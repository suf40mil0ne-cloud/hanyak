import React from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const DisclaimerPage: React.FC = () => {
  useDocumentTitle('면책조항 | 아파트 실거래가 비교');

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <article className="card">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">면책조항</h1>

        <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2">
          <li>본 사이트의 모든 데이터는 국토교통부 실거래가 공공데이터를 기반으로 합니다.</li>
          <li>본 서비스는 데이터 활용으로 인해 발생하는 투자 손실에 대한 책임을 지지 않습니다.</li>
          <li>제공되는 데이터는 참고용으로만 활용하시기 바랍니다.</li>
        </ul>
      </article>
    </main>
  );
};

export default DisclaimerPage;
