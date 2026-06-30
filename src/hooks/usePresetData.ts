import { useEffect, useMemo, useRef, useState } from 'react';
import { PRESET_APARTMENTS, PresetApt } from '../data/presetApartments';
import { ApartmentData, ApartmentInfo, FilterOptions, RawTradeRecord } from '../types';
import { getQueryYears, getCacheKey, buildYearMonthList } from '../utils/apiClient';
import { calcYearlyStats, prefixMatcher, makeAreaLabel } from '../utils/priceFilter';

/**
 * 프리셋 전용 캐시(싱글턴). /api/preset-data(KV)에서 받은 거래 레코드를 담는다.
 * globalCache(탭1 직접비교·내 아파트 실시간 조회용)와 분리해 둔다 — 프리셋 데이터는 aptNm prefix로
 * 1차 필터된 부분집합이므로, 같은 지역의 임의 아파트 실시간 조회를 오염시키지 않도록 격리한다.
 */
const presetCache = new Map<string, RawTradeRecord[]>();
let presetUpdatedAt: string | null = null; // KV 적재 시각(ISO) — 탭 간 공유

/** 프리셋은 이상 거래를 항상 자동 제외 (국평 기준 대표 시세) */
// areaTolerance 2: 프리셋 areaTarget(대부분 84)을 실제 거래 면적과 ±2㎡(82~86) 범위로 매칭.
// (직접 검색은 areaTolerance 미지정 → 원본값 정확 매칭)
export const PRESET_FILTER: Omit<FilterOptions, 'monthFilter'> = {
  excludeDirect: true,
  excludeCorporate: true,
  excludeOutliers: true,
  areaTolerance: 2,
};

export interface PresetResult extends ApartmentData {
  preset: PresetApt;
}

export function presetId(p: PresetApt): string {
  return `${p.lawdCd}_${p.aptNm}_${p.areaTarget}_${p.label}`;
}

/** KV 적재 시각(ISO·UTC)을 한국시간 "YYYY-MM-DD HH:mm" 으로 표시 */
export function formatUpdatedAt(iso: string | null): string {
  if (!iso) return '준비 중';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '준비 중';
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${kst.getUTCFullYear()}-${p(kst.getUTCMonth() + 1)}-${p(kst.getUTCDate())} ${p(kst.getUTCHours())}:${p(kst.getUTCMinutes())}`;
}

export interface PresetProgress {
  current: number;
  total: number;
  label: string;
}

export interface UsePresetData {
  years: number[];
  monthFilter: number | null;
  results: PresetResult[];
  loading: boolean;
  progress: PresetProgress;
  updatedAt: string | null; // KV 적재 시각(ISO). 화면에 "마지막 업데이트"로 표시.
  handleMonthFilter: (mf: number | null) => void;
  handleManualPrice: (id: string, price: number | undefined) => void;
  reload: () => void;
}

/**
 * 주요 아파트(프리셋) 데이터 로딩·집계 로직.
 * 탭 2(주요 아파트 시세)와 탭 3(주요 아파트와 비교)에서 공유한다.
 * globalCache 싱글턴을 통해 네트워크 호출은 탭 간 자동 공유되며(중복 호출 없음),
 * 각 탭은 독립적인 results/manualPrices 상태를 가진다.
 */
export function usePresetData(): UsePresetData {
  const years = getQueryYears();

  const [monthFilter, setMonthFilter] = useState<number | null>(null);
  const [results, setResults] = useState<PresetResult[]>([]);
  const [manualPrices, setManualPrices] = useState<Record<string, number | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<PresetProgress>({ current: 0, total: 0, label: '' });
  const [updatedAt, setUpdatedAt] = useState<string | null>(presetUpdatedAt);
  const loadedRef = useRef(false);

  const uniqueLawdCds = useMemo(
    () => Array.from(new Set(PRESET_APARTMENTS.map((p) => p.lawdCd))),
    []
  );

  // 현재 monthFilter 기준으로 presetCache에서 통계 재계산 (네트워크 호출 없음)
  const recompute = (mf: number | null) => {
    const next: PresetResult[] = PRESET_APARTMENTS.map((p) => {
      const yearlyStats = calcYearlyStats(
        presetCache,
        p.lawdCd,
        years,
        prefixMatcher(p.aptNm),
        p.areaTarget,
        { ...PRESET_FILTER, monthFilter: mf },
        p.label
      );
      const id = presetId(p);
      const info: ApartmentInfo = {
        id,
        name: p.label,
        lawdCd: p.lawdCd,
        area: p.areaTarget,
        areaLabel: makeAreaLabel(p.areaTarget),
        regionLabel: p.category,
      };
      return { preset: p, info, yearlyStats, manualPrice: manualPrices[id] };
    });
    setResults(next);
  };

  // 프리셋 데이터 로드: KV 캐시(/api/preset-data)를 1회만 받아 presetCache 채움 (실시간 국토부 호출 없음).
  // force=true(새로고침)면 캐시를 비우고 KV를 다시 받는다.
  const loadData = async (force = false, mf: number | null = monthFilter) => {
    setLoading(true);
    try {
      if (force) presetCache.clear();
      // 아직 안 채워졌으면 KV에서 가져온다 (탭 전환 시엔 이미 차 있어 즉시 집계).
      if (presetCache.size === 0) {
        setProgress({ current: 30, total: 100, label: '저장된 시세 불러오는 중...' });
        const res = await fetch('/api/preset-data', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = (await res.json()) as {
          updatedAt: string | null;
          data: Record<string, RawTradeRecord[]>;
        };
        for (const [key, records] of Object.entries(payload.data || {})) {
          presetCache.set(key, records);
        }
        presetUpdatedAt = payload.updatedAt ?? null;
      }
      setUpdatedAt(presetUpdatedAt);
      setProgress({ current: 90, total: 100, label: '집계 중...' });
      recompute(mf);
      loadedRef.current = true;
    } catch (e) {
      console.error('프리셋 데이터 로드 실패:', e);
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0, label: '' });
    }
  };

  // 탭 최초 진입 시 자동 조회 (presetCache가 차 있으면 즉시 완료)
  useEffect(() => {
    if (!loadedRef.current) void loadData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMonthFilter = (mf: number | null) => {
    setMonthFilter(mf);
    if (!loadedRef.current) return;
    const ymList = buildYearMonthList(years, mf);
    const missing = uniqueLawdCds.some((cd) =>
      ymList.some((ym) => !presetCache.has(getCacheKey(cd, ym.dealYmd)))
    );
    if (missing) void loadData(false, mf);
    else recompute(mf);
  };

  const handleManualPrice = (id: string, price: number | undefined) => {
    setManualPrices((prev) => ({ ...prev, [id]: price }));
    setResults((prev) => prev.map((r) => (r.info.id === id ? { ...r, manualPrice: price } : r)));
  };

  return {
    years,
    monthFilter,
    results,
    loading,
    progress,
    updatedAt,
    handleMonthFilter,
    handleManualPrice,
    reload: () => void loadData(true),
  };
}
