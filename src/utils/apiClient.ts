import { RawTradeRecord, ApiResponse } from '../types';

/** (lawdCd + dealYmd) 기반 캐시: 전역 싱글턴 */
const globalCache = new Map<string, RawTradeRecord[]>();

export function getCacheKey(lawdCd: string, dealYmd: string): string {
  return `${lawdCd}_${dealYmd}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 단일 월 데이터 조회 (캐시 우선, 일시 오류 시 1회 재시도) */
export async function fetchMonthData(
  lawdCd: string,
  dealYmd: string
): Promise<RawTradeRecord[]> {
  const key = getCacheKey(lawdCd, dealYmd);
  if (globalCache.has(key)) {
    return globalCache.get(key)!;
  }

  let lastErr: unknown;
  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch('/api/apt-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lawdCd, dealYmd }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data: ApiResponse = await res.json();
      const items = data.items || [];
      globalCache.set(key, items);
      return items;
    } catch (e) {
      lastErr = e;
      // WAF 차단/일시 rate limit 대비 지수 백오프 + 지터(재시도 분산)
      if (attempt < MAX_ATTEMPTS - 1) {
        const base = 500 * 2 ** attempt; // 500 → 1000 → 2000 → 4000 (throttle 창 통과용 긴 꼬리)
        await sleep(base + Math.floor(Math.random() * 400));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('데이터 조회 실패');
}

/** 현재 연도/월 계산 */
export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** 조회할 연도 배열 반환 (현재 기준 최근 5개년) */
export function getQueryYears(): number[] {
  const { year } = getCurrentYearMonth();
  return [year - 4, year - 3, year - 2, year - 1, year];
}

/**
 * 조회할 연월 목록 생성.
 * - monthFilter == null  → 연평균 모드: 각 연도의 1~당월 전체
 * - monthFilter 1~12     → 특정 월 모드: 각 연도의 해당 월 1건만 (호출 수 최대 12배 절감)
 *   (당해 연도에서 아직 오지 않은 미래 월은 건너뜀)
 */
export function buildYearMonthList(
  years: number[],
  monthFilter: number | null = null
): { year: number; month: number; dealYmd: string }[] {
  const { year: curYear, month: curMonth } = getCurrentYearMonth();
  const list: { year: number; month: number; dealYmd: string }[] = [];
  const ymd = (y: number, m: number) => ({ year: y, month: m, dealYmd: `${y}${String(m).padStart(2, '0')}` });

  for (const y of years) {
    const maxMonth = y < curYear ? 12 : curMonth;
    if (monthFilter != null) {
      if (monthFilter >= 1 && monthFilter <= maxMonth) list.push(ymd(y, monthFilter));
    } else {
      for (let m = 1; m <= maxMonth; m++) list.push(ymd(y, m));
    }
  }

  return list;
}

/** 배치 단위로 병렬 API 호출 (rate limit 방지) */
async function batchFetch<T>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(fn));
  }
}

/**
 * 특정 지역의 전체 연도 데이터를 dataMap에 로드
 * dataMap: key = "LAWDCD_YYYYMM" → 해당 월 전체 거래 레코드
 * onProgress: 진행 상황 콜백
 */
export async function loadAllData(
  lawdCd: string,
  years: number[],
  dataMap: Map<string, RawTradeRecord[]>,
  onProgress: (msg: string, current: number, total: number) => void
): Promise<void> {
  const ymList = buildYearMonthList(years);
  const needed = ymList.filter((ym) => !dataMap.has(getCacheKey(lawdCd, ym.dealYmd)));

  if (needed.length === 0) return;

  let done = 0;
  const total = needed.length;

  await batchFetch(needed, 6, async ({ year, month, dealYmd }) => {
    const key = getCacheKey(lawdCd, dealYmd);
    if (!dataMap.has(key)) {
      try {
        const records = await fetchMonthData(lawdCd, dealYmd);
        dataMap.set(key, records);
      } catch (e) {
        // 오류 발생 시 빈 배열로 처리 (계속 진행)
        dataMap.set(key, []);
        console.warn(`[${lawdCd} ${dealYmd}] 조회 실패:`, e);
      }
    }
    done++;
    onProgress(`${year}년 ${month}월 조회 중`, done, total);
  });
}

/** 평형 스캔 진행 상황 */
export interface AreaScanProgress {
  done: number; // 조회 완료한 월 수 (캐시 미적중분 기준)
  total: number; // 조회해야 할 월 수 (캐시 미적중분)
  anyFetch: boolean; // 네트워크 호출이 한 건이라도 필요한지 (false면 캐시 100% 적중)
}

/**
 * 특정 지역의 최근 N개월(기본 24) 데이터를 모아 합산 조회 (아파트 목록·면적 검색용).
 * - 현재월부터 N개월 전까지 대상. globalCache에 이미 있는 달은 호출을 건너뛴다.
 * - 캐시 미적중 월만 6개씩 배치 병렬 호출(WAF 차단 방지) + 배치 간 50ms 딜레이.
 * - 탭 2(주요 아파트 시세)가 같은 지역을 이미 로딩했다면 캐시 100% 적중 → 즉시 합산.
 * - 24개월 합산이라 거래가 드문 대형 평형도 면적 드롭다운에 잡힌다.
 */
export async function fetchAreaScanData(
  lawdCd: string,
  onProgress?: (p: AreaScanProgress) => void,
  months = 24
): Promise<RawTradeRecord[]> {
  const { year, month } = getCurrentYearMonth();
  const ymds: string[] = [];
  for (let back = 0; back < months; back++) {
    let y = year;
    let m = month - back;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    ymds.push(`${y}${String(m).padStart(2, '0')}`);
  }

  const needed = ymds.filter((ymd) => !globalCache.has(getCacheKey(lawdCd, ymd)));
  const anyFetch = needed.length > 0;
  let done = 0;
  onProgress?.({ done, total: needed.length, anyFetch });

  // 캐시 미적중 월만 6개씩 배치, 배치 간 50ms 딜레이
  for (let i = 0; i < needed.length; i += 6) {
    const batch = needed.slice(i, i + 6);
    await Promise.all(
      batch.map(async (ymd) => {
        try {
          await fetchMonthData(lawdCd, ymd); // 성공 시 globalCache에 저장됨
        } catch (e) {
          globalCache.set(getCacheKey(lawdCd, ymd), []); // 실패 월은 빈 배열로 계속 진행
          console.warn(`[${lawdCd} ${ymd}] 평형 스캔 조회 실패:`, e);
        }
        done++;
        onProgress?.({ done, total: needed.length, anyFetch });
      })
    );
    if (i + 6 < needed.length) await sleep(50);
  }

  // 전체(캐시 포함) 합산
  const merged: RawTradeRecord[] = [];
  for (const ymd of ymds) {
    const recs = globalCache.get(getCacheKey(lawdCd, ymd));
    if (recs) merged.push(...recs);
  }
  return merged;
}

/** 다지역 로딩 진행 상황 (지역·월 단위 모두 보고) */
export interface LoadProgress {
  regionsDone: number;       // 모든 월 조회가 끝난 지역 수
  totalRegions: number;      // 전체 지역 수
  tasksDone: number;         // 완료된 (지역×월) 요청 수
  totalTasks: number;        // 전체 (지역×월) 요청 수 (캐시 적중분 제외)
  lastDoneLawdCd: string;    // 방금 막 완료된 지역 (없으면 '')
  loadingLawdCds: string[];  // 현재 조회 중인 지역 코드들
}

/**
 * 여러 지역(lawdCd)의 데이터를 전역 동시성 풀로 한 번에 로드한다.
 * - 모든 (lawdCd × 연월) 요청을 하나의 큐로 평탄화하여 지역 경계 없이 concurrency개씩 병렬 처리
 *   → 지역을 순차 처리하던 방식 대비 유휴 시간 제거. (전체 in-flight 수를 concurrency로 제한 → WAF 과부하 방지)
 * - 동일 (lawdCd, dealYmd)는 globalCache로 1회만 호출 → 같은 구의 여러 아파트가 데이터 공유.
 * - opts.monthFilter 지정 시 해당 월만 조회 (연평균 대비 호출 수 최대 12배 절감).
 * - onProgress로 지역·월 단위 진행률 + 방금 완료/조회 중 지역명을 보고.
 */
export async function loadManyRegions(
  lawdCds: string[],
  years: number[],
  dataMap: Map<string, RawTradeRecord[]>,
  onProgress: (p: LoadProgress) => void,
  opts: { monthFilter?: number | null; concurrency?: number } = {}
): Promise<void> {
  const { monthFilter = null, concurrency = 8 } = opts;
  const ymList = buildYearMonthList(years, monthFilter);
  const pending = new Map<string, number>(); // lawdCd → 남은 요청 수
  const tasks: { lawdCd: string; dealYmd: string }[] = [];

  for (const lawdCd of lawdCds) {
    const needed = ymList.filter((ym) => !dataMap.has(getCacheKey(lawdCd, ym.dealYmd)));
    pending.set(lawdCd, needed.length);
    for (const ym of needed) tasks.push({ lawdCd, dealYmd: ym.dealYmd });
  }

  const totalRegions = lawdCds.length;
  const totalTasks = tasks.length;
  let regionsDone = 0;
  let tasksDone = 0;
  const inFlight = new Set<string>();

  // 이미 전부 캐시된 지역은 즉시 완료 처리
  for (const lawdCd of lawdCds) {
    if (pending.get(lawdCd) === 0) regionsDone++;
  }

  const emit = (lastDoneLawdCd: string) =>
    onProgress({
      regionsDone,
      totalRegions,
      tasksDone,
      totalTasks,
      lastDoneLawdCd,
      loadingLawdCds: Array.from(inFlight),
    });

  emit('');
  if (totalTasks === 0) return;

  let idx = 0;
  const worker = async () => {
    while (idx < tasks.length) {
      const t = tasks[idx++];
      inFlight.add(t.lawdCd);
      const key = getCacheKey(t.lawdCd, t.dealYmd);
      try {
        const records = await fetchMonthData(t.lawdCd, t.dealYmd);
        dataMap.set(key, records);
      } catch (e) {
        dataMap.set(key, []); // 실패 시 빈 배열로 계속 진행
        console.warn(`[${t.lawdCd} ${t.dealYmd}] 조회 실패:`, e);
      }
      tasksDone++;
      const left = (pending.get(t.lawdCd) ?? 1) - 1;
      pending.set(t.lawdCd, left);
      let doneCd = '';
      if (left === 0) {
        regionsDone++;
        inFlight.delete(t.lawdCd);
        doneCd = t.lawdCd;
      }
      emit(doneCd);
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, totalTasks) }, worker);
  await Promise.all(workers);
}

export { globalCache };
