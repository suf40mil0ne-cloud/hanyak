import React from 'react';
import { FilterOptions } from '../types';
import { getQueryYears } from '../utils/apiClient';

interface Props {
  options: FilterOptions;
  onChange: (opts: FilterOptions) => void;
  onQuery: () => void;
  loading: boolean;
  disabled: boolean;
}

const QueryOptions: React.FC<Props> = ({ options, onChange, onQuery, loading, disabled }) => {
  const years = getQueryYears();
  const yearRange = `${years[0]}~${years[years.length - 1]}`;

  const set = (partial: Partial<FilterOptions>) => onChange({ ...options, ...partial });

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-gray-800 mb-3">조회 옵션</h2>
      <div className="flex flex-wrap gap-x-8 gap-y-3 items-start">

        {/* 조회 기간 */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">조회 기간</span>
          <span className="text-sm text-gray-700 bg-gray-100 rounded px-3 py-1.5 font-medium">
            최근 5개년 ({yearRange})
          </span>
        </div>

        {/* 월 필터 */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">월 필터</span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-sm">
              <input
                type="radio"
                name="monthFilter"
                checked={options.monthFilter === null}
                onChange={() => set({ monthFilter: null })}
                className="accent-blue-600"
              />
              전체 연평균
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-sm">
              <input
                type="radio"
                name="monthFilter"
                checked={options.monthFilter !== null}
                onChange={() => set({ monthFilter: options.monthFilter ?? 1 })}
                className="accent-blue-600"
              />
              특정 월
            </label>
            {options.monthFilter !== null && (
              <select
                className="select-base w-24"
                value={options.monthFilter}
                onChange={(e) => set({ monthFilter: parseInt(e.target.value, 10) })}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}월
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 이상 거래 필터 */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">이상 거래 필터</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <label className="flex items-center gap-1.5 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={options.excludeDirect}
                onChange={(e) => set({ excludeDirect: e.target.checked })}
                className="accent-blue-600"
              />
              직거래 제외
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={options.excludeCorporate}
                onChange={(e) => set({ excludeCorporate: e.target.checked })}
                className="accent-blue-600"
              />
              법인/공공기관 제외
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={options.excludeOutliers}
                onChange={(e) => set({ excludeOutliers: e.target.checked })}
                className="accent-blue-600"
              />
              통계적 이상치 제거 (IQR)
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          className="btn-primary px-8"
          onClick={onQuery}
          disabled={disabled || loading}
        >
          {loading ? '조회 중...' : '조회하기'}
        </button>
        {disabled && (
          <span className="ml-3 text-sm text-gray-400">아파트를 먼저 추가해주세요.</span>
        )}
      </div>
    </div>
  );
};

export default QueryOptions;
