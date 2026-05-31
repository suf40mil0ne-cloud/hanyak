import React, { useEffect, useRef, useState } from 'react';
import { PRESET_APARTMENTS, PRESET_CATEGORIES, PresetApt } from '../data/presetApartments';
import { ApartmentData, ApartmentInfo, FilterOptions } from '../types';
import { loadManyRegions, getQueryYears, getCacheKey, buildYearMonthList, globalCache } from '../utils/apiClient';
import { calcYearlyStats, prefixMatcher } from '../utils/priceFilter';
import { getRegionName } from '../data/lawdCodes';
import PriceChart from './PriceChart';

// 프리셋은 이상 거래를 항상 자동 제외 (국평 기준 대표 시세)
const PRESET_FILTER: Omit<FilterOptions, 'monthFilter'> = {
  excludeDirect: true,
  excludeCorporate: true,
  excludeOutliers: true,
};

interface PresetResult extends ApartmentData {
  preset: PresetApt;
}

function presetId(p: PresetApt): string {
  return `${p.lawdCd}_${p.aptNm}_${p.areaTarget}_${p.label}`;
}

/** 지수 셀 텍스트 */
function idxText(idx: number | null): string {
  return idx == null ? '-' : String(idx);
}

/** 지수 셀 스타일: 100=진한 파랑 배경, >100=빨강, <100=초록 */
function idxClass(idx: number | null): string {
  if (idx == null) return 'text-gray-300';
  if (idx === 100) return 'bg-blue-600 text-white font-bold';
  if (idx > 100) return 'text-red-600 font-semibold';
  return 'text-green-700 font-semibold';
}

const PresetComparePage: React.FC = () => {
  const years = getQueryYears();
  const curYear = years[years.length - 1];
  const totalCols = 2 + years.length * 2; // 아파트 + 비고 + (연도별 시세/지수)

  const [monthFilter, setMonthFilter] = useState<number | null>(null);
  const [baseId, setBaseId] = useState<string>(''); // '' = 기준 없음
  const [results, setResults] = useState<PresetResult[]>([]);
  const [manualPrices, setManualPrices] = useState<Record<string, number | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' });
  const [chartCategory, setChartCategory] = useState<string>('전체');
  const loadedRef = useRef(false);

  const uniqueLawdCds = Array.from(new Set(PRESET_APARTMENTS.map((p) => p.lawdCd)));

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
        p.label // 콘솔에 면적 필터 전/후 건수 로그
      );
      const id = presetId(p);
      const info: ApartmentInfo = {
        id,
        name: p.label,
        lawdCd: p.lawdCd,
        area: p.areaTarget,
        areaLabel: `전용 ${p.areaTarget}㎡`,
        regionLabel: p.category,
      };
      return { preset: p, info, yearlyStats, manualPrice: manualPrices[id] };
    });
    setResults(next);
  };

  // 전체 프리셋 지역 데이터 로드
  const loadData = async (force = false) => {
    setLoading(true);
    try {
      if (force) {
        // 새로고침: 프리셋 지역의 캐시 제거 후 재조회
        const ymList = buildYearMonthList(years);
        for (const lawdCd of uniqueLawdCds) {
          for (const ym of ymList) globalCache.delete(getCacheKey(lawdCd, ym.dealYmd));
        }
      }
      const total = uniqueLawdCds.length;
      setProgress({ current: 0, total, label: `데이터 로딩 중... (0/${total} 지역)` });
      await loadManyRegions(
        uniqueLawdCds,
        years,
        globalCache,
        (done, totalRegions, lastLawdCd) => {
          const where = lastLawdCd ? `${getRegionName(lastLawdCd)} ` : '';
          setProgress({
            current: done,
            total: totalRegions,
            label: `${where}데이터 로딩 중... (${done}/${totalRegions} 지역)`,
          });
        }
      );
      recompute(monthFilter);
      loadedRef.current = true;
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0, label: '' });
    }
  };

  // 탭 최초 진입 시 자동 조회
  useEffect(() => {
    if (!loadedRef.current) void loadData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMonthFilter = (mf: number | null) => {
    setMonthFilter(mf);
    if (loadedRef.current) recompute(mf);
  };

  const handleManualPrice = (id: string, price: number | undefined) => {
    setManualPrices((prev) => ({ ...prev, [id]: price }));
    setResults((prev) => prev.map((r) => (r.info.id === id ? { ...r, manualPrice: price } : r)));
  };

  const handleBase = (id: string) => setBaseId((prev) => (prev === id ? '' : id));

  const effectivePrice = (r: PresetResult, y: number): number | null => {
    if (y === curYear && r.manualPrice != null && !isNaN(r.manualPrice)) return r.manualPrice;
    return r.yearlyStats[y]?.avgPrice ?? null;
  };

  const baseResult = results.find((r) => r.info.id === baseId) ?? null;

  const chartResults: ApartmentData[] =
    chartCategory === '전체' ? results : results.filter((r) => r.preset.category === chartCategory);

  return (
    <div className="space-y-4">
      {/* 헤더 카드 */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-800">⭐ 주요 아파트 국평 시세 현황</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              국평(전용 84㎡) 기준 · 직거래/법인/이상치 자동 제외 · 기준 아파트 선택 시 지수 표시
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">월 필터</label>
            <select
              className="select-base w-32"
              value={monthFilter ?? ''}
              onChange={(e) => handleMonthFilter(e.target.value === '' ? null : parseInt(e.target.value, 10))}
            >
              <option value="">전체 연평균</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
            <button className="btn-secondary" onClick={() => loadData(true)} disabled={loading}>
              🔄 새로고침
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-3 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-600">{progress.label || '조회 중...'}</p>
              {progress.total > 0 && (
                <div className="mt-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 카테고리별 테이블 */}
      {!loading && results.length > 0 && (
        <div className="card p-0 overflow-x-auto">
          <table
            className="text-sm border-collapse"
            style={{
              tableLayout: 'fixed',
              width: `${260 + years.reduce((s, y) => s + (y === curYear ? 120 : 90) + 60, 0)}px`,
            }}
          >
            <colgroup>
              <col style={{ width: '180px' }} />
              <col style={{ width: '80px' }} />
              {years.map((y) => (
                <React.Fragment key={y}>
                  <col style={{ width: y === curYear ? '120px' : '90px' }} />
                  <col style={{ width: '60px' }} />
                </React.Fragment>
              ))}
            </colgroup>

            {/* 단일 2단 헤더 (전체 테이블 최상단 1회만) */}
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th
                  rowSpan={2}
                  className="px-3 py-2 text-left font-semibold border border-gray-200 sticky left-0 bg-gray-100 z-20 align-bottom"
                >
                  아파트
                </th>
                <th rowSpan={2} className="px-2 py-2 text-center font-semibold border border-gray-200 align-bottom">
                  비고
                </th>
                {years.map((y) => (
                  <th
                    key={y}
                    colSpan={2}
                    className="px-2 py-2 text-center font-semibold border border-gray-200 border-l-2 border-l-gray-300 whitespace-nowrap"
                  >
                    {y}년{y === curYear ? ' (입력)' : ''}
                  </th>
                ))}
              </tr>
              <tr className="bg-gray-50 text-gray-500 text-xs">
                {years.map((y) => (
                  <React.Fragment key={y}>
                    <th className="px-1 py-1.5 text-center font-medium border border-gray-200 border-l-2 border-l-gray-300">
                      시세(억)
                    </th>
                    <th className="px-1 py-1.5 text-center font-medium border border-gray-200 bg-blue-50 text-blue-700">
                      지수
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody>
              {PRESET_CATEGORIES.map((cat) => {
                const rows = results.filter((r) => r.preset.category === cat);
                if (rows.length === 0) return null;
                return (
                  <React.Fragment key={cat}>
                    {/* 카테고리 구분 행 */}
                    <tr>
                      <td
                        colSpan={totalCols}
                        className="bg-gray-200 text-gray-700 font-bold text-xs px-3 py-1.5 border border-gray-200"
                      >
                        ── {cat} ──
                      </td>
                    </tr>

                    {rows.map((r) => {
                      const isBase = r.info.id === baseId;
                      const rowBg = isBase ? 'bg-blue-50' : 'bg-white';
                      return (
                        <tr key={r.info.id} className={`${rowBg} hover:bg-yellow-50 transition-colors`}>
                          {/* 아파트 (기준 라디오 + ★ + 이름) */}
                          <td className={`px-2 py-2 border border-gray-200 sticky left-0 z-10 ${rowBg}`}>
                            <label className="flex items-center gap-1.5 cursor-pointer" title="기준 설정/해제">
                              <input
                                type="radio"
                                name="presetBase"
                                checked={isBase}
                                onChange={() => handleBase(r.info.id)}
                                className="accent-blue-600 shrink-0"
                              />
                              {isBase && <span className="text-blue-600 shrink-0 leading-none">★</span>}
                              <span className="font-medium text-gray-800 text-xs truncate">{r.preset.label}</span>
                            </label>
                          </td>
                          {/* 비고 */}
                          <td className="px-1 py-2 border border-gray-200 text-[10px] text-gray-400 text-center truncate">
                            {r.preset.note || '-'}
                          </td>
                          {years.map((y) => {
                            const ys = r.yearlyStats[y];
                            const price = effectivePrice(r, y);
                            const basePrice = baseResult ? effectivePrice(baseResult, y) : null;
                            const idx =
                              baseId && basePrice != null && price != null
                                ? Math.round((price / basePrice) * 100)
                                : null;
                            const isInput = y === curYear;
                            return (
                              <React.Fragment key={y}>
                                {/* 시세 셀 */}
                                <td className="px-1 py-2 border border-gray-200 border-l-2 border-l-gray-300 text-center align-middle">
                                  {isInput ? (
                                    <div className="flex flex-col items-center gap-0.5">
                                      {ys?.avgPrice != null && (
                                        <span className="text-[9px] text-gray-400">API {ys.avgPrice.toFixed(2)}</span>
                                      )}
                                      <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        placeholder={ys?.avgPrice != null ? ys.avgPrice.toFixed(2) : '입력'}
                                        value={r.manualPrice ?? ''}
                                        onChange={(e) =>
                                          handleManualPrice(
                                            r.info.id,
                                            e.target.value === '' ? undefined : parseFloat(e.target.value)
                                          )
                                        }
                                        className="input-base w-[90px] text-center text-xs"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center leading-tight">
                                      <span className={`font-bold ${price != null ? 'text-gray-800' : 'text-gray-300'}`}>
                                        {price != null ? `${price.toFixed(2)}억` : '-'}
                                      </span>
                                      {ys && ys.count > 0 && (
                                        <span className="text-[10px] text-gray-400">실거래 {ys.count}</span>
                                      )}
                                    </div>
                                  )}
                                </td>
                                {/* 지수 셀 */}
                                <td
                                  className={`px-1 py-2 border border-gray-200 text-center align-middle text-xs ${idxClass(idx)}`}
                                >
                                  {idxText(idx)}
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 차트 */}
      {!loading && results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">📊 차트 카테고리</label>
            <select
              className="select-base w-40"
              value={chartCategory}
              onChange={(e) => setChartCategory(e.target.value)}
            >
              <option value="전체">전체</option>
              {PRESET_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {chartResults.length > 0 && <PriceChart results={chartResults} baseId={baseId} />}
        </div>
      )}

      <p className="text-xs text-gray-400">
        * 모든 aptNm·법정동코드는 국토부 실거래가 API로 직접 검증함. 신축/입주권 단지는 거래량이 적어 일부 연도가 비어 있을 수 있습니다.
      </p>
    </div>
  );
};

export default PresetComparePage;
