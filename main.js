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
];

const getLocalISODate = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const state = {
  search: "",
  date: "",
  sort: "open",
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
const selectedDateLabelEl = document.getElementById("selectedDateLabel");
const availableCountEl = document.getElementById("availableCount");
const soonCountEl = document.getElementById("soonCount");
const spotlightListEl = document.getElementById("spotlightList");
const spotlightEmptyEl = document.getElementById("spotlightEmpty");
const spotlightHintEl = document.getElementById("spotlightHint");

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
  return formatDate(item.openDate);
};

const withinRange = (date, start, end) => {
  if (!date) return true;
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
    const today = new Date();
    const open = new Date(item.openDate + "T00:00:00");
    if (open > today) return { label: "오픈 예정", tone: "soon" };
    return { label: "예약 진행", tone: "open" };
  }
  if (withinRange(selectedDate, item.availableStart, item.availableEnd)) {
    return { label: "해당 날짜 가능", tone: "open" };
  }
  if (!isDateString(item.openDate)) {
    return { label: "시즌 확인", tone: "soon" };
  }
  const open = new Date(item.openDate + "T00:00:00");
  const selected = new Date(selectedDate + "T00:00:00");
  if (selected < open) return { label: "오픈 전", tone: "soon" };
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

  card.innerHTML = `
    <div class="card-head">
      <div>
        <div class="card-title">${item.name}</div>
        <div class="card-tags">
          <span class="tag">${item.type}</span>
          <span class="tag">${item.region}</span>
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
      <span class="tag">부모 추천</span>
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
      <span class="tag">날짜 기준 추천</span>
    </div>
    <div class="card-actions">
      <a class="${linkClass}" ${linkAttrs}>
        예약 페이지
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

const updateSpotlight = () => {
  const focusDate = state.date || getLocalISODate();
  selectedDateLabelEl.textContent = formatDateLong(focusDate);

  const available = facilities.filter((item) =>
    withinRange(focusDate, item.availableStart, item.availableEnd)
  );

  const soon = facilities.filter((item) => {
    if (!isDateString(item.openDate)) return false;
    return item.openDate > focusDate;
  });

  availableCountEl.textContent = available.length;
  soonCountEl.textContent = soon.length;

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
    .filter((item) => withinRange(state.date, item.availableStart, item.availableEnd))
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
    sortedTypes.forEach((type) => {
      const items = typeGroups[type];
      const group = document.createElement("div");
      group.className = "type-group";
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
    emptyMap.public.style.display = "none";
  } else {
    emptyMap.public.style.display = "block";
  }

  ["private", "farm", "popup"].forEach((sector) => {
    const list = listMap[sector];
    const items = grouped[sector] || [];
    list.innerHTML = "";
    items.forEach((item) => {
      list.appendChild(buildCard(item));
    });
    emptyMap[sector].style.display = items.length ? "none" : "block";
  });

  totalCountEl.textContent = facilities.length;
  updateSpotlight();
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
};

init();
