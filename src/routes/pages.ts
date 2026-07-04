// 정적 페이지 라우트 — 홈, 병원소개, 진료과목, 내원안내, 지역페이지
import { Hono } from 'hono'
import { layout, esc } from '../lib/layout'
import { CLINIC, DOCTOR, EQUIPMENT, STORIES } from '../data/clinic'
import { TREATMENTS, getTreatment } from '../data/treatments'
import { FAQS } from '../data/faqs'
import { SEO_REGIONS } from '../data/regions'
import type { AppEnv } from '../types'

const pages = new Hono<AppEnv>()

// ============ 홈 ============
pages.get('/', (c) => {
  const core = TREATMENTS.filter((t) => t.isCore)
  const others = TREATMENTS.filter((t) => !t.isCore)
  const body = `
<!-- 히어로 -->
<section id="hero-section" class="relative bg-navy-900 text-white overflow-hidden">
  <div class="absolute inset-0 opacity-10" style="background-image:radial-gradient(circle at 20% 30%, #c9a227 0, transparent 40%), radial-gradient(circle at 80% 70%, #1d5486 0, transparent 45%)"></div>
  <div class="relative max-w-6xl mx-auto px-4 py-24 md:py-32 text-center">
    <p class="text-gold-400 tracking-[0.3em] text-sm mb-4 uppercase">Make Luminate, More Attractive</p>
    <h1 class="text-3xl md:text-5xl font-extrabold leading-tight">미소에 자신감을 더하는,<br><span class="text-gold-400">검단에서 가장 정직한 치과</span></h1>
    <p class="mt-6 text-slate-300 md:text-lg max-w-2xl mx-auto">과잉진료 없는 1인 대표원장 책임진료.<br class="sm:hidden"> 상담한 원장이 치료하고, 치료한 원장이 끝까지 관리합니다.</p>
    <div class="mt-9 flex flex-wrap justify-center gap-3">
      <a href="tel:${CLINIC.phone}" class="px-7 py-3.5 rounded-full bg-gold-500 hover:bg-gold-600 font-bold"><i class="fas fa-phone mr-2"></i>${CLINIC.phone}</a>
      <a href="/location" class="px-7 py-3.5 rounded-full border border-slate-400 hover:border-gold-400 hover:text-gold-400 font-bold"><i class="fas fa-map-marker-alt mr-2"></i>오시는 길</a>
    </div>
  </div>
</section>

<!-- 신뢰 배너 -->
<section id="trust-banner" class="bg-navy-50 border-b border-slate-200">
  <div class="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
    <div class="fade-in"><i class="fas fa-user-md text-navy-700 text-2xl"></i><p class="mt-2 font-bold text-navy-800">통합치의학 전문의</p><p class="text-slate-500 text-xs">보건복지부 인증</p></div>
    <div class="fade-in"><i class="fas fa-award text-navy-700 text-2xl"></i><p class="mt-2 font-bold text-navy-800">우수보철의사 인증</p><p class="text-slate-500 text-xs">대한치과보철학회</p></div>
    <div class="fade-in"><i class="fas fa-clock text-navy-700 text-2xl"></i><p class="mt-2 font-bold text-navy-800">검단에서 가장 오래된</p><p class="text-slate-500 text-xs">그 이름의 무게를 압니다</p></div>
    <div class="fade-in"><i class="fas fa-handshake text-navy-700 text-2xl"></i><p class="mt-2 font-bold text-navy-800">과잉진료 없는 상담</p><p class="text-slate-500 text-xs">필요한 치료만 정직하게</p></div>
  </div>
</section>

<!-- 핵심 진료 -->
<section id="core-treatments" class="max-w-6xl mx-auto px-4 py-16">
  <header class="text-center mb-10 fade-in">
    <p class="text-gold-600 font-bold tracking-widest text-sm uppercase">Signature</p>
    <h2 class="text-2xl md:text-3xl font-extrabold text-navy-900 mt-1">검단퍼스트치과가 가장 잘하는 진료</h2>
  </header>
  <div class="grid md:grid-cols-3 gap-6">
    ${core.map((t) => `
    <a href="/treatments/${t.slug}" class="treatment-card group block rounded-2xl border border-slate-200 p-7 hover:border-gold-400 hover:shadow-xl transition fade-in">
      <span class="w-14 h-14 rounded-xl bg-navy-800 text-gold-400 flex items-center justify-center text-2xl group-hover:bg-gold-500 group-hover:text-white transition"><i class="fas ${t.icon}"></i></span>
      <h3 class="mt-4 text-xl font-extrabold text-navy-900">${t.name}</h3>
      <p class="text-gold-600 text-sm font-medium mt-0.5">${t.tagline}</p>
      <p class="mt-3 text-sm text-slate-500 leading-relaxed line-clamp-3">${esc(t.heroDesc)}</p>
      <p class="mt-4 text-navy-700 font-bold text-sm">자세히 보기 <i class="fas fa-arrow-right ml-1 group-hover:translate-x-1 transition-transform inline-block"></i></p>
    </a>`).join('')}
  </div>
  <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
    ${others.map((t) => `<a href="/treatments/${t.slug}" class="rounded-xl border border-slate-200 py-4 px-2 text-center hover:border-navy-600 hover:bg-navy-50 transition fade-in"><i class="fas ${t.icon} text-navy-700"></i><p class="mt-1.5 text-sm font-bold text-slate-700">${t.name}</p></a>`).join('')}
  </div>
</section>

<!-- 원장 소개 -->
<section id="doctor-intro" class="bg-navy-900 text-white">
  <div class="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
    <div class="fade-in">
      <p class="text-gold-400 font-bold tracking-widest text-sm uppercase">Doctor</p>
      <h2 class="text-2xl md:text-3xl font-extrabold mt-1">대표원장 ${DOCTOR.name}</h2>
      <p class="mt-5 text-slate-300 leading-relaxed">"${DOCTOR.philosophy}"</p>
      <ul class="mt-6 space-y-2 text-sm">
        ${DOCTOR.highlights.map((h) => `<li><i class="fas fa-check text-gold-400 mr-2"></i>${h}</li>`).join('')}
        <li><i class="fas fa-check text-gold-400 mr-2"></i>미국 Harvard School of Dental Medicine Implant Dentistry CE</li>
        <li><i class="fas fa-check text-gold-400 mr-2"></i>오스템·덴티스 임플란트 임상자문연구위원</li>
      </ul>
      <a href="/about" class="inline-block mt-7 px-6 py-3 rounded-full bg-gold-500 hover:bg-gold-600 font-bold text-sm">원장 이력 전체보기 <i class="fas fa-arrow-right ml-1"></i></a>
    </div>
    <div class="fade-in">
      <blockquote class="rounded-2xl bg-navy-800 border border-navy-700 p-7">
        <i class="fas fa-quote-left text-gold-400 text-2xl"></i>
        <p class="mt-3 leading-relaxed text-slate-200">가장 기억에 남는 환자는, 저희 아버지입니다. 상악 9개, 하악 7개의 임플란트를 아들 손으로 직접 심어드렸습니다. 저는 모든 환자분의 임플란트를 이 마음으로 심습니다.</p>
        <footer class="mt-4 text-sm text-gold-400 font-bold">— <a href="/stories" class="underline hover:no-underline">치료스토리에서 전문 읽기</a></footer>
      </blockquote>
    </div>
  </div>
</section>

<!-- 장비 -->
<section id="equipment-section" class="max-w-6xl mx-auto px-4 py-16">
  <header class="text-center mb-10 fade-in">
    <p class="text-gold-600 font-bold tracking-widest text-sm uppercase">Equipment</p>
    <h2 class="text-2xl md:text-3xl font-extrabold text-navy-900 mt-1">정확한 진단을 위한 투자</h2>
    <p class="text-slate-500 mt-2">좋은 치료는 정확한 진단에서 시작됩니다</p>
  </header>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
    ${EQUIPMENT.map((e) => `
    <article class="equipment-card rounded-xl border border-slate-200 p-5 hover:shadow-lg transition fade-in">
      <h3 class="font-extrabold text-navy-900"><i class="fas ${e.icon} text-gold-600 mr-2"></i>${e.name}</h3>
      <p class="mt-2 text-sm text-slate-500 leading-relaxed">${e.desc}</p>
    </article>`).join('')}
  </div>
</section>

<!-- 진료안내 & 오시는길 -->
<section id="visit-info" class="bg-navy-50">
  <div class="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8">
    <div class="rounded-2xl bg-white border border-slate-200 p-7 fade-in">
      <h2 class="text-xl font-extrabold text-navy-900"><i class="fas fa-clock text-gold-600 mr-2"></i>진료시간</h2>
      <ul class="mt-4 space-y-2 text-sm">
        ${CLINIC.hours.map((h) => `<li class="flex justify-between border-b border-slate-100 pb-2"><span class="text-slate-500">${h.day}</span><span class="font-medium text-slate-700">${h.time}</span></li>`).join('')}
        <li class="flex justify-between pb-1"><span class="text-slate-500">점심시간</span><span class="font-medium text-slate-700">${CLINIC.lunch}</span></li>
      </ul>
    </div>
    <div class="rounded-2xl bg-white border border-slate-200 p-7 fade-in">
      <h2 class="text-xl font-extrabold text-navy-900"><i class="fas fa-map-marker-alt text-gold-600 mr-2"></i>오시는 길</h2>
      <p class="mt-4 text-sm text-slate-600 leading-relaxed">${CLINIC.address}</p>
      <p class="mt-2 text-sm text-slate-500">검단신도시 중심상권, 검단퍼스트프라자 3층입니다. 건물 주차장을 이용하실 수 있습니다.</p>
      <div class="mt-5 flex gap-2">
        <a href="/location" class="flex-1 text-center px-4 py-3 rounded-xl bg-navy-800 text-white font-bold text-sm hover:bg-navy-700">상세 안내 보기</a>
        <a href="tel:${CLINIC.phone}" class="flex-1 text-center px-4 py-3 rounded-xl bg-gold-500 text-white font-bold text-sm hover:bg-gold-600"><i class="fas fa-phone mr-1"></i>전화 문의</a>
      </div>
    </div>
  </div>
</section>`
  return c.html(layout({ title: '홈', desc: `검단신도시 치과 — ${CLINIC.name}. 과잉진료 없는 1인 대표원장 책임진료. 임플란트·라미네이트·턱관절 치료. 통합치의학 전문의 김희수 원장. ${CLINIC.phone}`, path: '/' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 병원소개 ============
pages.get('/about', (c) => {
  const body = `
<section class="bg-navy-900 text-white py-16 text-center px-4">
  <p class="text-gold-400 tracking-widest text-sm uppercase">About Us</p>
  <h1 class="text-3xl md:text-4xl font-extrabold mt-2">병원소개</h1>
  <p class="mt-4 text-slate-300 max-w-2xl mx-auto">검단신도시에서 가장 오래된 치과, 그 이름의 무게를 압니다.</p>
</section>

<section id="philosophy" class="max-w-4xl mx-auto px-4 py-14 text-center">
  <h2 class="text-2xl font-extrabold text-navy-900">"다른 병원도 다녀오세요.<br class="sm:hidden"> 그럼 저희의 가치를 더 느끼실 수 있습니다."</h2>
  <p class="mt-5 text-slate-600 leading-relaxed">검단퍼스트치과는 화려한 광고 대신 정직한 진단으로 승부합니다. 꼭 필요한 치료만 권해드리고, 하지 않아도 되는 치료는 하지 않아도 된다고 말씀드립니다. 상담한 원장이 직접 치료하고, 치료한 원장이 끝까지 관리하는 1인 대표원장 책임진료 시스템 — 그것이 검단에서 가장 오래 신뢰받아온 이유입니다.</p>
</section>

<section id="doctor-profile" class="bg-navy-50 py-14">
  <div class="max-w-5xl mx-auto px-4">
    <header class="text-center mb-10">
      <p class="text-gold-600 font-bold tracking-widest text-sm uppercase">Doctor</p>
      <h2 class="text-2xl md:text-3xl font-extrabold text-navy-900 mt-1">대표원장 ${DOCTOR.name}</h2>
      <p class="mt-3 text-slate-500">보건복지부 인증 통합치의학 전문의 · 대한치과보철학회 우수보철의사</p>
    </header>
    <blockquote class="rounded-2xl bg-white border-l-4 border-gold-500 p-6 shadow-sm mb-10">
      <p class="text-slate-700 leading-relaxed italic">"${DOCTOR.philosophy}"</p>
    </blockquote>
    <div class="grid md:grid-cols-2 gap-6">
      <article class="rounded-2xl bg-white border border-slate-200 p-6">
        <h3 class="font-extrabold text-navy-900 mb-3"><i class="fas fa-graduation-cap text-gold-600 mr-2"></i>학력 및 경력</h3>
        <ul class="text-sm space-y-2 text-slate-600">${DOCTOR.career.map((x) => `<li><i class="fas fa-circle text-[5px] text-gold-500 mr-2 align-middle"></i>${x}</li>`).join('')}</ul>
      </article>
      <article class="rounded-2xl bg-white border border-slate-200 p-6">
        <h3 class="font-extrabold text-navy-900 mb-3"><i class="fas fa-certificate text-gold-600 mr-2"></i>연수 및 수료</h3>
        <ul class="text-sm space-y-2 text-slate-600">${DOCTOR.courses.map((x) => `<li><i class="fas fa-circle text-[5px] text-gold-500 mr-2 align-middle"></i>${x}</li>`).join('')}</ul>
      </article>
      <article class="rounded-2xl bg-white border border-slate-200 p-6">
        <h3 class="font-extrabold text-navy-900 mb-3"><i class="fas fa-users text-gold-600 mr-2"></i>학회 활동</h3>
        <ul class="text-sm space-y-2 text-slate-600">${DOCTOR.memberships.map((x) => `<li><i class="fas fa-circle text-[5px] text-gold-500 mr-2 align-middle"></i>${x}</li>`).join('')}</ul>
      </article>
      <article class="rounded-2xl bg-white border border-slate-200 p-6">
        <h3 class="font-extrabold text-navy-900 mb-3"><i class="fas fa-file-alt text-gold-600 mr-2"></i>논문 · 방송</h3>
        <ul class="text-sm space-y-2 text-slate-600">
          ${DOCTOR.papers.map((x) => `<li><i class="fas fa-circle text-[5px] text-gold-500 mr-2 align-middle"></i>${x}</li>`).join('')}
          ${DOCTOR.media.map((x) => `<li><i class="fas fa-tv text-gold-500 mr-2"></i>${x}</li>`).join('')}
        </ul>
      </article>
    </div>
  </div>
</section>

<section id="equipment-full" class="max-w-5xl mx-auto px-4 py-14">
  <header class="text-center mb-10">
    <p class="text-gold-600 font-bold tracking-widest text-sm uppercase">Equipment</p>
    <h2 class="text-2xl md:text-3xl font-extrabold text-navy-900 mt-1">첨단 장비 소개</h2>
  </header>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
    ${EQUIPMENT.map((e) => `<article class="rounded-xl border border-slate-200 p-5"><h3 class="font-extrabold text-navy-900"><i class="fas ${e.icon} text-gold-600 mr-2"></i>${e.name}</h3><p class="mt-2 text-sm text-slate-500 leading-relaxed">${e.desc}</p></article>`).join('')}
  </div>
</section>`
  return c.html(layout({ title: '병원소개', desc: `검단퍼스트치과 소개 — 통합치의학 전문의 김희수 대표원장, 1인 책임진료, ZEISS 미세현미경·체외충격파·페이스스캐너 등 첨단장비.`, path: '/about' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 진료과목 목록 ============
pages.get('/treatments', (c) => {
  const body = `
<section class="bg-navy-900 text-white py-16 text-center px-4">
  <p class="text-gold-400 tracking-widest text-sm uppercase">Treatments</p>
  <h1 class="text-3xl md:text-4xl font-extrabold mt-2">진료과목</h1>
  <p class="mt-4 text-slate-300">필요한 치료만, 정직하게 안내해 드립니다.</p>
</section>
<section class="max-w-6xl mx-auto px-4 py-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
  ${TREATMENTS.map((t) => `
  <a href="/treatments/${t.slug}" class="group block rounded-2xl border ${t.isCore ? 'border-gold-400 bg-gradient-to-b from-white to-amber-50/40' : 'border-slate-200'} p-6 hover:shadow-xl transition">
    ${t.isCore ? '<span class="inline-block text-[11px] font-bold bg-gold-500 text-white rounded-full px-2.5 py-0.5 mb-3">시그니처</span>' : ''}
    <span class="w-12 h-12 rounded-xl bg-navy-800 text-gold-400 flex items-center justify-center text-xl"><i class="fas ${t.icon}"></i></span>
    <h2 class="mt-3 text-lg font-extrabold text-navy-900">${t.name} <span class="text-xs text-slate-400 font-normal">${t.nameEn}</span></h2>
    <p class="text-gold-600 text-sm">${t.tagline}</p>
    <p class="mt-2 text-sm text-slate-500 line-clamp-2">${esc(t.metaDesc)}</p>
  </a>`).join('')}
</section>`
  return c.html(layout({ title: '진료과목', desc: '검단퍼스트치과 진료과목 — 임플란트, 루미네이트(라미네이트), 턱관절치료, 심미보철, 신경치료, 충치치료, 잇몸치료, 보철, 사랑니 발치, 치과 보톡스.', path: '/treatments' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 진료과목 상세 ============
pages.get('/treatments/:slug', (c) => {
  const t = getTreatment(c.req.param('slug'))
  if (!t) return c.notFound()
  const faqs = FAQS[t.slug] || []
  const faqLd = faqs.length
    ? [{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }]
    : []
  const related = TREATMENTS.filter((x) => x.slug !== t.slug).slice(0, 4)
  const body = `
<section class="bg-navy-900 text-white py-16 px-4">
  <div class="max-w-4xl mx-auto text-center">
    <p class="text-gold-400 tracking-widest text-sm uppercase">${esc(t.nameEn)}</p>
    <h1 class="text-3xl md:text-4xl font-extrabold mt-2">${t.name}</h1>
    <p class="mt-2 text-gold-400 font-medium">${esc(t.tagline)}</p>
    <p class="mt-5 text-slate-300 leading-relaxed max-w-2xl mx-auto">${esc(t.heroDesc)}</p>
  </div>
</section>

<article class="max-w-3xl mx-auto px-4 py-12 prose-clinic">
  ${t.sections.map((s) => `
  <h2>${esc(s.h2)}</h2>
  ${s.body.map((p) => `<p>${esc(p)}</p>`).join('')}
  ${s.list ? `<ul>${s.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}
  `).join('')}
</article>

${faqs.length ? `
<section id="faq-section" class="bg-navy-50 py-14">
  <div class="max-w-3xl mx-auto px-4">
    <h2 class="text-2xl font-extrabold text-navy-900 text-center mb-8"><i class="fas fa-circle-question text-gold-600 mr-2"></i>${t.name} 자주 묻는 질문</h2>
    <div class="space-y-3">
      ${faqs.map((f) => `
      <div class="faq-item rounded-xl bg-white border border-slate-200 overflow-hidden">
        <button class="w-full flex justify-between items-center gap-3 px-5 py-4 text-left font-bold text-navy-900 text-[15px]">
          <span><span class="text-gold-600 mr-2">Q.</span>${esc(f.q)}</span>
          <i class="faq-icon fas fa-chevron-down text-slate-400 transition-transform shrink-0"></i>
        </button>
        <div class="faq-answer hidden px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3"><span class="text-navy-700 font-bold mr-1">A.</span>${esc(f.a)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>` : ''}

<section id="treatment-cta" class="max-w-3xl mx-auto px-4 py-12 text-center">
  <div class="rounded-2xl bg-navy-900 text-white p-8">
    <h2 class="text-xl font-extrabold">${t.name}, 정직한 진단부터 시작하세요</h2>
    <p class="mt-2 text-slate-300 text-sm">다른 병원 견적을 들고 오셔도 좋습니다. 꼭 필요한 치료만 말씀드립니다.</p>
    <div class="mt-5 flex flex-wrap justify-center gap-3">
      <a href="tel:${CLINIC.phone}" class="px-6 py-3 rounded-full bg-gold-500 hover:bg-gold-600 font-bold text-sm"><i class="fas fa-phone mr-2"></i>${CLINIC.phone}</a>
      <a href="/location" class="px-6 py-3 rounded-full border border-slate-500 hover:border-gold-400 font-bold text-sm">오시는 길</a>
    </div>
  </div>
  <nav class="mt-10">
    <h3 class="text-sm font-bold text-slate-400 mb-3">다른 진료 보기</h3>
    <div class="flex flex-wrap justify-center gap-2">
      ${related.map((r) => `<a href="/treatments/${r.slug}" class="px-4 py-2 rounded-full border border-slate-200 text-sm hover:border-navy-600 hover:text-navy-700">${r.name}</a>`).join('')}
      <a href="/treatments" class="px-4 py-2 rounded-full bg-navy-50 text-sm font-bold text-navy-700">전체 진료과목</a>
    </div>
  </nav>
</section>`
  return c.html(layout({ title: t.name, desc: t.metaDesc, path: `/treatments/${t.slug}`, jsonLd: faqLd }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 치료스토리 ============
pages.get('/stories', (c) => {
  const body = `
<section class="bg-navy-900 text-white py-16 text-center px-4">
  <p class="text-gold-400 tracking-widest text-sm uppercase">Stories</p>
  <h1 class="text-3xl md:text-4xl font-extrabold mt-2">치료스토리</h1>
  <p class="mt-4 text-slate-300">숫자가 아닌, 사람의 이야기입니다.</p>
</section>
<section class="max-w-3xl mx-auto px-4 py-12 space-y-10">
  ${STORIES.map((s) => {
    const t = getTreatment(s.treatment)
    return `
  <article id="story-${s.id}" class="rounded-2xl border border-slate-200 p-7 shadow-sm">
    ${t ? `<a href="/treatments/${t.slug}" class="inline-block text-xs font-bold bg-navy-50 text-navy-700 rounded-full px-3 py-1 mb-3"><i class="fas ${t.icon} mr-1"></i>${t.name}</a>` : ''}
    <h2 class="text-xl font-extrabold text-navy-900">${esc(s.title)}</h2>
    <div class="mt-4 space-y-3 text-slate-600 leading-relaxed text-[15px]">${s.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
  </article>`
  }).join('')}
</section>`
  return c.html(layout({ title: '치료스토리', desc: '검단퍼스트치과 치료스토리 — 아버지의 전악 임플란트, 응급실에서 못 넣은 턱을 5초 만에, 정확한 진단이 바꾼 턱관절 치료.', path: '/stories' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 내원안내 / 오시는길 ============
pages.get('/location', (c) => {
  const body = `
<section class="bg-navy-900 text-white py-16 text-center px-4">
  <p class="text-gold-400 tracking-widest text-sm uppercase">Location</p>
  <h1 class="text-3xl md:text-4xl font-extrabold mt-2">내원안내</h1>
  <p class="mt-4 text-slate-300">${CLINIC.addressShort}</p>
</section>

<section class="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8">
  <div id="map-section" class="rounded-2xl overflow-hidden border border-slate-200">
    <iframe title="검단퍼스트치과 지도" src="https://www.openstreetmap.org/export/embed.html?bbox=${CLINIC.lng - 0.008}%2C${CLINIC.lat - 0.005}%2C${CLINIC.lng + 0.008}%2C${CLINIC.lat + 0.005}&layer=mapnik&marker=${CLINIC.lat}%2C${CLINIC.lng}" class="w-full h-80 border-0"></iframe>
    <div class="p-4 bg-navy-50 flex flex-wrap gap-2">
      <a href="https://map.naver.com/p/search/${encodeURIComponent('검단퍼스트치과')}" target="_blank" rel="noopener" class="flex-1 min-w-[130px] text-center px-4 py-2.5 rounded-lg bg-[#03c75a] text-white text-sm font-bold">네이버지도</a>
      <a href="https://map.kakao.com/?q=${encodeURIComponent('검단퍼스트치과')}" target="_blank" rel="noopener" class="flex-1 min-w-[130px] text-center px-4 py-2.5 rounded-lg bg-[#fee500] text-slate-900 text-sm font-bold">카카오맵</a>
      <a href="tel:${CLINIC.phone}" class="flex-1 min-w-[130px] text-center px-4 py-2.5 rounded-lg bg-navy-800 text-white text-sm font-bold"><i class="fas fa-phone mr-1"></i>전화</a>
    </div>
  </div>
  <div class="space-y-5">
    <article class="rounded-2xl border border-slate-200 p-6">
      <h2 class="font-extrabold text-navy-900"><i class="fas fa-map-marker-alt text-gold-600 mr-2"></i>주소</h2>
      <p class="mt-2 text-sm text-slate-600 leading-relaxed">${CLINIC.address}</p>
      <p class="mt-1 text-xs text-slate-400">검단신도시 중심상권 · 검단퍼스트프라자 3층 303~305호</p>
    </article>
    <article class="rounded-2xl border border-slate-200 p-6">
      <h2 class="font-extrabold text-navy-900"><i class="fas fa-car text-gold-600 mr-2"></i>주차 & 대중교통</h2>
      <ul class="mt-2 text-sm text-slate-600 space-y-1.5">
        <li><i class="fas fa-square-parking text-navy-600 mr-2"></i>건물 내 주차장 이용 가능 (내원 시 안내데스크에 문의)</li>
        <li><i class="fas fa-train-subway text-navy-600 mr-2"></i>인천지하철 1호선 검단연장선 이용 시 아라역·마전역 인근</li>
        <li><i class="fas fa-bus text-navy-600 mr-2"></i>검단신도시 중심상가 버스정류장 하차 도보권</li>
      </ul>
    </article>
    <article class="rounded-2xl border border-slate-200 p-6">
      <h2 class="font-extrabold text-navy-900"><i class="fas fa-clock text-gold-600 mr-2"></i>진료시간</h2>
      <ul class="mt-2 text-sm space-y-1.5">
        ${CLINIC.hours.map((h) => `<li class="flex justify-between"><span class="text-slate-500">${h.day}</span><span class="font-medium">${h.time}</span></li>`).join('')}
        <li class="flex justify-between"><span class="text-slate-500">점심시간</span><span class="font-medium">${CLINIC.lunch}</span></li>
      </ul>
      <p class="mt-3 text-xs text-slate-400">* 목요일 휴진이지만, 공휴일이 있는 주에는 목요일도 정상진료합니다.</p>
    </article>
    <article class="rounded-2xl border border-slate-200 p-6">
      <h2 class="font-extrabold text-navy-900"><i class="fas fa-won-sign text-gold-600 mr-2"></i>비급여 진료비 안내</h2>
      <p class="mt-2 text-sm text-slate-600">비급여 수가는 의료법에 따라 원내에 게시되어 있으며, 내원 상담 시 정확한 견적을 안내해 드립니다. 전화로도 문의하실 수 있습니다.</p>
    </article>
  </div>
</section>`
  return c.html(layout({ title: '내원안내 · 오시는길', desc: `검단퍼스트치과 오시는 길 — ${CLINIC.address}. 진료시간 평일 09:30~18:30, 토요일 09:30~14:00. ${CLINIC.phone}`, path: '/location' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 지역 SEO 페이지 ============
pages.get('/region/:slug', (c) => {
  const r = SEO_REGIONS.find((x) => x.slug === c.req.param('slug'))
  if (!r) return c.notFound()
  const core = TREATMENTS.filter((t) => t.isCore)
  const body = `
<section class="bg-navy-900 text-white py-16 text-center px-4">
  <p class="text-gold-400 tracking-widest text-sm uppercase">Local</p>
  <h1 class="text-3xl md:text-4xl font-extrabold mt-2">${r.name} 치과를 찾으신다면</h1>
  <p class="mt-4 text-slate-300 max-w-2xl mx-auto">${esc(r.desc)}</p>
  <p class="mt-2 text-gold-400 text-sm font-bold"><i class="fas fa-route mr-1"></i>${r.name}에서 ${r.distance}</p>
</section>
<section class="max-w-4xl mx-auto px-4 py-12">
  <h2 class="text-xl font-extrabold text-navy-900 text-center">${r.name}에서 검단퍼스트치과를 찾는 이유</h2>
  <div class="mt-8 grid sm:grid-cols-3 gap-5">
    ${core.map((t) => `<a href="/treatments/${t.slug}" class="rounded-xl border border-slate-200 p-5 text-center hover:border-gold-400 hover:shadow-lg transition"><i class="fas ${t.icon} text-2xl text-navy-700"></i><h3 class="mt-2 font-extrabold text-navy-900">${t.name}</h3><p class="mt-1 text-xs text-slate-500">${t.tagline}</p></a>`).join('')}
  </div>
  <div class="mt-10 prose-clinic">
    <h2>${r.name} 주민을 위한 안내</h2>
    <p>검단퍼스트치과는 ${CLINIC.address}에 위치해 있으며, ${r.name}에서 ${r.distance} 거리입니다. 과잉진료 없는 1인 대표원장 책임진료를 원칙으로, 통합치의학 전문의 김희수 원장이 상담부터 치료, 사후관리까지 직접 책임집니다.</p>
    <p>임플란트, 무삭제 라미네이트(루미네이트), 턱관절 치료는 물론 충치·신경·잇몸치료까지 — ${r.name}에서 믿을 수 있는 치과를 찾으신다면 편하게 전화 주세요.</p>
  </div>
  <div class="mt-8 text-center">
    <a href="tel:${CLINIC.phone}" class="inline-block px-7 py-3.5 rounded-full bg-gold-500 hover:bg-gold-600 text-white font-bold"><i class="fas fa-phone mr-2"></i>${CLINIC.phone}</a>
    <a href="/location" class="inline-block ml-2 px-7 py-3.5 rounded-full border border-slate-300 font-bold text-slate-700 hover:border-navy-600">오시는 길</a>
  </div>
</section>`
  return c.html(layout({ title: `${r.name} 치과 — 검단퍼스트치과`, desc: `${r.name} 치과 추천 — 검단퍼스트치과. ${r.desc} 임플란트·라미네이트·턱관절 치료, 과잉진료 없는 정직한 진료. ${CLINIC.phone}`, path: `/region/${r.slug}` }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

export default pages
