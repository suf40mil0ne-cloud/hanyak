import React from 'react';
import { ApartmentData } from '../types';
import { getQueryYears } from '../utils/apiClient';

interface Props {
  results: ApartmentData[];
  baseId: string;
  onManualPriceChange: (id: string, price: number | undefined) => void;
}

function formatPrice(price: number | null | undefined): string {
  if (price == null) return '-';
  return price.toFixed(2) + '억';
}

function calcIndex(comparePrice: number | null | undefined, basePrice: number | null | undefined): string {
  if (!comparePrice || !basePrice || basePrice === 0) return '-';
  return Math.round((comparePrice / basePrice) * 100).toString();
}

const ResultTable: React.FC<Props> = ({ results, baseId, onManualPriceChange }) => {
  const years = getQueryYears();
  const isMultiple = results.length >= 2;
  const baseResult = results.find((r) => r.info.id === baseId) ?? results[0];

  if (results.length === 0) return null;

  const getEffectivePrice = (data: ApartmentData, year: number): number | null => {
    const curYear = new Date().getFullYear();
    if (year === curYear && data.manualPrice != null && !isNaN(data.manualPrice)) {
      return data.manualPrice;
    }
    return data.yearlyStats[year]?.avgPrice ?? null;
  };

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-gray-800 mb-3">
        실거래가 결과
        {isMultiple && baseResult && (
          <span className="ml-2 text-sm text-blue-600 font-normal">
            (기준: {baseResult.info.name} {baseResult.info.areaLabel})
          </span>
        )}
      </h2>

      <div className="overflow-x-auto">
        <table className="text-sm w-full border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-100 text-gray-600">
              <th className="text-left px-3 py-2 font-medium border border-gray-200 sticky left-0 bg-gray-100 z-10 whitespace-nowrap">
                아파트
              </th>
              {years.map((y) => {
                const curYear = new Date().getFullYear();
                const isCurrentYear = y === curYear;
                return isMultiple ? (
                  <React.Fragment key={y}>
                    <th className="px-3 py-2 font-medium border border-gray-200 text-center whitespace-nowrap">
                      {y}년 {isCurrentYear ? '시세(억)' : '시세(억)'}
                    </th>
                    <th className="px-3 py-2 font-medium border border-gray-200 text-center whitespace-nowrap bg-blue-50 text-blue-700">
                      {y}년 지수
                    </th>
                  </React.Fragment>
                ) : (
                  <th key={y} className="px-3 py-2 font-medium border border-gray-200 text-center whitespace-nowrap">
                    {y}년 {isCurrentYear ? '입력시세(억)' : '시세(억)'}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {results.map((data) => {
              const isBase = data.info.id === baseId;
              const rowBg = isBase && isMultiple ? 'bg-blue-50' : 'bg-white';

              return (
                <tr key={data.info.id} className={`${rowBg} hover:bg-yellow-50 transition-colors`}>
                  {/* 아파트명 */}
                  <td className={`px-3 py-2 border border-gray-200 sticky left-0 z-10 ${rowBg} whitespace-nowrap`}>
                    <div className="font-medium text-gray-800 flex items-center gap-1">
                      {isBase && isMultiple && (
                        <span className="text-yellow-500 text-base leading-none">★</span>
                      )}
                      {data.info.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{data.info.areaLabel}</div>
                    <div className="text-xs text-gray-400">{data.info.regionLabel}</div>
                  </td>

                  {years.map((y) => {
                    const curYear = new Date().getFullYear();
                    const isCurrentYear = y === curYear;
                    const ys = data.yearlyStats[y];
                    const apiPrice = ys?.avgPrice ?? null;
                    const effectivePrice = getEffectivePrice(data, y);
                    const basePrice = baseResult ? getEffectivePrice(baseResult, y) : null;
                    const idx = isMultiple ? calcIndex(effectivePrice, basePrice) : null;

                    return isMultiple ? (
                      <React.Fragment key={y}>
                        {/* 시세 셀 */}
                        <td className="px-3 py-2 border border-gray-200 text-center align-middle">
                          {isCurrentYear ? (
                            <div className="flex flex-col items-center gap-1">
                              {apiPrice != null && (
                                <span className="text-xs text-gray-400">
                                  API: {apiPrice.toFixed(2)}억
                                </span>
                              )}
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder={apiPrice != null ? apiPrice.toFixed(2) : '입력'}
                                value={data.manualPrice ?? ''}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  onManualPriceChange(data.info.id, v === '' ? undefined : parseFloat(v));
                                }}
                                className="input-base w-20 text-center text-xs"
                              />
                            </div>
                          ) : (
                            <div>
                              <div className={`font-medium ${apiPrice != null ? 'text-gray-800' : 'text-gray-400'}`}>
                                {formatPrice(apiPrice)}
                              </div>
                              {ys && ys.count > 0 && (
                                <div className="text-xs text-gray-400 mt-0.5">n={ys.count}</div>
                              )}
                            </div>
                          )}
                        </td>
                        {/* 지수 셀 */}
                        <td className="px-3 py-2 border border-gray-200 text-center bg-blue-50 align-middle">
                          <span
                            className={`font-semibold ${
                              idx === '-'
                                ? 'text-gray-400'
                                : isBase
                                ? 'text-blue-700'
                                : parseInt(idx || '0') >= 100
                                ? 'text-orange-600'
                                : 'text-green-700'
                            }`}
                          >
                            {isBase && idx !== '-' ? '100' : idx}
                          </span>
                        </td>
                      </React.Fragment>
                    ) : (
                      /* 단일 아파트: 시세만 */
                      <td key={y} className="px-3 py-2 border border-gray-200 text-center align-middle">
                        {isCurrentYear ? (
                          <div className="flex flex-col items-center gap-1">
                            {apiPrice != null && (
                              <span className="text-xs text-gray-400">
                                API: {apiPrice.toFixed(2)}억
                              </span>
                            )}
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder={apiPrice != null ? apiPrice.toFixed(2) : '직접입력'}
                              value={data.manualPrice ?? ''}
                              onChange={(e) => {
                                const v = e.target.value;
                                onManualPriceChange(data.info.id, v === '' ? undefined : parseFloat(v));
                              }}
                              className="input-base w-24 text-center text-sm"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className={`font-medium ${apiPrice != null ? 'text-gray-800' : 'text-gray-400'}`}>
                              {formatPrice(apiPrice)}
                            </div>
                            {ys && ys.count > 0 && (
                              <div className="text-xs text-gray-400 mt-0.5">n={ys.count}</div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        * 지수는 기준 아파트 = 100 기준. 숫자가 클수록 기준 아파트보다 비쌈. 현재 연도 셀에 직접 입력 시 지수 즉시 재계산.
      </p>
    </div>
  );
};

export default ResultTable;
