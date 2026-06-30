/**
 * 프리셋(탭2·탭3) 캐시 수집기 — 매일 자정 GitHub Actions에서 실행(`npx tsx`).
 *
 * 흐름:
 *   1. presetApartments.ts 의 모든 지역(lawdCd)×최근 5개년 월을 배포된 /api/apt-trade 로 수집
 *      (배포 프록시를 그대로 사용 → XML 파싱/엔티티 디코딩/필드 정규화가 프론트와 100% 동일)
 *   2. 각 지역 레코드를 프리셋 aptNm prefix(normalizeApt)로 1차 필터 → 페이로드 축소
 *      (직거래/법인/IQR/면적 등 실제 집계 필터는 프론트 priceFilter.ts 가 그대로 수행 — 새 로직 없음)
 *   3. { updatedAt, data } 를 /api/refresh 로 POST → KV 적재
 *
 * 환경변수:
 *   SITE_URL    (기본 https://hanyak.pages.dev)  — 수집/적재 대상 사이트
 *   REFRESH_KEY (필수)                           — /api/refresh 인증 키
 */
import { PRESET_APARTMENTS } from '../src/data/presetApartments';
import { normalizeApt } from '../src/utils/priceFilter';
import { getQueryYears, buildYearMonthList, getCacheKey } from '../src/utils/apiClient';
import type { RawTradeRecord } from '../src/types';

const SITE_URL = (process.env.SITE_URL || 'https://hanyak.pages.dev').replace(/\/$/, '');
const REFRESH_KEY = process.env.REFRESH_KEY;
const CONCURRENCY = 8;

// 집계에 실제로 쓰이는 필드만 보관(priceFilter 기준) → KV 용량 절감
const KEEP_FIELDS: (keyof RawTradeRecord)[] = [
  'aptNm', 'excluUseAr', 'dealAmount', 'dealYear', 'dealMonth',
  'dealingGbn', 'slerGbn', 'buyerGbn', 'cdealType',
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 지역별 프리셋 aptNm 정규화 prefix 목록 */
const prefixesByLawd = new Map<string, string[]>();
for (const p of PRESET_APARTMENTS) {
  const arr = prefixesByLawd.get(p.lawdCd) ?? [];
  arr.push(normalizeApt(p.aptNm));
  prefixesByLawd.set(p.lawdCd, arr);
}

function trim(r: RawTradeRecord): RawTradeRecord {
  const out: Record<string, unknown> = {};
  for (const f of KEEP_FIELDS) out[f] = (r as Record<string, unknown>)[f] ?? '';
  return out as RawTradeRecord;
}

/** 배포된 프록시로 단일 월 조회(재시도 포함) */
async function fetchMonth(lawdCd: string, dealYmd: string): Promise<RawTradeRecord[]> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(`${SITE_URL}/api/apt-trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lawdCd, dealYmd }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = (await res.json()) as { items?: RawTradeRecord[] };
      return j.items || [];
    } catch (e) {
      if (attempt === 3) {
        console.error(`[fail] ${lawdCd} ${dealYmd}:`, (e as Error).message);
        return [];
      }
      await sleep(800 * (attempt + 1));
    }
  }
  return [];
}

async function run() {
  if (!REFRESH_KEY) throw new Error('환경변수 REFRESH_KEY 가 필요합니다.');

  const years = getQueryYears();
  const ymList = buildYearMonthList(years, null);
  const uniqueLawd = [...new Set(PRESET_APARTMENTS.map((p) => p.lawdCd))];

  const tasks: { lawdCd: string; dealYmd: string }[] = [];
  for (const lawdCd of uniqueLawd) {
    for (const ym of ymList) tasks.push({ lawdCd, dealYmd: ym.dealYmd });
  }
  console.error(`[start] ${uniqueLawd.length}개 지역 × ${ymList.length}개월 = ${tasks.length}건 수집 (SITE=${SITE_URL})`);

  const data: Record<string, RawTradeRecord[]> = {};
  let done = 0;
  let idx = 0;
  const worker = async () => {
    while (idx < tasks.length) {
      const t = tasks[idx++];
      const records = await fetchMonth(t.lawdCd, t.dealYmd);
      const prefixes = prefixesByLawd.get(t.lawdCd) ?? [];
      const matched = records.filter((r) => {
        const n = normalizeApt(r.aptNm || '');
        return prefixes.some((p) => n.startsWith(p));
      });
      data[getCacheKey(t.lawdCd, t.dealYmd)] = matched.map(trim);
      if (++done % 100 === 0) console.error(`  ...${done}/${tasks.length}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, worker));

  const totalRecords = Object.values(data).reduce((s, arr) => s + arr.length, 0);
  const payload = { updatedAt: new Date().toISOString(), data };
  const sizeMB = (JSON.stringify(payload).length / 1024 / 1024).toFixed(2);
  console.error(`[collected] 매칭 레코드 ${totalRecords}건, 페이로드 ${sizeMB}MB → 적재 중...`);

  const res = await fetch(`${SITE_URL}/api/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-refresh-key': REFRESH_KEY },
    body: JSON.stringify(payload),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`/api/refresh 적재 실패 HTTP ${res.status}: ${txt}`);
  console.error(`[done] 적재 완료: ${txt}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
