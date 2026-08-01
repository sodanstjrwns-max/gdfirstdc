import { CLINIC } from '../data/clinic'
import { TREATMENTS } from '../data/treatments'
import { SEO_REGIONS } from '../data/regions'

export interface PageMeta {
  title: string
  desc: string
  path: string
  ogImage?: string
  jsonLd?: object[]
  noindex?: boolean
}

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const NAV = [
  { href: '/about', label: '병원소개' },
  { href: '/stories', label: '스토리' },
  { href: '/treatments', label: '진료과목', children: TREATMENTS.map((t) => ({ href: `/treatments/${t.slug}`, label: t.name })) },
  { href: '/cases', label: '치료사례' },
  { href: '/pricing', label: '치료비용' },
  { href: '/blog', label: '칼럼' },
  { href: '/notice', label: '공지사항' },
  { href: '/faq', label: 'FAQ' },
  { href: '/location', label: '오시는길' },
]

export function clinicJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    '@id': `${CLINIC.siteUrl}/#clinic`,
    name: CLINIC.name,
    alternateName: [CLINIC.shortName, CLINIC.nameEn],
    description: '인천 검단신도시에서 가장 오래된 치과. 보건복지부 인증 통합치의학 전문의 1인 대표원장 책임진료. 임플란트·무삭제 라미네이트·턱관절(체외충격파) 특화 진료, 과잉진료 없는 정직한 치과입니다.',
    telephone: CLINIC.phone,
    email: CLINIC.email,
    url: CLINIC.siteUrl,
    image: `${CLINIC.siteUrl}/static/images/doctor_lobby.webp`,
    priceRange: '₩₩',
    currenciesAccepted: 'KRW',
    paymentAccepted: '현금, 카드, 계좌이체',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '이음5로 80, 검단퍼스트프라자 3층 303~305호',
      addressLocality: '서구',
      addressRegion: '인천광역시',
      addressCountry: 'KR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: CLINIC.lat, longitude: CLINIC.lng },
    hasMap: 'https://map.naver.com/p/search/' + encodeURIComponent('검단퍼스트치과'),
    sameAs: [CLINIC.blog, 'https://map.naver.com/p/search/' + encodeURIComponent('검단퍼스트치과')],
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Friday'], opens: '09:30', closes: '18:30' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:30', closes: '14:00' },
    ],
    areaServed: [
      '검단신도시', '인천 서구', '원당동', '당하동', '마전동', '불로동', '대곡동', '금곡동', '오류동', '왕길동', '아라동', '검암동',
      '청라국제도시', '루원시티', '가정동', '석남동', '인천 계양구', '계산동', '작전동',
      '김포시', '풍무동', '사우동', '장기동', '구래동', '운양동', '통진읍', '한강신도시',
    ].map((n) => ({ '@type': 'Place', name: n })),
    availableService: [
      { '@type': 'MedicalProcedure', name: '임플란트', description: '뼈이식·상악동거상술 포함 전악 임플란트, 만 65세 이상 건강보험 적용(평생 2개)' },
      { '@type': 'MedicalProcedure', name: '무삭제 라미네이트(루미네이트)', description: '뉴욕대 Non-prep Veneer 과정 수료 원장의 페이스스캐너 기반 미소 디자인' },
      { '@type': 'MedicalProcedure', name: '턱관절(TMJ) 치료', description: '스플린트·체외충격파(ESWT)·PDRN 인대강화주사, 턱 탈구 응급 정복' },
      { '@type': 'MedicalProcedure', name: '미세현미경 신경치료', description: 'ZEISS 독일 미세현미경 25배율 정밀 근관치료, 플라즈마 엔도 살균' },
      { '@type': 'MedicalProcedure', name: '충치·잇몸치료', description: 'Q-ray 형광검사 기반 조기 진단, 미온수 스케일링' },
      { '@type': 'MedicalProcedure', name: '사랑니 발치', description: '디지털 CT 정밀진단 후 안전한 매복 사랑니 발치' },
    ],
    founder: {
      '@type': 'Person',
      name: CLINIC.doctor,
      jobTitle: '대표원장',
      description: '보건복지부 인증 통합치의학 전문의, 대한치과보철학회 인증 우수보철의사, Harvard Implant CE 수료, 오스템·덴티스 임상자문연구위원',
      alumniOf: '경희대학교 치의학전문대학원',
    },
    medicalSpecialty: 'Dentistry',
    isAcceptingNewPatients: true,
  }
}

// WebSite 스키마 (사이트 전체 아이덴티티)
export function websiteJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${CLINIC.siteUrl}/#website`,
    name: CLINIC.name,
    alternateName: [CLINIC.shortName, CLINIC.nameEn],
    url: CLINIC.siteUrl,
    inLanguage: 'ko-KR',
    publisher: { '@id': `${CLINIC.siteUrl}/#clinic` },
  }
}

// 경로 세그먼트 → 한글 라벨 맵 (브레드크럼 자동 생성용)
const PATH_LABELS: Record<string, string> = {
  about: '병원소개',
  treatments: '진료과목',
  cases: '치료사례',
  pricing: '치료비용',
  stories: '스토리',
  blog: '칼럼',
  faq: '자주 묻는 질문',
  location: '오시는길',
  notice: '공지사항',
  region: '진료 지역 안내',
}
TREATMENTS.forEach((t) => { PATH_LABELS[t.slug] = t.name })
SEO_REGIONS.forEach((r) => { PATH_LABELS[r.slug] = `${r.name} 치과` })

// BreadcrumbList 자동 생성 (마지막 세그먼트는 PATH_LABELS 없으면 페이지 title 사용)
export function autoBreadcrumbJsonLd(path: string, pageTitle: string): object | null {
  if (path === '/' || !path) return null
  const segs = path.split('/').filter(Boolean)
  const items = [{ '@type': 'ListItem', position: 1, name: '홈', item: CLINIC.siteUrl + '/' }]
  let acc = ''
  segs.forEach((seg, i) => {
    acc += '/' + seg
    const isLast = i === segs.length - 1
    const name = PATH_LABELS[seg] || (isLast ? pageTitle : decodeURIComponent(seg))
    items.push({ '@type': 'ListItem', position: i + 2, name, item: CLINIC.siteUrl + acc })
  })
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items }
}

// Speakable 스키마 (음성·AI 답변엔진이 읽을 핵심 요약 영역)
export function speakableJsonLd(path: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${CLINIC.siteUrl}${path}`,
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.speakable-summary', 'h1'] },
  }
}

export function layout(meta: PageMeta, body: string, opts?: { user?: { name: string } | null; admin?: boolean }): string {
  const fullTitle = meta.path === '/' ? `${CLINIC.name} — ${CLINIC.mission}` : `${meta.title} | ${CLINIC.shortName}`
  const url = CLINIC.siteUrl + meta.path
  const extraLd = meta.jsonLd || []
  const hasBreadcrumb = extraLd.some((j) => (j as Record<string, unknown>)['@type'] === 'BreadcrumbList')
  const autoBc = hasBreadcrumb ? null : autoBreadcrumbJsonLd(meta.path, meta.title)
  const jsonLd = [clinicJsonLd(), websiteJsonLd(), speakableJsonLd(meta.path), ...(autoBc ? [autoBc] : []), ...extraLd]
  const userName = opts?.user?.name

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(meta.desc)}">
${meta.noindex ? '<meta name="robots" content="noindex,nofollow">' : '<meta name="robots" content="index,follow">'}
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(meta.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${CLINIC.name}">
<meta property="og:locale" content="ko_KR">
<meta property="og:image" content="${meta.ogImage || `${CLINIC.siteUrl}/static/images/og_default.jpg`}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(CLINIC.name)} — 검단신도시 임플란트·라미네이트·턱관절 치과">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(meta.desc)}">
<meta name="twitter:image" content="${meta.ogImage || `${CLINIC.siteUrl}/static/images/og_default.jpg`}">
<meta name="theme-color" content="#0a1628">
<meta name="geo.region" content="KR-28">
<meta name="geo.placename" content="인천광역시 서구 검단신도시">
<meta name="geo.position" content="${CLINIC.lat};${CLINIC.lng}">
<meta name="ICBM" content="${CLINIC.lat}, ${CLINIC.lng}">
<meta name="author" content="${CLINIC.name} ${CLINIC.doctor} 원장">
<link rel="preconnect" href="https://cdn.tailwindcss.com" crossorigin>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${meta.path === '/' ? '<link rel="preload" as="image" href="/static/images/hero_poster.webp" fetchpriority="high">' : ''}
<link rel="icon" href="/static/images/logo.png" type="image/png">
<link rel="apple-touch-icon" href="/static/images/logo.png">
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={theme:{extend:{colors:{ink:{DEFAULT:'#0a1628',soft:'#0f1f38',mute:'#16294a'},navy:{50:'#f2f6fb',100:'#dfeaf5',200:'#bcd3ea',400:'#5b8ec2',600:'#1d5486',700:'#173f66',800:'#12365a',900:'#0d2843'},gold:{300:'#eef1f6',400:'#cdd5e0',500:'#b7c1cf',600:'#5c6b82'},royal:{DEFAULT:'#0a4fc2',600:'#0040a0'},cream:'#faf7f0'},fontFamily:{sans:['Pretendard','-apple-system','system-ui','sans-serif'],disp:['"Nanum Myeongjo"','Pretendard','serif']},letterSpacing:{tightest:'-0.04em'}}}}</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap">
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<link href="/static/style.css" rel="stylesheet">
${jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body class="bg-cream text-ink antialiased overflow-x-hidden">
<div class="grain-overlay" aria-hidden="true"></div>
${meta.path === '/' ? '<div id="curtain" aria-hidden="true"><span class="curtain-logo">Geomdan First</span></div>' : ''}
<div id="scroll-progress" aria-hidden="true"></div>
<div id="cursor-ring" aria-hidden="true"></div>
<div id="cursor-dot" aria-hidden="true"></div>

<!-- 글래스 플로팅 네비 -->
<header id="site-header" class="fixed top-0 inset-x-0 z-50 px-3 pt-3 transition-transform duration-300">
  <div class="max-w-6xl mx-auto glass-nav rounded-2xl px-4 sm:px-6 flex items-center justify-between h-16">
    <a href="/" id="logo" class="flex items-center gap-2.5 shrink-0">
      <img src="/static/images/logo.png" alt="검단퍼스트치과 로고" class="w-10 h-10 object-contain shrink-0" width="40" height="40">
      <span class="leading-none">
        <strong class="block text-ink text-[17px] font-extrabold tracking-tightest">검단퍼스트치과</strong>
        <span class="block text-[9px] text-ink/40 mt-1 tracking-[0.22em] uppercase font-semibold">First &amp; Honest</span>
      </span>
    </a>
    <nav id="main-nav" class="hidden lg:flex items-center gap-0.5">
      ${NAV.map(
        (n) => `<div class="relative group">
        <a href="${n.href}" class="px-3.5 py-2 rounded-full text-[14px] font-semibold text-ink/70 hover:text-ink hover:bg-ink/5 transition">${n.label}</a>
        ${n.children ? `<div class="absolute left-1/2 -translate-x-1/2 top-full pt-3 hidden group-hover:block"><div class="glass-drop rounded-2xl p-2 w-[420px] grid grid-cols-2 gap-0.5" data-tilt data-tilt-max="5">${n.children.map((ch) => `<a href="${ch.href}" class="px-4 py-2.5 rounded-xl text-[13.5px] font-medium text-ink/70 hover:bg-ink hover:text-white transition">${ch.label}</a>`).join('')}</div></div>` : ''}
      </div>`
      ).join('')}
    </nav>
    <div class="flex items-center gap-2">
      <a href="tel:${CLINIC.phone}" class="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-white text-sm font-bold hover:bg-navy-800 transition group">
        <span class="w-1.5 h-1.5 rounded-full bg-gold-400 group-hover:animate-ping"></span>${CLINIC.phone}
      </a>
      ${opts?.admin ? '<a href="/admin" class="hidden md:inline-flex px-3 py-2.5 rounded-full text-xs font-bold text-gold-600 hover:bg-gold-500/10">ADMIN</a>' : ''}
      <button id="mobile-menu-btn" class="lg:hidden w-10 h-10 rounded-xl bg-ink/5 flex items-center justify-center text-ink" aria-label="메뉴 열기"><i class="fas fa-bars-staggered"></i></button>
    </div>
  </div>
</header>

<!-- 모바일 풀스크린 메뉴 -->
<div id="mobile-menu" class="fixed inset-0 z-[60] hidden">
  <div id="mobile-menu-backdrop" class="absolute inset-0 bg-ink/98 backdrop-blur-xl"></div>
  <div class="relative h-full flex flex-col p-6 overflow-y-auto">
    <div class="flex justify-between items-center">
      <span class="text-white font-extrabold text-lg">검단퍼스트치과</span>
      <button id="mobile-menu-close" class="w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center" aria-label="메뉴 닫기"><i class="fas fa-xmark text-xl"></i></button>
    </div>
    <nav class="mt-10 space-y-1">
      ${NAV.map((n, i) => `<a href="${n.href}" class="mobile-link flex items-baseline gap-3 py-3 border-b border-white/10" style="--d:${i * 0.05}s">
        <span class="text-gold-400 text-xs font-mono">0${i + 1}</span>
        <span class="text-white text-3xl font-extrabold tracking-tightest">${n.label}</span>
      </a>`).join('')}
    </nav>
    <div class="mt-8 flex flex-wrap gap-2">
      ${TREATMENTS.slice(0, 6).map((t) => `<a href="/treatments/${t.slug}" data-tilt data-tilt-max="14" class="px-4 py-2 rounded-full border border-white/20 text-white/70 text-sm">${t.name}</a>`).join('')}
    </div>
    <div class="mt-auto pt-10 flex gap-3 text-sm">
      ${userName ? `<span class="text-gold-400 py-3">${esc(userName)}님</span><a href="/logout" class="text-white/60 py-3">로그아웃</a>` : `<a href="/login" class="text-white/60 py-3">로그인</a><a href="/signup" class="text-white/60 py-3">회원가입</a>`}
      <a href="tel:${CLINIC.phone}" class="ml-auto px-6 py-3 rounded-full bg-gold-500 text-ink font-bold"><i class="fas fa-phone mr-2"></i>전화하기</a>
    </div>
  </div>
</div>

<main id="main-content">${body}</main>

<!-- 모바일 하단 액션바 -->
<nav id="mobile-actionbar" class="fixed bottom-0 inset-x-0 z-40 md:hidden bg-ink/95 backdrop-blur-lg border-t border-white/10 transition-transform duration-300" aria-label="빠른 연락 메뉴">
  <div class="grid grid-cols-3">
    <a href="tel:${CLINIC.phone}" class="flex flex-col items-center gap-1 py-3 text-gold-400 active:bg-white/5" aria-label="전화 예약">
      <i class="fas fa-phone text-[17px]"></i><span class="text-[10.5px] font-bold text-white/85">전화예약</span>
    </a>
    <a href="/location" class="flex flex-col items-center gap-1 py-3 text-white/70 active:bg-white/5 border-x border-white/10" aria-label="오시는 길">
      <i class="fas fa-location-dot text-[17px]"></i><span class="text-[10.5px] font-bold text-white/85">오시는길</span>
    </a>
    <a href="/faq" class="flex flex-col items-center gap-1 py-3 text-white/70 active:bg-white/5" aria-label="자주 묻는 질문">
      <i class="fas fa-circle-question text-[17px]"></i><span class="text-[10.5px] font-bold text-white/85">FAQ</span>
    </a>
  </div>
</nav>

<!-- 푸터 -->
<footer id="site-footer" class="relative bg-ink text-white/60 mt-24 overflow-hidden pb-16 md:pb-0">
  <div class="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-navy-600/20 blur-[120px]" aria-hidden="true"></div>
  <div class="max-w-6xl mx-auto px-5 pt-16 pb-8 relative">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-white/10">
      <div>
        <p class="text-gold-400 text-xs font-bold tracking-[0.3em] uppercase">Geomdan First Dental Clinic</p>
        <p class="mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tightest leading-[1.15]">정직한 진료,<br>그거면 됩니다.</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <a href="tel:${CLINIC.phone}" class="btn-3d px-7 py-4 rounded-full bg-gold-500 text-ink font-extrabold hover:bg-gold-400 transition"><i class="fas fa-phone mr-2"></i>${CLINIC.phone}</a>
        <a href="/location" class="px-7 py-4 rounded-full border border-white/25 text-white font-bold hover:bg-white/10 transition">오시는 길</a>
      </div>
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 py-10 text-[13.5px]">
      <section>
        <h2 class="text-white/90 font-bold mb-3 text-xs tracking-[0.2em] uppercase">Clinic</h2>
        <p class="leading-relaxed">${CLINIC.address}</p>
        <p class="mt-2">대표자 ${CLINIC.doctor} · 사업자 ${CLINIC.bizNo}<br>${CLINIC.email}</p>
      </section>
      <section id="footer-pricing">
        <h2 class="text-white/90 font-bold mb-3 text-xs tracking-[0.2em] uppercase">Pricing</h2>
        <ul class="space-y-1">
          <li class="flex justify-between max-w-[240px]"><span class="text-white/35">임플란트</span><span>90만원~</span></li>
          <li class="flex justify-between max-w-[240px]"><span class="text-white/35">라미네이트</span><span>55만원</span></li>
          <li class="flex justify-between max-w-[240px]"><span class="text-white/35">지르코니아 크라운</span><span>50만원~</span></li>
          <li class="flex justify-between max-w-[240px]"><span class="text-white/35">세라믹인레이</span><span>30만원~</span></li>
          <li class="flex justify-between max-w-[240px]"><span class="text-white/35">전문가미백</span><span>14만원~</span></li>
        </ul>
        <a href="/pricing" class="mt-2.5 inline-flex items-center gap-1.5 text-gold-400 font-bold hover:text-gold-300 transition text-[12.5px]">비급여 수가 전체 보기 <i class="fas fa-arrow-right text-[9px]"></i></a>
        <p class="mt-1.5 text-[10.5px] text-white/25">의료법 제45조 비급여 진료비용 고지</p>
      </section>
      <section>
        <h2 class="text-white/90 font-bold mb-3 text-xs tracking-[0.2em] uppercase">Hours</h2>
        <ul class="space-y-1">
          <li class="flex justify-between max-w-[240px]"><span class="text-white/35">월·화·수·금</span><span>09:30–18:30</span></li>
          <li class="flex justify-between max-w-[240px]"><span class="text-white/35">토요일</span><span>09:30–14:00</span></li>
          <li class="flex justify-between max-w-[240px]"><span class="text-white/35">목·일·공휴일</span><span>휴진</span></li>
          <li class="flex justify-between max-w-[240px]"><span class="text-white/35">점심</span><span>13:00–14:00</span></li>
        </ul>
        <p class="mt-2 text-[11px] text-white/30">* 공휴일이 있는 주 목요일은 정상진료</p>
      </section>
      <section>
        <h2 class="text-white/90 font-bold mb-3 text-xs tracking-[0.2em] uppercase">Treatments</h2>
        <ul class="grid grid-cols-2 gap-1">
          ${TREATMENTS.map((t) => `<li><a href="/treatments/${t.slug}" class="hover:text-gold-400 transition">${t.name}</a></li>`).join('')}
        </ul>
      </section>
      <section>
        <h2 class="text-white/90 font-bold mb-3 text-xs tracking-[0.2em] uppercase">Menu</h2>
        <ul class="space-y-1">
          ${NAV.map((n) => `<li><a href="${n.href}" class="hover:text-gold-400 transition">${n.label}</a></li>`).join('')}
          <li><a href="/notice" class="hover:text-gold-400 transition">공지사항</a></li>
          <li><a href="/region" class="hover:text-gold-400 transition">진료 지역 안내</a></li>
          <li><a href="${CLINIC.blog}" target="_blank" rel="noopener" class="hover:text-gold-400 transition">네이버 블로그 <i class="fas fa-arrow-up-right-from-square text-[9px]"></i></a></li>
          ${userName ? `<li class="text-gold-400/80">${esc(userName)}님 · <a href="/logout" class="hover:text-gold-400">로그아웃</a></li>` : `<li><a href="/login" class="hover:text-gold-400 transition">로그인</a> · <a href="/signup" class="hover:text-gold-400 transition">회원가입</a></li>`}
        </ul>
      </section>
    </div>
    <nav class="py-5 border-t border-white/10" aria-label="진료 지역 바로가기">
      <p class="text-[10px] font-bold tracking-[0.25em] uppercase text-white/25 mb-2.5">Service Areas — 검단·서구·김포·청라·계양 치과</p>
      <p class="text-[11.5px] leading-[2.1] text-white/30">
        ${SEO_REGIONS.map((r) => `<a href="/region/${r.slug}" class="hover:text-gold-400 transition whitespace-nowrap">${r.name} 치과</a>`).join(' <span class="text-white/10">·</span> ')}
      </p>
    </nav>
    <div class="pt-5 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2 text-[11px] text-white/30">
      <p>치료 전후 사진은 환자 동의 하에 게시되었으며, 결과는 개인에 따라 다를 수 있습니다.</p>
      <p>© ${new Date().getFullYear()} ${CLINIC.name}</p>
    </div>
  </div>
</footer>
<script src="/static/app.js" defer></script>
</body>
</html>`
}

// ===== 공통 서브페이지 히어로 =====
export function pageHero(kicker: string, title: string, sub?: string): string {
  return `
<section class="page-hero relative bg-ink text-white pt-36 pb-16 sm:pt-44 sm:pb-24 px-5 overflow-hidden">
  <div class="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-navy-600/25 blur-[130px]" aria-hidden="true"></div>
  <div class="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full bg-gold-500/10 blur-[110px]" aria-hidden="true"></div>
  <div class="max-w-6xl mx-auto relative">
    <p class="reveal text-gold-400 text-xs font-bold tracking-[0.35em] uppercase">${kicker}</p>
    <h1 class="reveal mt-4 text-4xl sm:text-6xl font-extrabold tracking-tightest leading-[1.08]">${title}</h1>
    ${sub ? `<p class="reveal mt-6 text-white/50 max-w-xl text-[15px] sm:text-base leading-relaxed">${sub}</p>` : ''}
  </div>
</section>`
}
