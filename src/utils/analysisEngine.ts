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
  trend: Trend; // 전체 추세 (연평균 지수 변화량 기준)
  avgSlope: number; // 연평균 지수 변화량 ((최근 - 첫) / 연도 간격)
  trendLabel: string; // 📈/📉/➡️ 한 줄 라벨
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

  // 지수 추세 분석 (전체 방향성 + 최근 변화 + 급등/급락)
  const trendInfo = analyzeIndexTrend(validIdx);
  const { trend, avgSlope, trendLabel, trendVerdict } = trendInfo;

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

  // ── 섹션 3-2: 지수 추세 판단 → trendInfo.trendVerdict 사용 ─

  // ── 섹션 3-3: 실거래 건수 판단 ────────────────────────────
  let volumeWarning: string | null = null;
  if (compare.avgCount < 3) {
    volumeWarning = '단, 비교 아파트의 거래량이 적어 시세 신뢰도가 낮을 수 있습니다.';
  } else if (base.avgCount < 3) {
    volumeWarning = '단, 내 아파트의 거래량이 적어 시세 신뢰도가 낮을 수 있습니다.';
  }

  // ── 최종 한줄 요약 (자동 조합) ────────────────────────────
  const oneLine = buildOneLine(base, compare, trendInfo, volumeWarning);

  return {
    base,
    compare,
    indexSeries,
    trend,
    avgSlope,
    trendLabel,
    riseVerdict,
    trendVerdict,
    volumeWarning,
    oneLine,
  };
}

interface TrendInfo {
  trend: Trend;
  avgSlope: number; // 연평균 지수 변화량
  trendLabel: string; // 카드 헤더용 짧은 라벨
  trendVerdict: string; // 섹션 2/3 설명문 (전체 + 최근 + 급등/급락)
  reversalNote: string; // 한줄 요약에 덧붙일 보조 절 (선행 공백 포함, 없으면 '')
}

/**
 * 지수 추세 분석.
 * 1) 전체 추세: 단순 마지막값이 아니라 (최근 - 첫) / 연도 간격 = 연평균 변화량으로 방향성 판단 (±10 기준)
 * 2) 최근 변화: 최근 2개년 변화를 별도로 언급 (전체 추세와 반대면 단서로 표기)
 * 3) 급등/급락: 전년 대비 ±50 이상 변화 시점 감지
 * 4) 정점/저점: 최댓/최솟값이 마지막 연도가 아니면 "정점 후 조정 / 저점 후 반등"으로 표현
 */
function analyzeIndexTrend(validIdx: { year: number; index: number }[]): TrendInfo {
  if (validIdx.length < 2) {
    return {
      trend: 'flat',
      avgSlope: 0,
      trendLabel: '➡️ 추세 판단 데이터 부족',
      trendVerdict: '지수 추세를 판단할 데이터가 부족합니다.',
      reversalNote: '',
    };
  }

  const first = validIdx[0];
  const last = validIdx[validIdx.length - 1];
  const span = validIdx.length - 1; // 연도 간격 수
  const avgSlope = +((last.index - first.index) / span).toFixed(1); // 연평균 변화량

  // 1) 전체 추세 (연평균 변화량 ±10 기준)
  let trend: Trend = 'flat';
  if (avgSlope >= 10) trend = 'up';
  else if (avgSlope <= -10) trend = 'down';

  const trendLabel =
    trend === 'up' ? '📈 격차 확대 추세' : trend === 'down' ? '📉 격차 축소 추세' : '➡️ 비슷한 흐름 유지';

  // 정점/저점: 최댓/최솟값이 "중간" 연도(첫·마지막 제외)이고 마지막과 10 이상 벌어진 경우만
  // (단조 추세에서 첫 연도가 극값으로 잡혀 "정점 후 조정"이 잘못 붙는 것을 방지)
  const maxP = validIdx.reduce((m, p) => (p.index > m.index ? p : m), first);
  const minP = validIdx.reduce((m, p) => (p.index < m.index ? p : m), first);
  const isMid = (y: number) => y !== first.year && y !== last.year;
  const peak = isMid(maxP.year) && maxP.index - last.index >= 10 ? maxP : null;
  const trough = isMid(minP.year) && last.index - minP.index >= 10 ? minP : null;

  // 2) 최근 2개년 변화
  const recentDelta = last.index - validIdx[validIdx.length - 2].index;
  const recentSmall = Math.abs(recentDelta) < 20;

  // 3) 급등/급락 (전년 대비 ±50)
  const spikes: { year: number; up: boolean }[] = [];
  for (let i = 1; i < validIdx.length; i++) {
    const d = validIdx[i].index - validIdx[i - 1].index;
    if (d >= 50) spikes.push({ year: validIdx[i].year, up: true });
    else if (d <= -50) spikes.push({ year: validIdx[i].year, up: false });
  }

  // ── 설명문 조합 ──
  const slopeTxt = `${avgSlope >= 0 ? '+' : ''}${avgSlope}`;
  let trendVerdict =
    trend === 'up'
      ? `첫 데이터 연도(지수 ${first.index}) 대비 최근(${last.index})이 연평균 약 ${slopeTxt}씩 올라, 전반적으로 격차가 확대되는 추세입니다.`
      : trend === 'down'
      ? `첫 데이터 연도(지수 ${first.index}) 대비 최근(${last.index})이 연평균 약 ${slopeTxt}씩 내려, 전반적으로 격차가 축소되는 추세입니다.`
      : `첫 데이터 연도(지수 ${first.index})와 최근(${last.index})이 비슷해(연평균 ${slopeTxt}), 두 아파트가 비슷한 흐름을 유지하고 있습니다.`;

  // 정점/저점 → 최근 반전을 우선 서술 (없으면 최근 2개년 단서)
  let reversalNote = '';
  if (peak) {
    reversalNote = ` 다만 ${peak.year}년 정점(${peak.index}) 이후 ${last.year}년(${last.index})에 ${recentSmall ? '다소' : '크게'} 조정되는 모습입니다.`;
  } else if (trough) {
    reversalNote = ` 다만 ${trough.year}년 저점(${trough.index}) 이후 ${last.year}년(${last.index})에 ${recentSmall ? '소폭' : '크게'} 반등하는 모습입니다.`;
  } else if (trend === 'up' && recentDelta < 0) {
    reversalNote = ` 다만 최근 들어 ${recentSmall ? '소폭 ' : ''}좁혀지고 있습니다.`;
  } else if (trend === 'down' && recentDelta > 0) {
    reversalNote = ` 다만 최근 들어 ${recentSmall ? '소폭 ' : ''}다시 벌어지고 있습니다.`;
  }
  trendVerdict += reversalNote;

  // 급등/급락 (정점/저점·마지막 연도로 이미 설명한 변화는 중복 표기하지 않음)
  const narrated = new Set<number>([last.year, peak?.year, trough?.year].filter((y): y is number => y != null));
  for (const s of spikes) {
    if (narrated.has(s.year)) continue;
    trendVerdict += ` ${s.year}년에는 격차가 급격히 ${s.up ? '확대' : '축소'}되었습니다.`;
  }

  return { trend, avgSlope, trendLabel, trendVerdict, reversalNote };
}

function buildOneLine(
  base: AptSeries,
  compare: AptSeries,
  trendInfo: TrendInfo,
  volumeWarning: string | null
): string {
  if (base.risePct == null || compare.risePct == null) {
    return `${compare.name}와(과) ${base.name}를(을) 비교할 충분한 데이터가 아직 없습니다.`;
  }

  // 주어 = 비교 아파트. d = 내 아파트 상승률 - 비교 상승률 (양수면 내 아파트가 더 오름)
  const d = base.risePct - compare.risePct;
  let risePart: string;
  if (d <= -20) risePart = `내 아파트(${base.name}) 대비 상승폭이 크게 높으며`;
  else if (d < -5) risePart = `내 아파트(${base.name})보다 다소 높은 상승률을 보였으며`;
  else if (d <= 5) risePart = `내 아파트(${base.name})와 비슷한 수준의 상승률을 기록했으며`;
  else if (d <= 20) risePart = `내 아파트(${base.name})보다 다소 낮은 상승률을 보였으며`;
  else risePart = `내 아파트(${base.name}) 대비 상승폭이 크게 낮았으며`;

  let trendPart: string;
  if (trendInfo.trend === 'up') trendPart = '기준 대비 프리미엄이 점점 확대되는 추세입니다';
  else if (trendInfo.trend === 'down') trendPart = '내 아파트가 격차를 좁혀가는 추세입니다';
  else trendPart = '두 아파트가 비슷한 흐름으로 연동되고 있습니다';

  let text = `비교 아파트(${compare.name})는 ${risePart}, ${trendPart}.`;
  if (trendInfo.reversalNote) text += trendInfo.reversalNote;
  if (volumeWarning) text += ` ${volumeWarning}`;
  return text;
}
