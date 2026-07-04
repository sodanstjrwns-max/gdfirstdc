import { CLINIC } from '../data/clinic'
import { TREATMENTS } from '../data/treatments'

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
  { href: '/treatments', label: '진료과목', children: TREATMENTS.map((t) => ({ href: `/treatments/${t.slug}`, label: t.name })) },
  { href: '/cases', label: '치료사례' },
  { href: '/stories', label: '치료스토리' },
  { href: '/blog', label: '건강칼럼' },
  { href: '/notice', label: '공지사항' },
  { href: '/location', label: '내원안내' },
]

export function clinicJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: CLINIC.name,
    alternateName: CLINIC.nameEn,
    telephone: CLINIC.phone,
    email: CLINIC.email,
    url: CLINIC.siteUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '이음5로 80, 검단퍼스트프라자 3층 303~305호',
      addressLocality: '인천광역시 서구',
      addressCountry: 'KR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: CLINIC.lat, longitude: CLINIC.lng },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Friday'], opens: '09:30', closes: '18:30' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:30', closes: '14:00' },
    ],
    founder: { '@type': 'Person', name: CLINIC.doctor, jobTitle: '대표원장' },
  }
}

export function layout(meta: PageMeta, body: string, opts?: { user?: { name: string } | null; admin?: boolean }): string {
  const fullTitle = meta.path === '/' ? `${CLINIC.name} — ${CLINIC.mission}` : `${meta.title} | ${CLINIC.shortName}`
  const url = CLINIC.siteUrl + meta.path
  const jsonLd = [clinicJsonLd(), ...(meta.jsonLd || [])]
  const userName = opts?.user?.name

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
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
${meta.ogImage ? `<meta property="og:image" content="${meta.ogImage}">` : ''}
<meta name="twitter:card" content="summary">
<link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={theme:{extend:{colors:{navy:{50:'#f0f5fa',100:'#dbe7f2',600:'#1d5486',700:'#173f66',800:'#12365a',900:'#0d2843'},gold:{400:'#d4b254',500:'#c9a227',600:'#a9871f'}},fontFamily:{sans:['Pretendard','-apple-system','BlinkMacSystemFont','system-ui','Roboto','sans-serif']}}}}</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<link href="/static/style.css" rel="stylesheet">
${jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body class="bg-white text-slate-800 antialiased">
<!-- 상단 유틸바 -->
<div class="bg-navy-900 text-white text-xs sm:text-sm">
  <div class="max-w-6xl mx-auto px-4 py-1.5 flex justify-between items-center">
    <p><i class="fas fa-phone mr-1 text-gold-400"></i> ${CLINIC.phone} <span class="hidden sm:inline text-slate-300 ml-2">평일 09:30~18:30 · 토 09:30~14:00 · 목/일 휴진</span></p>
    <nav id="util-nav" class="flex gap-3 items-center">
      ${userName
        ? `<span class="text-gold-400"><i class="fas fa-user mr-1"></i>${esc(userName)}님</span><a href="/logout" class="hover:text-gold-400">로그아웃</a>`
        : `<a href="/login" class="hover:text-gold-400">로그인</a><a href="/signup" class="hover:text-gold-400">회원가입</a>`}
      ${opts?.admin ? '<a href="/admin" class="text-gold-400 font-bold">관리자</a>' : ''}
    </nav>
  </div>
</div>
<!-- 헤더 -->
<header id="site-header" class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
  <div class="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
    <a href="/" id="logo" class="flex items-center gap-2">
      <span class="w-9 h-9 rounded-lg bg-navy-800 text-gold-400 flex items-center justify-center"><i class="fas fa-tooth"></i></span>
      <span class="leading-tight">
        <strong class="block text-navy-800 text-lg tracking-tight">검단퍼스트치과</strong>
        <span class="block text-[10px] text-slate-500 -mt-0.5 tracking-widest uppercase">Geomdan First Dental</span>
      </span>
    </a>
    <nav id="main-nav" class="hidden lg:flex items-center gap-1">
      ${NAV.map(
        (n) => `<div class="relative group">
        <a href="${n.href}" class="px-3 py-2 rounded-md text-[15px] font-medium text-slate-700 hover:text-navy-700 hover:bg-navy-50">${n.label}${n.children ? ' <i class="fas fa-chevron-down text-[10px] ml-0.5"></i>' : ''}</a>
        ${n.children ? `<div class="absolute left-0 top-full pt-1 hidden group-hover:block"><div class="bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-44">${n.children.map((ch) => `<a href="${ch.href}" class="block px-4 py-2 text-sm text-slate-600 hover:bg-navy-50 hover:text-navy-700">${ch.label}</a>`).join('')}</div></div>` : ''}
      </div>`
      ).join('')}
      <a href="/location" class="ml-2 px-4 py-2 rounded-full bg-gold-500 hover:bg-gold-600 text-white text-sm font-bold"><i class="fas fa-calendar-check mr-1"></i>진료예약 안내</a>
    </nav>
    <button id="mobile-menu-btn" class="lg:hidden w-10 h-10 flex items-center justify-center text-navy-800 text-xl" aria-label="메뉴 열기"><i class="fas fa-bars"></i></button>
  </div>
  <nav id="mobile-menu" class="hidden lg:hidden border-t border-slate-100 bg-white max-h-[70vh] overflow-y-auto">
    ${NAV.map(
      (n) => `<a href="${n.href}" class="block px-5 py-3 font-medium text-slate-700 border-b border-slate-50">${n.label}</a>
      ${n.children ? n.children.map((ch) => `<a href="${ch.href}" class="block pl-9 pr-5 py-2 text-sm text-slate-500 border-b border-slate-50">· ${ch.label}</a>`).join('') : ''}`
    ).join('')}
  </nav>
</header>

<main id="main-content">${body}</main>

<!-- 플로팅 전화버튼 -->
<a href="tel:${CLINIC.phone}" id="floating-call" class="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-gold-500 text-white flex items-center justify-center text-xl shadow-lg hover:bg-gold-600 lg:hidden" aria-label="전화걸기"><i class="fas fa-phone"></i></a>

<!-- 푸터 -->
<footer id="site-footer" class="bg-navy-900 text-slate-300 mt-20">
  <div class="max-w-6xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-3">
    <section>
      <h3 class="text-white font-bold text-lg mb-3"><i class="fas fa-tooth text-gold-400 mr-2"></i>${CLINIC.name}</h3>
      <p class="text-sm leading-relaxed">${CLINIC.address}<br>대표자: ${CLINIC.doctor} · 사업자등록번호: ${CLINIC.bizNo}<br>TEL: ${CLINIC.phone} · EMAIL: ${CLINIC.email}</p>
      <div class="mt-3 flex gap-2">
        <a href="${CLINIC.blog}" target="_blank" rel="noopener" class="w-9 h-9 rounded-full bg-navy-700 hover:bg-gold-500 flex items-center justify-center" aria-label="네이버 블로그"><i class="fas fa-blog"></i></a>
        <a href="tel:${CLINIC.phone}" class="w-9 h-9 rounded-full bg-navy-700 hover:bg-gold-500 flex items-center justify-center" aria-label="전화"><i class="fas fa-phone"></i></a>
      </div>
    </section>
    <section>
      <h3 class="text-white font-bold mb-3">진료시간</h3>
      <ul class="text-sm space-y-1">
        ${CLINIC.hours.map((h) => `<li class="flex justify-between max-w-xs"><span class="text-slate-400">${h.day}</span><span>${h.time}</span></li>`).join('')}
        <li class="flex justify-between max-w-xs"><span class="text-slate-400">점심시간</span><span>${CLINIC.lunch}</span></li>
      </ul>
    </section>
    <section>
      <h3 class="text-white font-bold mb-3">바로가기</h3>
      <ul class="text-sm grid grid-cols-2 gap-1">
        ${NAV.map((n) => `<li><a href="${n.href}" class="hover:text-gold-400">${n.label}</a></li>`).join('')}
        <li><a href="/treatments/implant" class="hover:text-gold-400">임플란트</a></li>
        <li><a href="/treatments/luminate" class="hover:text-gold-400">루미네이트</a></li>
        <li><a href="/treatments/tmj" class="hover:text-gold-400">턱관절치료</a></li>
      </ul>
    </section>
  </div>
  <div class="border-t border-navy-700 py-4 text-center text-xs text-slate-500">
    <p>본 홈페이지의 치료 전후 사진 및 치료 사례는 환자 동의 하에 게시되었으며, 개인에 따라 결과가 다를 수 있습니다.</p>
    <p class="mt-1">© ${new Date().getFullYear()} ${CLINIC.name}. All rights reserved.</p>
  </div>
</footer>
<script src="/static/app.js" defer></script>
</body>
</html>`
}
