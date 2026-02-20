// Scroll to top on refresh
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const facilities = [
  {
    sector: "public",
    name: "국립중앙박물관",
    type: "박물관",
    region: "서울 용산",
    openDate: "2026-02-25",
    availableStart: "2026-03-01",
    availableEnd: "2026-03-31",
    reservationUrl: "https://www.museum.go.kr/MUSEUM/contents/M0104090000.do",
  },
  {
    sector: "public",
    name: "국립과천과학관",
    type: "과학관",
    region: "경기 과천",
    openDate: "2026-02-20",
    availableStart: "2026-02-22",
    availableEnd: "2026-03-20",
    reservationUrl: "https://www.sciencecenter.go.kr/scipia/schedules?ACADEMY_CD=ACD012",
  },
  {
    sector: "public",
    name: "국립현대미술관 서울",
    type: "미술관",
    region: "서울 종로",
    openDate: "2026-02-28",
    availableStart: "2026-03-05",
    availableEnd: "2026-04-05",
    reservationUrl: "https://m.mmca.go.kr/visitingInfo/exhReserve.do",
  },
  {
    sector: "public",
    name: "국립광주과학관",
    type: "과학관",
    region: "광주 북구",
    openDate: "2026-02-22",
    availableStart: "2026-02-24",
    availableEnd: "2026-03-30",
    reservationUrl: "https://www.sciencecenter.or.kr/",
  },
  {
    sector: "public",
    name: "국립해양박물관",
    type: "박물관",
    region: "부산 영도",
    openDate: "2026-02-24",
    availableStart: "2026-03-02",
    availableEnd: "2026-03-28",
    reservationUrl: "https://www.mmk.or.kr/",
  },
  {
    sector: "public",
    name: "국립아시아문화전당",
    type: "체험관",
    region: "광주 동구",
    openDate: "2026-02-21",
    availableStart: "2026-02-26",
    availableEnd: "2026-04-10",
    reservationUrl: "https://www.accf.or.kr/main/",
  },
  {
    sector: "public",
    name: "국립중앙과학관",
    type: "과학관",
    region: "대전 유성",
    openDate: "2026-02-23",
    availableStart: "2026-02-27",
    availableEnd: "2026-03-27",
    reservationUrl: "https://rsvn.science.go.kr/nsm/exbtrsvn/dspy/000",
  },
  {
    sector: "public",
    name: "국립현대미술관 과천",
    type: "미술관",
    region: "경기 과천",
    openDate: "2026-02-26",
    availableStart: "2026-03-03",
    availableEnd: "2026-04-01",
    reservationUrl: "https://m.mmca.go.kr/visitingInfo/exhReserve.do",
  },
  {
    sector: "public",
    name: "국립항공박물관",
    type: "박물관",
    region: "서울 강서",
    openDate: "2026-02-27",
    availableStart: "2026-03-04",
    availableEnd: "2026-03-25",
    reservationUrl: "https://www.aviation.or.kr/reservation.do?gcode=gcode1&menuno=191",
  },
  {
    sector: "public",
    name: "해양생태과학관",
    type: "과학관",
    region: "경기 시흥",
    openRule: "공식 공지 확인 필요",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "#",
  },
  {
    sector: "public",
    name: "한국잡월드",
    type: "체험관",
    region: "경기 성남",
    openRule: "홈페이지 체험 예약",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.koreajobworld.or.kr",
  },
  {
    sector: "public",
    name: "경기도교육청미래과학교육원",
    type: "과학관",
    region: "경기 수원",
    openRule: "전시관 예약 캘린더 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.gise.kr/",
  },
  {
    sector: "public",
    name: "해우재",
    type: "박물관",
    region: "경기 수원",
    openRule: "공식 공지 확인 필요",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "#",
  },
  {
    sector: "public",
    name: "경찰박물관",
    type: "박물관",
    region: "서울 종로",
    openRule: "공식 공지 확인 필요",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.policemuseum.go.kr/",
  },
  {
    sector: "public",
    name: "서울시립미술관",
    type: "미술관",
    region: "서울 중구",
    openDate: "시립 공지",
    availableStart: "상시",
    availableEnd: "상시",
    reservationUrl: "https://sema.seoul.go.kr/",
  },
  {
    sector: "public",
    name: "서울역사박물관",
    type: "박물관",
    region: "서울 종로",
    openDate: "시립 공지",
    availableStart: "상시",
    availableEnd: "상시",
    reservationUrl: "https://www.museum.seoul.kr/www/NR_index.do",
  },
  {
    sector: "public",
    name: "서대문자연사박물관",
    type: "박물관",
    region: "서울 서대문",
    openDate: "구립 공지",
    availableStart: "상시",
    availableEnd: "상시",
    reservationUrl: "https://namursv.sdm.go.kr/modules/reservation/rsv_list.html",
  },
  {
    sector: "public",
    name: "강서구립우장산자락길숲속도서관",
    type: "체험관",
    region: "서울 강서",
    openDate: "구립 공지",
    availableStart: "상시",
    availableEnd: "상시",
    reservationUrl: "#",
  },
  {
    sector: "public",
    name: "부산시립미술관",
    type: "미술관",
    region: "부산 해운대",
    openDate: "시립 공지",
    availableStart: "상시",
    availableEnd: "상시",
    reservationUrl: "https://art.busan.go.kr/",
  },
  {
    sector: "public",
    name: "대구미술관",
    type: "미술관",
    region: "대구 수성",
    openDate: "시립 공지",
    availableStart: "상시",
    availableEnd: "상시",
    reservationUrl: "https://daeguartmuseum.or.kr/",
  },
  {
    sector: "public",
    name: "인천시립박물관",
    type: "박물관",
    region: "인천 미추홀",
    openDate: "시립 공지",
    availableStart: "상시",
    availableEnd: "상시",
    reservationUrl: "https://www.incheon.go.kr/museum",
  },
  {
    sector: "farm",
    name: "대관령 양떼목장",
    type: "목장 체험",
    region: "강원 평창",
    openDate: "네이버 예약",
    availableStart: "상시(현장 안내)",
    availableEnd: "상시(현장 안내)",
    reservationUrl: "#",
  },
  {
    sector: "farm",
    name: "521농업생태체험장",
    type: "농업 체험",
    region: "경기 구리",
    openRule: "공식 공지 확인 필요",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "#",
  },
  {
    sector: "private",
    name: "스위트파크 롯데 어린이 식품체험관",
    type: "체험관",
    region: "서울 강서",
    openRule: "매월 첫째 수요일 11시 익월 예약 오픈(휴관/공휴일 시 둘째 수요일)",
    openDate: "",
    availableStart: "상시",
    availableEnd: "상시",
    reservationUrl: "https://sweetpark.lotternd.com/kor/schedule/sweet__schedule.html",
  },
  {
    sector: "private",
    name: "Workshop by 배스킨라빈스",
    type: "체험/클래스",
    region: "서울 강남",
    openRule: "공식 공지 확인 필요",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "#",
  },
  {
    sector: "farm",
    name: "양평 빌라자넬라 블루베리 수확체험",
    type: "블루베리 체험",
    region: "경기 양평",
    openDate: "네이버 예약",
    availableStart: "2024-06-15",
    availableEnd: "여름",
    reservationUrl: "https://booking.naver.com/booking/6/bizes/368951",
  },
  {
    sector: "popup",
    name: "미피와 마법의 우체통",
    type: "전시/팝업",
    region: "서울 종로",
    openDate: "2024-11-21",
    availableStart: "2024-11-21",
    availableEnd: "2025-08-17",
    reservationUrl: "https://booking.naver.com/booking/5/bizes/1250913",
  },
  {
    sector: "popup",
    name: "쿠푸왕의 피라미드 VR 전시",
    type: "전시/체험",
    region: "서울",
    openDate: "네이버 예매",
    availableStart: "2025-03-27",
    availableEnd: "2026-03-02",
    reservationUrl: "https://booking.naver.com/booking/12/bizes/1347394",
  },
  {
    sector: "farm",
    name: "딸기의하루",
    type: "딸기 체험",
    region: "인천 남동",
    openDate: "2026-02-23",
    openTime: "12:00",
    availableStart: "2025-12-01",
    availableEnd: "2026-05-31",
    reservationUrl: "https://m.booking.naver.com/booking/6/bizes/590379",
  },
  {
    sector: "farm",
    name: "부천 수퍼팜",
    type: "딸기 체험",
    region: "경기 부천",
    openDate: "네이버 예약",
    availableStart: "2025-12-01",
    availableEnd: "2026-05-31",
    reservationUrl: "https://booking.naver.com/booking/6/bizes/192290",
  },
  {
    sector: "farm",
    name: "두루팜",
    type: "농촌 체험",
    region: "인천 계양",
    openDate: "상시 예약",
    availableStart: "2025-12-14",
    availableEnd: "2026-05-05",
    reservationUrl: "https://durufarm.kr/",
  },
  {
    sector: "farm",
    name: "강화 이상준 부자농부",
    type: "딸기 체험",
    region: "인천 강화",
    openDate: "전화 예약",
    availableStart: "2025-12-01",
    availableEnd: "2026-05-31",
    reservationUrl: "tel:010-4141-8049",
  },
  {
    sector: "public",
    name: "검단소방서 소방안전체험",
    type: "체험관",
    region: "인천 서구",
    openDate: "2026-02-02",
    availableStart: "2026-02-02",
    availableEnd: "2026-02-26",
    reservationUrl: "https://www.incheon.go.kr/res/RE030101/view?res_no=41",
  },
  {
    sector: "public",
    name: "인천대공원 목재문화체험장",
    type: "체험관",
    region: "인천 남동",
    openDate: "2026-01-21",
    availableStart: "2026-02-01",
    availableEnd: "2026-02-28",
    reservationUrl: "https://www.incheon.go.kr/res/RE030101/view?res_no=18",
  },
  {
    sector: "public",
    name: "인천대공원 환경미래관",
    type: "체험관",
    region: "인천 남동",
    openDate: "2026-01-28",
    availableStart: "2026-02-01",
    availableEnd: "2026-12-31",
    reservationUrl: "https://www.incheon.go.kr/res/RE030101/view?res_no=21",
  },
];

const getLocalISODate = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const state = {
  search: "",
  date: "",
  sort: "open",
  expandedSectors: [],
};

const listMap = {
  public: document.getElementById("publicList"),
  private: document.getElementById("privateList"),
  farm: document.getElementById("farmList"),
  popup: document.getElementById("popupList"),
};

const emptyMap = {
  public: document.getElementById("publicEmpty"),
  private: document.getElementById("privateEmpty"),
  farm: document.getElementById("farmEmpty"),
  popup: document.getElementById("popupEmpty"),
};

const totalCountEl = document.getElementById("totalCount");
const todayLabelEl = document.getElementById("todayLabel");
const spotlightListEl = document.getElementById("spotlightList");
const spotlightEmptyEl = document.getElementById("spotlightEmpty");
const spotlightHintEl = document.getElementById("spotlightHint");

const updateThreeDayForecast = () => {
  const base = new Date();
  for (let i = 0; i <= 2; i++) {
    const focus = new Date(base);
    focus.setDate(base.getDate() + i);
    const focusDate = getLocalISODate(focus);
    const dayEl = document.getElementById(`day-${i}`);
    if (!dayEl) continue;

    dayEl.querySelector(".day-date").textContent = focus.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });

    const available = facilities.filter((item) =>
      withinRange(focusDate, item.availableStart, item.availableEnd, item.openDate)
    );

    const listEl = dayEl.querySelector(".forecast-list");
    const emptyEl = dayEl.querySelector(".empty");
    listEl.innerHTML = "";

    const sorted = [...available].sort((a, b) => {
      const aKey = isDateString(a.availableStart) ? a.availableStart : "9999-12-31";
      const bKey = isDateString(b.availableStart) ? b.availableStart : "9999-12-31";
      if (aKey !== bKey) return aKey.localeCompare(bKey, "ko");
      return a.name.localeCompare(b.name, "ko");
    });

    sorted.slice(0, 4).forEach((item) => {
      const card = buildSpotlightCard(item, focusDate);
      listEl.appendChild(card);
    });

    emptyEl.style.display = sorted.length ? "none" : "block";
  }
};

const isDateString = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || "");

const formatDate = (value) => {
  if (!value) return "-";
  if (!isDateString(value)) return value;
  const date = new Date(value + "T00:00:00");
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateLong = (value) => {
  if (!value) return "-";
  if (!isDateString(value)) return value;
  const date = new Date(value + "T00:00:00");
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

const formatOpenInfo = (item) => {
  if (item.openRule) return item.openRule;
  let info = formatDate(item.openDate);
  if (item.openTime) info += ` ${item.openTime}`;
  return info;
};

const withinRange = (date, start, end, openDate) => {
  if (!date) return true;
  
  // If openDate is set and in the future, it's not available for booking yet
  if (openDate && isDateString(openDate)) {
    const todayStr = getLocalISODate();
    if (openDate > todayStr) {
      return false;
    }
  }

  if (!isDateString(start) || !isDateString(end)) {
    const startText = String(start || "");
    const endText = String(end || "");
    const isAlways =
      startText.includes("상시") && endText.includes("상시");
    return isAlways;
  }
  const d = new Date(date + "T00:00:00");
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return d >= s && d <= e;
};

const getStatus = (item, selectedDate) => {
  const todayStr = getLocalISODate();
  const openStr = item.openDate || "";
  
  // If openDate is in the future, always show "Soon" or "Before Open"
  if (isDateString(openStr) && openStr > todayStr) {
    return { label: "오픈 예정", tone: "soon" };
  }

  if (!selectedDate) {
    if (isDateString(item.availableEnd)) {
      const today = new Date();
      const endDate = new Date(item.availableEnd + "T00:00:00");
      if (today > endDate) {
        return { label: "기간 종료", tone: "closed" };
      }
    }
    if (!isDateString(item.openDate)) {
      return { label: "정보 확인", tone: "soon" };
    }
    return { label: "예약 진행", tone: "open" };
  }

  if (withinRange(selectedDate, item.availableStart, item.availableEnd, item.openDate)) {
    return { label: "해당 날짜 가능", tone: "open" };
  }
  
  if (!isDateString(item.openDate)) {
    return { label: "시즌 확인", tone: "soon" };
  }

  return { label: "예약 불가", tone: "closed" };
};

const buildCard = (item) => {
  const status = getStatus(item, state.date);
  const card = document.createElement("div");
  card.className = "card";
  const disabled = item.reservationUrl === "#" || !item.reservationUrl;
  const linkClass = `link-btn primary${disabled ? " disabled" : ""}`;
  const linkAttrs = disabled
    ? `href="#" aria-disabled="true"`
    : `href="${item.reservationUrl}" target="_blank" rel="noopener"`;

  const reviewUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(item.name + " 후기")}`;

  const isSoon = item.openDate && item.openDate > getLocalISODate();
  const soonBadge = isSoon ? `<span class="tag soon-badge">🔥 오픈런</span>` : "";

  card.innerHTML = `
    <div class="card-head">
      <div>
        <div class="card-title">${item.name}</div>
        <div class="card-tags">
          <span class="tag">${item.type}</span>
          <span class="tag">${item.region}</span>
          ${soonBadge}
        </div>
      </div>
      <span class="status ${status.tone}">${status.label}</span>
    </div>
    <div class="card-grid">
      <div>
        <strong>예약 오픈</strong>
        <span>${formatOpenInfo(item)}</span>
      </div>
      <div>
        <strong>체험 시작</strong>
        <span>${formatDate(item.availableStart)}</span>
      </div>
      <div>
        <strong>체험 종료</strong>
        <span>${formatDate(item.availableEnd)}</span>
      </div>
    </div>
    <div class="card-actions">
      <a class="${linkClass}" ${linkAttrs}>
        예약 페이지
      </a>
      <a href="${reviewUrl}" target="_blank" rel="noopener" class="link-btn">
        후기 보기
      </a>
    </div>
  `;

  if (disabled) {
    card.querySelector(".link-btn").addEventListener("click", (event) => {
      event.preventDefault();
    });
  }
  return card;
};

const buildSpotlightCard = (item, focusDate) => {
  const status = getStatus(item, focusDate);
  const card = document.createElement("div");
  card.className = "spotlight-card";
  const disabled = item.reservationUrl === "#" || !item.reservationUrl;
  const linkClass = `link-btn primary${disabled ? " disabled" : ""}`;
  const linkAttrs = disabled
    ? `href="#" aria-disabled="true"`
    : `href="${item.reservationUrl}" target="_blank" rel="noopener"`;

  const reviewUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(item.name + " 후기")}`;
  const isSoon = item.openDate && item.openDate > getLocalISODate();
  const soonBadge = isSoon ? `<span class="tag soon-badge">🔥 오픈런</span>` : "";

  card.innerHTML = `
    <div class="card-head">
      <div class="card-title">${item.name}</div>
      <span class="status ${status.tone}">${status.label}</span>
    </div>
    <div class="spotlight-meta">
      <span>${item.region}</span>
      <span>${formatDate(item.availableStart)} ~ ${formatDate(item.availableEnd)}</span>
    </div>
    <div class="spotlight-tags">
      <span class="tag">${item.type}</span>
      ${soonBadge}
    </div>
    <div class="card-actions">
      <a class="${linkClass}" ${linkAttrs}>
        예약
      </a>
      <a href="${reviewUrl}" target="_blank" rel="noopener" class="link-btn">
        후기
      </a>
    </div>
  `;

  if (disabled) {
    card.querySelector(".link-btn").addEventListener("click", (event) => {
      event.preventDefault();
    });
  }
  return card;
};

const renderShowMoreBtn = (sector, count, isExpanded) => {
  const container = document.createElement("div");
  container.className = "show-more-container";
  if (count <= 5) return container;

  const btn = document.createElement("button");
  btn.className = "ghost full show-more-btn";
  btn.textContent = isExpanded ? "접기" : `${count - 5}개 더보기`;
  btn.onclick = () => {
    if (isExpanded) {
      state.expandedSectors = state.expandedSectors.filter(s => s !== sector);
    } else {
      state.expandedSectors.push(sector);
    }
    render();
  };
  container.appendChild(btn);
  return container;
};

const updateSpotlight = () => {
  const focusDate = state.date || getLocalISODate();

  const available = facilities.filter((item) =>
    withinRange(focusDate, item.availableStart, item.availableEnd, item.openDate)
  );

  const soon = facilities.filter((item) => {
    if (!isDateString(item.openDate)) return false;
    return item.openDate > focusDate;
  });

  const sorted = [...available].sort((a, b) => {
    const aKey = isDateString(a.availableStart) ? a.availableStart : "9999-12-31";
    const bKey = isDateString(b.availableStart) ? b.availableStart : "9999-12-31";
    if (aKey !== bKey) return aKey.localeCompare(bKey, "ko");
    return a.name.localeCompare(b.name, "ko");
  });

  spotlightListEl.innerHTML = "";
  sorted.slice(0, 6).forEach((item) => {
    spotlightListEl.appendChild(buildSpotlightCard(item, focusDate));
  });
  spotlightEmptyEl.style.display = sorted.length ? "none" : "block";
  spotlightHintEl.textContent = `${formatDateLong(focusDate)} 기준입니다.`;
};

const render = () => {
  const filtered = facilities
    .filter((item) => item.name.includes(state.search))
    .filter((item) => withinRange(state.date, item.availableStart, item.availableEnd, item.openDate))
    .sort((a, b) => {
      if (state.sort === "name") return a.name.localeCompare(b.name, "ko");
      if (state.sort === "start") return a.availableStart.localeCompare(b.availableStart, "ko");
      const aKey = isDateString(a.openDate) ? a.openDate : "9999-12-31";
      const bKey = isDateString(b.openDate) ? b.openDate : "9999-12-31";
      return aKey.localeCompare(bKey, "ko");
    });

  Object.values(listMap).forEach((list) => {
    list.innerHTML = "";
  });

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.sector]) acc[item.sector] = [];
    acc[item.sector].push(item);
    return acc;
  }, {});

  const publicList = listMap.public;
  const publicItems = grouped.public || [];
  publicList.innerHTML = "";
  if (publicItems.length) {
    const typeGroups = publicItems.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    }, {});
    const typeOrder = ["박물관", "미술관", "과학관", "체험관", "도서관"];
    const sortedTypes = Object.keys(typeGroups).sort((a, b) => {
      const aIdx = typeOrder.indexOf(a);
      const bIdx = typeOrder.indexOf(b);
      if (aIdx === -1 && bIdx === -1) return a.localeCompare(b, "ko");
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });
    const isExpanded = state.expandedSectors.includes("public");
    const visibleTypes = isExpanded ? sortedTypes : sortedTypes.slice(0, 3); // Limit types initially

    sortedTypes.forEach((type, idx) => {
      const items = typeGroups[type];
      const group = document.createElement("div");
      group.className = "type-group";
      
      // If not expanded, hide groups beyond the 3rd type
      if (!isExpanded && idx >= 3) {
        group.style.display = "none";
      }

      group.innerHTML = `
        <div class="type-title">
          <h3>${type}</h3>
          <span>${items.length}곳</span>
        </div>
      `;
      const list = document.createElement("div");
      list.className = "list";
      items.forEach((item) => list.appendChild(buildCard(item)));
      group.appendChild(list);
      publicList.appendChild(group);
    });

    publicList.appendChild(renderShowMoreBtn("public", sortedTypes.length > 3 ? 6 : 0, isExpanded)); // Fake count to trigger btn
    emptyMap.public.style.display = "none";
  } else {
    emptyMap.public.style.display = "block";
  }

  ["private", "farm", "popup"].forEach((sector) => {
    const list = listMap[sector];
    const items = grouped[sector] || [];
    list.innerHTML = "";
    
    const isExpanded = state.expandedSectors.includes(sector);
    const visibleItems = isExpanded ? items : items.slice(0, 5);

    visibleItems.forEach((item) => {
      list.appendChild(buildCard(item));
    });
    
    list.appendChild(renderShowMoreBtn(sector, items.length, isExpanded));
    emptyMap[sector].style.display = items.length ? "none" : "block";
  });

  totalCountEl.textContent = facilities.length;
  updateSpotlight();
  updateThreeDayForecast();
};

const init = () => {
  const today = new Date();
  todayLabelEl.textContent = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  state.date = getLocalISODate(today);
  document.getElementById("dateInput").value = state.date;

  document.getElementById("searchInput").addEventListener("input", (event) => {
    state.search = event.target.value.trim();
    render();
  });

  document.getElementById("dateInput").addEventListener("change", (event) => {
    state.date = event.target.value;
    render();
  });

  document.getElementById("sortSelect").addEventListener("change", (event) => {
    state.sort = event.target.value;
    render();
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    state.search = "";
    state.date = getLocalISODate();
    state.sort = "open";
    document.getElementById("searchInput").value = "";
    document.getElementById("dateInput").value = state.date;
    document.getElementById("sortSelect").value = "open";
    render();
  });

  document.getElementById("scrollToList").addEventListener("click", () => {
    document.querySelector("#public").scrollIntoView({ behavior: "smooth" });
  });

  document.querySelectorAll(".chip-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.quick;
      const base = new Date();
      if (action === "weekend") {
        const day = base.getDay();
        const diff = day === 6 ? 0 : (6 - day + 7) % 7;
        base.setDate(base.getDate() + diff);
      }
      if (action === "next7") {
        base.setDate(base.getDate() + 7);
      }
      state.date = getLocalISODate(base);
      document.getElementById("dateInput").value = state.date;
      render();
    });
  });

  render();
  updateThreeDayForecast();
};

init();
