import { ApartmentData } from '../types';

/** 한 아파트의 시세 시계열 요약 */
export interface AptSeries {
  name: string;
  /** 연도별 시세(억)·실거래 건수. price=null → 데이터 없음 */
  yearly: { year: number; price: number | null; count: number }[];
  firstYear: number | null; // 데이터가 존재하는 첫 연도
  firstPrice: number | null;
  lastYear: number | null; // 기준 연도(보통 2026)
  lastPrice: number | null; // 2026: 실거래 우선, 없으면 입력값
  rise: number | null; // lastPrice - firstPrice (억)
  risePct: number | null; // 상승률 (%)
  avgCount: number; // 데이터 있는 연도의 평균 실거래 건수
}

/** 비교 아파트의 기준 아파트 대비 지수 (기준=100) */
export interface IndexPoint {
  year: number;
  index: number | null;
}

export type Trend = 'up' | 'down' | 'flat';

export interface AnalysisResult {
  base: AptSeries; // 내 아파트
  compare: AptSeries; // 비교 아파트
  indexSeries: IndexPoint[]; // 비교 아파트의 기준 대비 지수 추이
  trend: Trend;
  trendLabel: string; // 📈/📉/➡️ 한 줄 라벨
  /** 격차 급변 시점 (없으면 null) */
  pivot: { year: number; widening: boolean } | null;
  riseVerdict: string; // 상승률 비교 판단
  trendVerdict: string; // 지수 추세 판단
  volumeWarning: string | null; // 거래량 신뢰도 경고
  oneLine: string; // 최종 한줄 요약 (굵게 강조)
}

/** 2026(마지막 연도)은 실거래 우선, 없으면 입력값 사용 */
function effectivePrice(data: ApartmentData, year: number, curYear: number): number | null {
  const real = data.yearlyStats[year]?.avgPrice ?? null;
  if (real != null) return real;
  if (year === curYear && data.manualPrice != null && !isNaN(data.manualPrice)) return data.manualPrice;
  return null;
}

function buildSeries(data: ApartmentData, years: number[], curYear: number): AptSeries {
  const yearly = years.map((year) => ({
    year,
    price: effectivePrice(data, year, curYear),
    count: data.yearlyStats[year]?.count ?? 0,
  }));

  const withData = yearly.filter((y) => y.price != null);
  const first = withData[0] ?? null;
  const last = [...withData].reverse()[0] ?? null;

  const rise = first && last ? +(last.price! - first.price!).toFixed(2) : null;
  const risePct =
    first && last && first.price! !== 0
      ? +(((last.price! - first.price!) / first.price!) * 100).toFixed(1)
      : null;

  const counts = yearly.filter((y) => y.price != null).map((y) => y.count);
  const avgCount = counts.length ? counts.reduce((s, c) => s + c, 0) / counts.length : 0;

  return {
    name: data.info.name,
    yearly,
    firstYear: first?.year ?? null,
    firstPrice: first?.price ?? null,
    lastYear: last?.year ?? null,
    lastPrice: last?.price ?? null,
    rise,
    risePct,
    avgCount: +avgCount.toFixed(1),
  };
}

/**
 * 규칙 기반 비교 분석 생성.
 * base = 내 아파트(기준=100), compare = 비교 아파트.
 */
export function analyzeComparison(
  baseData: ApartmentData,
  compareData: ApartmentData,
  years: number[]
): AnalysisResult {
  const curYear = years[years.length - 1];
  const base = buildSeries(baseData, years, curYear);
  const compare = buildSeries(compareData, years, curYear);

  // 비교 아파트의 기준 대비 지수 추이
  const indexSeries: IndexPoint[] = years.map((year) => {
    const bp = effectivePrice(baseData, year, curYear);
    const cp = effectivePrice(compareData, year, curYear);
    const index = bp != null && cp != null && bp !== 0 ? Math.round((cp / bp) * 100) : null;
    return { year, index };
  });

  const validIdx = indexSeries.filter((p) => p.index != null) as { year: number; index: number }[];
  const firstIdx = validIdx[0]?.index ?? null;
  const lastIdx = validIdx[validIdx.length - 1]?.index ?? null;
  const idxDelta = firstIdx != null && lastIdx != null ? lastIdx - firstIdx : 0;

  // 추세 판단 (지수 전체 변동폭 ±10 기준)
  let trend: Trend = 'flat';
  if (idxDelta > 10) trend = 'up';
  else if (idxDelta < -10) trend = 'down';

  const trendLabel =
    trend === 'up'
      ? '📈 비교 아파트 프리미엄 확대 중'
      : trend === 'down'
      ? '📉 내 아파트가 격차를 좁히는 중'
      : '➡️ 비슷한 상승 흐름 유지 중';

  // 격차 급변 시점: 연도 간 지수 변화폭이 가장 크고 ±10을 넘는 지점
  let pivot: { year: number; widening: boolean } | null = null;
  let maxJump = 10;
  for (let i = 1; i < validIdx.length; i++) {
    const diff = validIdx[i].index - validIdx[i - 1].index;
    if (Math.abs(diff) > maxJump) {
      maxJump = Math.abs(diff);
      pivot = { year: validIdx[i].year, widening: diff > 0 };
    }
  }

  // ── 섹션 3-1: 상승률 비교 판단 ─────────────────────────────
  let riseVerdict = '상승률을 비교할 데이터가 부족합니다.';
  if (base.risePct != null && compare.risePct != null) {
    const d = base.risePct - compare.risePct; // 양수면 내 아파트가 더 높음
    if (d > 20) riseVerdict = '내 아파트의 상승폭이 비교 아파트보다 크게 높습니다.';
    else if (d > 5) riseVerdict = '내 아파트가 비교 아파트보다 다소 높은 상승률을 보였습니다.';
    else if (d >= -5) riseVerdict = '두 아파트는 비슷한 수준의 상승률을 기록했습니다.';
    else if (d >= -20) riseVerdict = '비교 아파트가 내 아파트보다 더 높은 상승률을 보였습니다.';
    else riseVerdict = '비교 아파트의 상승폭이 내 아파트보다 크게 높습니다.';
  }

  // ── 섹션 3-2: 지수 추세 판단 ──────────────────────────────
  let trendVerdict: string;
  if (trend === 'up') trendVerdict = '기준 아파트 대비 프리미엄이 점점 확대되는 추세입니다.';
  else if (trend === 'down') trendVerdict = '기준 아파트가 상대적으로 격차를 줄이고 있는 추세입니다.';
  else trendVerdict = '두 아파트는 연동성이 높아 비슷한 흐름으로 움직이고 있습니다.';
  if (pivot) {
    trendVerdict += ` ${pivot.year}년을 기점으로 격차가 ${pivot.widening ? '벌어지기' : '좁혀지기'} 시작했습니다.`;
  }

  // ── 섹션 3-3: 실거래 건수 판단 ────────────────────────────
  let volumeWarning: string | null = null;
  if (compare.avgCount < 3) {
    volumeWarning = '단, 비교 아파트의 거래량이 적어 시세 신뢰도가 낮을 수 있습니다.';
  } else if (base.avgCount < 3) {
    volumeWarning = '단, 내 아파트의 거래량이 적어 시세 신뢰도가 낮을 수 있습니다.';
  }

  // ── 최종 한줄 요약 (자동 조합) ────────────────────────────
  const oneLine = buildOneLine(base, compare, trend, pivot, volumeWarning);

  return {
    base,
    compare,
    indexSeries,
    trend,
    trendLabel,
    pivot,
    riseVerdict,
    trendVerdict,
    volumeWarning,
    oneLine,
  };
}

function buildOneLine(
  base: AptSeries,
  compare: AptSeries,
  trend: Trend,
  pivot: { year: number; widening: boolean } | null,
  volumeWarning: string | null
): string {
  if (base.risePct == null || compare.risePct == null) {
    return `${compare.name}와(과) ${base.name}를(을) 비교할 충분한 데이터가 아직 없습니다.`;
  }

  const d = base.risePct - compare.risePct; // 양수면 내 아파트 우위
  let risePart: string;
  if (d > 20) risePart = `상승폭이 내 아파트(${base.name})가 크게 높으며`;
  else if (d > 5) risePart = `내 아파트(${base.name})가 다소 높은 상승률을 보였으며`;
  else if (d >= -5) risePart = `내 아파트(${base.name})와 비슷한 수준의 상승률을 기록했으며`;
  else if (d >= -20) risePart = `내 아파트(${base.name}) 대비 상승폭이 다소 높으며`;
  else risePart = `내 아파트(${base.name}) 대비 상승폭이 크게 높으며`;

  let trendPart: string;
  if (trend === 'up') trendPart = '프리미엄이 점점 확대되는 추세입니다';
  else if (trend === 'down') trendPart = '내 아파트가 격차를 좁혀가는 추세입니다';
  else trendPart = '두 아파트가 비슷한 흐름으로 연동되고 있습니다';

  let text = `비교 아파트(${compare.name})는 ${risePart}, ${trendPart}.`;
  if (pivot) {
    text += ` ${pivot.year}년을 기점으로 격차가 ${pivot.widening ? '빠르게 벌어지고' : '빠르게 좁혀지고'} 있어 주목됩니다.`;
  }
  if (volumeWarning) text += ` ${volumeWarning}`;
  return text;
}
