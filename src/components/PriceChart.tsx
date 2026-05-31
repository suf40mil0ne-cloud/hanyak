import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ApartmentData } from '../types';
import { getQueryYears } from '../utils/apiClient';

interface Props {
  results: ApartmentData[];
  baseId: string;
}

const COLORS = [
  '#2563eb', // blue
  '#dc2626', // red
  '#16a34a', // green
  '#d97706', // amber
  '#7c3aed', // violet
  '#db2777', // pink
  '#0891b2', // cyan
  '#65a30d', // lime
  '#9333ea', // purple
  '#ea580c', // orange
];

const PriceChart: React.FC<Props> = ({ results, baseId }) => {
  const [mode, setMode] = useState<'price' | 'index'>('price');
  const years = getQueryYears();
  const curYear = new Date().getFullYear();
  const isMultiple = results.length >= 2;
  const baseResult = results.find((r) => r.info.id === baseId) ?? results[0];

  if (results.length === 0) return null;

  const getEffectivePrice = (data: ApartmentData, year: number): number | null => {
    if (year === curYear && data.manualPrice != null && !isNaN(data.manualPrice)) {
      return data.manualPrice;
    }
    return data.yearlyStats[year]?.avgPrice ?? null;
  };

  // 차트 데이터 빌드
  const chartData = years.map((y) => {
    const point: Record<string, number | string | null> = { year: y };
    for (const data of results) {
      const price = getEffectivePrice(data, y);
      const key = `${data.info.name}_${data.info.area.toFixed(0)}`;

      if (mode === 'price') {
        point[key] = price;
      } else {
        const basePrice = baseResult ? getEffectivePrice(baseResult, y) : null;
        if (price != null && basePrice != null && basePrice > 0) {
          point[key] = Math.round((price / basePrice) * 100);
        } else {
          point[key] = null;
        }
      }
    }
    return point;
  });

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ color: string; name: string; value: number | null }>;
    label?: string | number;
  }) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-700 mb-1.5">{label}년</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <span style={{ color: p.color }} className="font-medium">■</span>
            <span className="text-gray-600">{p.name}:</span>
            <span className="font-semibold">
              {p.value != null
                ? mode === 'price'
                  ? `${p.value.toFixed(2)}억`
                  : `${p.value}`
                : '-'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">가격 추이 차트</h2>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              mode === 'price' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setMode('price')}
          >
            시세 보기
          </button>
          {isMultiple && (
            <button
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                mode === 'index' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setMode('index')}
            >
              지수 보기
            </button>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(v) => `${v}년`}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(v) =>
              mode === 'price' ? `${v.toFixed(1)}억` : `${v}`
            }
            width={mode === 'price' ? 65 : 45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          />
          {mode === 'index' && (
            <ReferenceLine y={100} stroke="#9ca3af" strokeDasharray="4 4" label={{ value: '100', fill: '#9ca3af', fontSize: 11 }} />
          )}
          {results.map((data, i) => {
            const key = `${data.info.name}_${data.info.area.toFixed(0)}`;
            const label = `${data.info.name} ${data.info.areaLabel}`;
            const isBase = data.info.id === baseId;
            const color = COLORS[i % COLORS.length];

            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={label}
                stroke={color}
                strokeWidth={isBase && isMultiple ? 3 : 2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {mode === 'index' && isMultiple && baseResult && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          기준: {baseResult.info.name} {baseResult.info.areaLabel} = 100
        </p>
      )}
    </div>
  );
};

export default PriceChart;
