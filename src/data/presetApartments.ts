/**
 * 주요 아파트 프리셋 목록.
 *
 * 모든 aptNm / lawdCd 는 국토교통부 실거래가 API(2024~2025 전월)를 직접 조회해
 * 실제 응답값과 대조·검증하였다. (검증 스크립트: /verify-presets.mjs)
 *
 * 매칭 규칙(PresetComparePage):
 *   정규화(공백·괄호·기호 제거, 소문자) 후  apiAptNm.startsWith(presetAptNm)  으로 매칭한다.
 *   따라서 단지/차수가 나뉜 단지는 대표 prefix 하나로 여러 동을 묶어 집계한다.
 *   예) "마포래미안푸르지오" → 2·3·4단지 전체,  "신현대" → 9·11·12차 전체.
 *
 * 검증 과정에서 수정된 주요 항목(원안 → 실제):
 *   - 이촌 한가람 : lawdCd 11545(금천구·오류) → 11170(용산구)
 *   - 전농 크레시티 / 이문 : 11350(노원구·오류) → 11230(동대문구), aptNm "래미안크레시티"/"래미안라그란데"
 *   - 인덕원 : 41171(만안구·오류) → 41173(동안구)  (엘센트로 미조회 → 래미안인덕원더포인트로 대체)
 *   - 광교 중흥S클래스 : 41115(오류) → 41117(영통구), aptNm "광교중흥에스클래스"
 *   - 용인기흥 : 41461(처인구·오류) → 41463(기흥구)  (상갈메트로파크 미조회 → 기흥역더샵으로 대체)
 *   - 동탄 시범꿈에그린 : 41590(0건) → 41597, aptNm "동탄역 시범한화 꿈에그린 프레스티지"
 *   - 철산 / 안산 그랑시티자이 : 41270(존재하지 않는 코드) → 41210(광명) / 41271(안산 상록구)
 *   - 영등포 "아타스" = 아크로타워스퀘어,  마곡 7단지 = 마곡엠밸리7단지,  여의도 원베일리 = 래미안원베일리
 */
export type PresetApt = {
  category: string;
  label: string; // 표에 표시할 이름
  aptNm: string; // API aptNm 필드 prefix (정규화 매칭)
  lawdCd: string; // 법정동코드 5자리
  areaTarget: number; // 전용면적 (㎡) — ±3㎡ 범위로 필터
  note?: string; // 비고
};

export const PRESET_APARTMENTS: PresetApt[] = [
  // ── 강남권 ───────────────────────────────────────────────
  { category: '강남권', label: '압구정 신현대', aptNm: '신현대', lawdCd: '11680', areaTarget: 111, note: '현대 9·11·12차 통합' },
  { category: '강남권', label: '서반포 원베일리', aptNm: '래미안원베일리', lawdCd: '11650', areaTarget: 84 },
  { category: '강남권', label: '동반포 반포자이', aptNm: '반포자이', lawdCd: '11650', areaTarget: 84 },
  { category: '강남권', label: '청담자이', aptNm: '청담자이', lawdCd: '11680', areaTarget: 89, note: '전용89㎡' },
  { category: '강남권', label: '잠원 메이플자이', aptNm: '메이플자이', lawdCd: '11650', areaTarget: 84, note: '신축·거래 적음' },
  { category: '강남권', label: '삼성 힐스1단지', aptNm: '삼성동힐스테이트 1단지', lawdCd: '11680', areaTarget: 84 },
  { category: '강남권', label: '서초 그랑자이', aptNm: '서초그랑자이', lawdCd: '11650', areaTarget: 84 },
  { category: '강남권', label: '개포 디퍼아', aptNm: '디에이치퍼스티어아이파크', lawdCd: '11680', areaTarget: 84, note: '신축·대형 거래 적음' },
  { category: '강남권', label: '대치 래미안팰리스', aptNm: '래미안대치팰리스', lawdCd: '11680', areaTarget: 84 },
  { category: '강남권', label: '도곡렉슬', aptNm: '도곡렉슬', lawdCd: '11680', areaTarget: 84 },
  { category: '강남권', label: '방배 롯데캐슬아르떼', aptNm: '롯데캐슬아르떼', lawdCd: '11650', areaTarget: 84 },
  { category: '강남권', label: '잠실엘스', aptNm: '잠실엘스', lawdCd: '11710', areaTarget: 84 },
  { category: '강남권', label: '파크리오', aptNm: '파크리오', lawdCd: '11710', areaTarget: 84 },
  { category: '강남권', label: '송파 헬리오시티', aptNm: '헬리오시티', lawdCd: '11710', areaTarget: 84 },
  { category: '강남권', label: '둔촌 포레온', aptNm: '올림픽파크포레온', lawdCd: '11740', areaTarget: 84, note: '신축' },
  { category: '강남권', label: '고덕 그라시움', aptNm: '고덕그라시움', lawdCd: '11740', areaTarget: 84 },

  // ── 여/목/이 ─────────────────────────────────────────────
  { category: '여/목/이', label: '여의도 브라이튼', aptNm: '브라이튼여의도', lawdCd: '11560', areaTarget: 84 },
  { category: '여/목/이', label: '여의도 시범 (전용118)', aptNm: '시범', lawdCd: '11560', areaTarget: 118, note: '대형' },
  { category: '여/목/이', label: '여의도 시범 (전용60)', aptNm: '시범', lawdCd: '11560', areaTarget: 60, note: '소형' },
  { category: '여/목/이', label: '목동 7단지 (전용101)', aptNm: '목동신시가지7', lawdCd: '11470', areaTarget: 101 },
  { category: '여/목/이', label: '목동 7단지 (전용67)', aptNm: '목동신시가지7', lawdCd: '11470', areaTarget: 67 },
  { category: '여/목/이', label: '이촌 한가람', aptNm: '한가람', lawdCd: '11170', areaTarget: 84 },

  // ── 뉴타운·뉴급 ──────────────────────────────────────────
  { category: '뉴타운·뉴급', label: '경희궁자이 2단지', aptNm: '경희궁자이(2단지)', lawdCd: '11110', areaTarget: 84 },
  { category: '뉴타운·뉴급', label: '아현 마래푸', aptNm: '마포래미안푸르지오', lawdCd: '11440', areaTarget: 84, note: '2·3·4단지 통합' },
  { category: '뉴타운·뉴급', label: '북아현 이편신', aptNm: 'e편한세상신촌', lawdCd: '11410', areaTarget: 84, note: '1~4단지 통합' },
  { category: '뉴타운·뉴급', label: 'DMC 파크뷰자이', aptNm: 'DMC파크뷰자이', lawdCd: '11410', areaTarget: 84, note: '1~5단지 통합' },
  { category: '뉴타운·뉴급', label: '옥수 파크힐스', aptNm: '옥수파크힐스', lawdCd: '11200', areaTarget: 84 },
  { category: '뉴타운·뉴급', label: '금호 파크힐스', aptNm: '이편한세상금호파크힐스', lawdCd: '11200', areaTarget: 84 },
  { category: '뉴타운·뉴급', label: '왕십리 센트라스', aptNm: '센트라스', lawdCd: '11200', areaTarget: 84 },
  { category: '뉴타운·뉴급', label: '전농 크레시티', aptNm: '래미안크레시티', lawdCd: '11230', areaTarget: 84 },
  { category: '뉴타운·뉴급', label: '이문 라그란데', aptNm: '래미안라그란데', lawdCd: '11230', areaTarget: 84, note: '신축·거래 적음' },
  { category: '뉴타운·뉴급', label: '장위 퍼스트하이', aptNm: '래미안장위퍼스트하이', lawdCd: '11290', areaTarget: 84, note: '장위뉴타운 대표(레디언트 신축 거래 적어 대체)' },
  { category: '뉴타운·뉴급', label: '길음 센터피스', aptNm: '래미안길음센터피스', lawdCd: '11290', areaTarget: 84 },
  { category: '뉴타운·뉴급', label: '신정 목동힐스', aptNm: '목동힐스테이트', lawdCd: '11470', areaTarget: 84 },
  { category: '뉴타운·뉴급', label: '흑석 아리하', aptNm: '흑석리버파크자이', lawdCd: '11590', areaTarget: 84, note: '신축·거래 적음' },
  { category: '뉴타운·뉴급', label: '상도파크자이', aptNm: '상도파크자이', lawdCd: '11590', areaTarget: 84 },
  { category: '뉴타운·뉴급', label: '영등포 아타스', aptNm: '아크로타워스퀘어', lawdCd: '11560', areaTarget: 84 },
  { category: '뉴타운·뉴급', label: '신길 에스티움', aptNm: '래미안에스티움', lawdCd: '11560', areaTarget: 84 },
  { category: '뉴타운·뉴급', label: '철산 롯캐&SK뷰', aptNm: '철산역롯데캐슬&SKVIEW클래스티지', lawdCd: '41210', areaTarget: 84 },

  // ── 기타 ─────────────────────────────────────────────────
  { category: '기타', label: '당산 센트럴아이파크', aptNm: '당산센트럴아이파크', lawdCd: '11560', areaTarget: 84 },
  { category: '기타', label: '마곡 엠밸리7단지', aptNm: '마곡엠밸리7단지', lawdCd: '11500', areaTarget: 84 },

  // ── 경기 ─────────────────────────────────────────────────
  { category: '경기', label: '판교 봇들7단지', aptNm: '봇들마을7단지', lawdCd: '41135', areaTarget: 84 },
  { category: '경기', label: '과천 푸르지오써밋', aptNm: '과천푸르지오써밋', lawdCd: '41290', areaTarget: 84 },
  { category: '경기', label: '인덕원 더포인트', aptNm: '래미안인덕원더포인트', lawdCd: '41173', areaTarget: 84, note: '인덕원 대표(엘센트로 미조회로 대체)' },
  { category: '경기', label: '수지 롯데골드타운', aptNm: '성복역롯데캐슬골드타운', lawdCd: '41465', areaTarget: 84 },
  { category: '경기', label: '광교 중흥S클래스', aptNm: '광교중흥에스클래스', lawdCd: '41117', areaTarget: 84 },
  { category: '경기', label: '성남 산성역포레스티아', aptNm: '산성역포레스티아', lawdCd: '41131', areaTarget: 84 },
  { category: '경기', label: '용인기흥 기흥역더샵', aptNm: '기흥역더샵', lawdCd: '41463', areaTarget: 84, note: '기흥역세권 대표(상갈메트로파크 미조회로 대체)' },
  { category: '경기', label: '동탄 시범꿈에그린', aptNm: '동탄역 시범한화 꿈에그린 프레스티지', lawdCd: '41597', areaTarget: 84 },
  { category: '경기', label: '평택고덕 파라곤', aptNm: '고덕국제신도시파라곤', lawdCd: '41220', areaTarget: 84, note: '파라곤+에듀포레' },
  { category: '경기', label: '안산 그랑시티자이1차', aptNm: '그랑시티자이', lawdCd: '41271', areaTarget: 84, note: '1·2차 통합' },
];

/** 프리셋 카테고리 표시 순서 */
export const PRESET_CATEGORIES = ['강남권', '여/목/이', '뉴타운·뉴급', '기타', '경기'];
