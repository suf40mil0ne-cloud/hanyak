const facilities = [
  {
    name: "국립중앙박물관",
    type: "박물관",
    region: "서울 용산",
    openDate: "2026-02-25",
    availableStart: "2026-03-01",
    availableEnd: "2026-03-31",
  },
  {
    name: "국립과천과학관",
    type: "과학관",
    region: "경기 과천",
    openDate: "2026-02-20",
    availableStart: "2026-02-22",
    availableEnd: "2026-03-20",
  },
  {
    name: "국립현대미술관 서울",
    type: "미술관",
    region: "서울 종로",
    openDate: "2026-02-28",
    availableStart: "2026-03-05",
    availableEnd: "2026-04-05",
  },
  {
    name: "국립광주과학관",
    type: "과학관",
    region: "광주 북구",
    openDate: "2026-02-22",
    availableStart: "2026-02-24",
    availableEnd: "2026-03-30",
  },
  {
    name: "국립해양박물관",
    type: "박물관",
    region: "부산 영도",
    openDate: "2026-02-24",
    availableStart: "2026-03-02",
    availableEnd: "2026-03-28",
  },
  {
    name: "국립아시아문화전당",
    type: "체험관",
    region: "광주 동구",
    openDate: "2026-02-21",
    availableStart: "2026-02-26",
    availableEnd: "2026-04-10",
  },
  {
    name: "국립중앙과학관",
    type: "과학관",
    region: "대전 유성",
    openDate: "2026-02-23",
    availableStart: "2026-02-27",
    availableEnd: "2026-03-27",
  },
  {
    name: "국립현대미술관 과천",
    type: "미술관",
    region: "경기 과천",
    openDate: "2026-02-26",
    availableStart: "2026-03-03",
    availableEnd: "2026-04-01",
  },
  {
    name: "국립항공박물관",
    type: "박물관",
    region: "서울 강서",
    openDate: "2026-02-27",
    availableStart: "2026-03-04",
    availableEnd: "2026-03-25",
  },
];

const state = {
  search: "",
  date: "",
  sort: "open",
  type: "전체",
};

const listEl = document.getElementById("facilityList");
const emptyEl = document.getElementById("emptyState");
const totalCountEl = document.getElementById("totalCount");
const todayLabelEl = document.getElementById("todayLabel");
const typeChipsEl = document.getElementById("typeChips");

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value + "T00:00:00");
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const withinRange = (date, start, end) => {
  if (!date) return true;
  const d = new Date(date + "T00:00:00");
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return d >= s && d <= e;
};

const getStatus = (item, selectedDate) => {
  if (!selectedDate) {
    const today = new Date();
    const open = new Date(item.openDate + "T00:00:00");
    if (open > today) return { label: "오픈 예정", tone: "soon" };
    return { label: "예약 진행", tone: "open" };
  }
  if (withinRange(selectedDate, item.availableStart, item.availableEnd)) {
    return { label: "해당 날짜 가능", tone: "open" };
  }
  const open = new Date(item.openDate + "T00:00:00");
  const selected = new Date(selectedDate + "T00:00:00");
  if (selected < open) return { label: "오픈 전", tone: "soon" };
  return { label: "예약 불가", tone: "closed" };
};

const renderChips = () => {
  const types = ["전체", ...new Set(facilities.map((item) => item.type))];
  typeChipsEl.innerHTML = "";
  types.forEach((type) => {
    const chip = document.createElement("button");
    chip.className = `chip ${state.type === type ? "active" : ""}`;
    chip.textContent = type;
    chip.addEventListener("click", () => {
      state.type = type;
      render();
    });
    typeChipsEl.appendChild(chip);
  });
};

const render = () => {
  const filtered = facilities
    .filter((item) => item.name.includes(state.search))
    .filter((item) => (state.type === "전체" ? true : item.type === state.type))
    .filter((item) => withinRange(state.date, item.availableStart, item.availableEnd))
    .sort((a, b) => {
      if (state.sort === "name") return a.name.localeCompare(b.name, "ko");
      if (state.sort === "start") return a.availableStart.localeCompare(b.availableStart);
      return a.openDate.localeCompare(b.openDate);
    });

  listEl.innerHTML = "";
  filtered.forEach((item) => {
    const status = getStatus(item, state.date);
    const card = document.createElement("div");
    card.className = "card";
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
          <span>${formatDate(item.openDate)}</span>
        </div>
        <div>
          <strong>관람 시작</strong>
          <span>${formatDate(item.availableStart)}</span>
        </div>
        <div>
          <strong>관람 종료</strong>
          <span>${formatDate(item.availableEnd)}</span>
        </div>
      </div>
    `;
    listEl.appendChild(card);
  });

  emptyEl.style.display = filtered.length ? "none" : "block";
  totalCountEl.textContent = facilities.length;
};

const init = () => {
  const today = new Date();
  todayLabelEl.textContent = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
    state.date = "";
    state.sort = "open";
    state.type = "전체";
    document.getElementById("searchInput").value = "";
    document.getElementById("dateInput").value = "";
    document.getElementById("sortSelect").value = "open";
    renderChips();
    render();
  });

  document.getElementById("scrollToList").addEventListener("click", () => {
    document.getElementById("list").scrollIntoView({ behavior: "smooth" });
  });

  renderChips();
  render();
};

init();
