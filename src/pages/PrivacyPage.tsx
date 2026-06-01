import React from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const PrivacyPage: React.FC = () => {
  useDocumentTitle('개인정보처리방침 | 아파트 실거래가 비교');

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <article className="card">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">개인정보처리방침</h1>

        <p className="text-gray-600 leading-relaxed mb-6">
          아파트 실거래가 비교(이하 “본 서비스”)는 이용자의 개인정보를 수집하지 않는 비로그인 서비스입니다.
        </p>

        <dl className="space-y-4 text-gray-600 leading-relaxed">
          <div>
            <dt className="font-semibold text-gray-800">1. 수집하는 개인정보</dt>
            <dd>없음 (회원가입·로그인이 없는 서비스로 어떠한 개인정보도 수집하지 않습니다.)</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-800">2. 쿠키 사용</dt>
            <dd>없음</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-800">3. 제3자 제공</dt>
            <dd>없음</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-800">4. 데이터 출처</dt>
            <dd>국토교통부 실거래가 공공데이터 (공공 API)</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-800">5. 문의</dt>
            <dd>your-email@example.com</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-800">시행일</dt>
            <dd>2026년 1월 1일</dd>
          </div>
        </dl>
      </article>
    </main>
  );
};

export default PrivacyPage;
