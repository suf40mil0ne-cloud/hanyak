// 프리셋 아파트 검증 스크립트
// 각 lawdCd 지역의 최근 거래를 수집하여 실제 aptNm 값을 찾는다.
const SERVICE_KEY = '93ab10ebd79f48772e33be1df27532bbfba053564aa834082eacb75da688c46b';
const BASE = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade';

// (label, aptNm 추정값, lawdCd, areaTarget)
const PRESET = [
  ["강남권","압구정 신현대","신현대","11680",116],
  ["강남권","서반포 원베일리","원베일리","11650",84],
  ["강남권","동반포 반포자이","반포자이","11650",84],
  ["강남권","청담자이","청담자이","11680",89],
  ["강남권","잠원 메이플자이","메이플자이","11650",84],
  ["강남권","삼성 힐스1단지","힐스테이트1단지","11680",84],
  ["강남권","서초 그랑자이","그랑자이","11650",84],
  ["강남권","개포 디에이치퍼스티어","디에이치퍼스티어아이파크","11680",84],
  ["강남권","대치 래미안팰리스","래미안대치팰리스","11680",84],
  ["강남권","도곡렉슬","도곡렉슬","11680",84],
  ["강남권","방배 롯데캐슬아르떼","롯데캐슬아르떼","11650",84],
  ["강남권","잠실엘스","잠실엘스","11710",84],
  ["강남권","파크리오","파크리오","11710",84],
  ["강남권","송파 헬리오시티","헬리오시티","11710",84],
  ["강남권","둔촌 올림픽파크포레온","올림픽파크포레온","11740",84],
  ["강남권","고덕 그라시움","고덕그라시움","11740",84],
  ["여/목/이","여의도 브라이튼","브라이튼여의도","11560",84],
  ["여/목/이","여의도 시범(공급118)","시범","11560",84],
  ["여/목/이","여의도 시범(공급79)","시범","11560",59],
  ["여/목/이","목동 7단지(공급121)","목동신시가지7단지","11470",95],
  ["여/목/이","목동 7단지(공급90)","목동신시가지7단지","11470",71],
  ["여/목/이","이촌 한가람","한가람","11545",84],
  ["뉴타운·뉴급","경희궁자이 2단지","경희궁자이2단지","11110",84],
  ["뉴타운·뉴급","아현 마래푸","마포래미안푸르지오","11440",84],
  ["뉴타운·뉴급","북아현 이편신","e편한세상신촌","11440",84],
  ["뉴타운·뉴급","DMC 파크뷰자이","DMC파크뷰자이","11380",84],
  ["뉴타운·뉴급","옥수 파크힐스","옥수파크힐스","11200",84],
  ["뉴타운·뉴급","금호 파크힐스","금호파크힐스","11200",84],
  ["뉴타운·뉴급","왕십리 센트라스","왕십리센트라스","11200",84],
  ["뉴타운·뉴급","전답 크레시티","크레시티","11350",84],
  ["뉴타운·뉴급","이문 라그란데/아이파크자이","이문아이파크자이","11350",84],
  ["뉴타운·뉴급","장위 레디언트","장위자이레디언트","11290",84],
  ["뉴타운·뉴급","길음 센터피스","길음센터피스","11290",84],
  ["뉴타운·뉴급","신정 목동힐스테이트","신정뉴타운목동힐스테이트","11470",84],
  ["뉴타운·뉴급","흑석 아리하","흑석리버파크자이","11590",84],
  ["뉴타운·뉴급","노량진/상도파크자이","상도파크자이","11590",84],
  ["뉴타운·뉴급","영등포 아타스","영등포아타스","11560",84],
  ["뉴타운·뉴급","신길 에스티움","신길에스티움","11560",84],
  ["뉴타운·뉴급","철산 sk뷰클래스티지","철산sk뷰클래스티지","41270",84],
  ["기타","당산 센트럴아이파크","당산센트럴아이파크","11560",84],
  ["기타","마곡 7단지힐스","마곡7단지힐스테이트마스터","11500",84],
  ["경기","판교 봇들7단지","봇들마을7단지","41135",84],
  ["경기","과천 푸르지오써밋","과천푸르지오써밋","41290",84],
  ["경기","인덕원 푸르지오엘센트로","인덕원푸르지오엘센트로","41171",84],
  ["경기","수지 롯데골드타운","롯데골드타운","41465",84],
  ["경기","광교 중흥S클래스","광교중흥S클래스","41115",84],
  ["경기","성남 산성역포레스티아","산성역포레스티아","41131",84],
  ["경기","용인기흥 상갈메트로파크","상갈메트로파크","41461",84],
  ["경기","동탄 시범꿈에그린","시범꿈에그린프레스티지","41590",84],
  ["경기","평택고덕 파라곤","고덕파라곤","41220",84],
  ["경기","안산 그랑시티자이1차","그랑시티자이1차","41270",84],
];

// 조회할 월 목록: 2024-01 ~ 2025-12 (24개월)
const months = [];
for (let y = 2024; y <= 2025; y++) {
  for (let m = 1; m <= 12; m++) months.push(`${y}${String(m).padStart(2,'0')}`);
}

const uniqueLawd = [...new Set(PRESET.map(p => p[3]))];

function getTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1].trim() : '';
}

async function fetchMonth(lawd, ymd) {
  const url = new URL(BASE);
  url.searchParams.set('serviceKey', SERVICE_KEY);
  url.searchParams.set('LAWD_CD', lawd);
  url.searchParams.set('DEAL_YMD', ymd);
  url.searchParams.set('numOfRows', '999');
  url.searchParams.set('pageNo', '1');
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url.toString(), { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const xml = await res.text();
      const out = [];
      for (const mm of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
        const b = mm[1];
        out.push({ aptNm: getTag(b,'aptNm'), umdNm: getTag(b,'umdNm'), ar: parseFloat(getTag(b,'excluUseAr')) });
      }
      return out;
    } catch (e) {
      if (attempt === 2) { console.error('fail', lawd, ymd, e.message); return []; }
    }
  }
  return [];
}

// lawdCd -> Map(aptNm -> {count, umds:Set, areas:Set})
const collected = new Map();

async function run() {
  for (const lawd of uniqueLawd) {
    const aptMap = new Map();
    // 병렬 6개씩
    for (let i = 0; i < months.length; i += 6) {
      const batch = months.slice(i, i+6);
      const results = await Promise.all(batch.map(ymd => fetchMonth(lawd, ymd)));
      for (const recs of results) {
        for (const r of recs) {
          if (!r.aptNm) continue;
          if (!aptMap.has(r.aptNm)) aptMap.set(r.aptNm, { count:0, umds:new Set(), areas:new Set() });
          const e = aptMap.get(r.aptNm);
          e.count++;
          if (r.umdNm) e.umds.add(r.umdNm);
          if (!isNaN(r.ar)) e.areas.add(Math.round(r.ar));
        }
      }
    }
    collected.set(lawd, aptMap);
    console.error(`[done] ${lawd}: ${aptMap.size} distinct apts`);
  }

  const norm = s => s.replace(/[\s\-·.,()]/g,'').toLowerCase();

  const report = [];
  for (const [cat, label, guess, lawd, area] of PRESET) {
    const aptMap = collected.get(lawd);
    const g = norm(guess);
    const candidates = [];
    for (const [name, info] of aptMap) {
      const n = norm(name);
      let score = 0;
      if (n === g) score = 100;
      else if (n.includes(g) || g.includes(n)) score = 80;
      else {
        // 토큰 부분 일치: 2글자 이상 공통 substring 길이
        let common = 0;
        for (let len = Math.min(n.length,g.length); len >= 2; len--) {
          let found = false;
          for (let s = 0; s+len <= g.length; s++) {
            if (n.includes(g.slice(s,s+len))) { common = len; found = true; break; }
          }
          if (found) break;
        }
        score = common * 5;
      }
      if (score > 0) candidates.push({ name, score, count: info.count, umds:[...info.umds], areas:[...info.areas].sort((a,b)=>a-b) });
    }
    candidates.sort((a,b)=> b.score-a.score || b.count-a.count);
    report.push({ cat, label, guess, lawd, area, top: candidates.slice(0,5) });
  }

  console.log(JSON.stringify(report, null, 1));
}

run();
