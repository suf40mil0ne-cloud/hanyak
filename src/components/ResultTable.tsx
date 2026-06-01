import React from 'react';
import { ApartmentData } from '../types';
import { getQueryYears } from '../utils/apiClient';

interface Props {
  results: ApartmentData[];
  baseId: string;
  onManualPriceChange: (id: string, price: number | undefined) => void;
}

/** 지수 셀 색상: 100=파랑 bold, >110=빨강, <90=초록, 90~110=회색 */
function idxClass(idx: number | null): string {
  if (idx == null) return 'text-gray-300';
  if (idx === 100) return 'text-blue-600 font-bold';
  if (idx > 110) return 'text-red-500';
  if (idx < 90) return 'text-green-500';
  return 'text-gray-500';
}

const ResultTable: React.FC<Props> = ({ results, baseId, onManualPriceChange }) => {
  const years = getQueryYears();
  const curYear = years[years.length - 1];
  const pastYears = years.slice(0, -1);
  const isMultiple = results.length >= 2;
  const baseResult = results.find((r) => r.info.id === baseId) ?? results[0];

  if (results.length === 0) return null;

  // 지수 컬럼은 비교 대상이 2개 이상일 때만 노출
  const showIdx = isMultiple;
  const idxColCount = showIdx ? 1 : 0;
  const tableWidth =
    160 + pastYears.length * (75 + (showIdx ? 45 : 0)) + (75 + (showIdx ? 45 : 0)) + (85 + (showIdx ? 45 : 0));

  const effectivePrice = (data: ApartmentData, year: number): number | null => {
    if (year === curYear && data.manualPrice != null && !isNaN(data.manualPrice)) return data.manualPrice;
    return data.yearlyStats[year]?.avgPrice ?? null;
  };

  const calcIdx = (price: number | null, basePrice: number | null): number | null =>
    showIdx && price != null && basePrice != null && basePrice !== 0
      ? Math.round((price / basePrice) * 100)
      : null;

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

  const idxTd = (idx: number | null) => (
    <td className={`px-2 py-1 border border-gray-200 text-center align-middle text-[11px] ${idxClass(idx)}`}>
      {idx == null ? '-' : idx}
    </td>
  );

  return (
    <div className="card p-0">
      <h2 className="text-base font-semibold text-gray-800 px-4 pt-3 pb-2">
        실거래가 결과
        {isMultiple && baseResult && (
          <span className="ml-2 text-sm text-blue-600 font-normal">
            (기준: {baseResult.info.name} {baseResult.info.areaLabel})
          </span>
        )}
      </h2>

      <div className="overflow-x-auto">
        <table className="text-[12px] border-collapse" style={{ tableLayout: 'fixed', width: `${tableWidth}px` }}>
          <colgroup>
            <col style={{ width: '160px' }} />
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

          <thead>
            {/* 1단: 연도 */}
            <tr className="bg-gray-100 text-gray-700">
              <th
                rowSpan={2}
                className="text-left px-2 py-1 font-semibold border border-gray-200 sticky left-0 top-0 bg-gray-100 z-30 whitespace-nowrap align-bottom"
              >
                아파트
              </th>
              {pastYears.map((y) => (
                <th
                  key={y}
                  colSpan={1 + idxColCount}
                  className="px-1 py-1 font-semibold border border-gray-200 border-l-2 border-l-gray-300 text-center whitespace-nowrap sticky top-0 bg-gray-100 z-20"
                >
                  {y}
                </th>
              ))}
              <th
                colSpan={1 + idxColCount}
                className="px-1 py-1 font-semibold border border-gray-200 border-l-2 border-l-gray-300 text-center whitespace-nowrap sticky top-0 bg-gray-100 z-20"
              >
                {curYear} 실거래
              </th>
              <th
                colSpan={1 + idxColCount}
                className="px-1 py-1 font-semibold border border-gray-200 border-l-2 border-l-gray-300 text-center whitespace-nowrap sticky top-0 bg-gray-100 z-20"
              >
                {curYear} 현재시세
              </th>
            </tr>
            {/* 2단: 시세 / 지수 */}
            <tr className="bg-gray-100 text-gray-500">
              {pastYears.map((y) => (
                <React.Fragment key={y}>
                  <th className="px-1 py-0.5 font-medium border border-gray-200 border-l-2 border-l-gray-300 text-center whitespace-nowrap sticky top-[26px] bg-gray-100 z-20">
                    시세
                  </th>
                  {showIdx && (
                    <th className="px-1 py-0.5 font-medium border border-gray-200 text-center sticky top-[26px] bg-gray-100 z-20">
                      지수
                    </th>
                  )}
                </React.Fragment>
              ))}
              {/* 2026 실거래 */}
              <th className="px-1 py-0.5 font-medium border border-gray-200 border-l-2 border-l-gray-300 text-center whitespace-nowrap sticky top-[26px] bg-gray-100 z-20">
                시세
              </th>
              {showIdx && (
                <th className="px-1 py-0.5 font-medium border border-gray-200 text-center sticky top-[26px] bg-gray-100 z-20">
                  지수
                </th>
              )}
              {/* 2026 입력 */}
              <th className="px-1 py-0.5 font-medium border border-gray-200 border-l-2 border-l-gray-300 text-center whitespace-nowrap sticky top-[26px] bg-gray-100 text-blue-700 z-20">
                입력
              </th>
              {showIdx && (
                <th className="px-1 py-0.5 font-medium border border-gray-200 text-center sticky top-[26px] bg-gray-100 z-20">
                  지수
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {results.map((data) => {
              const isBase = data.info.id === baseId;
              const rowBg = isBase && isMultiple ? 'bg-blue-50' : 'bg-white';
              const api2026 = data.yearlyStats[curYear]?.avgPrice ?? null;
              const baseApi2026 = baseResult?.yearlyStats[curYear]?.avgPrice ?? null;
              const eff2026 = effectivePrice(data, curYear);
              const baseEff2026 = baseResult ? effectivePrice(baseResult, curYear) : null;

              return (
                <tr key={data.info.id} className={`${rowBg} hover:bg-gray-50 transition-colors`}>
                  {/* 아파트명 */}
                  <td className={`px-2 py-1 border border-gray-200 sticky left-0 z-10 ${rowBg} whitespace-nowrap`}>
                    <div className="font-medium text-gray-800 text-[12px] flex items-center gap-1">
                      {isBase && isMultiple && <span className="text-blue-600 leading-none text-[11px]">★</span>}
                      {data.info.name}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {data.info.areaLabel} · {data.info.regionLabel}
                    </div>
                  </td>

                  {/* 이전 연도 실거래 */}
                  {pastYears.map((y) => {
                    const ys = data.yearlyStats[y];
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
                  {priceTd(api2026, data.yearlyStats[curYear]?.count ?? 0)}
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
                        value={data.manualPrice ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          onManualPriceChange(data.info.id, v === '' ? undefined : parseFloat(v));
                        }}
                        className="input-base h-6 w-full text-center text-[12px] px-1 py-0"
                      />
                    </div>
                  </td>
                  {showIdx && idxTd(calcIdx(eff2026, baseEff2026))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-gray-400 px-4 py-2">
        * 지수는 기준 아파트 = 100. {curYear}년은 실거래(API)와 현재시세(직접 입력)를 분리 표시하며, 입력 시 해당 지수가 즉시 재계산됩니다.
      </p>
    </div>
  );
};

export default ResultTable;
