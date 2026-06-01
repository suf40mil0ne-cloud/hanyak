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
    if (Math.abs(ar - area) > 5) return false; // 선택 면적 ±5㎡

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

      // 디버그: 명칭+면적(±5㎡) 1차 매칭 건수 집계
      if (debugLabel) {
        rawTotal += records.filter((r) => {
          if (!r.aptNm || !matchFn(r.aptNm)) return false;
          const ar = parseFloat(String(r.excluUseAr));
          return !isNaN(ar) && Math.abs(ar - area) <= 5;
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
    const range = options.monthFilter !== null ? `${options.monthFilter}월` : '연평균';
    console.log(
      `[면적필터] ${debugLabel} 전용 ${area}±5㎡ (${range}) | 명칭+면적 매칭 ${rawTotal}건 → 이상거래/IQR 필터 후 ${finalTotal}건`
    );
  }

  return result;
}

/** 전용면적 ㎡ → 약 몇 평 */
export function sqmToPyeong(sqm: number): number {
  return Math.round(sqm * 0.3025);
}

/** 전용면적 그룹핑: 5㎡ 단위로 대표값 계산 */
export function groupAreas(areas: number[]): number[] {
  if (areas.length === 0) return [];

  const grouped = new Map<number, number[]>();
  for (const a of areas) {
    const key = Math.round(a / 5) * 5; // 5㎡ 단위 반올림
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(a);
  }

  const result: number[] = [];
  for (const [, vals] of grouped) {
    // 그룹 내 중앙값을 대표값으로
    const sorted = vals.sort((a, b) => a - b);
    result.push(sorted[Math.floor(sorted.length / 2)]);
  }

  return result.sort((a, b) => a - b);
}

/** 면적 라벨 생성 (예: "84㎡(33평)") */
export function makeAreaLabel(area: number): string {
  const pyeong = sqmToPyeong(area);
  return `${area.toFixed(0)}㎡(${pyeong}평)`;
}
