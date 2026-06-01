import React from 'react';

export type TabKey = 'direct' | 'preset';

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'direct', label: '🔍 직접 비교' },
  { key: 'preset', label: '⭐ 주요 아파트 시세' },
];

const TabNav: React.FC<Props> = ({ active, onChange }) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`px-5 py-3 text-sm border-b-2 -mb-px transition-colors ${
                active === t.key
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-gray-500 font-semibold hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNav;
