/** 공공데이터 API 원본 거래 레코드 */
export interface RawTradeRecord {
  aptNm: string;
  excluUseAr: string;
  dealAmount: string;
  dealYear: string;
  dealMonth: string;
  dealDay?: string;
  dealingGbn?: string;
  slerGbn?: string;
  buyerGbn?: string;
  floor?: string;
  cdealType?: string;
  umdNm?: string;
  jibun?: string;
  rgstDate?: string;
}

/** 비교 목록에 추가된 아파트 정보 */
export interface ApartmentInfo {
  id: string;
  name: string;
  lawdCd: string;
  area: number;         // 전용면적 ㎡ (대표값, 그룹 기준)
  areaLabel: string;   // "전용 84㎡ (약 33평)"
  regionLabel: string; // "서울특별시 강남구"
}

/** 월 통계 */
export interface MonthlyStats {
  avgPrice: number;  // 억원
  count: number;
}

/** 연도별 통계 */
export interface YearlyStats {
  year: number;
  avgPrice: number | null;  // 억원, null = 데이터 없음
  count: number;
  monthly: { [month: number]: MonthlyStats };
}

/** 아파트별 결과 데이터 */
export interface ApartmentData {
  info: ApartmentInfo;
  yearlyStats: { [year: number]: YearlyStats };
  manualPrice?: number;  // 사용자가 입력한 2026 시세 (억원)
}

/** 필터 옵션 */
export interface FilterOptions {
  excludeDirect: boolean;
  excludeCorporate: boolean;
  excludeOutliers: boolean;
  monthFilter: number | null;  // null = 전체 연평균, 1~12 = 특정 월
}

/** 지역 선택 상태 */
export interface SelectedRegion {
  sido: string;
  sigungu: string;
  lawdCd: string;
}

/** API 응답 */
export interface ApiResponse {
  items: RawTradeRecord[];
  totalCount: number;
}
