import React, { useState } from 'react';
import { PRESET_CATEGORIES } from '../data/presetApartments';
import { ApartmentData, ApartmentInfo, FilterOptions } from '../types';
import { loadAllData, getQueryYears, globalCache } from '../utils/apiClient';
import { calcYearlyStats, exactMatcher } from '../utils/priceFilter';
import { usePresetData } from '../hooks/usePresetData';
import MyApartmentSetup from './MyApartmentSetup';
import AnalysisCard from './AnalysisCard';

const DEFAULT_FILTER: Omit<FilterOptions, 'monthFilter'> = {
  excludeDirect: true,
  excludeCorporate: true,
  excludeOutliers: true,
};

/** 지수 셀 색상: 100=파랑 bold, >110=빨강, <90=초록, 90~110=회색 */
function idxClass(idx: number | null): string {
  if (idx == null) return 'text-gray-300';
  if (idx === 100) return 'text-blue-600 font-bold';
  if (idx > 110) return 'text-red-500';
  if (idx < 90) return 'text-green-500';
  return 'text-gray-500';
}

const CompareWithPresetPage: React.FC = () => {
  const years = getQueryYears();
  const curYear = years[years.length - 1];
  const pastYears = years.slice(0, -1);

  const { monthFilter, results, loading, progress, handleMonthFilter, handleManualPrice, reload } =
    usePresetData();

  // 기준(내) 아파트
  const [baseInfo, setBaseInfo] = useState<ApartmentInfo | null>(null);
  const [baseData, setBaseData] = useState<ApartmentData | null>(null);
  const [baseLoading, setBaseLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(''); // 분석 대상 비교 아파트

  const recomputeBase = (info: ApartmentInfo, mf: number | null) => {
    const yearlyStats = calcYearlyStats(
      globalCache,
      info.lawdCd,
      years,
      exactMatcher(info.name),
      info.area,
      { ...DEFAULT_FILTER, monthFilter: mf },
      `${info.name} ${info.areaLabel}`
    );
    setBaseData((prev) => ({ info, yearlyStats, manualPrice: prev?.info.id === info.id ? prev.manualPrice : undefined }));
  };

  const handleConfirmBase = async (info: ApartmentInfo) => {
    setBaseInfo(info);
    setBaseLoading(true);
    try {
      // 기준 아파트 지역의 5개년 전체(연평균 범위) 데이터를 캐시에 로드 → 이후 월필터 전환도 네트워크 없이 재계산
      await loadAllData(info.lawdCd, years, globalCache, () => {});
      recomputeBase(info, monthFilter);
    } finally {
      setBaseLoading(false);
    }
  };

  const handleClearBase = () => {
    setBaseInfo(null);
    setBaseData(null);
  };

  // 월 필터: 프리셋 + 기준 아파트 동시 재계산
  const onMonthFilter = (mf: number | null) => {
    handleMonthFilter(mf);
    if (baseInfo) recomputeBase(baseInfo, mf);
  };

  const handleBaseManualPrice = (price: number | undefined) => {
    setBaseData((prev) => (prev ? { ...prev, manualPrice: price } : prev));
  };

  const showIdx = baseData != null;
  const compareData = results.find((r) => r.info.id === selectedId) ?? null;

  const effectivePrice = (data: ApartmentData | null, y: number): number | null => {
    if (!data) return null;
    if (y === curYear && data.manualPrice != null && !isNaN(data.manualPrice)) return data.manualPrice;
    return data.yearlyStats[y]?.avgPrice ?? null;
  };

  const calcIdx = (price: number | null, basePrice: number | null): number | null =>
    showIdx && price != null && basePrice != null && basePrice !== 0
      ? Math.round((price / basePrice) * 100)
      : null;

  // ───────── 테이블 레이아웃 ─────────
  const idxCols = showIdx ? pastYears.length + 2 : 0;
  const idxSpan = showIdx ? 2 : 1;
  const totalCols = 2 + pastYears.length + 2 + idxCols;
  const COLW = { apt: 160, note: 90, year: 90, real: 90, input: 100, idx: 50 };
  const sumW =
    COLW.apt + COLW.note + pastYears.length * COLW.year + COLW.real + COLW.input + idxCols * COLW.idx;
  const tableWidth = Math.max(900, sumW);

  const thBase = 'px-1.5 py-2 font-semibold border-b border-blue-900 whitespace-nowrap sticky top-0 z-20';
  const thSub = 'px-1.5 py-1 font-medium border-b border-blue-800 whitespace-nowrap sticky top-[34px] z-20';

  const priceTd = (price: number | null, count: number) => (
    <td className="px-2 py-1.5 text-center align-middle whitespace-nowrap border-b border-gray-100 border-l border-gray-200">
      {price != null ? (
        <span>
          <span className="text-[13px] font-bold text-gray-800">{price.toFixed(2)}억</span>
          {count > 0 && <span className="text-[10px] text-gray-400 ml-1">(실거래 {count})</span>}
        </span>
      ) : (
        <span className="text-[13px] text-gray-300">-</span>
      )}
    </td>
  );

  const idxTd = (idx: number | null) => (
    <td className={`px-1 py-1.5 text-center align-middle text-[11px] border-b border-gray-100 ${idxClass(idx)}`}>
      {idx == null ? '-' : idx}
    </td>
  );

  // 2026 현재시세 입력 셀
  const inputCell = (api2026: number | null, value: number | undefined, onChange: (p: number | undefined) => void) => (
    <td className="px-2 py-1.5 text-center align-middle border-b border-gray-100 border-l border-gray-200">
      <div className="flex flex-col items-center gap-0.5">
        {api2026 != null && <span className="text-[9px] text-gray-400 leading-none">API {api2026.toFixed(2)}억</span>}
        <div className="flex items-center justify-center gap-0.5">
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder={api2026 != null ? api2026.toFixed(2) : '입력'}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            className="input-base text-center text-[12px] px-1 py-0"
            style={{ width: '70px', height: '28px' }}
          />
          <span className="text-[11px] text-gray-500">억</span>
        </div>
      </div>
    </td>
  );

  const fmtShort = (p: number | null): string => (p != null ? `${p.toFixed(1)}억` : '-');

  // 기준 아파트 행 (테이블/카드 최상단 고정)
  const baseDesktopRow = baseData && (
    <tr className="bg-blue-100">
      <td className="px-2 py-1.5 border-b border-gray-200 border-r border-gray-200 sticky left-0 z-10 bg-blue-100">
        <span className="font-bold text-blue-900 text-[13px] leading-tight">📍 {baseData.info.name}</span>
        <div className="text-[10px] text-blue-500">{baseData.info.areaLabel} · {baseData.info.regionLabel}</div>
      </td>
      <td className="px-1 py-1.5 border-b border-gray-200 border-l border-gray-200 text-center">
        <span className="inline-block text-[10px] text-white bg-blue-600 rounded px-1.5 py-0.5 font-semibold">내 아파트</span>
      </td>
      {pastYears.map((y) => (
        <React.Fragment key={y}>
          {priceTd(baseData.yearlyStats[y]?.avgPrice ?? null, baseData.yearlyStats[y]?.count ?? 0)}
          {showIdx && idxTd(100)}
        </React.Fragment>
      ))}
      {priceTd(baseData.yearlyStats[curYear]?.avgPrice ?? null, baseData.yearlyStats[curYear]?.count ?? 0)}
      {showIdx && idxTd(100)}
      {inputCell(baseData.yearlyStats[curYear]?.avgPrice ?? null, baseData.manualPrice, handleBaseManualPrice)}
      {showIdx && idxTd(100)}
    </tr>
  );

  return (
    <div className="space-y-4">
      {/* 상단: 내 아파트 설정 */}
      <MyApartmentSetup
        baseInfo={baseInfo}
        onConfirm={handleConfirmBase}
        onClear={handleClearBase}
        loading={baseLoading}
      />

      {/* 중간: 주요 아파트 시세 테이블 */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-800">🏠 주요 아파트와 비교</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {showIdx
                ? '모든 지수는 내 아파트 기준(=100) · 행을 클릭하면 아래에서 AI 분석을 확인할 수 있습니다.'
                : '기준 아파트를 설정하면 지수와 AI 분석이 표시됩니다.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">월 필터</label>
            <select
              className="select-base w-32"
              value={monthFilter ?? ''}
              onChange={(e) => onMonthFilter(e.target.value === '' ? null : parseInt(e.target.value, 10))}
            >
              <option value="">전체 연평균</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
            <button className="btn-secondary" onClick={reload} disabled={loading}>
              🔄 새로고침
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1 gap-2">
              <p className="text-xs text-gray-600 truncate">{progress.label || '데이터 로딩 중...'}</p>
              {progress.total > 0 && (
                <span className="text-xs font-semibold text-blue-600 shrink-0">{progress.current}%</span>
              )}
            </div>
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.total > 0 ? progress.current : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 데스크탑 테이블 */}
      {!loading && results.length > 0 && (
        <div className="hidden md:block card p-0 overflow-auto max-h-[78vh]">
          <table
            className="text-[12px] border-collapse w-full shadow-sm"
            style={{ tableLayout: 'fixed', minWidth: `${tableWidth}px` }}
          >
            <colgroup>
              <col style={{ width: `${COLW.apt}px` }} />
              <col style={{ width: `${COLW.note}px` }} />
              {pastYears.map((y) => (
                <React.Fragment key={y}>
                  <col style={{ width: `${COLW.year}px` }} />
                  {showIdx && <col style={{ width: `${COLW.idx}px` }} />}
                </React.Fragment>
              ))}
              <col style={{ width: `${COLW.real}px` }} />
              {showIdx && <col style={{ width: `${COLW.idx}px` }} />}
              <col style={{ width: `${COLW.input}px` }} />
              {showIdx && <col style={{ width: `${COLW.idx}px` }} />}
            </colgroup>

            <thead>
              <tr className="bg-blue-800 text-white text-left">
                <th rowSpan={2} className={`${thBase} text-left sticky left-0 z-30 bg-blue-800`}>아파트</th>
                <th rowSpan={2} className={`${thBase} text-center bg-blue-800`}>선택/비고</th>
                {pastYears.map((y) => (
                  <th key={y} colSpan={idxSpan} className={`${thBase} text-center bg-blue-800`}>{y}</th>
                ))}
                <th colSpan={idxSpan} className={`${thBase} text-center bg-blue-800`}>{curYear} 실거래</th>
                <th colSpan={idxSpan} className={`${thBase} text-center bg-blue-800`}>{curYear} 현재시세</th>
              </tr>
              <tr className="bg-blue-700 text-blue-50">
                {pastYears.map((y) => (
                  <React.Fragment key={y}>
                    <th className={`${thSub} text-center bg-blue-700`}>시세</th>
                    {showIdx && <th className={`${thSub} text-center bg-blue-700`}>지수</th>}
                  </React.Fragment>
                ))}
                <th className={`${thSub} text-center bg-blue-700`}>시세</th>
                {showIdx && <th className={`${thSub} text-center bg-blue-700`}>지수</th>}
                <th className={`${thSub} text-center bg-blue-700`}>입력</th>
                {showIdx && <th className={`${thSub} text-center bg-blue-700`}>지수</th>}
              </tr>
            </thead>

            <tbody>
              {/* 기준(내) 아파트 고정 행 */}
              {baseDesktopRow}

              {PRESET_CATEGORIES.map((cat) => {
                const rows = results.filter((r) => r.preset.category === cat);
                if (rows.length === 0) return null;
                return (
                  <React.Fragment key={cat}>
                    <tr>
                      <td
                        colSpan={totalCols}
                        className="bg-[#f8f9fa] text-gray-500 text-[12px] text-center py-1 border-b border-gray-200"
                      >
                        ── {cat} ──
                      </td>
                    </tr>
                    {rows.map((r) => {
                      const isSelected = r.info.id === selectedId;
                      const rowBg = isSelected ? 'bg-amber-50' : 'bg-white';
                      const api2026 = r.yearlyStats[curYear]?.avgPrice ?? null;
                      const baseEff = (y: number) => effectivePrice(baseData, y);
                      const eff2026 = effectivePrice(r, curYear);
                      return (
                        <tr
                          key={r.info.id}
                          onClick={() => setSelectedId(r.info.id)}
                          className={`group cursor-pointer ${rowBg} hover:bg-blue-50 transition-colors`}
                        >
                          <td className={`px-2 py-1.5 border-b border-gray-100 border-r border-gray-200 sticky left-0 z-10 ${rowBg} group-hover:bg-blue-50`}>
                            <span className="font-semibold text-gray-800 text-[13px] leading-tight">
                              {isSelected && <span className="text-amber-500 mr-0.5">●</span>}
                              {r.preset.label}
                            </span>
                          </td>
                          <td className="px-1 py-1.5 border-b border-gray-100 border-l border-gray-200 text-center">
                            <input
                              type="radio"
                              name="comparePick"
                              checked={isSelected}
                              onChange={() => setSelectedId(r.info.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="accent-blue-600 w-3.5 h-3.5"
                            />
                          </td>

                          {pastYears.map((y) => {
                            const ys = r.yearlyStats[y];
                            const price = ys?.avgPrice ?? null;
                            return (
                              <React.Fragment key={y}>
                                {priceTd(price, ys?.count ?? 0)}
                                {showIdx && idxTd(calcIdx(price, baseEff(y)))}
                              </React.Fragment>
                            );
                          })}

                          {priceTd(api2026, r.yearlyStats[curYear]?.count ?? 0)}
                          {showIdx && idxTd(calcIdx(api2026, baseData?.yearlyStats[curYear]?.avgPrice ?? null))}

                          {inputCell(api2026, r.manualPrice, (p) => handleManualPrice(r.info.id, p))}
                          {showIdx && idxTd(calcIdx(eff2026, effectivePrice(baseData, curYear)))}
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

      {/* 모바일 카드 */}
      {!loading && results.length > 0 && (
        <div className="md:hidden space-y-2">
          {/* 기준 아파트 카드 */}
          {baseData && (
            <div className="rounded-lg shadow-sm bg-blue-50 p-3 border-2 border-blue-600">
              <div className="flex items-center justify-between">
                <div className="font-bold text-[13px] text-blue-900">📍 {baseData.info.name}</div>
                <span className="text-[10px] text-white bg-blue-600 rounded px-1.5 py-0.5 font-semibold">내 아파트</span>
              </div>
              <div className="text-[11px] text-blue-500 mb-2">{baseData.info.areaLabel} · {baseData.info.regionLabel}</div>
              <div className="overflow-x-auto">
                <table className="text-[11px] border-collapse w-full min-w-max">
                  <tbody>
                    <tr className="text-gray-500">
                      {pastYears.map((y) => (
                        <td key={y} className="px-2 py-1 border border-blue-100 bg-white/60 text-center">{y}</td>
                      ))}
                      <td className="px-2 py-1 border border-blue-100 bg-white/60 text-center whitespace-nowrap">{curYear}</td>
                    </tr>
                    <tr>
                      {pastYears.map((y) => (
                        <td key={y} className="px-2 py-1 border border-blue-100 text-center font-bold text-gray-800">
                          {fmtShort(baseData.yearlyStats[y]?.avgPrice ?? null)}
                        </td>
                      ))}
                      <td className="px-2 py-1 border border-blue-100 text-center font-bold text-gray-800">
                        {fmtShort(effectivePrice(baseData, curYear))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {PRESET_CATEGORIES.map((cat) => {
            const rows = results.filter((r) => r.preset.category === cat);
            if (rows.length === 0) return null;
            return (
              <div key={cat}>
                <div className="text-[12px] text-gray-500 text-center py-1.5">── {cat} ──</div>
                {rows.map((r) => {
                  const isSelected = r.info.id === selectedId;
                  const api2026 = r.yearlyStats[curYear]?.avgPrice ?? null;
                  return (
                    <div
                      key={r.info.id}
                      onClick={() => setSelectedId(r.info.id)}
                      className={`rounded-lg shadow-sm p-3 mb-2 border cursor-pointer ${
                        isSelected ? 'border-2 border-amber-400 bg-amber-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-[13px] text-gray-800">
                          {isSelected && <span className="text-amber-500 mr-0.5">●</span>}
                          {r.preset.label}
                        </div>
                        {showIdx && (
                          <span className={`text-[12px] font-bold ${idxClass(calcIdx(effectivePrice(r, curYear), effectivePrice(baseData, curYear)))}`}>
                            지수 {calcIdx(effectivePrice(r, curYear), effectivePrice(baseData, curYear)) ?? '-'}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 overflow-x-auto">
                        <table className="text-[11px] border-collapse w-full min-w-max">
                          <tbody>
                            <tr className="text-gray-500">
                              {pastYears.map((y) => (
                                <td key={y} className="px-2 py-1 border border-gray-100 bg-gray-50 text-center">{y}</td>
                              ))}
                              <td className="px-2 py-1 border border-gray-100 bg-gray-50 text-center whitespace-nowrap">{curYear}</td>
                            </tr>
                            <tr>
                              {pastYears.map((y) => (
                                <td key={y} className="px-2 py-1 border border-gray-100 text-center font-bold text-gray-800">
                                  {fmtShort(r.yearlyStats[y]?.avgPrice ?? null)}
                                </td>
                              ))}
                              <td className="px-2 py-1 border border-gray-100 text-center font-bold text-gray-800">
                                {fmtShort(api2026)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* 하단: AI 분석 카드 */}
      <div>
        {!showIdx ? (
          <div className="card text-center py-8">
            <p className="text-3xl mb-2">🏠</p>
            <p className="text-gray-500 text-sm">먼저 상단에서 <span className="font-semibold text-gray-700">내 아파트(기준)</span>를 설정하세요.</p>
          </div>
        ) : !compareData ? (
          <div className="card text-center py-8">
            <p className="text-3xl mb-2">👆</p>
            <p className="text-gray-500 text-sm">주요 아파트 목록에서 비교할 아파트를 선택하세요.</p>
          </div>
        ) : (
          baseData && <AnalysisCard baseData={baseData} compareData={compareData} years={years} />
        )}
      </div>

      <p className="text-xs text-gray-400">
        * 지수는 내 아파트 = 100 기준. {curYear}년은 실거래(API) 우선, 없으면 입력값을 사용합니다. AI 분석은 규칙 기반 자동 생성입니다.
      </p>
    </div>
  );
};

export default CompareWithPresetPage;
