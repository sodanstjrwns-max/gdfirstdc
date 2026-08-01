// 검단퍼스트치과 기본 정보
export const CLINIC = {
  name: '검단퍼스트치과의원',
  shortName: '검단퍼스트치과',
  nameEn: 'Geomdan First Dental Clinic',
  doctor: '김희수',
  phone: '032-563-2872',
  address: '인천광역시 서구 이음5로 80, 검단퍼스트프라자 3층 303~305호 (원당동)',
  addressShort: '인천 서구 이음5로 80, 검단퍼스트프라자 3층',
  region: '검단신도시',
  lat: 37.6023,
  lng: 126.6788,
  bizNo: '141-59-00634',
  email: 'khs831009@naver.com',
  blog: 'https://blog.naver.com/gdfirstdental',
  naverBooking: 'https://naver.me/G4GOgKMQ', // 네이버 예약
  kakao: 'http://pf.kakao.com/_xoUQjX', // 카카오톡 채널
  siteUrl: 'https://gdfirstdc.kr', // 공식 도메인 (가비아 등록, Cloudflare DNS)
  hours: [
    { day: '월요일', time: 'AM 09:30 ~ PM 18:30' },
    { day: '화요일', time: 'AM 09:30 ~ PM 18:30' },
    { day: '수요일', time: 'AM 09:30 ~ PM 18:30' },
    { day: '목요일', time: '휴진 (공휴일이 있는 주는 정상진료)' },
    { day: '금요일', time: 'AM 09:30 ~ PM 18:30' },
    { day: '토요일', time: 'AM 09:30 ~ PM 14:00 (점심시간 없이 진료)' },
    { day: '일요일 · 공휴일', time: '휴진' },
  ],
  lunch: 'PM 13:00 ~ PM 14:00 (평일)',
  mission: '미소에 자신감을 더하는, 검단에서 가장 정직한 치과',
  missionEn: 'Make Luminate, More Attractive',
  // 원장님이 직접 작성하신 비전·가치·슬로건 (제작 신청서 원문)
  vision: '자연스러운 심미와 정밀한 진료로 오래 신뢰받는 치과',
  coreValue: '사람에 대한 진심과 배려',
  slogan: '미소에 자신감을 더하는, 가장 편안한 진료를 제공합니다',
  slogans: [
    '과잉진료 없는 1인 대표원장 책임진료',
    '검단신도시에서 가장 오래된 치과, 그 이름의 무게를 압니다',
    '다른 병원도 다녀오세요. 그럼 저희의 가치를 더 느끼실 수 있습니다',
  ],
}

export const DOCTOR = {
  name: '김희수',
  title: '대표원장',
  philosophy:
    '환자분께 최고의 진료를 하는 것이 저의 진료 철학이자 의사로서의 자부심입니다. 최고의 진료뿐 아니라 최상의 만족을 위해, 환자분의 불편감을 최대한 없애드리는 것이 제가 해드릴 수 있는 최고의 배려라고 생각합니다. 저는 이 두 가지를 위해 끊임없이 연구하고 투자합니다.',
  highlights: [
    '보건복지부 인증 통합치의학 전문의 (대학병원 정식 수련과정)',
    '보건복지부 산하 대한치과보철학회 인증 「우수보철의사」',
  ],
  career: [
    '휘문고등학교 졸업',
    '육군 수도기계화보병사단(맹호부대) 기갑수색대대 만기 제대',
    '경희대학교 학사 · 치의학전문대학원 석사',
    '가톨릭대학교 부천성모병원 통합치의학과 레지던트 과정 수료',
    '필리핀 카푸친 수녀원 해외봉사단 치과 진료팀',
    '미국 Harvard School of Dental Medicine Implant Dentistry CE',
    '서울대학교 치의학대학원 Periodontal / Implant Therapy',
  ],
  courses: [
    'CIRD Advanced Implant Sinus / Ridge Augmentation Course',
    'ATC Implant Surgery Advanced Course',
    'ATC 심미보철 Course',
    'KAYA Dental Hospital 고정성보철 고급과정',
    'JPDA 소아치과 고급과정',
    'APEX 근관치료과정',
    '연세대학교 Doctor’s Endo Seminar',
    '고려대학교 가철성보철 고급과정',
    '아시안 턱관절 포럼 Advanced Course',
    '미국 뉴욕대 심미과 「무삭제 라미네이트」 고급과정 (Non-prep Veneer Academy)',
    'Noble Medical 보톡스 Course',
    'Shockwave Regenerative Medicine Training Program (체외충격파)',
  ],
  memberships: [
    'AAID (미국치과임플란트학회) 정회원',
    'ICOI (세계구강임플란트학회) 정회원',
    '한국임상임플란트연구회(KCIRI) 회원',
    '대한치과 통합치과학회 정회원',
    '대한치과 근관치료학회 정회원',
    '대한치과 보철학회 정회원',
    '대한충격파재생의학회 정회원 (체외충격파)',
    '오스템임플란트 임상자문연구위원',
    '덴티스임플란트 임상자문연구위원',
  ],
  papers: [
    '우수포스터상 수상 — Implant Displacement into the Mandibular Medullary Space during Implant Surgery: Case Report (Vol.08, No.2, May 2019, Journal of Korean Academy of Advanced General Dentistry)',
    'Three Cases of Nasopalatine Duct Cysts Misdiagnosed as a Radicular Cyst (Vol.09, No.2, May 2020, Journal of Korean Academy of Advanced General Dentistry)',
  ],
  media: [
    '한국경제TV 「건강매거진」 백세시대 건강장수 돕는 임플란트 치료편 출연',
  ],
  bestAt: ['implant', 'luminate', 'tmj'],
}

export const EQUIPMENT = [
  { name: 'ZEISS 독일 미세현미경', desc: '치아 균열·근관 내부를 최대 25배율로 확대하여 맨눈으로 볼 수 없는 미세한 부분까지 정밀하게 치료합니다.', icon: 'fa-microscope' },
  { name: '체외충격파 (ESWT)', desc: '턱관절 만성 근육통증에 통증전달물질을 감소시키고 신생혈관 생성을 유도해 만성염증을 줄이고 치유를 촉진합니다.', icon: 'fa-wave-square' },
  { name: 'RAY 페이스 스캐너', desc: '얼굴 전체를 3D로 스캔하여 나에게 가장 잘 어울리는 미소를 시뮬레이션합니다. 라미네이트 디자인의 핵심 장비입니다.', icon: 'fa-face-smile' },
  { name: '3D 구강스캐너 & 3D 프린터', desc: '불편한 본뜨기 없이 디지털 스캔 후, 약 25분 만에 무삭제 임시 라미네이트를 원내에서 즉시 출력합니다.', icon: 'fa-print' },
  { name: 'Q-ray 치아균열 형광검사', desc: '특수 형광 빛으로 맨눈으로 보이지 않는 치아 균열과 초기 충치를 조기에 발견합니다.', icon: 'fa-magnifying-glass' },
  { name: '플라즈마 엔도', desc: '신경치료 시 근관 내 세균을 플라즈마로 살균하여 치료 성공률을 높입니다.', icon: 'fa-bolt' },
  { name: '크라이오 냉각장비', desc: '시술 부위를 냉각시켜 통증과 부기를 최소화합니다. 임플란트 수술 후 회복이 빨라집니다.', icon: 'fa-snowflake' },
  { name: '에어파우더 미온수 스케일러', desc: '미세 파우더 분사와 따뜻한 물로 스케일링합니다. 차가운 물이 시린 분도 시림 없이 편안하게, 착색까지 깨끗하게.', icon: 'fa-droplet' },
  { name: '디지털 CT & 파노라마', desc: '3차원 정밀 진단으로 신경관 위치·골밀도까지 분석하여 안전한 임플란트를 계획합니다.', icon: 'fa-x-ray' },
]

export const STORIES = [
  {
    id: 'father',
    title: '가장 기억에 남는 환자는, 저희 아버지입니다',
    treatment: 'implant',
    body: [
      '어느 날 어머니에게 전화가 왔습니다. "너희 아빠가 요즘 밥을 잘 안 먹어. 왜 그러냐니 이가 아프다고 하네. 평생 한마디도 안 하더니."',
      '아버지가 오셔서 파노라마 사진을 찍은 순간, 저는 헉 했습니다. 치아 개수는 절반 정도밖에 남지 않았고, 뼈에 온전히 붙어 있는 치아는 네 개나 될까. 잇몸으로 식사를 버티시다가, 이제는 아예 식사가 안 되니 오신 것이었습니다.',
      '겁이 많으신 아버지는 흔들리는 치아도 절대 안 빼겠다 고집을 부리셨고, 상악 9개·하악 7개의 임플란트를 심기로 했습니다. 판교에서 검단까지, 한 번 오실 때마다 긴 치료를 견디셔야 했습니다.',
      '약 5개월 후 보철물을 올리던 날, 힘들다고만 하시고 돌아가셨던 아버지. 몇 시간 뒤 어머니의 전화가 울렸습니다. "야, 아빠가 고기를 너무 잘 드셔서 너무 좋댄다. 그동안 빠졌던 살도 금방 다시 올라오겠다. 고생했다."',
      '이제 여든을 바라보시는 아버지가 가족모임 때마다 고기를 잘 드시는 모습을 보면, 아들이 해드린 임플란트로 식사하신다는 게 아버지도 자랑스럽지 않으실까 생각합니다. 저는 모든 환자분의 임플란트를 이 마음으로 심습니다.',
    ],
  },
  {
    id: 'jaw-student',
    title: '응급실에서 30분, 저희 진료실에서는 5초',
    treatment: 'tmj',
    body: [
      '하품을 하다 갑자기 턱이 빠진 고3 수험생이 있었습니다. 2차병원 응급실에서 30분 동안 쩔쩔맸던 학생이, 다시 턱이 빠져 저희 병원에 왔을 때는 단 5초 만에 탈구정복술로 턱을 제자리로 돌려드렸습니다.',
      '이후 스플린트 치료와 PDRN 인대강화주사를 통해 정상적인 식사가 가능해졌고, 지금도 재발 방지를 위해 꾸준히 내원하고 있습니다. 수험생에게 가장 중요한 시기를 지켜드릴 수 있어 다행이었습니다.',
    ],
  },
  {
    id: 'jaw-splint',
    title: '6개월간 낫지 않던 턱관절, 정확한 진단이 바꾼 4개월',
    treatment: 'tmj',
    body: [
      '다른 병원에서 스플린트를 제작하고 6개월간 치료를 받았지만 호전이 없어 내원하신 30대 중반 여성 환자분. 문진을 해보니, 정확히 어떤 진단으로 이 장치를 만들었는지조차 전혀 모르셔서 두려움이 심한 상태였습니다.',
      '디스크 전방변위라는 정확한 진단 하에 잘 맞지 않던 스플린트를 재제작하고 주기적으로 체크한 결과, 4개월 후 불편함 없이 식사를 하실 수 있게 되었습니다. 턱관절 치료는 장치가 아니라 진단이 먼저입니다.',
    ],
  },
]

export const SNS = {
  blog: 'https://blog.naver.com/gdfirstdental',
  naverPlace: 'https://map.naver.com/p/search/검단퍼스트치과',
}
