import React, { useState } from 'react';
import { PRESET_CATEGORIES } from '../data/presetApartments';
import { ApartmentData } from '../types';
import { getQueryYears } from '../utils/apiClient';
import { usePresetData, PresetResult, formatUpdatedAt } from '../hooks/usePresetData';
import PriceChart from './PriceChart';

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

  const { monthFilter, results, loading, progress, updatedAt, handleMonthFilter, handleManualPrice, reload } =
    usePresetData();

  const [baseId, setBaseId] = useState<string>(''); // '' = 기준 없음
  const [chartCategory, setChartCategory] = useState<string>('전체');

  const handleBase = (id: string) => setBaseId((prev) => (prev === id ? '' : id));

  const effectivePrice = (r: PresetResult, y: number): number | null => {
    if (y === curYear && r.manualPrice != null && !isNaN(r.manualPrice)) return r.manualPrice;
    return r.yearlyStats[y]?.avgPrice ?? null;
  };

  const baseResult = results.find((r) => r.info.id === baseId) ?? null;

  const chartResults: ApartmentData[] =
    chartCategory === '전체' ? results : results.filter((r) => r.preset.category === chartCategory);

  // ───────── 렌더 보조 (로직 불변, 표현만 담당) ─────────
  // 기준 아파트 선택 시에만 지수 컬럼 노출
  const showIdx = baseId !== '';
  const idxCols = showIdx ? pastYears.length + 2 : 0; // 과거연도 + 2026실거래 + 2026입력
  const idxSpan = showIdx ? 2 : 1; // 연도 그룹당 컬럼 수(시세[+지수])
  const totalCols = 2 + pastYears.length + 2 + idxCols; // 아파트+비고 + 시세들 + 지수들
  const COLW = { apt: 160, note: 70, year: 90, real: 90, input: 100, idx: 50 };
  const sumW =
    COLW.apt + COLW.note + pastYears.length * COLW.year + COLW.real + COLW.input + idxCols * COLW.idx;
  const tableWidth = Math.max(900, sumW);

  const calcIdx = (price: number | null, basePrice: number | null): number | null =>
    showIdx && price != null && basePrice != null && basePrice !== 0
      ? Math.round((price / basePrice) * 100)
      : null;

  // 시세 셀: "36.24억 (실거래 8)"
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

  // 2026 현재시세 입력 셀 (input 70px + "억", 위에 API 안내)
  const inputCell = (r: PresetResult, api2026: number | null) => (
    <td className="px-2 py-1.5 text-center align-middle border-b border-gray-100 border-l border-gray-200">
      <div className="flex flex-col items-center gap-0.5">
        {api2026 != null && (
          <span className="text-[9px] text-gray-400 leading-none">API {api2026.toFixed(2)}억</span>
        )}
        <div className="flex items-center justify-center gap-0.5">
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder={api2026 != null ? api2026.toFixed(2) : '입력'}
            value={r.manualPrice ?? ''}
            onChange={(e) =>
              handleManualPrice(r.info.id, e.target.value === '' ? undefined : parseFloat(e.target.value))
            }
            className="input-base text-center text-[12px] px-1 py-0"
            style={{ width: '70px', height: '28px' }}
          />
          <span className="text-[11px] text-gray-500">억</span>
        </div>
      </div>
    </td>
  );

  // 모바일 카드용 간략 시세
  const fmtShort = (p: number | null): string => (p != null ? `${p.toFixed(1)}억` : '-');

  // 비고 태그
  const noteTag = (note?: string) =>
    note ? (
      <span className="inline-block text-[10px] text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">{note}</span>
    ) : null;

  // 헤더 셀 공통 (스크롤 패널 상단에 고정 — 2단이므로 1행 top-0, 2행은 1행 높이만큼 오프셋)
  const thBase = 'px-1.5 py-2 font-semibold border-b border-blue-900 whitespace-nowrap sticky top-0 z-20';
  const thSub = 'px-1.5 py-1 font-medium border-b border-blue-800 whitespace-nowrap sticky top-[34px] z-20';

  let rowIdx = 0; // 데스크탑 zebra 줄무늬용 카운터

  return (
    <div className="space-y-4">
      {/* 헤더 카드 */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-800">⭐ 주요 아파트 국평 시세 현황</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              국평(전용 84㎡) · 직거래/법인/이상치 자동 제외 · {curYear}년 실거래/현재시세 분리 · 기준 선택 시 지수 표시
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">🕛 마지막 업데이트: {formatUpdatedAt(updatedAt)} (매일 자정 갱신)</p>
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
            <button className="btn-secondary" onClick={reload} disabled={loading}>
              🔄 새로고침
            </button>
          </div>
        </div>

        {/* 로딩 진행바 */}
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

      {/* ===== 데스크탑 테이블 (md 이상) ===== */}
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

            {/* 2단 헤더 (blue-800, sticky) */}
            <thead>
              <tr className="bg-blue-800 text-white text-left">
                <th rowSpan={2} className={`${thBase} text-left sticky left-0 z-30 bg-blue-800`}>아파트</th>
                <th rowSpan={2} className={`${thBase} text-center bg-blue-800`}>비고</th>
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
              {PRESET_CATEGORIES.map((cat) => {
                const rows = results.filter((r) => r.preset.category === cat);
                if (rows.length === 0) return null;
                return (
                  <React.Fragment key={cat}>
                    {/* 카테고리 구분 행 (심플 border-bottom) */}
                    <tr>
                      <td
                        colSpan={totalCols}
                        className="bg-[#f8f9fa] text-gray-500 text-[12px] text-center py-1 border-b border-gray-200"
                      >
                        ── {cat} ──
                      </td>
                    </tr>

                    {rows.map((r) => {
                      const isBase = r.info.id === baseId;
                      const zebra = rowIdx % 2 === 1 ? 'bg-[#fafafa]' : 'bg-white';
                      rowIdx++;
                      const rowBg = isBase ? 'bg-blue-100' : zebra;
                      const api2026 = r.yearlyStats[curYear]?.avgPrice ?? null;
                      const baseApi2026 = baseResult?.yearlyStats[curYear]?.avgPrice ?? null;
                      const eff2026 = effectivePrice(r, curYear);
                      const baseEff2026 = baseResult ? effectivePrice(baseResult, curYear) : null;
                      return (
                        <tr key={r.info.id} className={`group ${rowBg} hover:bg-blue-50 transition-colors`}>
                          {/* 아파트 (기준 라디오 + ★ + 이름, 줄바꿈 허용) */}
                          <td className={`px-2 py-1.5 border-b border-gray-100 border-r border-gray-200 sticky left-0 z-10 ${rowBg} group-hover:bg-blue-50`}>
                            <label className="flex items-start gap-1.5 cursor-pointer" title="기준 설정/해제">
                              <input
                                type="radio"
                                name="presetBase"
                                checked={isBase}
                                onChange={() => handleBase(r.info.id)}
                                className="accent-blue-600 shrink-0 w-3.5 h-3.5 mt-0.5"
                              />
                              <span className="font-semibold text-gray-800 text-[13px] leading-tight">
                                {isBase && <span className="text-blue-600 mr-0.5">★</span>}
                                {r.preset.label}
                              </span>
                            </label>
                          </td>
                          {/* 비고 */}
                          <td className="px-1 py-1.5 border-b border-gray-100 border-l border-gray-200 text-[10px] text-gray-400 text-center">
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
                          {inputCell(r, api2026)}
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

      {/* ===== 모바일 카드 (md 미만) ===== */}
      {!loading && results.length > 0 && (
        <div className="md:hidden">
          {PRESET_CATEGORIES.map((cat) => {
            const rows = results.filter((r) => r.preset.category === cat);
            if (rows.length === 0) return null;
            return (
              <div key={cat}>
                <div className="text-[12px] text-gray-500 text-center py-1.5">── {cat} ──</div>
                {rows.map((r) => {
                  const isBase = r.info.id === baseId;
                  const api2026 = r.yearlyStats[curYear]?.avgPrice ?? null;
                  return (
                    <div
                      key={r.info.id}
                      className={`rounded-lg shadow-sm bg-white p-3 mb-2 border ${
                        isBase ? 'border-2 border-blue-600' : 'border-gray-200'
                      }`}
                    >
                      {/* 상단: 이름 + 비고 / 기준 라디오 */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-[13px] text-gray-800">
                            {isBase && <span className="text-blue-600 mr-0.5">★</span>}
                            {r.preset.label}
                          </div>
                          {r.preset.note && <div className="mt-1">{noteTag(r.preset.note)}</div>}
                        </div>
                        <label className="flex items-center gap-1 cursor-pointer shrink-0">
                          <input
                            type="radio"
                            name="presetBaseMobile"
                            checked={isBase}
                            onChange={() => handleBase(r.info.id)}
                            className="accent-blue-600 w-4 h-4"
                          />
                          <span className="text-[10px] text-gray-500">기준</span>
                        </label>
                      </div>

                      {/* 본문: 연도별 시세 미니 테이블 (가로 스크롤) */}
                      <div className="mt-2 overflow-x-auto">
                        <table className="text-[11px] border-collapse w-full min-w-max">
                          <tbody>
                            <tr className="text-gray-500">
                              <td className="px-2 py-1 border border-gray-100 bg-gray-50 font-medium">연도</td>
                              {pastYears.map((y) => (
                                <td key={y} className="px-2 py-1 border border-gray-100 bg-gray-50 text-center">{y}</td>
                              ))}
                              <td className="px-2 py-1 border border-gray-100 bg-gray-50 text-center whitespace-nowrap">
                                {curYear} 실거래
                              </td>
                            </tr>
                            <tr>
                              <td className="px-2 py-1 border border-gray-100 bg-gray-50 font-medium text-gray-500">시세</td>
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

                      {/* 하단: 2026 현재시세 입력 (full width) */}
                      <div className="mt-2">
                        <label className="text-[10px] text-gray-500 block mb-0.5">
                          {curYear} 현재시세 입력
                          {api2026 != null && <span className="text-gray-400"> (API {api2026.toFixed(2)}억)</span>}
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder={api2026 != null ? api2026.toFixed(2) : '입력'}
                            value={r.manualPrice ?? ''}
                            onChange={(e) =>
                              handleManualPrice(r.info.id, e.target.value === '' ? undefined : parseFloat(e.target.value))
                            }
                            className="input-base w-full text-[13px]"
                            style={{ height: '32px' }}
                          />
                          <span className="text-[12px] text-gray-500 shrink-0">억</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
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
