import React, { useState } from 'react';
import TabNav, { TabKey } from '../components/TabNav';
import DirectComparePage from '../components/DirectComparePage';
import PresetComparePage from '../components/PresetComparePage';
import CompareWithPresetPage from '../components/CompareWithPresetPage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/** 메인 페이지: 기존 탭 3종(직접 비교 / 주요 아파트 시세 / 주요 아파트와 비교). 기능 변경 없음. */
const HomePage: React.FC = () => {
  useDocumentTitle('아파트 실거래가 비교 | 국토부 공공데이터');

  const [tab, setTab] = useState<TabKey>('direct');
  const [presetMounted, setPresetMounted] = useState(false);
  const [compareMounted, setCompareMounted] = useState(false);

  const handleTab = (t: TabKey) => {
    if (t === 'preset') setPresetMounted(true); // 최초 진입 시 마운트 → 자동 조회
    if (t === 'compare') setCompareMounted(true);
    setTab(t);
  };

  return (
    <>
      <TabNav active={tab} onChange={handleTab} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 탭 모두 마운트 유지 → 탭 전환 시 상태/조회결과 보존 */}
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
    </>
  );
};

export default HomePage;
