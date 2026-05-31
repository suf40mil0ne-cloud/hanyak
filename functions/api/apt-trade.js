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

    return json({ items, totalCount });
  } catch (e) {
    return json({ error: `프록시 오류: ${e.message}` }, 500);
  }
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
