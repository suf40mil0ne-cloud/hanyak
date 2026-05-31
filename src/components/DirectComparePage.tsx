import React, { useState, useCallback } from 'react';
import RegionSelector from './RegionSelector';
import ApartmentSearch from './ApartmentSearch';
import QueryOptions from './QueryOptions';
import ResultTable from './ResultTable';
import PriceChart from './PriceChart';
import { ApartmentInfo, ApartmentData, FilterOptions, SelectedRegion } from '../types';
import { loadAllData, getQueryYears, globalCache } from '../utils/apiClient';
import { calcYearlyStats, exactMatcher } from '../utils/priceFilter';

const DEFAULT_FILTER: FilterOptions = {
  excludeDirect: true,
  excludeCorporate: true,
  excludeOutliers: true,
  monthFilter: null,
};

interface ToastMsg {
  id: number;
  text: string;
  type: 'error' | 'info';
}
let toastIdSeq = 0;

const DirectComparePage: React.FC = () => {
  const [region, setRegion] = useState<SelectedRegion | null>(null);
  const [apartments, setApartments] = useState<ApartmentInfo[]>([]);
  const [baseId, setBaseId] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(DEFAULT_FILTER);
  const [results, setResults] = useState<ApartmentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const showToast = useCallback((text: string, type: ToastMsg['type'] = 'error') => {
    const id = ++toastIdSeq;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const handleAddApartment = (apt: ApartmentInfo) => {
    setApartments((prev) => {
      const next = [...prev, apt];
      if (next.length === 1 || !baseId) setBaseId(apt.id);
      return next;
    });
    if (!baseId) setBaseId(apt.id);
  };

  const handleRemoveApartment = (id: string) => {
    setApartments((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (baseId === id && next.length > 0) setBaseId(next[0].id);
      if (next.length === 0) setBaseId('');
      return next;
    });
    setResults((prev) => prev.filter((r) => r.info.id !== id));
  };

  const handleQuery = async () => {
    if (apartments.length === 0) return;
    setLoading(true);
    setResults([]);

    const years = getQueryYears();

    try {
      const uniqueLawdCds = Array.from(new Set(apartments.map((a) => a.lawdCd)));

      for (const lawdCd of uniqueLawdCds) {
        const relatedApts = apartments.filter((a) => a.lawdCd === lawdCd);
        const regionLabel = relatedApts[0].regionLabel;
        setLoadingMsg(`${regionLabel} 데이터 로드 중...`);
        await loadAllData(lawdCd, years, globalCache, (msg, current, total) => {
          setLoadingMsg(`[${regionLabel}] ${msg}`);
          setLoadingProgress({ current, total });
        });
      }

      const newResults: ApartmentData[] = apartments.map((apt) => {
        const yearlyStats = calcYearlyStats(
          globalCache,
          apt.lawdCd,
          years,
          exactMatcher(apt.name),
          apt.area,
          filterOptions,
          `${apt.name} ${apt.areaLabel}` // 콘솔 면적 필터 로그
        );
        const prev = results.find((r) => r.info.id === apt.id);
        return { info: apt, yearlyStats, manualPrice: prev?.manualPrice };
      });

      setResults(newResults);

      const hasData = newResults.some((r) =>
        Object.values(r.yearlyStats).some((ys) => ys.avgPrice != null)
      );
      if (!hasData) {
        showToast('선택한 아파트/면적의 거래 데이터를 찾을 수 없습니다. 면적 범위나 아파트명을 확인해주세요.', 'info');
      }
    } catch (e: unknown) {
      showToast((e as Error).message || '데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setLoadingMsg('');
      setLoadingProgress({ current: 0, total: 0 });
    }
  };

  const handleManualPriceChange = (id: string, price: number | undefined) => {
    setResults((prev) => prev.map((r) => (r.info.id === id ? { ...r, manualPrice: price } : r)));
  };

  return (
    <div className="space-y-4">
      <RegionSelector selected={region} onChange={setRegion} />

      <ApartmentSearch
        region={region}
        apartments={apartments}
        onAdd={handleAddApartment}
        onRemove={handleRemoveApartment}
        baseId={baseId}
        onBaseChange={setBaseId}
      />

      <QueryOptions
        options={filterOptions}
        onChange={setFilterOptions}
        onQuery={handleQuery}
        loading={loading}
        disabled={apartments.length === 0}
      />

      {loading && (
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{loadingMsg || '데이터 조회 중...'}</p>
              {loadingProgress.total > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {loadingProgress.current}/{loadingProgress.total}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && !loading && (
        <ResultTable results={results} baseId={baseId} onManualPriceChange={handleManualPriceChange} />
      )}

      {results.length > 0 && !loading && <PriceChart results={results} baseId={baseId} />}

      {results.length === 0 && !loading && apartments.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-4xl mb-3">🏠</p>
          <p className="text-gray-600 font-medium mb-1">아파트 실거래가를 비교해보세요</p>
          <p className="text-gray-400 text-sm">1. 지역 선택 → 2. 아파트 조회 및 추가 → 3. 조회하기</p>
          <p className="text-gray-400 text-xs mt-2">
            최대 10개 아파트를 추가하여 연도별 시세 및 상대지수(기준=100)를 비교할 수 있습니다.
          </p>
        </div>
      )}

      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm text-white max-w-sm ${
              t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DirectComparePage;
