import React, { useMemo } from 'react';
import { ApartmentData } from '../types';
import { analyzeComparison } from '../utils/analysisEngine';

interface Props {
  baseData: ApartmentData; // 내 아파트 (기준)
  compareData: ApartmentData; // 비교 아파트
  years: number[];
}

const fmt = (n: number | null, unit = '억'): string => (n != null ? `${n.toFixed(2)}${unit}` : '-');
const fmtSigned = (n: number | null, unit = '억'): string =>
  n != null ? `${n >= 0 ? '+' : ''}${n.toFixed(2)}${unit}` : '-';
const fmtPct = (n: number | null): string => (n != null ? `${n >= 0 ? '+' : ''}${n.toFixed(1)}%` : '-');

const AnalysisCard: React.FC<Props> = ({ baseData, compareData, years }) => {
  const a = useMemo(
    () => analyzeComparison(baseData, compareData, years),
    [baseData, compareData, years]
  );

  const { base, compare, indexSeries, trendLabel, riseVerdict, trendVerdict, volumeWarning, oneLine } = a;

  // 상승률 셀 색상
  const riseColor = (pct: number | null) =>
    pct == null ? 'text-gray-400' : pct > 0 ? 'text-red-500' : pct < 0 ? 'text-blue-600' : 'text-gray-600';

  // 지수 셀 색상 (100=파랑 bold, >110=빨강, <90=초록)
  const idxColor = (idx: number | null) => {
    if (idx == null) return 'text-gray-300';
    if (idx === 100) return 'text-blue-600 font-bold';
    if (idx > 110) return 'text-red-500';
    if (idx < 90) return 'text-green-600';
    return 'text-gray-500';
  };

  const summaryRow = (label: string, s: typeof base, highlight: boolean) => (
    <tr className={highlight ? 'bg-blue-50' : 'bg-white'}>
      <td className="px-3 py-2 border-b border-gray-100 font-medium text-gray-700 whitespace-nowrap">
        {label}
        <div className="text-[11px] text-gray-400 font-normal">{s.name}</div>
      </td>
      <td className="px-3 py-2 border-b border-gray-100 text-center whitespace-nowrap">
        {s.firstPrice != null ? (
          <>
            <span className="font-semibold text-gray-800">{fmt(s.firstPrice)}</span>
            <span className="text-[11px] text-gray-400 ml-1">({s.firstYear}년)</span>
          </>
        ) : (
          '-'
        )}
      </td>
      <td className="px-3 py-2 border-b border-gray-100 text-center font-semibold text-gray-800 whitespace-nowrap">
        {fmt(s.lastPrice)}
        {s.lastPrice != null && s.lastYear !== years[years.length - 1] && (
          <span className="text-[11px] text-gray-400 ml-1 font-normal">({s.lastYear}년)</span>
        )}
      </td>
      <td className={`px-3 py-2 border-b border-gray-100 text-center font-semibold whitespace-nowrap ${riseColor(s.risePct)}`}>
        {fmtSigned(s.rise)}
      </td>
      <td className={`px-3 py-2 border-b border-gray-100 text-center font-bold whitespace-nowrap ${riseColor(s.risePct)}`}>
        {fmtPct(s.risePct)}
      </td>
    </tr>
  );

  const curYear = years[years.length - 1];

  return (
    <div className="rounded-xl bg-white shadow-md border border-blue-100 overflow-hidden">
      {/* 카드 상단 제목 */}
      <div className="bg-blue-600 text-white px-4 py-3">
        <h3 className="text-sm font-bold flex items-center gap-1.5 flex-wrap">
          <span className="opacity-90">{base.name}</span>
          <span className="opacity-70 font-normal">vs</span>
          <span>{compare.name}</span>
        </h3>
        <p className="text-[11px] text-blue-100 mt-0.5">{trendLabel}</p>
      </div>

      <div className="p-4 space-y-5">
        {/* 섹션 1: 시세 변화 요약 */}
        <section>
          <h4 className="text-[13px] font-semibold text-gray-700 mb-2">📊 시세 변화 요약</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] border-collapse min-w-[440px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[11px]">
                  <th className="px-3 py-1.5 text-left font-medium border-b border-gray-200">구분</th>
                  <th className="px-3 py-1.5 text-center font-medium border-b border-gray-200 whitespace-nowrap">
                    최초 데이터
                  </th>
                  <th className="px-3 py-1.5 text-center font-medium border-b border-gray-200 whitespace-nowrap">
                    {curYear}년
                  </th>
                  <th className="px-3 py-1.5 text-center font-medium border-b border-gray-200">상승폭</th>
                  <th className="px-3 py-1.5 text-center font-medium border-b border-gray-200">상승률</th>
                </tr>
              </thead>
              <tbody>
                {summaryRow('📍 내 아파트', base, true)}
                {summaryRow('비교 아파트', compare, false)}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            ※ 최초 데이터: 거래가 존재하는 첫 연도 · {curYear}년: 실거래 우선, 없으면 입력값
          </p>
        </section>

        {/* 섹션 2: 지수 변화 분석 */}
        <section>
          <h4 className="text-[13px] font-semibold text-gray-700 mb-2">📈 지수 변화 분석 (내 아파트=100)</h4>
          <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
            {indexSeries.map((p, i) => (
              <React.Fragment key={p.year}>
                <span className="inline-flex flex-col items-center px-2 py-1 rounded-md bg-gray-50">
                  <span className="text-[10px] text-gray-400 leading-none">{p.year}</span>
                  <span className={`font-semibold leading-tight ${idxColor(p.index)}`}>
                    {p.index == null ? '-' : p.index}
                  </span>
                </span>
                {i < indexSeries.length - 1 && <span className="text-gray-300">→</span>}
              </React.Fragment>
            ))}
          </div>
          <p className="text-[12px] text-gray-600 mt-2 leading-relaxed">{trendVerdict}</p>
        </section>

        {/* 섹션 3: 종합 판단 */}
        <section>
          <h4 className="text-[13px] font-semibold text-gray-700 mb-2">🧭 종합 판단</h4>
          <ul className="space-y-1 text-[12px] text-gray-600 list-disc list-inside leading-relaxed">
            <li>{riseVerdict}</li>
            <li>{trendVerdict}</li>
            {volumeWarning && <li className="text-amber-600">{volumeWarning}</li>}
          </ul>
          <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5">
            <p className="text-[13px] font-bold text-blue-900 leading-relaxed">{oneLine}</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalysisCard;
