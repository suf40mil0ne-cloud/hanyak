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

/** 지수 셀 색상: 100=파랑 bold, >110=빨강, <90=초록, 90~110=회색 */
function idxClass(idx: number | null): string {
  if (idx == null) return 'text-gray-300';
  if (idx === 100) return 'text-blue-600 font-bold';
  if (idx > 110) return 'text-red-500';
  if (idx < 90) return 'text-green-500';
  return 'text-gray-500';
}

const PresetComparePage: React.FC = () => {
  const years = getQueryYears();
  const curYear = years[years.length - 1];
  const pastYears = years.slice(0, -1); // 2026 이전 연도 (실거래 단일 컬럼)

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

  // 프리셋 지역 데이터 로드 (mf 모드에 필요한 연월만 조회; 이미 캐시된 건 건너뜀)
  const loadData = async (force = false, mf: number | null = monthFilter) => {
    setLoading(true);
    try {
      if (force) {
        // 새로고침: 프리셋 지역의 캐시를 전부(연평균 범위) 제거 후 재조회
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
          const loading = p.loadingLawdCds
            .filter((cd) => cd !== p.lastDoneLawdCd)
            .slice(0, 2)
            .map(getRegionName);
          const loadingTxt = loading.length ? `${loading.join(', ')} 조회 중...` : '';
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

  // 탭 최초 진입 시 자동 조회
  useEffect(() => {
    if (!loadedRef.current) void loadData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMonthFilter = (mf: number | null) => {
    setMonthFilter(mf);
    if (!loadedRef.current) return;
    // 해당 모드에 필요한 연월이 모두 캐시돼 있으면 네트워크 없이 즉시 재계산,
    // 일부 누락(부분 실패 등) 시 그 월만 추가 로드.
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

  const handleBase = (id: string) => setBaseId((prev) => (prev === id ? '' : id));

  const effectivePrice = (r: PresetResult, y: number): number | null => {
    if (y === curYear && r.manualPrice != null && !isNaN(r.manualPrice)) return r.manualPrice;
    return r.yearlyStats[y]?.avgPrice ?? null;
  };

  const baseResult = results.find((r) => r.info.id === baseId) ?? null;

  const chartResults: ApartmentData[] =
    chartCategory === '전체' ? results : results.filter((r) => r.preset.category === chartCategory);

  // 기준 아파트 선택 시에만 지수 컬럼 노출 (미선택 시 테이블이 좁아짐)
  const showIdx = baseId !== '';
  const idxColCount = showIdx ? 1 : 0;
  // 컬럼: 아파트 + 비고 + 이전연도(시세[+지수]) + 2026실거래(시세[+지수]) + 2026입력(시세[+지수])
  const totalCols = 2 + pastYears.length * (1 + idxColCount) + (1 + idxColCount) * 2;
  const tableWidth =
    140 + 60 + pastYears.length * (75 + (showIdx ? 45 : 0)) + (75 + (showIdx ? 45 : 0)) + (85 + (showIdx ? 45 : 0));

  // 지수 = round(가격/기준가격×100); 기준 미선택이면 null → 컬럼 자체가 숨겨짐
  const calcIdx = (price: number | null, basePrice: number | null): number | null =>
    showIdx && price != null && basePrice != null && basePrice !== 0
      ? Math.round((price / basePrice) * 100)
      : null;

  // 시세 셀: "36.24억 (실거래 8)" 한 줄
  const priceTd = (price: number | null, count: number) => (
    <td className="px-2 py-1 border border-gray-200 border-l-2 border-l-gray-300 text-center align-middle whitespace-nowrap">
      {price != null ? (
        <>
          <span className="text-[13px] font-bold text-gray-800">{price.toFixed(2)}억</span>
          {count > 0 && <span className="text-[10px] text-gray-400 ml-1">(실거래 {count})</span>}
        </>
      ) : (
        <span className="text-[13px] text-gray-300">-</span>
      )}
    </td>
  );

  // 지수 셀
  const idxTd = (idx: number | null) => (
    <td className={`px-2 py-1 border border-gray-200 text-center align-middle text-[11px] ${idxClass(idx)}`}>
      {idx == null ? '-' : idx}
    </td>
  );

  return (
    <div className="space-y-4">
      {/* 헤더 카드 */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-800">⭐ 주요 아파트 국평 시세 현황</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              국평(전용 84㎡) 기준 · 직거래/법인/이상치 자동 제외 · {curYear}년은 실거래/현재시세(입력) 분리 · 기준 아파트 선택 시 지수 표시
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
            className="text-[12px] border-collapse"
            style={{ tableLayout: 'fixed', width: `${tableWidth}px` }}
          >
            <colgroup>
              <col style={{ width: '140px' }} />
              <col style={{ width: '60px' }} />
              {pastYears.map((y) => (
                <React.Fragment key={y}>
                  <col style={{ width: '75px' }} />
                  {showIdx && <col style={{ width: '45px' }} />}
                </React.Fragment>
              ))}
              {/* 2026 실거래 */}
              <col style={{ width: '75px' }} />
              {showIdx && <col style={{ width: '45px' }} />}
              {/* 2026 입력 */}
              <col style={{ width: '85px' }} />
              {showIdx && <col style={{ width: '45px' }} />}
            </colgroup>

            {/* 2단 헤더 (sticky top) */}
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th
                  rowSpan={2}
                  className="px-2 py-1 text-left font-semibold border border-gray-200 sticky left-0 top-0 bg-gray-100 z-30 align-bottom"
                >
                  아파트
                </th>
                <th
                  rowSpan={2}
                  className="px-1 py-1 text-center font-semibold border border-gray-200 sticky top-0 bg-gray-100 z-20 align-bottom"
                >
                  비고
                </th>
                {pastYears.map((y) => (
                  <th
                    key={y}
                    colSpan={1 + idxColCount}
                    className="px-1 py-1 text-center font-semibold border border-gray-200 border-l-2 border-l-gray-300 whitespace-nowrap sticky top-0 bg-gray-100 z-20"
                  >
                    {y}
                  </th>
                ))}
                <th
                  colSpan={1 + idxColCount}
                  className="px-1 py-1 text-center font-semibold border border-gray-200 border-l-2 border-l-gray-300 whitespace-nowrap sticky top-0 bg-gray-100 z-20"
                >
                  {curYear} 실거래
                </th>
                <th
                  colSpan={1 + idxColCount}
                  className="px-1 py-1 text-center font-semibold border border-gray-200 border-l-2 border-l-gray-300 whitespace-nowrap sticky top-0 bg-gray-100 z-20"
                >
                  {curYear} 현재시세
                </th>
              </tr>
              <tr className="bg-gray-100 text-gray-500">
                {pastYears.map((y) => (
                  <React.Fragment key={y}>
                    <th className="px-1 py-0.5 text-center font-medium border border-gray-200 border-l-2 border-l-gray-300 whitespace-nowrap sticky top-[26px] bg-gray-100 z-20">
                      시세
                    </th>
                    {showIdx && (
                      <th className="px-1 py-0.5 text-center font-medium border border-gray-200 sticky top-[26px] bg-gray-100 z-20">
                        지수
                      </th>
                    )}
                  </React.Fragment>
                ))}
                {/* 2026 실거래 */}
                <th className="px-1 py-0.5 text-center font-medium border border-gray-200 border-l-2 border-l-gray-300 whitespace-nowrap sticky top-[26px] bg-gray-100 z-20">
                  시세
                </th>
                {showIdx && (
                  <th className="px-1 py-0.5 text-center font-medium border border-gray-200 sticky top-[26px] bg-gray-100 z-20">
                    지수
                  </th>
                )}
                {/* 2026 입력 */}
                <th className="px-1 py-0.5 text-center font-medium border border-gray-200 border-l-2 border-l-gray-300 whitespace-nowrap sticky top-[26px] bg-gray-100 text-blue-700 z-20">
                  입력
                </th>
                {showIdx && (
                  <th className="px-1 py-0.5 text-center font-medium border border-gray-200 sticky top-[26px] bg-gray-100 z-20">
                    지수
                  </th>
                )}
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
                        className="bg-gray-50 text-gray-500 text-[11px] font-medium px-2 py-0.5 border border-gray-200 border-l-2 border-l-gray-300"
                      >
                        {cat}
                      </td>
                    </tr>

                    {rows.map((r) => {
                      const isBase = r.info.id === baseId;
                      const rowBg = isBase ? 'bg-blue-50' : 'bg-white';
                      const api2026 = r.yearlyStats[curYear]?.avgPrice ?? null;
                      const baseApi2026 = baseResult?.yearlyStats[curYear]?.avgPrice ?? null;
                      const eff2026 = effectivePrice(r, curYear);
                      const baseEff2026 = baseResult ? effectivePrice(baseResult, curYear) : null;
                      return (
                        <tr key={r.info.id} className={`${rowBg} hover:bg-gray-50 transition-colors`}>
                          {/* 아파트 (기준 라디오 + ★ + 이름) */}
                          <td className={`px-2 py-1 border border-gray-200 sticky left-0 z-10 ${rowBg}`}>
                            <label className="flex items-center gap-1 cursor-pointer" title="기준 설정/해제">
                              <input
                                type="radio"
                                name="presetBase"
                                checked={isBase}
                                onChange={() => handleBase(r.info.id)}
                                className="accent-blue-600 shrink-0 w-3 h-3"
                              />
                              {isBase && <span className="text-blue-600 shrink-0 leading-none text-[11px]">★</span>}
                              <span className="font-medium text-gray-800 text-[12px] truncate">{r.preset.label}</span>
                            </label>
                          </td>
                          {/* 비고 */}
                          <td className="px-1 py-1 border border-gray-200 text-[10px] text-gray-400 text-center truncate">
                            {r.preset.note || '-'}
                          </td>

                          {/* 이전 연도 실거래 */}
                          {pastYears.map((y) => {
                            const ys = r.yearlyStats[y];
                            const price = ys?.avgPrice ?? null;
                            const basePrice = baseResult?.yearlyStats[y]?.avgPrice ?? null;
                            return (
                              <React.Fragment key={y}>
                                {priceTd(price, ys?.count ?? 0)}
                                {showIdx && idxTd(calcIdx(price, basePrice))}
                              </React.Fragment>
                            );
                          })}

                          {/* 2026 실거래 */}
                          {priceTd(api2026, r.yearlyStats[curYear]?.count ?? 0)}
                          {showIdx && idxTd(calcIdx(api2026, baseApi2026))}

                          {/* 2026 현재시세(입력) */}
                          <td className="px-1 py-1 border border-gray-200 border-l-2 border-l-gray-300 text-center align-middle">
                            <div className="flex flex-col items-center gap-0.5">
                              {api2026 != null && (
                                <span className="text-[9px] text-gray-400 leading-none">API {api2026.toFixed(2)}억</span>
                              )}
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder={api2026 != null ? api2026.toFixed(2) : '입력'}
                                value={r.manualPrice ?? ''}
                                onChange={(e) =>
                                  handleManualPrice(
                                    r.info.id,
                                    e.target.value === '' ? undefined : parseFloat(e.target.value)
                                  )
                                }
                                className="input-base h-6 w-full text-center text-[12px] px-1 py-0"
                              />
                            </div>
                          </td>
                          {showIdx && idxTd(calcIdx(eff2026, baseEff2026))}
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
