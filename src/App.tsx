import React, { useState } from 'react';
import TabNav, { TabKey } from './components/TabNav';
import DirectComparePage from './components/DirectComparePage';
import PresetComparePage from './components/PresetComparePage';
import CompareWithPresetPage from './components/CompareWithPresetPage';
import { getQueryYears } from './utils/apiClient';

const App: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('direct');
  const [presetMounted, setPresetMounted] = useState(false);
  const [compareMounted, setCompareMounted] = useState(false);
  const years = getQueryYears();

  const handleTab = (t: TabKey) => {
    if (t === 'preset') setPresetMounted(true); // 최초 진입 시 마운트 → 자동 조회
    if (t === 'compare') setCompareMounted(true);
    setTab(t);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🏢</span>
          <div>
            <h1 className="text-xl font-bold leading-tight">아파트 실거래가 비교</h1>
            <p className="text-blue-200 text-xs mt-0.5">
              국토교통부 실거래가 공공데이터 기반 · 최근 5개년 ({years[0]}~{years[years.length - 1]})
            </p>
          </div>
        </div>
      </header>

      <TabNav active={tab} onChange={handleTab} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 두 탭 모두 마운트 유지 → 탭 전환 시 상태/조회결과 보존 */}
        <div className={tab === 'direct' ? '' : 'hidden'}>
          <DirectComparePage />
        </div>
        {presetMounted && (
          <div className={tab === 'preset' ? '' : 'hidden'}>
            <PresetComparePage />
          </div>
        )}
        {compareMounted && (
          <div className={tab === 'compare' ? '' : 'hidden'}>
            <CompareWithPresetPage />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
