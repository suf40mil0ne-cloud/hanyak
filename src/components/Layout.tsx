import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { getQueryYears } from '../utils/apiClient';

/** 전체 페이지 공통 레이아웃: 헤더(네비) + 본문(Outlet) + 푸터 */
const Layout: React.FC = () => {
  const years = getQueryYears();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-700 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <span className="text-2xl">🏢</span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight truncate">아파트 실거래가 비교</h1>
              <p className="text-blue-200 text-xs mt-0.5 truncate">
                국토교통부 실거래가 공공데이터 기반 · 최근 5개년 ({years[0]}~{years[years.length - 1]})
              </p>
            </div>
          </Link>
          <nav className="shrink-0">
            <Link
              to="/about"
              className="text-blue-100 hover:text-white text-sm font-medium whitespace-nowrap"
            >
              서비스 소개
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1">
        <Outlet />
      </div>

      <footer className="bg-gray-800 text-gray-300 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm space-y-3">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link to="/about" className="hover:text-white">서비스 소개</Link>
            <Link to="/privacy" className="hover:text-white">개인정보처리방침</Link>
            <Link to="/disclaimer" className="hover:text-white">면책조항</Link>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            데이터 출처: 국토교통부 실거래가 공공데이터<br />
            본 서비스는 국토교통부 공공데이터를 활용하며, 투자 판단의 책임은 이용자에게 있습니다.
          </p>
          <p className="text-gray-500 text-xs">© 2026 아파트 실거래가 비교</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
