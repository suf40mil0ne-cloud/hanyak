import React from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const AboutPage: React.FC = () => {
  useDocumentTitle('서비스 소개 | 아파트 실거래가 비교');

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <article className="card">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">서비스 소개</h1>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">아파트 실거래가 비교</h2>
          <p className="text-gray-600 leading-relaxed">
            국토교통부 실거래가 공공데이터를 기반으로 아파트 매매 실거래가를 조회하고 비교할 수 있는
            서비스입니다. 지역과 아파트를 선택하면 최근 5개년의 실거래가 추이를 한눈에 확인할 수 있습니다.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">데이터 출처</h2>
          <p className="text-gray-600 leading-relaxed">
            국토교통부 실거래가 공공데이터 포털에서 제공하는 아파트 매매 실거래가 공공 API를 사용합니다.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">서비스 특징</h2>
          <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1">
            <li>최근 5개년 실거래가 데이터 제공</li>
            <li>직거래 / 법인 거래 자동 제외</li>
            <li>통계적 이상치(IQR) 자동 제거</li>
            <li>최대 10개 아파트 동시 비교</li>
            <li>주요 아파트 프리셋 제공</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">주의사항</h2>
          <p className="text-gray-600 leading-relaxed">
            본 서비스의 데이터는 참고용이며, 실제 투자 판단에는 전문가 상담을 권장합니다.
          </p>
        </section>
      </article>
    </main>
  );
};

export default AboutPage;
