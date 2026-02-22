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
    name: "국립경찰박물관",
    type: "박물관",
    region: "서울 종로",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.policemuseum.go.kr/pm_reservation_new/tourguide.asp",
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
  {
    sector: "public",
    name: "중부소방서 소방차 길터주기",
    type: "체험관",
    region: "인천 중구",
    openDate: "2026-02-10",
    availableStart: "2026-02-19",
    availableEnd: "2026-02-19",
    reservationUrl: "https://www.incheon.go.kr/res/RE030101/lnbnsExprnView?resveGroupSn=102&resveProgrmSeCode=E&progrmSn=1662&curPage=2",
  },
  {
    sector: "public",
    name: "남동소방서 소방안전체험",
    type: "체험관",
    region: "인천 남동",
    openDate: "2026-02-01",
    availableStart: "2026-02-01",
    availableEnd: "2026-02-28",
    reservationUrl: "https://www.incheon.go.kr/res/RE030101/lnbnsExprnView?resveGroupSn=102&resveProgrmSeCode=E&progrmSn=1622",
  },
  {
    sector: "public",
    name: "연희공원 산림치유(채움의숲)",
    type: "체험관",
    region: "인천 서구",
    openDate: "2026-03-20",
    availableStart: "2026-04-01",
    availableEnd: "2026-04-30",
    reservationUrl: "https://www.incheon.go.kr/res/RE030101/lnbnsExprnView?resveGroupSn=101&resveProgrmSeCode=E&progrmSn=1122",
  },
  {
    sector: "public",
    name: "미추홀구 유아숲체험",
    type: "체험관",
    region: "인천 미추홀",
    openDate: "2026-02-15",
    availableStart: "2026-03-01",
    availableEnd: "2026-11-30",
    reservationUrl: "https://www.incheon.go.kr/res/RE030101",
  },
  {
    sector: "public",
    name: "인천 수도국산달동네 박물관",
    type: "박물관",
    region: "인천 동구",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.icdonggu.go.kr/museum/guide/reserve.jsp",
  },
  {
    sector: "private",
    name: "동탄 네이처스케이프 플러스",
    type: "체험관",
    region: "경기 화성",
    openRule: "네이버 예약",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://m.booking.naver.com/booking/5/bizes/1130044/items/7390793?theme=place&service-target=map-pc&lang=ko&area=bmp",
  },
  {
    sector: "farm",
    name: "토북팜",
    type: "농장 체험",
    region: "충남 홍성",
    openRule: "전화 문의",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "tel:010-9823-4647",
  },
  {
    sector: "private",
    name: "서울우유 양주공장",
    type: "공장 견학",
    region: "경기 양주",
    openDate: "2026-03-03",
    openTime: "10:00",
    availableStart: "2026-03-03",
    availableEnd: "2026-03-03",
    reservationUrl: "https://tour.seoulmilk.co.kr/tour/visit_01.php?int_place=1",
  },
  {
    sector: "public",
    name: "대한민국 국회 어린이박물관",
    type: "박물관",
    region: "서울 영등포",
    openRule: "온라인 예약",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://reservation.assembly.go.kr/reserve/contents/booking/contentsView.do?sn=K20222348999404&menuNo=2200023",
  },
  {
    sector: "private",
    name: "한국야구르트 평택공장",
    type: "공장 견학",
    region: "경기 평택",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://hyfactory.fredit.co.kr/apply/applySelect?v=12052024",
  },
  {
    sector: "public",
    name: "서울생활사박물관 어린이체험실",
    type: "박물관",
    region: "서울 노원",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://museum.seoul.go.kr/sulm/information/viewGuide/bfeResveGuide.jsp",
  },
  {
    sector: "public",
    name: "송파책박물관",
    type: "박물관",
    region: "서울 송파",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.bookmuseum.go.kr/watch/watch_inscr_step01.do",
  },
  {
    sector: "private",
    name: "키즈마린파크",
    type: "체험관",
    region: "부산",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://kidsmarinepark.or.kr/education/education2.php",
  },
  {
    sector: "private",
    name: "동구랑스틸랜드",
    type: "체험관",
    region: "인천 동구",
    openRule: "전화 문의",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "tel:0507-1429-2435",
  },
  {
    sector: "public",
    name: "서울형키즈카페",
    type: "키즈카페",
    region: "서울",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://umppa.seoul.go.kr/icare/user/kidsCafe/BD_selectKidsCafeList.do",
  },
  {
    sector: "private",
    name: "플래시백 계림",
    type: "전시/체험",
    region: "광주",
    openRule: "예매 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.ticketlink.co.kr/product/61311",
  },
  {
    sector: "private",
    name: "가평 베고니아 새정원",
    type: "정원/식물원",
    region: "경기 가평",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://code.lscompany-coupon.com/?lscompanyResellerProductCode=PR26010911",
  },
  {
    sector: "private",
    name: "영화공장",
    type: "체험/클래스",
    region: "서울",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://m.booking.naver.com/booking/12/bizes/640477?theme=place&service-target=map-pc&lang=ko&area=bmp",
  },
  {
    sector: "private",
    name: "현대어린이책미술관",
    type: "미술관",
    region: "경기 하남",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.hmoka.org/visit/information/main.do?st_cd=480",
  },
  {
    sector: "farm",
    name: "포천 아딸농원",
    type: "농장 체험",
    region: "경기 포천",
    openRule: "스마트스토어 문의",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://smartstore.naver.com/thechakhanfilter",
  },
  {
    sector: "public",
    name: "경기북부어린이박물관",
    type: "박물관",
    region: "경기 동두천",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://ngcm.ggcf.kr/pages/ticketing",
  },
  {
    sector: "public",
    name: "서울상상나라",
    type: "박물관",
    region: "서울 광진",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.seoulchildrensmuseum.org/reservation/individualregistration.do",
  },
  {
    sector: "private",
    name: "루덴시아 테마파크",
    type: "테마파크",
    region: "경기 가평",
    openRule: "지도/예약 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://map.naver.com/p/search/%EB%A3%A8%EB%8D%B4%EC%8B%9C%EC%95%84/place/1266097670?c=15.00,0,0,0,dh&placePath=/home",
  },
  {
    sector: "private",
    name: "라이크노아더키즈",
    type: "키즈카페",
    region: "인천 남동",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "http://pcmap.place.naver.com/place/2009162765/booking?from=map&fromPanelNum=2&timestamp=202602230117&locale=ko&svcName=map_pcv5",
  },
  {
    sector: "private",
    name: "라운드트립 모래놀이터 카페",
    type: "카페/체험",
    region: "충북 청주",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://pcmap.place.naver.com/restaurant/1769950058/booking?from=map&fromPanelNum=2&timestamp=202602230118&locale=ko&svcName=map_pcv5&entry=bmp",
  },
  {
    sector: "public",
    name: "도르르놀이터",
    type: "놀이터",
    region: "경기 남양주",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://nuture.nyjscc.kr/playground/playgroundList.do?playgroundUuid=20220211110654811800&reservationUserType=COM_MEMBER_TYPE_01&menuUuid=20211207231100050502",
  },
  {
    sector: "public",
    name: "문경 에코월드",
    type: "테마파크",
    region: "경북 문경",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://pcmap.place.naver.com/place/11783969/ticket?from=map&fromPanelNum=2&timestamp=202602230119&locale=ko&svcName=map_pcv5",
  },
  {
    sector: "public",
    name: "아리수나라",
    type: "체험관",
    region: "서울 광진",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://arisu.seoul.go.kr/home/sub?menukey=7534",
  },
  {
    sector: "farm",
    name: "쇠꼴마을",
    type: "농촌 체험",
    region: "경기",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://pcmap.place.naver.com/place/13418387/ticket?from=map&fromPanelNum=2&timestamp=202602230120&locale=ko&svcName=map_pcv5",
  },
  {
    sector: "farm",
    name: "은진농장",
    type: "농장 체험",
    region: "경기",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://pcmap.place.naver.com/place/1430820935/ticket?from=map&fromPanelNum=2&timestamp=202602230120&locale=ko&svcName=map_pcv5",
  },
  {
    sector: "farm",
    name: "생태농장 초록향기",
    type: "농장 체험",
    region: "경기",
    openRule: "상담/예약",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "http://www.eco-greenfarm.com/g5/booking/consult_form.php",
  },
  {
    sector: "farm",
    name: "연보람녹장",
    type: "농장 체험",
    region: "경기",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://pcmap.place.naver.com/place/20018347/ticket?from=map&fromPanelNum=2&timestamp=202602230121&locale=ko&svcName=map_pcv5",
  },
  {
    sector: "farm",
    name: "벼꽃농부",
    type: "농장 체험",
    region: "경기",
    openRule: "전화 문의",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "tel:070-4441-7085",
  },
  {
    sector: "farm",
    name: "볏짚놀이터",
    type: "농장 체험",
    region: "경기",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://pcmap.place.naver.com/place/1285720119/ticket?from=map&fromPanelNum=2&timestamp=202602230125&locale=ko&svcName=map_pcv5",
  },
  {
    sector: "public",
    name: "오산미니어처빌리지",
    type: "체험관",
    region: "경기 오산",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.osanmv.com/html/sub/03_03.asp",
  },
  {
    sector: "water",
    name: "동탄패밀리풀",
    type: "물놀이터",
    region: "경기 화성",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "여름",
    availableEnd: "여름",
    reservationUrl: "https://www.hsuco.or.kr/www/M040000/M040500/M0405002/M0405008.jsp",
  },
  {
    sector: "private",
    name: "그린티플",
    type: "체험관",
    region: "경기 안산(대부동)",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://pcmap.place.naver.com/place/1783116714/ticket?from=map&fromPanelNum=2&timestamp=202602230126&locale=ko&svcName=map_pcv5",
  },
  {
    sector: "public",
    name: "어린이순환자원홍보관",
    type: "체험관",
    region: "경기 성남",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://reworld.kora.or.kr/guide/individual/index.php",
  },
  {
    sector: "public",
    name: "의령곤충생태학습관",
    type: "체험관",
    region: "경남 의령",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://pcmap.place.naver.com/place/37438585/ticket?from=map&fromPanelNum=2&timestamp=202602230127&locale=ko&svcName=map_pcv5",
  },
  {
    sector: "private",
    name: "뮤지엄헤이",
    type: "미술관",
    region: "경기 파주",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://pcmap.place.naver.com/place/1179348912/ticket?from=map&fromPanelNum=2&timestamp=202602230128&locale=ko&svcName=map_pcv5",
  },
  {
    sector: "public",
    name: "태안군가족공감센터 어린이놀이터",
    type: "놀이터",
    region: "충남 태안",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.taeanfamily.kr:449/reservation/playground.html",
  },
  {
    sector: "public",
    name: "태안군가족공감센터 어린이과학관",
    type: "과학관",
    region: "충남 태안",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.taeanfamily.kr:449/reservation/science.html",
  },
  {
    sector: "private",
    name: "하우스플레이랩",
    type: "체험관",
    region: "경기",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://pcmap.place.naver.com/restaurant/1916388380/booking?from=map&fromPanelNum=2&timestamp=202602230129&locale=ko&svcName=map_pcv5&entry=bmp",
  },
  {
    sector: "private",
    name: "디스커버스 의왕",
    type: "체험관",
    region: "경기 의왕",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://pcmap.place.naver.com/place/1838180116/ticket?from=map&fromPanelNum=2&timestamp=202602230129&locale=ko&svcName=map_pcv5",
  },
  {
    sector: "private",
    name: "화담숲",
    type: "정원",
    region: "경기 광주",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://content.yanolja.com/event/216?source_caller=ui&shortlink=y8lon1i4&c=mkt_hwadam_fall&pid=NOL_hwadam_fall&deep_link_value=nol-app%3A%2F%2Fwv%3Furl%3Dhttps%253A%252F%252Fcontent.yanolja.com%252Fevent%252F216&af_click_lookback=1d&af_xp=custom&af_force_deeplink=true",
  },
  {
    sector: "public",
    name: "인천어린이과학관",
    type: "과학관",
    region: "인천",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://reserve.insiseol.or.kr/childsee/childSeeScheduleMonth.do?see_seq=1",
  },
  {
    sector: "public",
    name: "국립민속박물관 어린이박물관",
    type: "박물관",
    region: "서울 종로",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.nfm.go.kr/kids/nfmkid/exhibition/selectReserveView.do",
  },
  {
    sector: "public",
    name: "서울공예박물관 어린이박물관",
    type: "박물관",
    region: "서울 종로",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://craftmuseum.seoul.go.kr/chimsm/exhibit/plan/list/1",
  },
  {
    sector: "public",
    name: "전쟁기념관 어린이박물관",
    type: "박물관",
    region: "서울 용산",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.warmemo.or.kr:8443/Kids/K20000/K20200/html",
  },
  {
    sector: "private",
    name: "크라운해태 키즈뮤지엄",
    type: "박물관",
    region: "서울",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://pcmap.place.naver.com/place/32971793/booking?bk_query=%EC%96%B4%EB%A6%B0%EC%9D%B4&entry=bmp&from=map&fromPanelNum=2&timestamp=202602230136&locale=ko&svcName=map_pcv5&searchText=%EC%96%B4%EB%A6%B0%EC%9D%B4",
  },
  {
    sector: "public",
    name: "인천중부소방서 길터주기 동승체험",
    type: "체험관",
    region: "인천 중구",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.incheon.go.kr/res/RE030101/lnbnsExprnView?resveGroupSn=102&resveProgrmSeCode=E&progrmSn=1662&curPage=1",
  },
  {
    sector: "public",
    name: "인천남동소방서 길터주기 동승체험",
    type: "체험관",
    region: "인천 남동",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.incheon.go.kr/res/RE030101/lnbnsExprnView?resveGroupSn=103&resveProgrmSeCode=E&progrmSn=1659&curPage=1",
  },
  {
    sector: "public",
    name: "인천영종소방서 길터주기 동승체험",
    type: "체험관",
    region: "인천 중구",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.incheon.go.kr/res/RE030101/lnbnsExprnView?resveGroupSn=183&resveProgrmSeCode=E&progrmSn=1661&curPage=1",
  },
  {
    sector: "public",
    name: "인천미추홀소방서 길터주기 동승체험",
    type: "체험관",
    region: "인천 미추홀",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.incheon.go.kr/res/RE030101/lnbnsExprnView?resveGroupSn=108&resveProgrmSeCode=E&progrmSn=1667&curPage=1",
  },
  {
    sector: "farm",
    name: "용인농도원목장",
    type: "목장 체험",
    region: "경기 용인",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.nongdo.co.kr/menu4/menu4_sub1_1.php",
  },
  {
    sector: "public",
    name: "국립중앙박물관 어린이박물관",
    type: "박물관",
    region: "서울 용산",
    openRule: "예약 페이지 확인",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.museum.go.kr/site/main/reserve/child/intro",
  },
  {
    sector: "public",
    name: "국립생물자원관",
    type: "체험관",
    region: "인천 서구",
    openRule: "통합예약",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://www.nibr.go.kr/rsrv",
  },
  {
    sector: "public",
    name: "서울백제어린이박물관",
    type: "박물관",
    region: "서울 송파",
    openRule: "서울시 공공서비스예약",
    openDate: "",
    availableStart: "정보 확인",
    availableEnd: "정보 확인",
    reservationUrl: "https://yeyak.seoul.go.kr",
  },
  {
    sector: "water",
    name: "서울물재생체험관 어린이 물놀이터",
    type: "물놀이터",
    region: "서울 강서",
    openRule: "2주 단위 사전예약(서울시 공공서비스예약)",
    openDate: "",
    availableStart: "여름",
    availableEnd: "여름",
    reservationUrl: "https://swr.or.kr/museum/cpage.do",
  },
  {
    sector: "water",
    name: "진양호공원 어린이물놀이터",
    type: "물놀이터",
    region: "경남 진주",
    openRule: "진주시 통합예약 확인",
    openDate: "",
    availableStart: "여름",
    availableEnd: "여름",
    reservationUrl: "https://www.jinju.go.kr/board/view.jinju?boardId=BBS_0000214&menuCd=DOM_000000203012004000&dataSid=1598915",
  },
  {
    sector: "water",
    name: "물초울공원 물놀이터",
    type: "물놀이터",
    region: "경남 진주",
    openRule: "진주시 통합예약 확인",
    openDate: "",
    availableStart: "여름",
    availableEnd: "여름",
    reservationUrl: "https://www.jinju.go.kr/board/view.jinju?boardId=BBS_0000214&menuCd=DOM_000000203012004000&dataSid=1598639",
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
  regionFilter: "전체",
  expandedSectors: [],
};

const listMap = {
  public: document.getElementById("publicList"),
  private: document.getElementById("privateList"),
  farm: document.getElementById("farmList"),
  water: document.getElementById("waterList"),
  popup: document.getElementById("popupList"),
};

const emptyMap = {
  public: document.getElementById("publicEmpty"),
  private: document.getElementById("privateEmpty"),
  farm: document.getElementById("farmEmpty"),
  water: document.getElementById("waterEmpty"),
  popup: document.getElementById("popupEmpty"),
  region: document.getElementById("regionEmpty"),
};

const totalCountEl = document.getElementById("totalCount");
const todayLabelEl = document.getElementById("todayLabel");
const spotlightListEl = document.getElementById("spotlightList");
const spotlightEmptyEl = document.getElementById("spotlightEmpty");
const spotlightHintEl = document.getElementById("spotlightHint");
const regionListEl = document.getElementById("regionList");
const regionFilterEl = document.getElementById("regionFilter");
const regionSelectEl = document.getElementById("regionSelect");

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

const getRegionGroup = (region = "") => {
  if (!region || region.includes("정보") || region.includes("확인")) return "기타";
  const token = region.split(" ")[0];
  const normalized = token.replace(/특별시|광역시|특별자치시|특별자치도|자치도/g, "");
  const known = [
    "서울", "경기", "인천", "강원", "충북", "충남", "대전",
    "세종", "광주", "전북", "전남", "대구", "부산", "울산",
    "경북", "경남", "제주"
  ];
  if (known.includes(normalized)) return normalized;
  return normalized || "기타";
};

const populateRegionFilters = () => {
  const regions = Array.from(new Set(facilities.map((item) => getRegionGroup(item.region))));
  const sorted = regions.filter(Boolean).sort((a, b) => a.localeCompare(b, "ko"));
  const options = ["전체", ...sorted];

  const buildOptions = (selectEl) => {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    options.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value === "전체" ? "전체 지역" : value;
      selectEl.appendChild(option);
    });
    selectEl.value = state.regionFilter;
  };

  buildOptions(regionFilterEl);
  buildOptions(regionSelectEl);
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

const matchesDateFilter = (item) => {
  if (!state.date) return true;
  if (withinRange(state.date, item.availableStart, item.availableEnd, item.openDate)) {
    return true;
  }
  if (!isDateString(item.availableStart) || !isDateString(item.availableEnd)) {
    return true;
  }
  return false;
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

const buildRegionCard = (region, items) => {
  const card = document.createElement("div");
  card.className = "region-card";

  const header = document.createElement("h3");
  header.innerHTML = `${region}<span>${items.length}곳</span>`;
  card.appendChild(header);

  const list = document.createElement("div");
  list.className = "region-list";

  items.slice(0, 5).forEach((item) => {
    const row = document.createElement("div");
    row.className = "region-item";
    const disabled = item.reservationUrl === "#" || !item.reservationUrl;
    const nameEl = document.createElement(disabled ? "div" : "a");
    nameEl.textContent = item.name;
    if (!disabled) {
      nameEl.href = item.reservationUrl;
      nameEl.target = "_blank";
      nameEl.rel = "noopener";
    }
    const meta = document.createElement("span");
    meta.textContent = item.type;
    row.appendChild(nameEl);
    row.appendChild(meta);
    list.appendChild(row);
  });

  card.appendChild(list);
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
    .filter((item) => matchesDateFilter(item))
    .filter((item) => state.regionFilter === "전체" || getRegionGroup(item.region) === state.regionFilter)
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

  ["private", "farm", "water", "popup"].forEach((sector) => {
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

  if (regionListEl) {
    const regionGroups = filtered.reduce((acc, item) => {
      const key = getRegionGroup(item.region);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    regionListEl.innerHTML = "";
    const regionKeys = Object.keys(regionGroups).sort((a, b) => a.localeCompare(b, "ko"));
    if (regionKeys.length) {
      regionKeys.forEach((region) => {
        const items = regionGroups[region].sort((a, b) => a.name.localeCompare(b.name, "ko"));
        regionListEl.appendChild(buildRegionCard(region, items));
      });
      emptyMap.region.style.display = "none";
    } else {
      emptyMap.region.style.display = "block";
    }
  }

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

  const handleRegionChange = (value) => {
    state.regionFilter = value;
    if (regionFilterEl) regionFilterEl.value = value;
    if (regionSelectEl) regionSelectEl.value = value;
    render();
  };

  if (regionFilterEl) {
    regionFilterEl.addEventListener("change", (event) => {
      handleRegionChange(event.target.value);
    });
  }

  if (regionSelectEl) {
    regionSelectEl.addEventListener("change", (event) => {
      handleRegionChange(event.target.value);
    });
  }

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
    state.regionFilter = "전체";
    document.getElementById("searchInput").value = "";
    document.getElementById("dateInput").value = state.date;
    document.getElementById("sortSelect").value = "open";
    if (regionFilterEl) regionFilterEl.value = "전체";
    if (regionSelectEl) regionSelectEl.value = "전체";
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

populateRegionFilters();
init();
