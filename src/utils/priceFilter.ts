import { RawTradeRecord, MonthlyStats, FilterOptions, YearlyStats } from '../types';

/** 아파트명 매칭 함수: API 응답 aptNm을 받아 대상 여부 반환 */
export type AptMatcher = (apiAptNm: string) => boolean;

/** 아파트명 정규화: 공백·괄호·기호 제거 + 소문자 (한글/영문/숫자만 유지) */
export function normalizeApt(s: string): string {
  return String(s).toLowerCase().replace(/[^0-9a-z가-힣]/g, '');
}

/** 정확 일치 매처 (탭1 직접 비교: 드롭다운에서 고른 실제 aptNm) */
export function exactMatcher(name: string): AptMatcher {
  const t = name.trim();
  return (apiNm) => apiNm.trim() === t;
}

/**
 * 정규화 prefix 매처 (탭2 프리셋).
 * 정규화 후 apiAptNm 이 presetAptNm 으로 시작하면 매칭.
 * → 단지/차수가 나뉜 단지(마포래미안푸르지오2·3·4단지 등)를 prefix 하나로 묶는다.
 */
export function prefixMatcher(presetName: string): AptMatcher {
  const p = normalizeApt(presetName);
  return (apiNm) => normalizeApt(apiNm).startsWith(p);
}

/** 거래금액 문자열 → 만원 숫자 변환 (쉼표 제거) */
function parseDealAmount(amount: string): number {
  return parseInt(String(amount).replace(/,/g, '').trim(), 10);
}

/** IQR 방식 이상치 제거 */
function removeOutliersIQR(prices: number[]): number[] {
  if (prices.length < 4) return prices;

  const sorted = [...prices].sort((a, b) => a - b);
  const n = sorted.length;
  const q1Idx = Math.floor(n * 0.25);
  const q3Idx = Math.floor(n * 0.75);
  const q1 = sorted[q1Idx];
  const q3 = sorted[q3Idx];
  const iqr = q3 - q1;

  if (iqr === 0) return prices;

  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;

  return sorted.filter((p) => p >= lower && p <= upper);
}

/**
 * 특정 아파트 + 면적에 해당하는 레코드 필터링
 * records: 특정 지역+월의 전체 거래 데이터
 * aptName: 아파트명
 * area: 전용면적 대표값 (㎡), ±3㎡ 범위로 필터
 * year, month: 해당 연월 (records에 이미 포함되어 있지만 명시적으로 재확인)
 */
export function filterAndCalcMonthly(
  records: RawTradeRecord[],
  aptName: string | AptMatcher,
  area: number,
  year: number,
  month: number,
  options: FilterOptions
): MonthlyStats | null {
  const matches: AptMatcher = typeof aptName === 'function' ? aptName : exactMatcher(aptName);

  // 아파트명, 면적, 연월 1차 필터
  let filtered = records.filter((r) => {
    if (!r.aptNm) return false;
    if (!matches(r.aptNm)) return false;

    const ar = parseFloat(String(r.excluUseAr));
    if (isNaN(ar)) return false;
    // areaTolerance 지정 시 ±N㎡ 범위 매칭(프리셋), 미지정 시 원본값 정확 매칭(직접 검색)
    if (options.areaTolerance != null) {
      if (Math.abs(ar - area) > options.areaTolerance) return false;
    } else if (ar.toFixed(2) !== area.toFixed(2)) {
      return false;
    }

    if (parseInt(r.dealYear, 10) !== year) return false;
    if (parseInt(r.dealMonth, 10) !== month) return false;

    return true;
  });

  if (filtered.length === 0) return null;

  // 계약 해제 제외
  filtered = filtered.filter((r) => {
    const cd = String(r.cdealType || '').trim();
    return cd === '' || cd === 'undefined' || cd === 'null';
  });

  // 직거래 제외
  if (options.excludeDirect) {
    filtered = filtered.filter((r) => {
      const gbn = String(r.dealingGbn || '').trim();
      return gbn !== '직거래';
    });
  }

  // 법인/공공기관 제외
  if (options.excludeCorporate) {
    filtered = filtered.filter((r) => {
      const sler = String(r.slerGbn || '').trim();
      const buyer = String(r.buyerGbn || '').trim();
      const excluded = ['법인', '공공기관', '국가', '지자체', '지방자치단체'];
      return !excluded.some((kw) => sler.includes(kw) || buyer.includes(kw));
    });
  }

  if (filtered.length === 0) return null;

  // 거래금액 파싱
  let prices = filtered
    .map((r) => parseDealAmount(r.dealAmount))
    .filter((p) => !isNaN(p) && p > 0);

  if (prices.length === 0) return null;

  // IQR 이상치 제거
  if (options.excludeOutliers) {
    prices = removeOutliersIQR(prices);
  }

  if (prices.length === 0) return null;

  const avgManwon = prices.reduce((s, p) => s + p, 0) / prices.length;

  return {
    avgPrice: avgManwon / 10000, // 만원 → 억원
    count: prices.length,
  };
}

/**
 * 연도별 통계 계산
 * dataMap: key = "LAWDCD_YYYYMM", value = 해당 월 전체 거래 레코드
 * years: 조회 연도 배열
 * options.monthFilter: null이면 연평균, 1~12이면 해당 월만
 */
export function calcYearlyStats(
  dataMap: Map<string, RawTradeRecord[]>,
  lawdCd: string,
  years: number[],
  aptName: string | AptMatcher,
  area: number,
  options: FilterOptions,
  debugLabel?: string
): { [year: number]: YearlyStats } {
  const result: { [year: number]: YearlyStats } = {};
  const matchFn: AptMatcher = typeof aptName === 'function' ? aptName : exactMatcher(aptName);
  let rawTotal = 0; // 명칭+면적 1차 매칭 건수
  let finalTotal = 0; // 이상거래/IQR 필터 후 건수

  for (const year of years) {
    const monthStats: { [month: number]: MonthlyStats } = {};
    const months =
      options.monthFilter !== null ? [options.monthFilter] : Array.from({ length: 12 }, (_, i) => i + 1);

    for (const month of months) {
      const key = `${lawdCd}_${year}${String(month).padStart(2, '0')}`;
      const records = dataMap.get(key);
      if (!records || records.length === 0) continue;

      // 디버그: 명칭+면적 1차 매칭 건수 집계 (필터와 동일한 매칭 규칙)
      if (debugLabel) {
        const tol = options.areaTolerance;
        rawTotal += records.filter((r) => {
          if (!r.aptNm || !matchFn(r.aptNm)) return false;
          const ar = parseFloat(String(r.excluUseAr));
          if (isNaN(ar)) return false;
          return tol != null ? Math.abs(ar - area) <= tol : ar.toFixed(2) === area.toFixed(2);
        }).length;
      }

      const stats = filterAndCalcMonthly(records, matchFn, area, year, month, options);
      if (stats) {
        monthStats[month] = stats;
        finalTotal += stats.count;
      }
    }

    const validMonths = Object.values(monthStats).filter((s) => s.count > 0);
    if (validMonths.length === 0) {
      result[year] = { year, avgPrice: null, count: 0, monthly: monthStats };
    } else {
      const totalCount = validMonths.reduce((s, m) => s + m.count, 0);
      const avgPrice =
        validMonths.reduce((s, m) => s + m.avgPrice, 0) / validMonths.length;

      result[year] = { year, avgPrice, count: totalCount, monthly: monthStats };
    }
  }

  if (debugLabel) {
    const areaDesc =
      options.areaTolerance != null ? `${area}±${options.areaTolerance}㎡` : `${area.toFixed(2)}㎡(정확)`;
    const range = options.monthFilter !== null ? `${options.monthFilter}월` : '연평균';
    console.log(
      `[면적필터] ${debugLabel} 전용 ${areaDesc} (${range}) | 명칭+면적 매칭 ${rawTotal}건 → 이상거래/IQR 필터 후 ${finalTotal}건`
    );
  }

  return result;
}

/** 전용면적 ㎡ → 약 몇 평 */
export function sqmToPyeong(sqm: number): number {
  return Math.round(sqm * 0.3025);
}

/**
 * 거래 면적 목록 → 드롭다운용 원본 ㎡ 목록 (반올림 없음).
 * 각 excluUseAr을 소수점 둘째자리(toFixed(2)) 기준으로 중복 제거 후 오름차순 정렬한다.
 * 예: [57.37, 57.12, 84.99, 84.82] → [57.12, 57.37, 84.82, 84.99]
 * (Math.round로 인한 면적 중복/누락 문제 제거 — API 원본값 그대로 사용)
 */
export function distinctAreas(areas: number[]): number[] {
  const set = new Set<string>();
  for (const a of areas) {
    if (!isNaN(a)) set.add(a.toFixed(2));
  }
  return Array.from(set, (s) => parseFloat(s)).sort((a, b) => a - b);
}

/** 면적 라벨 생성 (예: "84.99㎡ (약 26평)") — 원본값 그대로, 평은 ㎡×0.3025 반올림 */
export function makeAreaLabel(area: number): string {
  const pyeong = sqmToPyeong(area);
  return `${area.toFixed(2)}㎡ (약 ${pyeong}평)`;
}

/** 부분 일치 아파트 검색 옵션 (이름 + 거래 건수) */
export interface AptOption {
  name: string;
  count: number;
}

/**
 * 거래 레코드에서 검색어(부분 일치)에 맞는 aptNm 목록을 거래 건수와 함께 생성한다.
 * - 매칭: 정규화(소문자·공백/기호 제거) 후 검색어 포함 여부
 * - 정렬: ① 검색어로 시작 ② 검색어 포함, 동순위는 거래 건수 내림차순
 * - 검색어가 비면 전체를 거래 건수 내림차순으로 반환
 */
export function buildAptOptions(records: RawTradeRecord[], query: string): AptOption[] {
  const counts = new Map<string, number>();
  for (const r of records) {
    const nm = r.aptNm?.trim();
    if (!nm) continue;
    counts.set(nm, (counts.get(nm) ?? 0) + 1);
  }

  const q = normalizeApt(query);
  let entries = Array.from(counts, ([name, count]) => ({ name, count }));
  if (q) entries = entries.filter((e) => normalizeApt(e.name).includes(q));

  entries.sort((a, b) => {
    const aStarts = normalizeApt(a.name).startsWith(q) ? 0 : 1;
    const bStarts = normalizeApt(b.name).startsWith(q) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts; // 시작 일치 우선
    return b.count - a.count; // 거래 건수 많은 순
  });

  return entries;
}
