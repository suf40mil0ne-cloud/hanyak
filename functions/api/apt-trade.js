// Cloudflare Pages Function: 국토교통부 아파트 매매 실거래가 API 프록시
// 경로: POST /api/apt-trade   { lawdCd, dealYmd }
// XML 응답을 정규식으로 파싱하여 JSON 배열로 반환한다 (Workers 환경에서 xml2js 사용 불가).

const SERVICE_KEY = '93ab10ebd79f48772e33be1df27532bbfba053564aa834082eacb75da688c46b';
const BASE_URL =
  'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// XML 엔티티 디코딩 (&amp; 등). 아파트명에 '&'가 포함된 단지(철산역롯데캐슬&SKVIEW클래스티지)를 위해 필수.
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export async function onRequestPost(context) {
  try {
    const { lawdCd, dealYmd } = await context.request.json();

    if (!lawdCd || !dealYmd) {
      return json({ error: '필수 파라미터(lawdCd, dealYmd)가 누락되었습니다.' }, 400);
    }

    // 엣지 캐시 조회: 과거 월 데이터는 불변이므로 Cloudflare 엣지에 캐시한다.
    // (반복 조회·다중 사용자 시 업스트림 재호출 없이 즉시 응답 → 속도↑ + WAF 부하↓)
    const cache = caches.default;
    const cacheKey = new Request(`https://molit-cache.internal/apt-trade/${lawdCd}-${dealYmd}`);
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const url = new URL(BASE_URL);
    url.searchParams.set('serviceKey', SERVICE_KEY);
    url.searchParams.set('LAWD_CD', String(lawdCd));
    url.searchParams.set('DEAL_YMD', String(dealYmd));
    url.searchParams.set('numOfRows', '999');
    url.searchParams.set('pageNo', '1');

    // data.go.kr WAF가 기본 User-Agent를 차단하므로 명시적으로 지정한다.
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/xml' },
    });
    const xml = await res.text();

    // 업스트림이 비정상(HTTP 오류) 또는 WAF 차단(HTML 응답)을 반환하면 에러로 돌려
    // 클라이언트가 재시도하게 한다. (정상 XML이면 <response>/<resultCode> 포함)
    if (!res.ok) {
      return json({ error: `공공데이터 API HTTP ${res.status}` }, 502);
    }
    if (!xml.includes('<response>') && !xml.includes('<resultCode>')) {
      return json({ error: '공공데이터 API 차단/비정상 응답(재시도 필요)' }, 502);
    }

    // resultCode 확인 (03 = 데이터 없음 → 정상 빈 결과)
    const codeMatch = xml.match(/<resultCode>([\s\S]*?)<\/resultCode>/);
    const resultCode = codeMatch ? codeMatch[1].trim() : '';
    if (resultCode && resultCode !== '000' && resultCode !== '00') {
      const msgMatch = xml.match(/<resultMsg>([\s\S]*?)<\/resultMsg>/);
      const msg = msgMatch ? msgMatch[1].trim() : `에러 코드 ${resultCode}`;
      if (resultCode === '03') return json({ items: [], totalCount: 0 });
      return json({ error: `공공데이터 API 오류: ${msg} (${resultCode})` }, 502);
    }

    const items = [];
    for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const block = match[1];
      const get = (tag) => {
        const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
        return m ? decodeEntities(m[1].trim()) : '';
      };
      items.push({
        aptNm: get('aptNm'),
        excluUseAr: get('excluUseAr'),
        dealAmount: get('dealAmount').replace(/,/g, ''),
        dealYear: get('dealYear'),
        dealMonth: get('dealMonth'),
        dealDay: get('dealDay'),
        dealingGbn: get('dealingGbn'),
        slerGbn: get('slerGbn'),
        buyerGbn: get('buyerGbn'),
        cdealType: get('cdealType'),
        floor: get('floor'),
        umdNm: get('umdNm'),
        jibun: get('jibun'),
      });
    }

    const tcMatch = xml.match(/<totalCount>([\s\S]*?)<\/totalCount>/);
    const totalCount = tcMatch ? parseInt(tcMatch[1].trim(), 10) : items.length;

    // TTL: 당월/직전월은 거래가 계속 갱신되므로 짧게(1h), 과거 월은 길게(7d)
    const ttl = isRecentMonth(dealYmd) ? 3600 : 604800;
    const response = new Response(JSON.stringify({ items, totalCount }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${ttl}`,
        ...CORS,
      },
    });
    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (e) {
    return json({ error: `프록시 오류: ${e.message}` }, 500);
  }
}

// dealYmd(YYYYMM)가 당월 또는 직전월이면 true
function isRecentMonth(dealYmd) {
  const now = new Date();
  const cur = now.getFullYear() * 12 + now.getMonth(); // 0-based month
  const y = parseInt(String(dealYmd).slice(0, 4), 10);
  const m = parseInt(String(dealYmd).slice(4, 6), 10) - 1;
  if (isNaN(y) || isNaN(m)) return true;
  return cur - (y * 12 + m) <= 1;
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
