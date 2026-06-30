// Cloudflare Pages Function: 프리셋 캐시 적재 엔드포인트(쓰기 전용)
// 경로: POST /api/refresh   header: x-refresh-key: <REFRESH_KEY>
// 매일 자정 GitHub Actions(scripts/refresh-preset.ts)가 수집·가공한 { updatedAt, data } 본문을
// 그대로 KV("preset-data")에 저장한다. 국토부 API를 직접 호출하지 않으므로 무료 플랜 subrequest 제한과 무관.

export async function onRequestPost(context) {
  const { env, request } = context;

  if (!env.PRESET_DATA) {
    return json({ error: 'KV(PRESET_DATA) 바인딩이 없습니다.' }, 500);
  }
  // 비밀키 검증(.github 워크플로 시크릿 = Pages 환경변수 REFRESH_KEY)
  if (!env.REFRESH_KEY || request.headers.get('x-refresh-key') !== env.REFRESH_KEY) {
    return json({ error: '인증 실패' }, 401);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: '잘못된 JSON 본문' }, 400);
  }
  if (!body || typeof body !== 'object' || !body.data || typeof body.updatedAt !== 'string') {
    return json({ error: '필수 필드(updatedAt, data) 누락' }, 400);
  }

  await env.PRESET_DATA.put('preset-data', JSON.stringify({ updatedAt: body.updatedAt, data: body.data }));
  return json({ ok: true, updatedAt: body.updatedAt, regions: Object.keys(body.data).length });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
