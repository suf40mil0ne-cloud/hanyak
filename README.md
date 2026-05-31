# 아파트 실거래가 비교

국토교통부 아파트 매매 실거래가 OpenAPI를 활용한 가격 비교 웹사이트.
**Cloudflare Pages**(프론트) + **Cloudflare Pages Functions**(API 프록시) 구조.

## 기술 스택

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **차트**: Recharts
- **백엔드 프록시**: Cloudflare Pages Functions (`functions/api/apt-trade.js`)
- **배포**: Cloudflare Pages

## 아키텍처

```
[브라우저]
  ↓ POST /api/apt-trade   { lawdCd, dealYmd }
[Pages Functions: functions/api/apt-trade.js]   ← CORS 프록시 + User-Agent 우회
  ↓ GET (XML)
[국토부 공공데이터 API]
  ↓ 정규식 XML 파싱 + 엔티티 디코딩 → JSON
[브라우저]
```

> 국토부 API는 기본 User-Agent를 WAF로 차단하므로 프록시에서 `User-Agent`를 명시한다.
> 또한 아파트명에 `&`가 포함된 단지(`철산역롯데캐슬&SKVIEW클래스티지`)를 위해 XML 엔티티(`&amp;`)를 디코딩한다.

## 기능

### 탭 1 — 🔍 직접 비교
- 시/도 → 시/군/구 2단계 지역 선택 (전국 법정동코드 내장)
- 아파트 검색 → 평형 선택 → 최대 10개까지 추가
- 최근 5개년 연도별 시세 / 기준 아파트 대비 지수(=100) / 라인 차트
- 이상 거래 필터: 직거래 · 법인/공공기관 · IQR 이상치 제거

### 탭 2 — ⭐ 주요 아파트 시세
- 탭 진입 시 전체 프리셋(약 50개) 자동 조회
- 카테고리별(강남권 / 여·목·이 / 뉴타운·뉴급 / 기타 / 경기) 테이블
- 월 필터(연평균 / 특정 월), 🔄 새로고침, 2026년 직접 입력칸
- 라디오로 기준 아파트 선택 시 지수 표시 · 카테고리별 차트

## 로컬 개발

```bash
npm install

# 방법 A: Functions까지 함께 (권장) — wrangler가 /api 라우팅 + vite 동시 구동
npm run dev:pages          # http://localhost:8788

# 방법 B: vite 단독 (별도 터미널에서 wrangler 필요)
npm run dev                # http://localhost:5173, /api 는 :8788 로 프록시
npx wrangler pages dev dist --port 8788
```

## 빌드 & 배포

```bash
npm run build              # → dist/
npm run deploy             # wrangler pages deploy dist  (wrangler 로그인 필요)
```

### Cloudflare Pages 대시보드 연동 설정

| 항목 | 값 |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | (비움) |
| Functions | `functions/` 자동 인식 |

Git 저장소를 Cloudflare Pages에 연결하면 push 시 자동 빌드·배포된다.
`functions/` 디렉토리는 빌드 산출물과 함께 자동으로 Pages Functions로 배포된다.

## 프리셋 수정 방법 (`src/data/presetApartments.ts`)

각 항목은 `{ category, label, aptNm, lawdCd, areaTarget, note? }`.

- **`aptNm`** 은 API 응답 `aptNm`의 **정규화 prefix**로 매칭한다(공백·괄호·기호 무시).
  예) `"마포래미안푸르지오"` → 2·3·4단지 전체, `"신현대"` → 9·11·12차 전체.
- **`lawdCd`** 는 법정동코드 5자리. 틀리면 0건이 조회된다.
- 항목을 추가/수정한 뒤에는 반드시 아래 검증 스크립트로 실제 API 응답과 대조할 것.

### 검증 스크립트

```bash
node scripts/verify-presets.mjs > report.json
```

각 `lawdCd` 지역의 2024~2025년 실거래를 수집해, 프리셋 `aptNm` 추정값과 가장
유사한 실제 단지명·전용면적·거래건수를 출력한다. 결과를 보고 `aptNm`/`lawdCd`/`areaTarget`을 보정한다.

> 모든 현재 프리셋은 이 스크립트로 검증 완료된 값이다. 검증 중 발견·수정된 주요 오류
> (화성시 41590→41597, 수원 영통 41115→41117, 철산/안산 41270→41210/41271 등)는
> `presetApartments.ts` 상단 주석에 정리되어 있다.

## 디렉토리 구조

```
.
├── functions/api/apt-trade.js     # Pages Functions (CORS 프록시)
├── src/
│   ├── App.tsx                     # 탭 셸
│   ├── components/                 # TabNav, Direct/PresetComparePage, RegionSelector ...
│   ├── data/                       # lawdCodes.ts, presetApartments.ts
│   ├── utils/                      # apiClient.ts, priceFilter.ts
│   └── types/index.ts
├── scripts/verify-presets.mjs      # 프리셋 검증 스크립트
├── wrangler.toml
└── vite.config.ts
```

## 데이터 정확도 메모

- 실거래 집계: 직거래·법인/공공기관·계약해제·IQR 이상치 제외 후 평균 → 월 대표값 → 연평균(만원→억원).
- 신축/입주권 단지(메이플자이, 디퍼아 대형, 흑석 아리하, 이문 라그란데 등)는 거래량이 적어
  일부 연도가 비어 있을 수 있다(정상).
- 화성시는 통합코드(41590)가 본 API에서 0건이라 권역 하위코드(동탄 41597 등)로 분리해 두었다.
