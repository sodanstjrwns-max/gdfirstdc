// ============================================================
// 대표 키워드 허브: "검단 치과 · 검단신도시 치과" (/region/geomdan, 2026-10-08)
// - 검색 의도(위치·교통·주차·진료시간·의료진·진료과목·예약)에 한 페이지로 답한다.
// - 다른 지역 페이지(regionFaqs·r.intro)와 문장을 공유하지 않는다. /location 은 길 안내·입구 사진 페이지로 두고 이 허브로 링크한다.
// - 사실 정보는 data/clinic.ts·/location 화면에 이미 있는 값만 쓴다.
// ============================================================
import { CLINIC, DOCTOR } from '../data/clinic'
import { TREATMENTS } from '../data/treatments'
import { SEO_REGIONS } from '../data/regions'
import { esc, pageHero, PHYSICIAN_ID } from '../lib/layout'

export const GEOMDAN_HUB_PATH = '/region/geomdan'
export const GEOMDAN_HUB_UPDATED = '2026-10-08'
export const GEOMDAN_HUB_TITLE = '검단 치과 · 검단신도시 치과'
export const GEOMDAN_HUB_FULL_TITLE = `검단 치과 · 검단신도시 치과 | ${CLINIC.shortName}`
export const GEOMDAN_HUB_DESC = `검단 치과 검단퍼스트치과 — 인천 검단구 이음5로 80 검단퍼스트프라자 3층, 아라역 1번 출구 도보 5분. 화요일 야간진료 20:30까지, 토요일 14:00까지, 건물 지하주차장. 통합치의학 전문의 1인 대표원장 진료. ${CLINIC.phone}`
export const GEOMDAN_HUB_ANSWER = `검단퍼스트치과는 인천 검단구 이음5로 80, 검단퍼스트프라자 3층(원당동)에 있는 검단 치과입니다. 인천 1호선 검단 아라역 1번 출구에서 걸어서 5분 거리이고 건물 지하주차장을 이용할 수 있습니다. 보건복지부 인증 통합치의학 전문의 김희수 대표원장이 상담부터 치료, 사후관리까지 직접 맡습니다.`

export const GEOMDAN_HUB_FAQS: { q: string; a: string }[] = [
  {
    q: '아라역에서 검단퍼스트치과까지 어떻게 가나요?',
    a: '인천 1호선 검단 아라역 1번 출구로 나와 이음5로 방향으로 5분 정도 걸으면 검단퍼스트프라자가 나옵니다. 건물 3층에서 엘리베이터를 내리면 바로 병원 입구가 보입니다. 버스는 검단신도시 중심상가 정류장에서 내리시면 걸어서 오실 수 있습니다.',
  },
  {
    q: '차를 가져가면 어디에 주차하나요?',
    a: '검단퍼스트프라자 건물 지하주차장을 이용하시면 됩니다. 지하주차장이 가득 찼을 때는 대각선 맞은편 유성타워 지상주차장을 이용하실 수 있습니다.',
  },
  {
    q: '목요일에도 진료하나요?',
    a: '목요일은 정기 휴진입니다. 다만 그 주에 공휴일이 있으면 목요일에 정상진료합니다. 화요일은 저녁 8시 30분까지 야간진료를 하고, 토요일은 점심시간 없이 오후 2시까지 진료합니다.',
  },
  {
    q: '진료비를 미리 알아볼 수 있나요?',
    a: '임플란트·라미네이트·크라운 등 비급여 진료비는 홈페이지 비용 안내 페이지에 항목별로 공개되어 있습니다. 실제 비용은 검사 결과와 치아 상태에 따라 달라질 수 있어 진단 후 치료 계획과 함께 다시 안내해 드립니다.',
  },
  {
    q: '이미 받은 치료 계획이 맞는지 다시 확인받고 싶어요.',
    a: '다른 곳에서 받은 진단이나 견적이 있다면 가지고 오셔도 됩니다. 검사 자료를 함께 보면서 꼭 필요한 치료와 지금 하지 않아도 되는 치료를 나누어 설명해 드리고, 결정은 충분히 비교해 보신 뒤에 하셔도 괜찮습니다.',
  },
  {
    q: '예약은 어떤 방법으로 하나요?',
    a: `전화(${CLINIC.phone}), 네이버 예약, 네이버 톡톡, 홈페이지 예약·상담 신청 중 편한 방법을 이용하시면 됩니다. 통증이 심하거나 붓기가 있다면 전화로 먼저 증상을 알려 주시면 당일 진료 가능 시간을 확인해 드립니다.`,
  },
]

export function geomdanHubBody(): string {
  const hoursRows = CLINIC.hours.map((h) => `<tr class="border-b border-ink/8"><th scope="row" class="py-3 pr-4 text-left font-bold text-ink w-[42%]">${esc(h.day)}</th><td class="py-3 text-ink/60">${esc(h.time)}</td></tr>`).join('')
  const txCards = TREATMENTS.map((t) => `<a href="/treatments/${t.slug}" class="group rounded-2xl bg-white border border-ink/8 p-5 block hover:border-gold-500/40 transition"><h3 class="font-extrabold text-ink tracking-tight">${esc(t.name)}</h3><p class="mt-1 text-[13px] text-ink/50 leading-relaxed">${esc(t.tagline)}</p></a>`).join('')
  const near = ['wondang', 'ara', 'dangha', 'majeon', 'bullo', 'wanggil']
    .map((s) => SEO_REGIONS.find((r) => r.slug === s))
    .filter((r): r is NonNullable<typeof r> => !!r)
    .map((r) => `<a href="/region/${r.slug}" class="px-4 py-2 rounded-full bg-white border border-ink/10 text-[13px] font-semibold text-ink/60 hover:bg-ink hover:text-white transition">${esc(r.name)} 치과</a>`).join('')
  const p = 'text-[15px] text-ink/70 leading-[1.95] mt-4'
  const h2 = 'text-2xl sm:text-[28px] font-extrabold text-ink tracking-tightest mt-14'
  return `
${pageHero('Geomdan Dental', `검단 치과<br><span class="font-disp text-shine">검단신도시 치과</span>`, `검단퍼스트치과 — 이음5로 80 검단퍼스트프라자 3층, 아라역 1번 출구 도보 5분.`)}

<section id="hub-answer" class="max-w-4xl mx-auto px-5 -mt-8 relative z-10">
  <div class="rounded-3xl bg-white border border-ink/8 shadow-xl shadow-ink/5 p-7 sm:p-9">
    <p class="text-[11px] font-bold tracking-[0.3em] uppercase text-gold-600">한눈에 보기</p>
    <p class="speakable-summary mt-3 text-[15px] sm:text-base text-ink/80 leading-[1.9]">${esc(GEOMDAN_HUB_ANSWER)}</p>
    <dl class="mt-6 grid sm:grid-cols-[7.5em_1fr] gap-x-5 gap-y-2.5 text-[14px]">
      <dt class="font-bold text-ink">주소</dt><dd class="text-ink/60">${esc(CLINIC.address)}</dd>
      <dt class="font-bold text-ink">대표전화</dt><dd><a href="tel:${CLINIC.phone}" class="font-extrabold text-gold-600">${CLINIC.phone}</a></dd>
      <dt class="font-bold text-ink">평일 진료</dt><dd class="text-ink/60">월·수·금 09:30~18:30 · 화 09:30~20:30(야간) · 점심 13:00~14:00</dd>
      <dt class="font-bold text-ink">토요일</dt><dd class="text-ink/60">09:30~14:00, 점심시간 없이 진료</dd>
      <dt class="font-bold text-ink">휴진</dt><dd class="text-ink/60">목요일·일요일·공휴일 (공휴일이 있는 주 목요일은 정상진료)</dd>
      <dt class="font-bold text-ink">주차</dt><dd class="text-ink/60">건물 지하주차장 · 만차 시 유성타워 지상주차장</dd>
    </dl>
  </div>
</section>

<section class="max-w-4xl mx-auto px-5 py-14">
  <h2 class="${h2} !mt-0">검단신도시 어디서든, 아라역 1번 출구에서 5분</h2>
  <p class="${p}">병원은 검단신도시 중심상권인 이음5로의 검단퍼스트프라자 3층 303~305호에 있습니다. 지하철은 인천 1호선 검단 아라역 1번 출구가 가장 가깝고, 출구에서 걸어서 5분 남짓이면 도착합니다. 버스를 타신다면 검단신도시 중심상가 정류장에서 내려 걸어오시면 됩니다. 원당동은 걸어서 다닐 수 있는 거리이고, 아라동·당하동·마전동에서도 차로 오래 걸리지 않습니다.</p>
  <p class="${p}">차를 가져오시면 건물 지하주차장에 세우시면 되고, 자리가 없을 때는 대각선 맞은편 유성타워 지상주차장을 쓰실 수 있습니다. 3층에서 엘리베이터를 내리면 병원 입구가 바로 보입니다. 입구와 접수 데스크 사진은 오시는 길 페이지에 있습니다.</p>
  <div class="mt-6 flex flex-wrap gap-2.5">
    <a href="https://map.naver.com/p/entry/place/1391225343" target="_blank" rel="noopener" class="px-5 py-3 rounded-full bg-[#03c75a] text-white text-sm font-bold">네이버지도 길찾기</a>
    <a href="https://map.kakao.com/?q=${encodeURIComponent('검단퍼스트치과')}" target="_blank" rel="noopener" class="px-5 py-3 rounded-full bg-[#fee500] text-ink text-sm font-bold">카카오맵</a>
    <a href="/location" class="px-5 py-3 rounded-full bg-white border border-ink/15 text-sm font-bold text-ink hover:bg-ink hover:text-white transition">오시는 길 · 입구 사진</a>
  </div>

  <h2 class="${h2}">진료시간 — 화요일은 저녁 8시 30분까지</h2>
  <table class="mt-5 w-full text-[14.5px]"><tbody>${hoursRows}</tbody></table>
  <p class="${p}">평일 점심시간은 13:00~14:00입니다. 퇴근 뒤에 오셔야 한다면 화요일 야간진료를, 평일에 시간을 내기 어렵다면 점심 휴게 없이 이어지는 토요일 진료를 이용해 보세요. 목요일은 쉬지만 공휴일이 끼어 있는 주에는 목요일에도 문을 엽니다.</p>

  <h2 class="${h2}">상담한 원장이 끝까지 진료합니다</h2>
  <p class="${p}">검단퍼스트치과는 ${esc(DOCTOR.name)} 대표원장 한 명이 진료하는 1인 원장 치과입니다. 김희수 원장은 대학병원 정식 수련과정을 거친 보건복지부 인증 통합치의학 전문의이며, 대한치과보철학회가 인증한 「우수보철의사」입니다. 처음 상담한 원장이 치료를 하고, 치료가 끝난 뒤의 점검과 관리까지 같은 원장이 이어서 봅니다. 꼭 필요한 치료와 당장 하지 않아도 되는 치료를 나누어 설명하는 것을 진료 원칙으로 삼고 있습니다.</p>
  <p class="mt-4"><a href="/about" class="inline-flex items-center gap-2 text-sm font-bold text-ink border-b border-gold-500 hover:text-gold-600 transition">대표원장 학력·경력 보기 <i class="fas fa-arrow-right text-xs"></i></a></p>

  <h2 class="${h2}">검단퍼스트치과에서 받을 수 있는 진료</h2>
  <p class="${p}">임플란트, 무삭제·최소삭제 라미네이트(블룸네이트), 턱관절 치료를 중심으로 충치·신경치료, 잇몸치료와 스케일링, 보철·틀니, 사랑니 발치, 턱 보톡스까지 진료합니다. 진단과 치료에는 ZEISS 미세현미경, 턱관절 근육 통증에 쓰는 체외충격파(ESWT), 얼굴 전체를 3D로 담는 RAY 페이스 스캐너, 3D 구강스캐너와 3D 프린터, 균열과 초기 충치를 살피는 Q-ray 형광검사를 사용합니다. 비급여 진료비는 <a href="/pricing" class="font-bold text-gold-600 underline underline-offset-4">비용 안내</a>에 항목별로 공개되어 있으며, 실제 치료 방법과 비용은 검사 결과에 따라 달라질 수 있습니다.</p>
  <div class="mt-6 grid sm:grid-cols-2 gap-3">${txCards}</div>

  <h2 class="${h2}" id="hub-faq">검단 주민분들이 자주 묻는 질문</h2>
  <div class="mt-6 space-y-3">
    ${GEOMDAN_HUB_FAQS.map((f, i) => `<details id="q-${i + 1}" class="group rounded-2xl bg-white border border-ink/8 overflow-hidden">
      <summary class="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none">
        <h3 class="text-[15px] font-bold text-ink leading-snug">${esc(f.q)}</h3>
        <span class="shrink-0 w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink/40 group-open:rotate-45 transition-transform" aria-hidden="true"><i class="fas fa-plus text-xs"></i></span>
      </summary>
      <p class="px-6 pb-6 text-[14px] text-ink/60 leading-[1.9]">${esc(f.a)}</p>
    </details>`).join('')}
  </div>

  <nav class="mt-14 pt-8 border-t border-ink/8 flex flex-wrap items-center gap-2" aria-label="검단 생활권 지역 안내">
    <span class="text-[12px] font-bold text-ink/35 tracking-widest uppercase mr-2">검단 생활권</span>
    ${near}
    <a href="/region" class="px-4 py-2 rounded-full bg-ink text-white text-[13px] font-bold">전체 지역 보기</a>
  </nav>

  <div class="mt-12 rounded-3xl bg-ink text-white p-8 sm:p-10">
    <h2 class="text-2xl font-extrabold tracking-tightest">검단에서 치과를 찾고 계신다면</h2>
    <p class="mt-3 text-white/55 text-[14.5px] leading-relaxed">불편한 곳을 편하게 말씀해 주세요. 검사 결과를 화면으로 함께 보며 필요한 치료부터 차례로 설명해 드립니다.</p>
    <div class="mt-6 flex flex-wrap gap-3">
      <a href="/reserve" class="btn-3d px-7 py-4 rounded-full bg-gold-500 text-ink font-extrabold hover:bg-gold-400 transition"><i class="fas fa-calendar-check mr-2"></i>예약·상담 신청</a>
      <a href="tel:${CLINIC.phone}" class="px-7 py-4 rounded-full border border-white/25 font-bold hover:bg-white/10 transition"><i class="fas fa-phone mr-2 text-gold-400"></i>${CLINIC.phone}</a>
      <a href="${CLINIC.naverBooking}" target="_blank" rel="noopener" class="px-6 py-4 rounded-full bg-[#03c75a] text-white font-extrabold hover:brightness-110 transition">네이버 예약</a>
    </div>
  </div>
  <p class="mt-6 text-[12px] text-ink/40 leading-relaxed">※ 치료 방법과 결과는 개인의 구강 상태에 따라 다를 수 있으며, 정확한 진단은 내원 상담을 통해 받으시기 바랍니다. · 최종 수정 <time datetime="${GEOMDAN_HUB_UPDATED}">${GEOMDAN_HUB_UPDATED}</time></p>
</section>`
}

/** 허브 JSON-LD: WebPage 노드(layout 의 speakable WebPage 에 병합) + FAQPage + BreadcrumbList */
export function geomdanHubWebPage(): Record<string, unknown> {
  const geomdan = SEO_REGIONS.find((r) => r.slug === 'geomdan')
  return {
    '@type': ['WebPage', 'MedicalWebPage'],
    name: GEOMDAN_HUB_FULL_TITLE,
    description: GEOMDAN_HUB_ANSWER,
    inLanguage: 'ko-KR',
    about: {
      '@type': 'Dentist',
      '@id': `${CLINIC.siteUrl}/#clinic`,
      name: CLINIC.name,
      areaServed: [
        { '@type': 'Place', name: geomdan?.full || '인천 검단신도시' },
        { '@type': 'AdministrativeArea', name: '인천광역시 검단구' },
        { '@type': 'GeoCircle', geoMidpoint: { '@type': 'GeoCoordinates', latitude: CLINIC.lat, longitude: CLINIC.lng }, geoRadius: 5000 },
      ],
    },
    mainEntity: { '@id': `${CLINIC.siteUrl}${GEOMDAN_HUB_PATH}#faq` },
    breadcrumb: { '@id': `${CLINIC.siteUrl}${GEOMDAN_HUB_PATH}#breadcrumb` },
    reviewedBy: { '@id': PHYSICIAN_ID },
    lastReviewed: GEOMDAN_HUB_UPDATED,
    dateModified: GEOMDAN_HUB_UPDATED,
    significantLink: ['/location', '/about', '/treatments', '/pricing', '/reserve'].map((p) => `${CLINIC.siteUrl}${p}`),
  }
}

export function geomdanHubJsonLd(): object[] {
  const base = `${CLINIC.siteUrl}${GEOMDAN_HUB_PATH}`
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${base}#faq`,
      mainEntity: GEOMDAN_HUB_FAQS.map((f, i) => ({ '@type': 'Question', '@id': `${base}#q-${i + 1}`, name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${base}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${CLINIC.siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: '진료 지역 안내', item: `${CLINIC.siteUrl}/region` },
        { '@type': 'ListItem', position: 3, name: '검단 치과', item: base },
      ],
    },
  ]
}
