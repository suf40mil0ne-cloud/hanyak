// Cloudflare Pages Function: 프리셋(탭2·탭3) 캐시 서빙
// 경로: GET /api/preset-data
// 매일 자정 /api/refresh 가 KV("preset-data")에 적재한 { updatedAt, data } 를 그대로 즉시 반환한다.
// data: { "<lawdCd>_<YYYYMM>": RawTradeRecord[] }  ← 프론트의 presetCache(getCacheKey) 형식과 동일.
// 실시간 국토부 API 호출 없음 → 즉시 응답.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestGet(context) {
  const kv = context.env.PRESET_DATA;
  if (!kv) {
    return json({ error: 'KV(PRESET_DATA) 바인딩이 없습니다.', updatedAt: null, data: {} }, 500);
  }

  const raw = await kv.get('preset-data');
  if (!raw) {
    // 아직 한 번도 수집되지 않음 → 빈 데이터(프론트는 "준비 중"으로 처리)
    return json({ updatedAt: null, data: {} });
  }

  // KV 값은 이미 JSON 문자열이므로 파싱 없이 그대로 흘려보낸다(불필요한 직렬화 방지).
  return new Response(raw, {
    headers: {
      'Content-Type': 'application/json',
      // 자정 1회 갱신 → 클라이언트/엣지에서 1시간 캐시 허용
      'Cache-Control': 'public, max-age=3600',
      ...CORS,
    },
  });
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
