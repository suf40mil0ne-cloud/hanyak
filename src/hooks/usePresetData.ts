import { useEffect, useMemo, useRef, useState } from 'react';
import { PRESET_APARTMENTS, PresetApt } from '../data/presetApartments';
import { ApartmentData, ApartmentInfo, FilterOptions } from '../types';
import {
  loadManyRegions,
  getQueryYears,
  getCacheKey,
  buildYearMonthList,
  globalCache,
} from '../utils/apiClient';
import { calcYearlyStats, prefixMatcher, makeAreaLabel } from '../utils/priceFilter';
import { getRegionName } from '../data/lawdCodes';

/** 프리셋은 이상 거래를 항상 자동 제외 (국평 기준 대표 시세) */
// areaTolerance 5: 프리셋 areaTarget은 검증된 대표 면적이라 기존 ±5㎡ 매칭을 유지
// (직접 검색은 기본 ±3㎡ 사용 → 더 좁게 매칭)
export const PRESET_FILTER: Omit<FilterOptions, 'monthFilter'> = {
  excludeDirect: true,
  excludeCorporate: true,
  excludeOutliers: true,
  areaTolerance: 5,
};

export interface PresetResult extends ApartmentData {
  preset: PresetApt;
}

export function presetId(p: PresetApt): string {
  return `${p.lawdCd}_${p.aptNm}_${p.areaTarget}_${p.label}`;
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
  const loadedRef = useRef(false);

  const uniqueLawdCds = useMemo(
    () => Array.from(new Set(PRESET_APARTMENTS.map((p) => p.lawdCd))),
    []
  );

  // 현재 monthFilter 기준으로 globalCache에서 통계 재계산 (네트워크 호출 없음)
  const recompute = (mf: number | null) => {
    const next: PresetResult[] = PRESET_APARTMENTS.map((p) => {
      const yearlyStats = calcYearlyStats(
        globalCache,
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

  // 프리셋 지역 데이터 로드 (mf 모드에 필요한 연월만 조회; 이미 캐시된 건 건너뜀)
  const loadData = async (force = false, mf: number | null = monthFilter) => {
    setLoading(true);
    try {
      if (force) {
        const ymList = buildYearMonthList(years);
        for (const lawdCd of uniqueLawdCds) {
          for (const ym of ymList) globalCache.delete(getCacheKey(lawdCd, ym.dealYmd));
        }
      }
      setProgress({ current: 0, total: 100, label: '데이터 로딩 중...' });
      await loadManyRegions(
        uniqueLawdCds,
        years,
        globalCache,
        (p) => {
          const done = p.lastDoneLawdCd ? `${getRegionName(p.lastDoneLawdCd)} 완료` : '';
          const loadingRegions = p.loadingLawdCds
            .filter((cd) => cd !== p.lastDoneLawdCd)
            .slice(0, 2)
            .map(getRegionName);
          const loadingTxt = loadingRegions.length ? `${loadingRegions.join(', ')} 조회 중...` : '';
          const detail = [done, loadingTxt].filter(Boolean).join(' · ');
          const pct = p.totalTasks ? Math.round((p.tasksDone / p.totalTasks) * 100) : 100;
          setProgress({
            current: pct,
            total: 100,
            label: `데이터 로딩 중 (${p.regionsDone}/${p.totalRegions} 지역)${detail ? ` — ${detail}` : ''}`,
          });
        },
        { monthFilter: mf, concurrency: 8 }
      );
      recompute(mf);
      loadedRef.current = true;
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0, label: '' });
    }
  };

  // 탭 최초 진입 시 자동 조회 (globalCache가 차 있으면 즉시 완료)
  useEffect(() => {
    if (!loadedRef.current) void loadData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMonthFilter = (mf: number | null) => {
    setMonthFilter(mf);
    if (!loadedRef.current) return;
    const ymList = buildYearMonthList(years, mf);
    const missing = uniqueLawdCds.some((cd) =>
      ymList.some((ym) => !globalCache.has(getCacheKey(cd, ym.dealYmd)))
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
    handleMonthFilter,
    handleManualPrice,
    reload: () => void loadData(true),
  };
}
