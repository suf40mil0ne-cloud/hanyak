import { RawTradeRecord, ApiResponse } from '../types';

/** (lawdCd + dealYmd) 기반 캐시: 전역 싱글턴 */
const globalCache = new Map<string, RawTradeRecord[]>();

export function getCacheKey(lawdCd: string, dealYmd: string): string {
  return `${lawdCd}_${dealYmd}`;
}

/** 단일 월 데이터 조회 (캐시 우선) */
export async function fetchMonthData(
  lawdCd: string,
  dealYmd: string
): Promise<RawTradeRecord[]> {
  const key = getCacheKey(lawdCd, dealYmd);
  if (globalCache.has(key)) {
    return globalCache.get(key)!;
  }

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

/** 조회할 전체 연월 목록 생성 */
export function buildYearMonthList(years: number[]): { year: number; month: number; dealYmd: string }[] {
  const { year: curYear, month: curMonth } = getCurrentYearMonth();
  const list: { year: number; month: number; dealYmd: string }[] = [];

  for (const y of years) {
    const maxMonth = y < curYear ? 12 : curMonth;
    for (let m = 1; m <= maxMonth; m++) {
      list.push({
        year: y,
        month: m,
        dealYmd: `${y}${String(m).padStart(2, '0')}`,
      });
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

/** 특정 지역의 최신 1개월 데이터 조회 (아파트 목록 검색용) */
export async function fetchLatestMonthData(lawdCd: string): Promise<RawTradeRecord[]> {
  const { year, month } = getCurrentYearMonth();
  const dealYmd = `${year}${String(month).padStart(2, '0')}`;
  return fetchMonthData(lawdCd, dealYmd);
}

export { globalCache };
