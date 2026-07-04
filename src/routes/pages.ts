// 정적 페이지 라우트 — 홈, 병원소개, 진료과목, 내원안내, 지역페이지 (2026 리뉴얼)
import { Hono } from 'hono'
import { layout, esc, pageHero } from '../lib/layout'
import { CLINIC, DOCTOR, EQUIPMENT, STORIES } from '../data/clinic'
import { TREATMENTS, getTreatment } from '../data/treatments'
import { FAQS } from '../data/faqs'
import { SEO_REGIONS } from '../data/regions'
import type { AppEnv } from '../types'

const pages = new Hono<AppEnv>()

const MARQUEE_ITEMS = ['과잉진료 없는 책임진료', '통합치의학 전문의', '우수보철의사 인증', 'Harvard Implant CE', '검단에서 가장 오래된 치과', '1인 대표원장 시스템', '오스템·덴티스 임상자문위원']

function marquee(): string {
  const seg = MARQUEE_ITEMS.map((t) => `<span class="mx-6 flex items-center gap-6 text-sm font-bold tracking-wide whitespace-nowrap">${t}<i class="fas fa-asterisk text-gold-500 text-[10px]"></i></span>`).join('')
  return `
<div class="marquee bg-ink text-white/80 py-3.5 border-y border-white/5" aria-hidden="true">
  <div class="marquee-track">${seg}</div>
  <div class="marquee-track">${seg}</div>
</div>`
}

// ============ 홈 ============
pages.get('/', (c) => {
  const core = TREATMENTS.filter((t) => t.isCore)
  const others = TREATMENTS.filter((t) => !t.isCore)
  const body = `
<!-- ===== 히어로 ===== -->
<section id="hero-section" class="relative min-h-[92vh] bg-ink text-white flex flex-col justify-end overflow-hidden">
  <div class="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[760px] max-h-[760px] rounded-full bg-navy-600/30 blur-[140px]" aria-hidden="true"></div>
  <div class="absolute bottom-[-30%] left-[-15%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-gold-500/12 blur-[130px]" aria-hidden="true"></div>
  <div class="absolute inset-0 opacity-[0.05]" style="background-image:linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px);background-size:72px 72px" aria-hidden="true"></div>

  <div class="relative max-w-6xl mx-auto px-5 w-full pt-40 pb-16 sm:pb-20">
    <div class="flex items-center gap-3 mb-8">
      <span class="flex h-2.5 w-2.5 relative"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-60"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold-400"></span></span>
      <p class="text-white/50 text-[13px] font-semibold tracking-wide">인천 검단신도시 · 오늘 정상진료</p>
    </div>
    <h1 class="relative z-[2] text-[13vw] sm:text-7xl lg:text-[92px] font-extrabold tracking-tightest leading-[0.98]">
      <span class="hero-word"><span style="--d:.05s">치과는</span></span><br>
      <span class="hero-word"><span style="--d:.15s">정직이</span></span>
      <span class="hero-word"><span style="--d:.25s" class="text-shine text-3d font-disp italic">실력</span></span><span class="hero-word"><span style="--d:.3s">입니다.</span></span>
    </h1>
    <div class="mt-10 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
      <p class="text-white/55 max-w-md leading-relaxed text-[15px]">
        상담한 원장이 치료하고, 치료한 원장이 끝까지 관리합니다.<br>
        검단에서 가장 오래된 치과의 1인 대표원장 책임진료 — <strong class="text-white">하지 않아도 될 치료는, 하지 않아도 된다고 말씀드립니다.</strong>
      </p>
      <div class="relative z-[2] flex flex-wrap gap-3 shrink-0">
        <a href="tel:${CLINIC.phone}" class="btn-3d group px-8 py-4 rounded-full bg-gold-500 text-ink font-extrabold hover:bg-gold-400 transition flex items-center gap-2">
          <i class="fas fa-phone"></i>${CLINIC.phone}
        </a>
        <a href="/treatments" class="px-8 py-4 rounded-full border border-white/25 font-bold hover:bg-white/10 transition">진료 보기 <i class="fas fa-arrow-right ml-1 text-sm"></i></a>
      </div>
    </div>
  </div>
  ${marquee()}
</section>

<!-- ===== 스탯 ===== -->
<section id="stats-section" class="max-w-6xl mx-auto px-5 py-16 sm:py-20">
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink/10 rounded-3xl overflow-hidden" data-stagger>
    ${[
      { n: 16, suffix: '', label: '전악 임플란트, 아버지께 직접', sub: '상악 9개 · 하악 7개' },
      { n: 25, suffix: '배', label: 'ZEISS 미세현미경 배율', sub: '독일 정밀 진단' },
      { n: 12, suffix: '+', label: '연수 · 고급과정 수료', sub: 'Harvard · NYU · 서울대' },
      { n: 2, suffix: '개사', label: '임플란트 임상자문위원', sub: '오스템 · 덴티스' },
    ].map((s) => `
    <div class="bg-cream p-7 sm:p-9" data-tilt data-tilt-max="6">
      <p class="stat-num text-5xl sm:text-6xl font-extrabold text-ink" data-count="${s.n}" data-suffix="${s.suffix}">0</p>
      <p class="mt-3 font-bold text-ink text-[15px]">${s.label}</p>
      <p class="mt-0.5 text-[13px] text-ink/40">${s.sub}</p>
    </div>`).join('')}
  </div>
</section>

<!-- ===== 시그니처 진료 (벤토) ===== -->
<section id="core-treatments" class="max-w-6xl mx-auto px-5 pb-20">
  <header class="mb-10 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p class="reveal text-gold-600 text-xs font-bold tracking-[0.3em] uppercase">Signature</p>
      <h2 class="reveal mt-2 text-3xl sm:text-5xl font-extrabold text-ink tracking-tightest">가장 잘하는 세 가지</h2>
    </div>
    <a href="/treatments" class="reveal px-5 py-2.5 rounded-full border border-ink/15 text-sm font-bold text-ink/70 hover:bg-ink hover:text-white transition">전체 진료 <i class="fas fa-arrow-right ml-1 text-xs"></i></a>
  </header>

  <div class="grid lg:grid-cols-3 gap-4">
    ${core.map((t, i) => `
    <a href="/treatments/${t.slug}" class="bento reveal-scale group relative block rounded-3xl overflow-hidden ${i === 0 ? 'bg-ink text-white lg:row-span-1' : 'bg-white border border-ink/8'} p-8 min-h-[340px] flex flex-col">
      <span class="idx-num${i === 0 ? '-light' : ''} absolute top-6 right-7 text-7xl font-extrabold select-none" aria-hidden="true">0${i + 1}</span>
      <span class="w-13 h-13 p-3.5 rounded-2xl ${i === 0 ? 'bg-gold-500 text-ink' : 'bg-ink text-gold-400'} inline-flex items-center justify-center text-xl w-fit"><i class="fas ${t.icon}"></i></span>
      <h3 class="mt-6 text-2xl font-extrabold tracking-tightest">${t.name}</h3>
      <p class="${i === 0 ? 'text-gold-400' : 'text-gold-600'} text-sm font-semibold mt-1">${t.tagline}</p>
      <p class="mt-4 text-sm ${i === 0 ? 'text-white/50' : 'text-ink/50'} leading-relaxed line-clamp-3 flex-1">${esc(t.heroDesc)}</p>
      <p class="mt-6 inline-flex items-center gap-2 font-bold text-sm ${i === 0 ? 'text-gold-400' : 'text-ink'}">
        자세히 보기 <span class="w-8 h-8 rounded-full ${i === 0 ? 'bg-white/10' : 'bg-ink/5'} flex items-center justify-center group-hover:translate-x-1.5 transition-transform"><i class="fas fa-arrow-right text-xs"></i></span>
      </p>
    </a>`).join('')}
  </div>

  <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2" data-stagger>
    ${others.map((t) => `<a href="/treatments/${t.slug}" data-tilt data-tilt-max="12" class="group rounded-2xl bg-white border border-ink/8 py-5 px-3 text-center hover:bg-ink hover:border-ink transition"><i class="fas ${t.icon} text-ink/60 group-hover:text-gold-400 transition"></i><p class="mt-2 text-[13px] font-bold text-ink/80 group-hover:text-white transition">${t.name}</p></a>`).join('')}
  </div>
</section>

<!-- ===== 원장 ===== -->
<section id="doctor-intro" class="relative bg-ink text-white overflow-hidden">
  <div class="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-navy-600/20 blur-[130px]" aria-hidden="true"></div>
  <div class="max-w-6xl mx-auto px-5 py-20 sm:py-28 relative">
    <div class="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
      <div>
        <p class="reveal text-gold-400 text-xs font-bold tracking-[0.3em] uppercase">The Doctor</p>
        <h2 class="reveal mt-3 text-3xl sm:text-5xl font-extrabold tracking-tightest leading-[1.15]">아버지의 임플란트를<br><span class="font-disp italic text-shine">아들이 직접</span> 심었습니다.</h2>
        <p class="reveal mt-6 text-white/50 leading-relaxed max-w-lg text-[15px]">상악 9개, 하악 7개. 판교에서 검단까지 오가며 견딘 5개월 — "아빠가 고기를 너무 잘 드셔서 좋댄다"는 어머니의 전화 한 통. 김희수 원장은 모든 환자의 임플란트를 이 마음으로 심습니다.</p>
        <div class="reveal mt-8 flex flex-wrap gap-3">
          <a href="/about" class="px-7 py-3.5 rounded-full bg-white text-ink font-extrabold text-sm hover:bg-gold-400 transition">원장 이력 보기</a>
          <a href="/stories" class="px-7 py-3.5 rounded-full border border-white/25 font-bold text-sm hover:bg-white/10 transition">스토리 전문 읽기</a>
        </div>
      </div>
      <div class="reveal-scale">
        <div class="rounded-3xl bg-white/[0.06] border border-white/10 backdrop-blur p-8" data-tilt data-tilt-max="7">
          <div class="flex items-center gap-4 pb-6 border-b border-white/10">
            <span class="w-14 h-14 rounded-2xl bg-gold-500 text-ink flex items-center justify-center text-xl font-black">金</span>
            <div>
              <p class="font-extrabold text-lg">${DOCTOR.name} <span class="text-white/40 text-sm font-medium">대표원장</span></p>
              <p class="text-gold-400 text-[13px] font-semibold">통합치의학 전문의 · 우수보철의사</p>
            </div>
          </div>
          <ul class="mt-6 space-y-3.5 text-[13.5px] text-white/70">
            ${['보건복지부 인증 통합치의학 전문의 (대학병원 정식 수련)', '대한치과보철학회 인증 우수보철의사', 'Harvard School of Dental Medicine Implant CE', '서울대 치의학대학원 Periodontal/Implant Therapy', 'NYU 무삭제 라미네이트 고급과정', '오스템·덴티스 임플란트 임상자문연구위원'].map((h) => `<li class="flex gap-3"><i class="fas fa-check text-gold-400 mt-0.5"></i>${h}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ===== 장비 ===== -->
<section id="equipment-section" class="max-w-6xl mx-auto px-5 py-20 sm:py-24">
  <header class="mb-10">
    <p class="reveal text-gold-600 text-xs font-bold tracking-[0.3em] uppercase">Equipment</p>
    <h2 class="reveal mt-2 text-3xl sm:text-5xl font-extrabold text-ink tracking-tightest">정확한 진단에<br class="sm:hidden"> 아낌없이 씁니다.</h2>
    <p class="reveal mt-4 text-ink/45 text-[15px]">광고비 대신 장비에 투자합니다. 좋은 치료는 정확한 진단에서 시작되니까요.</p>
  </header>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" data-stagger>
    ${EQUIPMENT.map((e, i) => `
    <article class="bento group rounded-3xl bg-white border border-ink/8 p-6 relative overflow-hidden">
      <span class="absolute top-5 right-6 text-[11px] font-mono text-ink/25">${String(i + 1).padStart(2, '0')}</span>
      <span class="w-11 h-11 rounded-xl bg-ink/[0.04] text-ink group-hover:bg-ink group-hover:text-gold-400 transition flex items-center justify-center"><i class="fas ${e.icon}"></i></span>
      <h3 class="mt-4 font-extrabold text-ink text-[15.5px] tracking-tight">${e.name}</h3>
      <p class="mt-2 text-[13.5px] text-ink/50 leading-relaxed">${e.desc}</p>
    </article>`).join('')}
  </div>
</section>

<!-- ===== 진료시간/CTA ===== -->
<section id="visit-info" class="max-w-6xl mx-auto px-5 pb-24">
  <div class="grid lg:grid-cols-5 gap-4">
    <div class="reveal-scale lg:col-span-3 rounded-3xl bg-ink text-white p-8 sm:p-10 relative overflow-hidden" data-tilt data-tilt-max="5">
      <div class="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-gold-500/15 blur-[80px]" aria-hidden="true"></div>
      <p class="text-gold-400 text-xs font-bold tracking-[0.3em] uppercase">Reservation</p>
      <h2 class="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tightest leading-tight">다른 병원 견적,<br>들고 오셔도 됩니다.</h2>
      <p class="mt-4 text-white/50 text-[15px] leading-relaxed max-w-md">"다른 병원도 다녀오세요. 그럼 저희의 가치를 더 느끼실 수 있습니다." — 비교하고 오셔도 정직하게만 말씀드립니다.</p>
      <div class="mt-8 flex flex-wrap gap-3 relative">
        <a href="tel:${CLINIC.phone}" class="btn-3d px-7 py-4 rounded-full bg-gold-500 text-ink font-extrabold hover:bg-gold-400 transition"><i class="fas fa-phone mr-2"></i>${CLINIC.phone}</a>
        <a href="/location" class="px-7 py-4 rounded-full border border-white/25 font-bold hover:bg-white/10 transition">오시는 길</a>
      </div>
    </div>
    <div class="reveal-scale lg:col-span-2 rounded-3xl bg-white border border-ink/8 p-8" data-tilt data-tilt-max="5">
      <h2 class="font-extrabold text-ink flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-gold-500"></span>진료시간</h2>
      <ul class="mt-5 space-y-3 text-[14px]">
        ${CLINIC.hours.map((h) => `<li class="flex justify-between items-baseline gap-3"><span class="text-ink/40 shrink-0">${h.day}</span><span class="tick-line flex-1 h-px self-center"></span><span class="font-bold text-ink text-right">${h.time.replace('AM 09:30 ~ PM 18:30', '09:30–18:30').replace('AM 09:30 ~ PM 14:00 (점심시간 없이 진료)', '09:30–14:00').replace('휴진 (공휴일이 있는 주는 정상진료)', '휴진*').replace('휴진', '휴진')}</span></li>`).join('')}
        <li class="flex justify-between items-baseline gap-3"><span class="text-ink/40 shrink-0">점심시간</span><span class="tick-line flex-1 h-px self-center"></span><span class="font-bold text-ink">13:00–14:00</span></li>
      </ul>
      <p class="mt-4 text-[11.5px] text-ink/35">* 공휴일이 있는 주 목요일은 정상진료 · 토요일은 점심시간 없이 진료</p>
    </div>
  </div>
</section>`
  return c.html(layout({ title: '홈', desc: `검단신도시 치과 — ${CLINIC.name}. 과잉진료 없는 1인 대표원장 책임진료. 임플란트·라미네이트·턱관절 치료. 통합치의학 전문의 김희수 원장. ${CLINIC.phone}`, path: '/' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 병원소개 ============
pages.get('/about', (c) => {
  const body = `
${pageHero('About Us', '광고 대신,<br><span class="font-disp italic text-shine">진단</span>으로 승부합니다.', '검단신도시에서 가장 오래된 치과, 그 이름의 무게를 압니다.')}

<section id="philosophy" class="max-w-6xl mx-auto px-5 py-20">
  <div class="grid lg:grid-cols-2 gap-10 items-start">
    <h2 class="reveal text-2xl sm:text-4xl font-extrabold text-ink tracking-tightest leading-[1.25] lg:sticky lg:top-28">"다른 병원도 다녀오세요.<br>그럼 저희의 가치를<br>더 느끼실 수 있습니다."</h2>
    <div class="space-y-5 text-ink/60 leading-[1.9] text-[15.5px]">
      <p class="reveal">검단퍼스트치과는 화려한 광고 대신 정직한 진단으로 승부합니다. 꼭 필요한 치료만 권해드리고, 하지 않아도 되는 치료는 하지 않아도 된다고 말씀드립니다.</p>
      <p class="reveal">상담한 원장이 직접 치료하고, 치료한 원장이 끝까지 관리하는 <strong class="text-ink">1인 대표원장 책임진료 시스템</strong>. 페이닥터 교체로 담당의가 바뀌는 일은 이곳에 없습니다.</p>
      <p class="reveal">그것이 검단에서 가장 오래 신뢰받아온 이유입니다.</p>
    </div>
  </div>
</section>

<section id="doctor-profile" class="bg-ink text-white py-20 sm:py-24 relative overflow-hidden">
  <div class="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-navy-600/20 blur-[140px]" aria-hidden="true"></div>
  <div class="max-w-6xl mx-auto px-5 relative">
    <header class="mb-12">
      <p class="reveal text-gold-400 text-xs font-bold tracking-[0.3em] uppercase">Doctor Profile</p>
      <h2 class="reveal mt-3 text-3xl sm:text-5xl font-extrabold tracking-tightest">대표원장 ${DOCTOR.name}</h2>
      <p class="reveal mt-3 text-white/45">보건복지부 인증 통합치의학 전문의 · 대한치과보철학회 우수보철의사</p>
    </header>
    <blockquote class="reveal-scale rounded-3xl bg-white/[0.06] border border-white/10 p-8 mb-10 max-w-3xl" data-tilt data-tilt-max="6">
      <i class="fas fa-quote-left text-gold-400 text-xl"></i>
      <p class="mt-3 text-white/75 leading-[1.9] text-[15.5px]">${DOCTOR.philosophy}</p>
    </blockquote>
    <div class="grid md:grid-cols-2 gap-4" data-stagger>
      ${[
        { title: '학력 및 경력', icon: 'fa-graduation-cap', items: DOCTOR.career },
        { title: '연수 및 수료', icon: 'fa-certificate', items: DOCTOR.courses },
        { title: '학회 활동', icon: 'fa-users', items: DOCTOR.memberships },
        { title: '논문 · 방송', icon: 'fa-file-alt', items: [...DOCTOR.papers, ...DOCTOR.media] },
      ].map((g) => `
      <article class="rounded-3xl bg-white/[0.04] border border-white/10 p-7" data-tilt data-tilt-max="6">
        <h3 class="font-extrabold text-white flex items-center gap-3 mb-5"><span class="w-9 h-9 rounded-xl bg-gold-500/15 text-gold-400 flex items-center justify-center text-sm"><i class="fas ${g.icon}"></i></span>${g.title}</h3>
        <ul class="space-y-2.5 text-[13.5px] text-white/55 leading-relaxed">${g.items.map((x) => `<li class="flex gap-2.5"><span class="text-gold-500/70 mt-1.5 w-1 h-1 rounded-full bg-gold-500 shrink-0"></span>${x}</li>`).join('')}</ul>
      </article>`).join('')}
    </div>
  </div>
</section>

<section id="equipment-full" class="max-w-6xl mx-auto px-5 py-20">
  <header class="mb-10">
    <p class="reveal text-gold-600 text-xs font-bold tracking-[0.3em] uppercase">Equipment</p>
    <h2 class="reveal mt-2 text-3xl sm:text-4xl font-extrabold text-ink tracking-tightest">첨단 장비</h2>
  </header>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" data-stagger>
    ${EQUIPMENT.map((e, i) => `<article class="bento rounded-3xl bg-white border border-ink/8 p-6 relative"><span class="absolute top-5 right-6 text-[11px] font-mono text-ink/25">${String(i + 1).padStart(2, '0')}</span><span class="w-11 h-11 rounded-xl bg-ink/[0.04] text-ink flex items-center justify-center"><i class="fas ${e.icon}"></i></span><h3 class="mt-4 font-extrabold text-ink text-[15.5px]">${e.name}</h3><p class="mt-2 text-[13.5px] text-ink/50 leading-relaxed">${e.desc}</p></article>`).join('')}
  </div>
</section>`
  return c.html(layout({ title: '병원소개', desc: `검단퍼스트치과 소개 — 통합치의학 전문의 김희수 대표원장, 1인 책임진료, ZEISS 미세현미경·체외충격파·페이스스캐너 등 첨단장비.`, path: '/about' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 진료과목 목록 ============
pages.get('/treatments', (c) => {
  const body = `
${pageHero('Treatments', '필요한 치료만,<br><span class="font-disp italic text-shine">정직하게.</span>', '10개 진료과목 — 무엇이 필요한지, 무엇이 필요 없는지부터 말씀드립니다.')}
<section class="max-w-6xl mx-auto px-5 py-16">
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-stagger>
    ${TREATMENTS.map((t, i) => `
    <a href="/treatments/${t.slug}" class="bento group relative block rounded-3xl overflow-hidden ${t.isCore ? 'bg-ink text-white' : 'bg-white border border-ink/8'} p-7 min-h-[240px] flex flex-col">
      <span class="idx-num${t.isCore ? '-light' : ''} absolute top-5 right-6 text-6xl font-extrabold select-none" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      ${t.isCore ? '<span class="absolute top-6 left-7 text-[10px] font-bold tracking-[0.2em] text-gold-400 uppercase">Signature</span>' : ''}
      <span class="mt-${t.isCore ? '8' : '0'} w-12 h-12 rounded-2xl ${t.isCore ? 'bg-gold-500 text-ink' : 'bg-ink text-gold-400'} flex items-center justify-center text-lg"><i class="fas ${t.icon}"></i></span>
      <h2 class="mt-5 text-xl font-extrabold tracking-tight">${t.name}</h2>
      <p class="${t.isCore ? 'text-gold-400' : 'text-gold-600'} text-[13px] font-semibold mt-0.5">${t.tagline}</p>
      <p class="mt-3 text-[13.5px] ${t.isCore ? 'text-white/50' : 'text-ink/45'} leading-relaxed line-clamp-2 flex-1">${esc(t.metaDesc)}</p>
      <p class="mt-4 text-sm font-bold ${t.isCore ? 'text-gold-400' : 'text-ink'} flex items-center gap-2">자세히 <i class="fas fa-arrow-right text-xs group-hover:translate-x-1.5 transition-transform"></i></p>
    </a>`).join('')}
  </div>
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
<section class="page-hero relative bg-ink text-white pt-36 pb-16 sm:pt-44 sm:pb-20 px-5 overflow-hidden">
  <div class="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-navy-600/25 blur-[130px]" aria-hidden="true"></div>
  <div class="absolute bottom-0 right-0 w-[380px] h-[380px] rounded-full bg-gold-500/10 blur-[110px]" aria-hidden="true"></div>
  <div class="max-w-6xl mx-auto relative">
    <nav class="reveal text-[12px] text-white/35 font-medium"><a href="/" class="hover:text-gold-400">홈</a> / <a href="/treatments" class="hover:text-gold-400">진료과목</a> / <span class="text-white/60">${t.name}</span></nav>
    <div class="mt-6 flex items-start justify-between gap-6 flex-wrap">
      <div>
        <p class="reveal text-gold-400 text-xs font-bold tracking-[0.35em] uppercase">${esc(t.nameEn)}</p>
        <h1 class="reveal mt-3 text-4xl sm:text-6xl font-extrabold tracking-tightest">${t.name}</h1>
        <p class="reveal mt-3 text-gold-400 font-disp italic text-lg">${esc(t.tagline)}</p>
      </div>
      <span class="reveal-scale hidden sm:flex w-20 h-20 rounded-3xl bg-white/[0.06] border border-white/10 items-center justify-center text-3xl text-gold-400" data-tilt data-tilt-max="16"><i class="fas ${t.icon}"></i></span>
    </div>
    <p class="reveal mt-7 text-white/50 leading-relaxed max-w-2xl text-[15px]">${esc(t.heroDesc)}</p>
  </div>
</section>

<article class="max-w-3xl mx-auto px-5 py-14 prose-clinic">
  ${t.sections.map((s) => `
  <h2>${esc(s.h2)}</h2>
  ${s.body.map((p) => `<p>${esc(p)}</p>`).join('')}
  ${s.list ? `<ul>${s.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}
  `).join('')}
</article>

${faqs.length ? `
<section id="faq-section" class="max-w-3xl mx-auto px-5 pb-16">
  <header class="mb-8">
    <p class="text-gold-600 text-xs font-bold tracking-[0.3em] uppercase">FAQ</p>
    <h2 class="mt-2 text-2xl sm:text-3xl font-extrabold text-ink tracking-tightest">${t.name}, 자주 묻는 질문</h2>
  </header>
  <div class="space-y-2.5">
    ${faqs.map((f) => `
    <div class="faq-item rounded-2xl bg-white border border-ink/8 overflow-hidden hover:border-ink/20" data-tilt data-tilt-max="3">
      <button class="w-full flex justify-between items-center gap-4 px-6 py-4.5 py-5 text-left font-bold text-ink text-[14.5px]">
        <span>${esc(f.q)}</span>
        <span class="faq-icon w-7 h-7 rounded-full bg-ink/5 flex items-center justify-center shrink-0 transition-transform"><i class="fas fa-plus text-[11px] text-ink/60"></i></span>
      </button>
      <div class="faq-answer hidden px-6 pb-5 text-[14px] text-ink/55 leading-[1.85]">${esc(f.a)}</div>
    </div>`).join('')}
  </div>
</section>` : ''}

<section id="treatment-cta" class="max-w-6xl mx-auto px-5 pb-20">
  <div class="reveal-scale rounded-3xl bg-ink text-white p-9 sm:p-12 relative overflow-hidden" data-tilt data-tilt-max="4">
    <div class="absolute -bottom-20 -right-16 w-72 h-72 rounded-full bg-gold-500/15 blur-[90px]" aria-hidden="true"></div>
    <div class="relative flex flex-col sm:flex-row sm:items-end justify-between gap-8">
      <div>
        <h2 class="text-2xl sm:text-4xl font-extrabold tracking-tightest leading-tight">${t.name},<br>정직한 진단부터.</h2>
        <p class="mt-3 text-white/50 text-[14.5px]">다른 병원 견적을 들고 오셔도 좋습니다. 꼭 필요한 치료만 말씀드립니다.</p>
      </div>
      <div class="flex flex-wrap gap-3 shrink-0">
        <a href="tel:${CLINIC.phone}" class="btn-3d px-7 py-4 rounded-full bg-gold-500 text-ink font-extrabold hover:bg-gold-400 transition"><i class="fas fa-phone mr-2"></i>${CLINIC.phone}</a>
        <a href="/location" class="px-7 py-4 rounded-full border border-white/25 font-bold hover:bg-white/10 transition">오시는 길</a>
      </div>
    </div>
  </div>
  <nav class="mt-8 flex flex-wrap items-center gap-2">
    <span class="text-[12px] font-bold text-ink/35 tracking-widest uppercase mr-2">More</span>
    ${related.map((r) => `<a href="/treatments/${r.slug}" class="px-4.5 px-5 py-2.5 rounded-full bg-white border border-ink/10 text-[13.5px] font-semibold text-ink/70 hover:bg-ink hover:text-white transition">${r.name}</a>`).join('')}
    <a href="/treatments" class="px-5 py-2.5 rounded-full bg-ink text-white text-[13.5px] font-bold">전체 보기</a>
  </nav>
</section>`
  return c.html(layout({ title: t.name, desc: t.metaDesc, path: `/treatments/${t.slug}`, jsonLd: faqLd }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 치료스토리 ============
pages.get('/stories', (c) => {
  const body = `
${pageHero('Stories', '숫자가 아닌,<br><span class="font-disp italic text-shine">사람</span>의 이야기.', '치료 케이스 뒤에는 언제나 한 사람의 삶이 있습니다.')}
<section class="max-w-3xl mx-auto px-5 py-16 space-y-8">
  ${STORIES.map((s, i) => {
    const t = getTreatment(s.treatment)
    return `
  <article id="story-${s.id}" class="reveal-scale relative rounded-3xl bg-white border border-ink/8 p-8 sm:p-10 overflow-hidden" data-tilt data-tilt-max="4">
    <span class="idx-num absolute top-6 right-8 text-7xl font-extrabold select-none" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    ${t ? `<a href="/treatments/${t.slug}" class="inline-flex items-center gap-2 text-[11.5px] font-bold bg-ink text-gold-400 rounded-full px-3.5 py-1.5 tracking-wide"><i class="fas ${t.icon}"></i>${t.name}</a>` : ''}
    <h2 class="mt-5 text-2xl sm:text-3xl font-extrabold text-ink tracking-tightest leading-snug max-w-lg">${esc(s.title)}</h2>
    <div class="mt-6 space-y-4 text-ink/60 leading-[1.9] text-[15px]">${s.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
  </article>`
  }).join('')}
</section>`
  return c.html(layout({ title: '치료스토리', desc: '검단퍼스트치과 치료스토리 — 아버지의 전악 임플란트, 응급실에서 못 넣은 턱을 5초 만에, 정확한 진단이 바꾼 턱관절 치료.', path: '/stories' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 내원안내 / 오시는길 ============
pages.get('/location', (c) => {
  const body = `
${pageHero('Location', '검단 한복판,<br><span class="font-disp italic text-shine">3층</span>입니다.', CLINIC.addressShort)}
<section class="max-w-6xl mx-auto px-5 py-14 grid lg:grid-cols-5 gap-4">
  <div id="map-section" class="reveal-scale lg:col-span-3 rounded-3xl overflow-hidden border border-ink/8 bg-white">
    <iframe title="검단퍼스트치과 지도" src="https://www.openstreetmap.org/export/embed.html?bbox=${CLINIC.lng - 0.008}%2C${CLINIC.lat - 0.005}%2C${CLINIC.lng + 0.008}%2C${CLINIC.lat + 0.005}&layer=mapnik&marker=${CLINIC.lat}%2C${CLINIC.lng}" class="w-full h-[380px] border-0"></iframe>
    <div class="p-4 flex flex-wrap gap-2">
      <a href="https://map.naver.com/p/search/${encodeURIComponent('검단퍼스트치과')}" target="_blank" rel="noopener" class="flex-1 min-w-[120px] text-center px-4 py-3 rounded-xl bg-[#03c75a] text-white text-sm font-bold">네이버지도</a>
      <a href="https://map.kakao.com/?q=${encodeURIComponent('검단퍼스트치과')}" target="_blank" rel="noopener" class="flex-1 min-w-[120px] text-center px-4 py-3 rounded-xl bg-[#fee500] text-ink text-sm font-bold">카카오맵</a>
      <a href="tel:${CLINIC.phone}" class="flex-1 min-w-[120px] text-center px-4 py-3 rounded-xl bg-ink text-white text-sm font-bold"><i class="fas fa-phone mr-1"></i>전화</a>
    </div>
  </div>
  <div class="lg:col-span-2 space-y-4" data-stagger>
    <article class="rounded-3xl bg-white border border-ink/8 p-7" data-tilt data-tilt-max="7">
      <h2 class="font-extrabold text-ink flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-gold-500"></span>주소</h2>
      <p class="mt-3 text-[14px] text-ink/60 leading-relaxed">${CLINIC.address}</p>
      <p class="mt-1.5 text-[12px] text-ink/35">검단신도시 중심상권 · 검단퍼스트프라자 3층 303~305호</p>
    </article>
    <article class="rounded-3xl bg-white border border-ink/8 p-7" data-tilt data-tilt-max="7">
      <h2 class="font-extrabold text-ink flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-gold-500"></span>주차 · 교통</h2>
      <ul class="mt-3 text-[14px] text-ink/60 space-y-2">
        <li class="flex gap-2.5"><i class="fas fa-square-parking text-ink/30 mt-0.5"></i>건물 내 주차장 이용 가능</li>
        <li class="flex gap-2.5"><i class="fas fa-train-subway text-ink/30 mt-0.5"></i>인천 1호선 검단연장선 아라역·마전역 인근</li>
        <li class="flex gap-2.5"><i class="fas fa-bus text-ink/30 mt-0.5"></i>검단신도시 중심상가 정류장 도보권</li>
      </ul>
    </article>
    <article class="rounded-3xl bg-ink text-white p-7" data-tilt data-tilt-max="7">
      <h2 class="font-extrabold flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-gold-400"></span>진료시간</h2>
      <ul class="mt-4 space-y-2.5 text-[13.5px]">
        <li class="flex justify-between"><span class="text-white/40">월·화·수·금</span><span class="font-bold">09:30–18:30</span></li>
        <li class="flex justify-between"><span class="text-white/40">토요일</span><span class="font-bold">09:30–14:00 <span class="text-gold-400 text-[11px]">점심없이</span></span></li>
        <li class="flex justify-between"><span class="text-white/40">목·일·공휴일</span><span class="font-bold">휴진</span></li>
        <li class="flex justify-between"><span class="text-white/40">점심시간</span><span class="font-bold">13:00–14:00</span></li>
      </ul>
      <p class="mt-4 text-[11px] text-white/30">* 공휴일이 있는 주 목요일은 정상진료합니다.</p>
    </article>
    <article class="rounded-3xl bg-white border border-ink/8 p-7" data-tilt data-tilt-max="7">
      <h2 class="font-extrabold text-ink flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-gold-500"></span>비급여 진료비</h2>
      <p class="mt-3 text-[13.5px] text-ink/55 leading-relaxed">비급여 수가는 의료법에 따라 원내 게시되어 있으며, 내원 상담 시 정확한 견적을 안내해 드립니다.</p>
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
${pageHero('Local', `${r.name},<br><span class="font-disp italic text-shine">가까운 정직함.</span>`, `${esc(r.desc)} <span class="text-gold-400 font-bold">— ${r.name}에서 ${r.distance}</span>`)}
<section class="max-w-6xl mx-auto px-5 py-16">
  <div class="grid sm:grid-cols-3 gap-4" data-stagger>
    ${core.map((t, i) => `<a href="/treatments/${t.slug}" class="bento group relative rounded-3xl ${i === 0 ? 'bg-ink text-white' : 'bg-white border border-ink/8'} p-7 block"><span class="w-12 h-12 rounded-2xl ${i === 0 ? 'bg-gold-500 text-ink' : 'bg-ink text-gold-400'} flex items-center justify-center text-lg"><i class="fas ${t.icon}"></i></span><h3 class="mt-4 text-lg font-extrabold tracking-tight">${t.name}</h3><p class="mt-1 text-[13px] ${i === 0 ? 'text-gold-400' : 'text-gold-600'} font-semibold">${t.tagline}</p></a>`).join('')}
  </div>
  <div class="mt-14 prose-clinic max-w-3xl">
    <h2>${r.name} 주민을 위한 안내</h2>
    <p>검단퍼스트치과는 ${CLINIC.address}에 위치해 있으며, ${r.name}에서 ${r.distance} 거리입니다. 과잉진료 없는 1인 대표원장 책임진료를 원칙으로, 통합치의학 전문의 김희수 원장이 상담부터 치료, 사후관리까지 직접 책임집니다.</p>
    <p>임플란트, 무삭제 라미네이트(루미네이트), 턱관절 치료는 물론 충치·신경·잇몸치료까지 — ${r.name}에서 믿을 수 있는 치과를 찾으신다면 편하게 전화 주세요.</p>
  </div>
  <div class="mt-10 flex flex-wrap gap-3">
    <a href="tel:${CLINIC.phone}" class="px-7 py-4 rounded-full bg-ink text-white font-extrabold hover:bg-navy-800 transition"><i class="fas fa-phone mr-2 text-gold-400"></i>${CLINIC.phone}</a>
    <a href="/location" class="px-7 py-4 rounded-full bg-white border border-ink/15 font-bold text-ink hover:bg-ink hover:text-white transition">오시는 길</a>
  </div>
</section>`
  return c.html(layout({ title: `${r.name} 치과 — 검단퍼스트치과`, desc: `${r.name} 치과 추천 — 검단퍼스트치과. ${r.desc} 임플란트·라미네이트·턱관절 치료, 과잉진료 없는 정직한 진료. ${CLINIC.phone}`, path: `/region/${r.slug}` }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

export default pages
