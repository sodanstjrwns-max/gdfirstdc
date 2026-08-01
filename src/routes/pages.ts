// 정적 페이지 라우트 — 홈, 병원소개, 진료과목, 내원안내, 지역페이지 (2026 리뉴얼)
import { Hono } from 'hono'
import { layout, esc, pageHero } from '../lib/layout'
import { CLINIC, DOCTOR, EQUIPMENT, STORIES } from '../data/clinic'
import { TREATMENTS, getTreatment } from '../data/treatments'
import { FAQS } from '../data/faqs'
import { SEO_REGIONS, REGION_GROUPS, type SeoRegion } from '../data/regions'
import { PRICING, fmtPrice, PRICING_UPDATED } from '../data/pricing'
import { getExtras } from '../data/treatment_extras'
import { interactiveSection } from '../lib/interactive'
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
  <video class="absolute inset-0 w-full h-full object-cover opacity-[0.38]" autoplay muted loop playsinline preload="metadata" poster="/static/images/hero_poster.webp" aria-hidden="true"><source src="/static/video/hero.mp4" type="video/mp4"></video>
  <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" aria-hidden="true"></div>
  <div class="aurora" aria-hidden="true"></div>
  <div class="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[760px] max-h-[760px] rounded-full bg-navy-600/30 blur-[140px]" aria-hidden="true"></div>
  <div class="absolute bottom-[-30%] left-[-15%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-gold-500/12 blur-[130px]" aria-hidden="true"></div>
  <div class="absolute inset-0 opacity-[0.05]" style="background-image:linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px);background-size:72px 72px" aria-hidden="true"></div>

  <div class="relative max-w-6xl mx-auto px-5 w-full pt-40 pb-16 sm:pb-20">
    <div class="flex items-center gap-3 mb-8">
      <span class="flex h-2.5 w-2.5 relative"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-60"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold-400"></span></span>
      <p class="text-white/50 text-[13px] font-semibold tracking-wide">인천 검단신도시 · 오늘 정상진료</p>
    </div>
    <h1 class="relative z-[2] text-[13vw] sm:text-7xl lg:text-[92px] font-extrabold tracking-tightest leading-[0.98]">
      <span data-split data-split-delay="0.55">치과는</span><br>
      <span data-split data-split-delay="0.72">정직이</span>
      <span class="hero-word"><span style="--d:.95s" class="text-shine text-3d font-disp">실력</span></span><span data-split data-split-delay="1.05">입니다.</span>
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
  <div class="absolute right-6 bottom-24 hidden lg:block z-[2]" aria-hidden="true"><div class="scroll-hint"><span>Scroll</span><span class="scroll-line"></span></div></div>
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

<!-- ===== AEO 핵심 요약 (speakable) ===== -->
<section id="clinic-summary" class="max-w-6xl mx-auto px-5 pb-14">
  <div class="reveal relative overflow-hidden rounded-[2rem] bg-ink text-white p-8 sm:p-12" data-tilt data-tilt-max="3">
    <div class="absolute -top-28 -right-24 w-96 h-96 rounded-full bg-gold-400/10 blur-3xl pointer-events-none" aria-hidden="true"></div>
    <div class="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-royal/25 blur-3xl pointer-events-none" aria-hidden="true"></div>
    <div class="absolute top-6 right-8 font-disp text-[120px] leading-none text-white/[0.04] select-none pointer-events-none hidden sm:block" aria-hidden="true">First</div>
    <p class="relative text-[11px] font-bold tracking-[0.3em] uppercase text-gold-400">At a Glance · 한눈에 보는 검단퍼스트치과</p>
    <p class="speakable-summary relative mt-5 max-w-4xl text-base sm:text-xl leading-[1.9] text-white/75">
      <strong class="text-white">검단퍼스트치과</strong>는 인천 검단신도시에서 가장 오래된 치과로, <strong class="text-white">보건복지부 인증 통합치의학 전문의 김희수 대표원장의 1인 책임진료</strong> 치과입니다. 임플란트·무삭제 라미네이트(루미네이트)·턱관절(체외충격파) 특화 진료를 하며, <span class="text-gold-400 font-bold">과잉진료 없이 꼭 필요한 치료만 권합니다.</span>
    </p>
    <div class="relative mt-8 flex flex-wrap gap-2.5 text-[13px]">
      <span class="inline-flex items-center gap-2 rounded-full bg-white/[0.07] border border-white/10 px-4 py-2.5 text-white/80"><i class="fas fa-location-dot text-gold-400"></i>${CLINIC.addressShort}</span>
      <span class="inline-flex items-center gap-2 rounded-full bg-white/[0.07] border border-white/10 px-4 py-2.5 text-white/80"><i class="fas fa-clock text-gold-400"></i>평일 09:30~18:30 · 토 09:30~14:00 <span class="text-white/45">(목·일 휴진)</span></span>
      <a href="tel:${CLINIC.phone}" class="inline-flex items-center gap-2 rounded-full bg-gold-500 hover:bg-gold-400 px-4 py-2.5 font-extrabold text-ink transition"><i class="fas fa-phone"></i>${CLINIC.phone}</a>
    </div>
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
        <h2 class="reveal mt-3 text-3xl sm:text-5xl font-extrabold tracking-tightest leading-[1.15]">아버지의 임플란트를<br><span class="font-disp text-shine">아들이 직접</span> 심었습니다.</h2>
        <p class="reveal mt-6 text-white/50 leading-relaxed max-w-lg text-[15px]">상악 9개, 하악 7개. 판교에서 검단까지 오가며 견딘 5개월 — "아빠가 고기를 너무 잘 드셔서 좋댄다"는 어머니의 전화 한 통. 김희수 원장은 모든 환자의 임플란트를 이 마음으로 심습니다.</p>
        <div class="reveal mt-8 flex flex-wrap gap-3">
          <a href="/about" class="px-7 py-3.5 rounded-full bg-white text-ink font-extrabold text-sm hover:bg-gold-400 transition">원장 이력 보기</a>
          <a href="/stories" class="px-7 py-3.5 rounded-full border border-white/25 font-bold text-sm hover:bg-white/10 transition">스토리 전문 읽기</a>
        </div>
      </div>
      <div class="reveal-scale">
        <div class="rounded-3xl bg-white/[0.06] border border-white/10 backdrop-blur overflow-hidden" data-tilt data-tilt-max="7">
          <div class="relative h-64 sm:h-80 overflow-hidden">
            <img src="/static/images/doctor_portrait.webp" alt="검단퍼스트치과 김희수 대표원장" class="w-full h-full object-cover object-top" width="1280" height="852" loading="lazy" decoding="async">
            <div class="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" aria-hidden="true"></div>
          </div>
          <div class="p-8 pt-6">
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
  </div>
</section>

<!-- ===== 언론 · 원내 투어 ===== -->
<section id="media-section" class="max-w-6xl mx-auto px-5 py-20 sm:py-24">
  <header class="mb-10">
    <p class="reveal text-gold-600 text-xs font-bold tracking-[0.3em] uppercase">Media & Clinic</p>
    <h2 class="reveal mt-2 text-3xl sm:text-5xl font-extrabold text-ink tracking-tightest">방송이 먼저<br class="sm:hidden"> 찾은 치과.</h2>
  </header>
  <div class="grid md:grid-cols-2 gap-4">
    <article class="bento reveal-scale rounded-3xl bg-white border border-ink/8 overflow-hidden flex flex-col">
      <div class="relative h-52 overflow-hidden">
        <img src="/static/images/doctor_study.webp" alt="수료증과 인증서 앞에서 임상 서적을 연구하는 김희수 원장" class="w-full h-full object-cover" loading="lazy" decoding="async">
      </div>
      <div class="p-7 flex-1 flex flex-col">
        <p class="text-gold-600 text-[11px] font-bold tracking-[0.25em] uppercase">Endless Study</p>
        <h3 class="mt-2 text-xl font-extrabold text-ink tracking-tight">벽면을 채운 수료증은<br>거들 뿐입니다.</h3>
        <p class="mt-3 text-[13.5px] text-ink/50 leading-relaxed flex-1">Harvard·NYU·서울대 — 12개가 넘는 연수·고급과정. 지금도 진료가 없는 시간엔 임상 서적을 폅니다.</p>
        <a href="/about" class="mt-4 inline-flex items-center gap-2 text-sm font-bold text-ink">원장 이력 전체 보기 <i class="fas fa-arrow-right text-xs"></i></a>
      </div>
    </article>
    <article class="bento reveal-scale rounded-3xl bg-ink text-white overflow-hidden flex flex-col">
      <div class="relative h-52 overflow-hidden">
        <img src="/static/images/news_article.webp" alt="메디컬투데이 — 검단퍼스트치과 김희수 원장 한국경제TV 건강매거진 출연 기사" class="w-full h-full object-cover object-top" width="340" height="1024" loading="lazy" decoding="async">
        <div class="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" aria-hidden="true"></div>
      </div>
      <div class="p-7 flex-1 flex flex-col">
        <p class="text-gold-400 text-[11px] font-bold tracking-[0.25em] uppercase">Press · TV</p>
        <h3 class="mt-2 text-xl font-extrabold tracking-tight">한국경제TV<br>「건강매거진」 출연</h3>
        <p class="mt-3 text-[13.5px] text-white/50 leading-relaxed flex-1">"부작용 줄이는 디지털 임플란트" — 김희수 원장이 생방송에서 임플란트 패러다임 변화를 소개하고 시청자 1:1 전화상담을 진행했습니다. (메디컬투데이 보도)</p>
        <a href="/about#media" class="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold-400">방송·언론 보기 <i class="fas fa-arrow-right text-xs"></i></a>
      </div>
    </article>
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

<!-- ===== 원내 갤러리 스트립 ===== -->
<section id="gallery-strip" class="max-w-6xl mx-auto px-5 pb-20">
  <a href="/about#clinic-gallery" class="group block">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" data-stagger>
      ${[
        { img: 'lobby_tmj', alt: '검단퍼스트치과 대기실과 턱관절센터', label: '대기실 · 턱관절센터' },
        { img: 'treatment_room', alt: '파티션으로 분리된 진료실', label: '프라이버시 진료실' },
        { img: 'consult_room', alt: '독립 1:1 상담실', label: '1:1 상담실' },
        { img: 'waiting_garden', alt: '정원 콘셉트 대기 공간', label: '가든 라운지' },
      ].map((g) => `
      <figure class="bento reveal-scale relative rounded-3xl overflow-hidden bg-ink min-h-[200px] sm:min-h-[240px]">
        <img src="/static/images/${g.img}.webp" alt="${g.alt}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" loading="lazy" decoding="async">
        <figcaption class="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-ink/80 to-transparent"><p class="text-white font-bold text-[13px]">${g.label}</p></figcaption>
      </figure>`).join('')}
    </div>
    <p class="mt-4 text-right text-sm font-bold text-ink/60 group-hover:text-gold-600 transition">실제 원내 모습 더 보기 <i class="fas fa-arrow-right text-xs"></i></p>
  </a>
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
${pageHero('About Us', '광고 대신,<br><span class="font-disp text-shine">진단</span>으로 승부합니다.', '검단신도시에서 가장 오래된 치과, 그 이름의 무게를 압니다.')}

<!-- ===== 대표원장 대형 포토 ===== -->
<section id="doctor-hero-photo" class="max-w-6xl mx-auto px-5 pt-14 sm:pt-16">
  <figure class="reveal-scale relative rounded-3xl overflow-hidden border border-ink/8 shadow-2xl shadow-ink/15">
    <img src="/static/images/doctor_lobby_hero.webp" alt="검단퍼스트치과 로비에서의 김희수 대표원장" class="w-full h-auto" width="1920" height="1278" fetchpriority="high" decoding="async">
    <figcaption class="absolute bottom-0 inset-x-0 p-6 sm:p-9 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent">
      <p class="text-gold-400 text-[10.5px] sm:text-xs font-bold tracking-[0.3em] uppercase">First Dental Clinic</p>
      <p class="mt-1.5 text-white font-extrabold text-xl sm:text-3xl tracking-tight">대표원장 ${DOCTOR.name}</p>
      <p class="mt-1 text-white/65 text-[12.5px] sm:text-sm">보건복지부 인증 통합치의학 전문의 · 대한치과보철학회 우수보철의사</p>
    </figcaption>
  </figure>
</section>

<section id="philosophy" class="max-w-6xl mx-auto px-5 py-20">
  <div class="grid lg:grid-cols-2 gap-10 items-start">
    <h2 class="reveal text-2xl sm:text-4xl font-extrabold text-ink tracking-tightest leading-[1.25] lg:sticky lg:top-28">"다른 병원도 다녀오세요.<br>그럼 저희의 가치를<br>더 느끼실 수 있습니다."</h2>
    <div class="space-y-5 text-ink/60 leading-[1.9] text-[15.5px]">
      <p class="reveal speakable-summary">검단퍼스트치과는 화려한 광고 대신 정직한 진단으로 승부합니다. 꼭 필요한 치료만 권해드리고, 하지 않아도 되는 치료는 하지 않아도 된다고 말씀드립니다.</p>
      <p class="reveal">상담한 원장이 직접 치료하고, 치료한 원장이 끝까지 관리하는 <strong class="text-ink">1인 대표원장 책임진료 시스템</strong>. 페이닥터 교체로 담당의가 바뀌는 일은 이곳에 없습니다.</p>
      <p class="reveal">그것이 검단에서 가장 오래 신뢰받아온 이유입니다.</p>
    </div>
  </div>
</section>

<!-- ===== 비전 · 핵심가치 · 슬로건 ===== -->
<section id="vision-values" class="max-w-6xl mx-auto px-5 pb-20">
  <div class="grid md:grid-cols-3 gap-4" data-stagger>
    <article class="bento reveal-scale rounded-3xl bg-ink text-white p-8 relative overflow-hidden" data-tilt data-tilt-max="5">
      <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold-500/15 blur-[60px]" aria-hidden="true"></div>
      <p class="text-gold-400 text-[11px] font-bold tracking-[0.3em] uppercase">Vision</p>
      <h3 class="mt-4 text-xl font-extrabold tracking-tight leading-snug">자연스러운 심미와<br>정밀한 진료로<br>오래 신뢰받는 치과</h3>
      <p class="mt-4 text-[13px] text-white/45 leading-relaxed">유행을 좇는 화려함이 아닌, 얼굴과 조화로운 자연스러움. 검단퍼스트치과가 바라보는 방향입니다.</p>
    </article>
    <article class="bento reveal-scale rounded-3xl bg-white border border-ink/8 p-8" data-tilt data-tilt-max="5">
      <p class="text-gold-600 text-[11px] font-bold tracking-[0.3em] uppercase">Core Value</p>
      <h3 class="mt-4 text-xl font-extrabold text-ink tracking-tight leading-snug">사람에 대한<br>진심과 배려</h3>
      <p class="mt-4 text-[13px] text-ink/50 leading-relaxed">최고의 진료뿐 아니라 최상의 만족을 위해, 환자분의 불편감을 최대한 없애드리는 것 — 저희가 해드릴 수 있는 최고의 배려입니다.</p>
    </article>
    <article class="bento reveal-scale rounded-3xl bg-white border border-ink/8 p-8" data-tilt data-tilt-max="5">
      <p class="text-gold-600 text-[11px] font-bold tracking-[0.3em] uppercase">Slogan</p>
      <h3 class="mt-4 text-xl font-extrabold text-ink tracking-tight leading-snug">미소에 자신감을 더하는,<br>가장 편안한 진료</h3>
      <p class="mt-4 text-[13px] text-ink/50 leading-relaxed">미소에 자신감을 더하는 가장 편안한 진료를 제공합니다. 검단퍼스트치과가 모든 환자분께 드리는 약속입니다.</p>
    </article>
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
    <div class="grid lg:grid-cols-2 gap-4 mb-10 items-stretch">
      <blockquote class="reveal-scale rounded-3xl bg-white/[0.06] border border-white/10 p-8" data-tilt data-tilt-max="6">
        <i class="fas fa-quote-left text-gold-400 text-xl"></i>
        <p class="mt-3 text-white/75 leading-[1.9] text-[15.5px]">${DOCTOR.philosophy}</p>
      </blockquote>
      <figure class="reveal-scale rounded-3xl overflow-hidden bg-black relative min-h-[320px] sm:min-h-[400px]">
        <video class="absolute inset-0 w-full h-full object-cover" data-lazy muted loop playsinline preload="none" aria-label="확대경을 착용하고 진료에 집중하는 김희수 원장"><source data-src="/static/video/doctor.mp4" type="video/mp4"></video>
        <figcaption class="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-ink/90 to-transparent">
          <p class="text-gold-400 text-[10.5px] font-bold tracking-[0.25em] uppercase">In Treatment</p>
          <p class="mt-1 text-white font-extrabold text-[15px]">진료 중인 김희수 원장</p>
        </figcaption>
      </figure>
    </div>
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

<!-- ===== 원내 투어 영상 (풀와이드 시네마틱) ===== -->
<section id="clinic-tour" class="max-w-6xl mx-auto px-5 py-20">
  <header class="mb-8">
    <p class="reveal text-gold-600 text-xs font-bold tracking-[0.3em] uppercase">Clinic Tour</p>
    <h2 class="reveal mt-2 text-3xl sm:text-5xl font-extrabold text-ink tracking-tightest">오시기 전에,<br class="sm:hidden"> 미리 둘러보세요.</h2>
    <p class="reveal mt-4 text-ink/45 text-[15px]">긴장을 덜어드리는 공간 설계 — 실제 원내 모습 그대로입니다.</p>
  </header>
  <div class="grid lg:grid-cols-[minmax(0,440px)_1fr] gap-8 items-center">
    <figure class="reveal-scale rounded-3xl overflow-hidden bg-ink relative aspect-[9/16] w-full max-w-[440px] mx-auto shadow-2xl shadow-ink/15">
      <video class="absolute inset-0 w-full h-full object-cover" data-lazy muted loop playsinline preload="none" poster="/static/images/tour_poster.webp" aria-label="검단퍼스트치과 원내 소개 영상"><source data-src="/static/video/clinic_tour.mp4" type="video/mp4"></video>
      <figcaption class="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent">
        <p class="text-gold-400 text-[10.5px] font-bold tracking-[0.3em] uppercase">Inside First Dental Clinic</p>
        <p class="mt-1 text-white font-extrabold text-lg tracking-tight">검단퍼스트치과 원내 둘러보기</p>
      </figcaption>
    </figure>
    <div class="space-y-5">
      <div class="grid sm:grid-cols-2 gap-3" data-stagger>
        ${[
          { icon: 'fa-couch', title: '넓은 대기실', desc: '긴장을 덜어드리는 여유로운 대기 공간과 턱관절센터' },
          { icon: 'fa-comments', title: '독립 상담실', desc: '다른 환자분 눈치 없이 편하게 묻고 답하는 공간' },
          { icon: 'fa-tooth', title: '진료실', desc: '프라이버시를 지키는 파티션형 진료 공간' },
          { icon: 'fa-shield-halved', title: '소독 · 멸균 시스템', desc: '보이지 않는 곳까지 관리하는 감염관리 체계' },
        ].map((g) => `
        <article class="rounded-2xl bg-white border border-ink/8 p-5">
          <span class="w-10 h-10 rounded-xl bg-ink/[0.04] text-ink flex items-center justify-center"><i class="fas ${g.icon}"></i></span>
          <h3 class="mt-3 font-extrabold text-ink text-[14.5px]">${g.title}</h3>
          <p class="mt-1.5 text-[12.5px] text-ink/50 leading-relaxed">${g.desc}</p>
        </article>`).join('')}
      </div>
      <a href="#clinic-gallery" class="reveal inline-flex items-center gap-2 text-sm font-bold text-ink border-b border-gold-500 hover:text-gold-600 transition">원내 사진 갤러리 바로가기 <i class="fas fa-arrow-down text-xs"></i></a>
    </div>
  </div>
</section>

<section id="media" class="max-w-6xl mx-auto px-5 pb-20">
  <header class="mb-10">
    <p class="reveal text-gold-600 text-xs font-bold tracking-[0.3em] uppercase">Press &amp; Broadcast</p>
    <h2 class="reveal mt-2 text-3xl sm:text-4xl font-extrabold text-ink tracking-tightest">방송 · 언론보도</h2>
  </header>
  <figure class="reveal-scale rounded-3xl overflow-hidden bg-black border border-ink/8 shadow-2xl shadow-ink/15 mb-6">
    <video class="w-full h-auto aspect-video" controls preload="none" poster="/static/images/broadcast_poster.webp" aria-label="한국경제TV 건강매거진 — 김희수 원장 임플란트 구조와 식립 과정 설명 하이라이트">
      <source src="/static/video/broadcast_clip.mp4" type="video/mp4">
    </video>
    <figcaption class="bg-ink px-6 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-gold-400 text-[10.5px] font-bold tracking-[0.25em] uppercase">On Air Highlight</p>
        <p class="mt-1 text-white font-extrabold text-[15px] sm:text-base">김희수 원장이 직접 설명하는 임플란트 구조와 식립 과정 (1분 49초)</p>
      </div>
      <p class="text-white/35 text-[11px]">영상 출처: 한국경제TV 「건강매거진」</p>
    </figcaption>
  </figure>
  <article class="bento reveal-scale rounded-3xl bg-white border border-ink/8 overflow-hidden flex flex-col sm:flex-row">
    <img src="/static/images/news_article.webp" alt="메디컬투데이 기사 — 검단퍼스트치과 김희수 원장 건강매거진 출연" class="sm:w-56 h-56 sm:h-auto object-cover object-top shrink-0" loading="lazy" decoding="async">
    <div class="p-7 sm:p-9">
      <p class="text-[11px] font-bold text-gold-600 tracking-[0.2em] uppercase">메디컬투데이 · 2022.05</p>
      <h3 class="mt-2 font-extrabold text-ink text-lg sm:text-xl leading-snug">김희수 원장, 한국경제TV 「건강매거진」 출연 — 임플란트 패러다임 변화 소개</h3>
      <p class="mt-3 text-[13.5px] text-ink/50 leading-relaxed">생방송으로 진행된 방송에서 3D 컴퓨터 기술을 적용한 환자 맞춤형 디지털 임플란트를 설명하고, 시청자 1:1 전화상담을 진행했습니다. 고혈압·당뇨 등 전신질환 환자와 고령 환자도 편안하고 정확하게 시술받을 수 있다고 소개했습니다.</p>
    </div>
  </article>
</section>

<section id="clinic-gallery" class="max-w-6xl mx-auto px-5 py-20">
  <header class="mb-10">
    <p class="reveal text-gold-600 text-xs font-bold tracking-[0.3em] uppercase">Inside the Clinic</p>
    <h2 class="reveal mt-2 text-3xl sm:text-4xl font-extrabold text-ink tracking-tightest">공간에도<br class="sm:hidden"> 진심을 담았습니다.</h2>
    <p class="reveal mt-4 text-ink/45 text-[15px]">긴장을 덜어드리는 공간 설계 — 실제 원내 모습 그대로입니다.</p>
  </header>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3" data-stagger>
    <figure class="bento reveal-scale col-span-2 rounded-3xl overflow-hidden bg-ink relative min-h-[280px] lg:min-h-[340px]">
      <img src="/static/images/lobby_tmj.webp" alt="검단퍼스트치과 대기실과 턱관절센터 입구" class="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async">
      <figcaption class="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-ink/85 to-transparent">
        <p class="text-gold-400 text-[10px] font-bold tracking-[0.25em] uppercase">Lobby · TMJ Center</p>
        <p class="mt-1 text-white font-extrabold">넓은 대기실과 턱관절센터</p>
      </figcaption>
    </figure>
    <figure class="bento reveal-scale rounded-3xl overflow-hidden bg-ink relative min-h-[280px] lg:min-h-[340px]">
      <img src="/static/images/waiting_garden.webp" alt="검단퍼스트치과 정원 콘셉트 대기 공간" class="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async">
      <figcaption class="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-ink/85 to-transparent">
        <p class="text-gold-400 text-[10px] font-bold tracking-[0.25em] uppercase">Waiting</p>
        <p class="mt-1 text-white font-extrabold text-[14px]">정원처럼, 편안하게</p>
      </figcaption>
    </figure>
    <figure class="bento reveal-scale rounded-3xl overflow-hidden bg-ink relative min-h-[280px] lg:min-h-[340px]">
      <img src="/static/images/treatment_room.webp" alt="검단퍼스트치과 파티션으로 분리된 진료실" class="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async">
      <figcaption class="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-ink/85 to-transparent">
        <p class="text-gold-400 text-[10px] font-bold tracking-[0.25em] uppercase">Treatment</p>
        <p class="mt-1 text-white font-extrabold text-[14px]">프라이버시 진료 공간</p>
      </figcaption>
    </figure>
    <figure class="bento reveal-scale rounded-3xl overflow-hidden bg-ink relative min-h-[240px]">
      <img src="/static/images/consult_room.webp" alt="검단퍼스트치과 독립 상담실" class="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async">
      <figcaption class="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-ink/85 to-transparent">
        <p class="text-gold-400 text-[10px] font-bold tracking-[0.25em] uppercase">Consulting</p>
        <p class="mt-1 text-white font-extrabold text-[14px]">차분한 1:1 상담실</p>
      </figcaption>
    </figure>
    <figure class="bento reveal-scale rounded-3xl overflow-hidden bg-ink relative min-h-[240px]">
      <img src="/static/images/interior_curve.webp" alt="검단퍼스트치과 곡선 유리 인테리어" class="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async">
      <figcaption class="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-ink/85 to-transparent">
        <p class="text-gold-400 text-[10px] font-bold tracking-[0.25em] uppercase">Interior</p>
        <p class="mt-1 text-white font-extrabold text-[14px]">부드러운 동선 설계</p>
      </figcaption>
    </figure>
    <figure class="bento reveal-scale col-span-2 rounded-3xl overflow-hidden bg-ink relative min-h-[240px]">
      <img src="/static/images/entrance.webp" alt="검단퍼스트치과 입구 전경" class="absolute inset-0 w-full h-full object-cover object-center" loading="lazy" decoding="async">
      <figcaption class="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-ink/85 to-transparent">
        <p class="text-gold-400 text-[10px] font-bold tracking-[0.25em] uppercase">Entrance · 3F</p>
        <p class="mt-1 text-white font-extrabold">검단퍼스트프라자 3층, 이 문으로 들어오세요</p>
      </figcaption>
    </figure>
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
  const doctorLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${CLINIC.siteUrl}/about#doctor`,
    name: DOCTOR.name,
    jobTitle: '대표원장 · 보건복지부 인증 통합치의학 전문의',
    worksFor: { '@id': `${CLINIC.siteUrl}/#clinic` },
    image: `${CLINIC.siteUrl}/static/images/doctor_lobby.webp`,
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: '경희대학교 치의학전문대학원' },
      { '@type': 'CollegeOrUniversity', name: '가톨릭대학교 부천성모병원 통합치의학과 (레지던트)' },
    ],
    hasCredential: [
      { '@type': 'EducationalOccupationalCredential', name: '보건복지부 인증 통합치의학 전문의' },
      { '@type': 'EducationalOccupationalCredential', name: '대한치과보철학회 인증 우수보철의사' },
      { '@type': 'EducationalOccupationalCredential', name: 'Harvard School of Dental Medicine Implant Dentistry CE' },
      { '@type': 'EducationalOccupationalCredential', name: 'NYU Non-prep Veneer(무삭제 라미네이트) 고급과정' },
    ],
    memberOf: DOCTOR.memberships.slice(0, 7).map((m) => ({ '@type': 'Organization', name: m })),
    knowsAbout: ['임플란트', '무삭제 라미네이트', '턱관절 치료', '체외충격파', '미세현미경 신경치료', '심미보철'],
  }
  return c.html(layout({ title: '병원소개 — 통합치의학 전문의 1인 책임진료', desc: `검단퍼스트치과 소개 — 통합치의학 전문의 김희수 대표원장, 1인 책임진료, ZEISS 미세현미경·체외충격파·페이스스캐너 등 첨단장비.`, path: '/about', jsonLd: [doctorLd] }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 진료과목 목록 ============
pages.get('/treatments', (c) => {
  const body = `
${pageHero('Treatments', '필요한 치료만,<br><span class="font-disp text-shine">정직하게.</span>', '10개 진료과목 — 무엇이 필요한지, 무엇이 필요 없는지부터 말씀드립니다.')}
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
  return c.html(layout({ title: '진료과목 — 임플란트·라미네이트·턱관절 치료', desc: '검단퍼스트치과 진료과목 — 임플란트, 루미네이트(라미네이트), 턱관절치료, 심미보철, 신경치료, 충치치료, 잇몸치료, 보철, 사랑니 발치, 치과 보톡스.', path: '/treatments' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 방송 클립 (한국경제TV 건강매거진 — 김희수 원장 출연분) ============
const TV_CLIPS: Record<string, { file: string; q: string; a: string; dur: string }[]> = {
  gum: [
    { file: 'tv_gum_perio', q: '치주질환이 감기처럼 흔하다던데, 왜 치아 건강을 망치나요?', a: '치은염과 치주염의 차이, 스케일링으로 예방 가능한 단계와 이미 뼈가 녹기 시작한 단계를 엑스레이로 구분해 설명합니다.', dur: '2:34' },
    { file: 'tv_gum_extract_qa', q: '치주염으로 발치하라는데 별로 안 아파요. 꼭 빼야 하나요?', a: '"아프고 안 아프고보다 뼈를 얼마나 녹이고 있느냐가 중요합니다" — 시청자 전화 사연에 대한 원장의 답변입니다.', dur: '2:15' },
  ],
  prosthetics: [
    { file: 'tv_prosth_compare', q: '틀니, 브릿지, 임플란트 — 뭐가 어떻게 다른가요?', a: '가철성 틀니의 한계, 양옆 치아를 깎는 브릿지의 부담, 그리고 각 치료의 수명과 특징을 비교해 설명합니다.', dur: '1:37' },
  ],
  implant: [
    { file: 'tv_implant_chronic', q: '당뇨·고혈압·심장질환이 있어도 임플란트 할 수 있나요?', a: '만성질환별 주의점 — 혈당 조절, 아스피린 복용, 골다공증 약물까지. 내과 협진이 필요한 경우를 짚어드립니다.', dur: '2:55' },
    { file: 'tv_implant_immediate', q: '임플란트 치료, 좀 빨리 끝낼 수 있나요?', a: '뼈 상태가 좋다면 발치 즉시 식립으로 3~6개월의 치료 기간을 단축할 수 있는 원리를 설명합니다.', dur: '1:01' },
    { file: 'tv_implant_care', q: '임플란트는 치료보다 관리가 더 중요하다던데요?', a: '치주인대가 없는 임플란트가 염증에 취약한 이유, 정기검진 주기(1개월→6개월→연 1회)와 치간칫솔·워터픽 관리법.', dur: '1:50' },
  ],
}

const tvSection = (slug: string): string => {
  const clips = TV_CLIPS[slug]
  if (!clips?.length) return ''
  return `
<!-- 방송에서 답하다 -->
<section id="tv-qna" class="bg-ink text-white py-16 sm:py-20 relative overflow-hidden mt-14">
  <div class="absolute -top-24 left-1/4 w-[460px] h-[460px] rounded-full bg-navy-600/20 blur-[130px]" aria-hidden="true"></div>
  <div class="max-w-5xl mx-auto px-5 relative">
    <header class="mb-10">
      <p class="reveal text-gold-400 text-xs font-bold tracking-[0.3em] uppercase"><i class="fas fa-tv mr-2" aria-hidden="true"></i>On Air — 방송에서 답하다</p>
      <h2 class="reveal mt-2 text-2xl sm:text-4xl font-extrabold tracking-tightest">한국경제TV 「건강매거진」,<br class="sm:hidden"> 김희수 원장의 답변</h2>
      <p class="reveal mt-3 text-white/45 text-[14px]">생방송에서 실제 시청자들이 물었던 질문 — 원장이 직접 답한 그대로 보여드립니다.</p>
    </header>
    <div class="grid ${clips.length > 1 ? 'md:grid-cols-2' : ''} gap-5" data-stagger>
      ${clips.map((cl) => `
      <article class="reveal-scale rounded-3xl bg-white/[0.05] border border-white/10 overflow-hidden flex flex-col">
        <div class="relative">
          <video class="w-full h-auto aspect-video bg-black" controls preload="none" poster="/static/images/${cl.file}.webp" aria-label="${esc(cl.q)}">
            <source src="/static/video/${cl.file}.mp4" type="video/mp4">
          </video>
          <span class="absolute top-3 right-3 rounded-full bg-ink/80 text-white/85 text-[11px] font-bold px-2.5 py-1 pointer-events-none"><i class="far fa-clock mr-1"></i>${cl.dur}</span>
        </div>
        <div class="p-6 sm:p-7 flex-1 flex flex-col">
          <h3 class="font-extrabold text-white text-[16px] leading-snug"><span class="text-gold-400 font-mono mr-1.5">Q.</span>${esc(cl.q)}</h3>
          <p class="mt-3 text-[13.5px] text-white/50 leading-relaxed flex-1">${esc(cl.a)}</p>
        </div>
      </article>`).join('')}
    </div>
    <p class="mt-7 text-[11.5px] text-white/30 leading-relaxed">영상 출처: 한국경제TV 「건강매거진」 (김희수 원장 출연분) · 방송 내용은 일반적인 의학 정보이며, 치료 방법과 결과는 개인의 구강 상태에 따라 달라질 수 있습니다. 정확한 진단은 내원 상담을 통해 받으시기 바랍니다.</p>
  </div>
</section>`
}

// ============ 진료과목 상세 ============
pages.get('/treatments/:slug', async (c) => {
  const t = getTreatment(c.req.param('slug'))
  if (!t) return c.notFound()
  const faqs = FAQS[t.slug] || []
  const ex = getExtras(t.slug)
  const related = TREATMENTS.filter((x) => x.slug !== t.slug).slice(0, 4)

  // 관련 치료사례·칼럼 (D1, 실패해도 페이지는 동작)
  let relCases: { id: number; title: string; thumb: string | null }[] = []
  let relPosts: { slug: string; title: string; excerpt: string | null }[] = []
  try {
    const [cs, ps] = await Promise.all([
      c.env.DB.prepare('SELECT id, title, COALESCE(intra_after_key, pano_after_key, intra_before_key, pano_before_key) AS thumb FROM before_after WHERE published = 1 AND category = ? ORDER BY created_at DESC LIMIT 3').bind(t.slug).all<{ id: number; title: string; thumb: string | null }>(),
      c.env.DB.prepare('SELECT slug, title, excerpt FROM blog_posts WHERE published = 1 AND category = ? ORDER BY created_at DESC LIMIT 3').bind(t.slug).all<{ slug: string; title: string; excerpt: string | null }>(),
    ])
    relCases = cs.results
    relPosts = ps.results
  } catch { /* D1 미연결 환경 대비 */ }

  // 수가 모듈: extras의 priceRefs 기준으로 pricing.ts에서 자동 추출
  const priceRows: { name: string; price: number; note?: string }[] = []
  if (ex) {
    for (const ref of ex.priceRefs) {
      const cat = PRICING.find((p) => p.key === ref.category)
      if (!cat) continue
      let items = cat.items.filter((i) => i.price > 0)
      if (ref.include) items = items.filter((i) => ref.include!.some((k) => i.name.includes(k)))
      priceRows.push(...items.slice(0, ref.limit ?? 8))
    }
  }
  const priceView = priceRows.slice(0, 10)

  // JSON-LD: FAQ + MedicalProcedure
  const jsonLd: object[] = []
  if (faqs.length) jsonLd.push({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  })
  jsonLd.push({
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    '@id': `${CLINIC.siteUrl}/treatments/${t.slug}#procedure`,
    name: t.name,
    alternateName: t.nameEn,
    description: t.metaDesc,
    procedureType: 'https://schema.org/NoninvasiveProcedure',
    bodyLocation: ex?.bodyLocation,
    howPerformed: ex ? ex.timeline.map((s, i) => `${i + 1}. ${s.title}: ${s.desc}`).join(' ') : undefined,
    followup: '정기검진을 통한 유지관리',
    provider: { '@id': `${CLINIC.siteUrl}/#clinic` },
  })

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
        <p class="reveal mt-3 text-gold-400 font-disp text-lg">${esc(t.tagline)}</p>
      </div>
      <span class="reveal-scale hidden sm:flex w-20 h-20 rounded-3xl bg-white/[0.06] border border-white/10 items-center justify-center text-3xl text-gold-400" data-tilt data-tilt-max="16"><i class="fas ${t.icon}"></i></span>
    </div>
    <p class="reveal speakable-summary mt-7 text-white/50 leading-relaxed max-w-2xl text-[15px]">${esc(t.heroDesc)}</p>
  </div>
</section>

${ex ? `
<!-- 이런 분께 필요합니다 (증상 체크리스트) -->
<section id="symptom-check" class="max-w-6xl mx-auto px-5 -mt-8 relative z-[3]">
  <div class="rounded-3xl bg-white border border-ink/8 shadow-xl shadow-ink/5 p-7 sm:p-9">
    <header class="flex flex-wrap items-baseline justify-between gap-3 mb-6">
      <h2 class="text-xl sm:text-2xl font-extrabold text-ink tracking-tight"><i class="fas fa-clipboard-check text-gold-600 mr-2"></i>이런 분께 필요한 치료입니다</h2>
      <p class="text-[12.5px] text-ink/40 font-semibold">해당되는 항목을 직접 눌러 체크해 보세요</p>
    </header>
    <div data-selfcheck data-t0="해당되는 항목을 눌러 체크해 보세요." data-t1="해당 증상이 있으시군요. 편하게 검진 상담을 받아보시는 것을 권해드립니다." data-t3="여러 항목이 해당됩니다. 가까운 시일 내에 검진을 받아보시길 권해드립니다.">
      <ul class="grid sm:grid-cols-2 gap-2.5" data-stagger>
        ${ex.checklist.map((item) => `
        <li class="sc-item flex items-start gap-3 rounded-2xl bg-cream border border-ink/5 px-5 py-4" role="checkbox" aria-checked="false" tabindex="0">
          <span class="sc-box" aria-hidden="true"></span>
          <span class="sc-txt text-[14px] text-ink/75 font-medium leading-snug">${esc(item)}</span>
        </li>`).join('')}
      </ul>
      <footer class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink/[0.03] border border-ink/8 px-5 py-3.5" aria-live="polite">
        <p class="text-[13px] font-bold text-ink/70">체크한 항목 <span class="text-royal text-lg font-extrabold" data-sc-count>0</span>개</p>
        <p class="text-[12.5px] text-ink/50 font-medium" data-sc-msg>해당되는 항목을 눌러 체크해 보세요.</p>
      </footer>
    </div>
  </div>
</section>

<!-- 원장 한마디 -->
<section id="doctor-note" class="max-w-3xl mx-auto px-5 pt-14">
  <figure class="reveal rounded-3xl bg-ink text-white p-7 sm:p-9 relative overflow-hidden" data-tilt data-tilt-max="3">
    <div class="absolute -top-14 -right-14 w-52 h-52 rounded-full bg-gold-500/12 blur-[70px]" aria-hidden="true"></div>
    <i class="fas fa-quote-left text-gold-500/40 text-3xl" aria-hidden="true"></i>
    <blockquote class="mt-4 text-[15px] sm:text-[15.5px] leading-[1.95] text-white/80">${esc(ex.doctorNote)}</blockquote>
    <figcaption class="mt-6 flex items-center gap-3.5">
      <img src="/static/images/doctor_lobby.webp" alt="김희수 대표원장" class="w-12 h-12 rounded-full object-cover border-2 border-gold-500/50" width="48" height="48" loading="lazy" decoding="async">
      <div>
        <p class="font-extrabold text-white text-sm">김희수 대표원장</p>
        <p class="text-[11.5px] text-gold-400">보건복지부 인증 통합치의학 전문의</p>
      </div>
    </figcaption>
  </figure>
</section>` : ''}

${tvSection(t.slug)}

${interactiveSection(t.slug)}

<article class="max-w-3xl mx-auto px-5 py-14 prose-clinic">
  ${t.sections.map((s) => `
  <h2>${esc(s.h2)}</h2>
  ${s.body.map((p) => `<p>${esc(p)}</p>`).join('')}
  ${s.list ? `<ul>${s.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}
  `).join('')}
</article>

${ex?.crossLinks?.length ? `
<!-- 과목 간 문맥 연결 -->
<aside id="cross-links" class="max-w-3xl mx-auto px-5 pb-4">
  <div class="rounded-2xl border border-gold-200 bg-gold-50/50 p-6 sm:p-7">
    <h2 class="text-[13px] font-bold text-gold-700 tracking-[0.2em] uppercase"><i class="fas fa-link mr-2" aria-hidden="true"></i>함께 보면 좋은 진료</h2>
    <ul class="mt-4 space-y-3">
      ${ex.crossLinks.map((cl) => {
        const ct = getTreatment(cl.slug)
        return ct ? `<li class="text-[14.5px] text-ink/65 leading-relaxed">${esc(cl.text)} <a href="/treatments/${ct.slug}" class="font-bold text-royal hover:underline whitespace-nowrap">${ct.name} 보기 →</a></li>` : ''
      }).join('')}
    </ul>
  </div>
</aside>` : ''}

${ex ? `
<!-- 치료 과정 타임라인 -->
<section id="treatment-timeline" class="bg-ink text-white py-16 sm:py-20 relative overflow-hidden">
  <div class="absolute -top-24 right-0 w-[420px] h-[420px] rounded-full bg-navy-600/20 blur-[120px]" aria-hidden="true"></div>
  <div class="max-w-5xl mx-auto px-5 relative">
    <header class="mb-10">
      <p class="reveal text-gold-400 text-xs font-bold tracking-[0.3em] uppercase">Process</p>
      <h2 class="reveal mt-2 text-2xl sm:text-4xl font-extrabold tracking-tightest">${t.name}, 이렇게 진행됩니다</h2>
    </header>
    <ol class="grid sm:grid-cols-2 lg:grid-cols-${Math.min(ex.timeline.length, 5)} gap-3" data-stagger>
      ${ex.timeline.map((s, i) => `
      <li class="rounded-3xl bg-white/[0.05] border border-white/10 p-6 flex flex-col" data-tilt data-tilt-max="5">
        <span class="text-gold-400 font-mono text-xs font-bold">STEP ${i + 1}</span>
        <h3 class="mt-2.5 font-extrabold text-white text-[15.5px] tracking-tight">${esc(s.title)}</h3>
        <p class="mt-2 text-[12.5px] text-white/45 leading-relaxed flex-1">${esc(s.desc)}</p>
        ${s.duration ? `<p class="mt-3.5 pt-3 border-t border-white/10 text-[11.5px] font-bold text-gold-400/90"><i class="far fa-clock mr-1.5"></i>${esc(s.duration)}</p>` : ''}
      </li>`).join('')}
    </ol>
  </div>
</section>

${ex.compare ? `
<!-- 비교표 -->
<section id="treatment-compare" class="max-w-5xl mx-auto px-5 py-16">
  <header class="mb-7">
    <p class="reveal text-gold-600 text-xs font-bold tracking-[0.3em] uppercase">Compare</p>
    <h2 class="reveal mt-2 text-2xl sm:text-3xl font-extrabold text-ink tracking-tightest">${esc(ex.compare.title)}</h2>
  </header>
  <div class="reveal rounded-3xl bg-white border border-ink/8 overflow-hidden overflow-x-auto">
    <table class="w-full min-w-[560px] text-[13.5px]">
      <thead>
        <tr class="bg-ink text-white">
          <th class="text-left px-5 py-4 font-bold text-white/60 text-[12px] uppercase tracking-wider">항목</th>
          ${ex.compare.headers.map((h, i) => `<th class="text-left px-5 py-4 font-extrabold ${i === 0 ? 'text-gold-400' : ''}">${esc(h)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${ex.compare.rows.map((r, ri) => `
        <tr class="${ri % 2 ? 'bg-cream/60' : ''} border-t border-ink/5">
          <th class="text-left px-5 py-3.5 font-bold text-ink/60 text-[12.5px]">${esc(r.label)}</th>
          ${r.cols.map((cell, ci) => `<td class="px-5 py-3.5 ${ci === 0 ? 'font-bold text-ink' : 'text-ink/60'}">${esc(cell)}</td>`).join('')}
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
  ${ex.compare.note ? `<p class="mt-3.5 text-[12.5px] text-ink/40 flex items-start gap-2"><i class="fas fa-circle-info mt-0.5 text-gold-600"></i>${esc(ex.compare.note)}</p>` : ''}
</section>` : ''}

${priceView.length ? `
<!-- 비용 투명 공개 -->
<section id="treatment-pricing" class="max-w-5xl mx-auto px-5 pb-16 ${ex.compare ? '' : 'pt-16'}">
  <div class="rounded-3xl bg-white border border-ink/8 p-7 sm:p-9">
    <header class="flex flex-wrap items-baseline justify-between gap-3 mb-6">
      <div>
        <p class="text-gold-600 text-xs font-bold tracking-[0.3em] uppercase">Pricing</p>
        <h2 class="mt-2 text-xl sm:text-2xl font-extrabold text-ink tracking-tight">${t.name} 비용, 숨기지 않습니다</h2>
      </div>
      <p class="text-[11.5px] text-ink/35">의료법 제45조 비급여 진료비용 고지 · ${PRICING_UPDATED} 기준</p>
    </header>
    <ul class="grid sm:grid-cols-2 gap-x-8 gap-y-1">
      ${priceView.map((p) => `
      <li class="flex items-baseline justify-between gap-4 py-2.5 border-b border-ink/5">
        <span class="text-[13.5px] text-ink/65 font-medium">${esc(p.name)}${p.note ? ` <em class="not-italic text-[11px] text-ink/30">(${esc(p.note)})</em>` : ''}</span>
        <span class="font-extrabold text-ink text-[14px] whitespace-nowrap">${fmtPrice(p.price)}</span>
      </li>`).join('')}
    </ul>
    <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p class="text-[12px] text-ink/40">개인 구강 상태에 따라 달라질 수 있으며, 정밀진단 후 정확히 안내드립니다.</p>
      <a href="/pricing" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-white text-[13px] font-bold hover:bg-navy-800 transition">전체 수가표 보기 <i class="fas fa-arrow-right text-[10px]"></i></a>
    </div>
  </div>
</section>` : ''}
` : ''}

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
</section>

${relCases.length || relPosts.length ? `
<!-- 관련 실제 콘텐츠 -->
<section id="related-content" class="max-w-6xl mx-auto px-5 pb-20">
  <header class="mb-7">
    <p class="reveal text-gold-600 text-xs font-bold tracking-[0.3em] uppercase">Real Stories</p>
    <h2 class="reveal mt-2 text-2xl sm:text-3xl font-extrabold text-ink tracking-tightest">${t.name}, 실제 기록</h2>
  </header>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-stagger>
    ${relCases.map((r) => `
    <a href="/cases/${r.id}" class="bento group block rounded-3xl bg-white border border-ink/8 overflow-hidden">
      <div class="aspect-[16/9] bg-ink/[0.03] overflow-hidden flex items-center justify-center">
        ${r.thumb ? `<img src="/images/${r.thumb}" alt="${esc(r.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async">` : '<i class="fas fa-tooth text-4xl text-ink/10"></i>'}
      </div>
      <div class="p-5">
        <span class="text-[10.5px] font-extrabold tracking-widest text-gold-600 uppercase">치료사례</span>
        <h3 class="mt-1.5 font-extrabold text-ink text-[14.5px] leading-snug line-clamp-2">${esc(r.title)}</h3>
      </div>
    </a>`).join('')}
    ${relPosts.map((p) => `
    <a href="/blog/${esc(p.slug)}" class="bento group block rounded-3xl bg-ink text-white p-6 flex flex-col min-h-[180px]">
      <span class="text-[10.5px] font-extrabold tracking-widest text-gold-400 uppercase">원장 칼럼</span>
      <h3 class="mt-2.5 font-extrabold text-[15.5px] leading-snug line-clamp-2">${esc(p.title)}</h3>
      ${p.excerpt ? `<p class="mt-2.5 text-[12.5px] text-white/45 leading-relaxed line-clamp-2 flex-1">${esc(p.excerpt)}</p>` : ''}
      <p class="mt-4 text-[12.5px] font-bold text-gold-400">읽어보기 <i class="fas fa-arrow-right ml-1 text-[10px] group-hover:translate-x-1 transition-transform"></i></p>
    </a>`).join('')}
  </div>
</section>` : ''}

<!-- 지역 키워드 칩 (내부링크) -->
<nav id="region-chips" class="max-w-6xl mx-auto px-5 pb-20" aria-label="지역별 ${t.name} 안내">
  <p class="text-[11px] font-bold tracking-[0.25em] uppercase text-ink/30 mb-3">지역별 안내 — ${t.name}</p>
  <p class="flex flex-wrap gap-x-1.5 gap-y-2 text-[12.5px] leading-none">
    ${SEO_REGIONS.slice(0, 12).map((r) => `<a href="/region/${r.slug}" class="px-3.5 py-2 rounded-full bg-white border border-ink/8 text-ink/50 hover:text-ink hover:border-ink/25 transition whitespace-nowrap">${r.name} ${t.name.replace(/ LumiNate$/, '')}</a>`).join('')}
  </p>
</nav>

<script src="/static/treatment.js" defer></script>`
  return c.html(layout({ title: `${t.name} — 인천 검단신도시 치과`, desc: t.metaDesc, path: `/treatments/${t.slug}`, jsonLd }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 치료스토리 (매거진 챕터형) ============
const STORY_META: Record<string, { chapterEn: string; lead: string; quote: string; quoteBy: string; facts: { label: string; value: string }[] }> = {
  father: {
    chapterEn: 'The Father',
    lead: '평생 아프다는 말 한마디 없던 아버지가, 밥을 안 드시기 시작했습니다.',
    quote: '야, 아빠가 고기를 너무 잘 드셔서 너무 좋댄다. 그동안 빠졌던 살도 금방 다시 올라오겠다. 고생했다.',
    quoteBy: '보철물을 올린 날 저녁, 어머니의 전화',
    facts: [
      { label: '임플란트', value: '상악 9 · 하악 7' },
      { label: '치료 여정', value: '판교 ↔ 검단' },
      { label: '기간', value: '약 5개월' },
    ],
  },
  'jaw-student': {
    chapterEn: 'Five Seconds',
    lead: '하품을 하다 턱이 빠진 고3 수험생 — 응급실은 30분을 쩔쩔맸습니다.',
    quote: '수험생에게 가장 중요한 시기를 지켜드릴 수 있어 다행이었습니다.',
    quoteBy: '김희수 원장',
    facts: [
      { label: '응급 처치', value: '탈구정복술' },
      { label: '이후 치료', value: '스플린트 · PDRN' },
      { label: '지금은', value: '재발 방지 관리 중' },
    ],
  },
  'jaw-splint': {
    chapterEn: 'Diagnosis First',
    lead: '6개월간 낫지 않던 턱관절 — 문제는 장치가 아니라 진단이었습니다.',
    quote: '턱관절 치료는 장치가 아니라 진단이 먼저입니다.',
    quoteBy: '김희수 원장',
    facts: [
      { label: '타 병원', value: '6개월 호전 없음' },
      { label: '진단', value: '디스크 전방변위' },
      { label: '재치료', value: '스플린트 재제작' },
    ],
  },
}

pages.get('/stories', (c) => {
  const chapterTone = [
    { section: 'bg-ink text-white', num: 'text-white/[0.06]', chip: 'bg-gold-500 text-ink', title: 'text-white', bodyTxt: 'text-white/65', quoteBg: 'bg-white/[0.05] border-white/10', quoteTxt: 'text-white', quoteBy: 'text-gold-400', factBg: 'bg-white/[0.04] border-white/10', factLabel: 'text-white/35', factValue: 'text-gold-400', cta: 'bg-gold-500 text-ink hover:bg-gold-400', glow: true },
    { section: 'bg-cream text-ink', num: 'text-ink/[0.05]', chip: 'bg-ink text-gold-400', title: 'text-ink', bodyTxt: 'text-ink/60', quoteBg: 'bg-white border-ink/8', quoteTxt: 'text-ink', quoteBy: 'text-gold-600', factBg: 'bg-white border-ink/8', factLabel: 'text-ink/35', factValue: 'text-ink', cta: 'bg-ink text-white hover:bg-navy-800', glow: false },
    { section: 'bg-white text-ink', num: 'text-ink/[0.05]', chip: 'bg-ink text-gold-400', title: 'text-ink', bodyTxt: 'text-ink/60', quoteBg: 'bg-cream border-ink/8', quoteTxt: 'text-ink', quoteBy: 'text-gold-600', factBg: 'bg-cream border-ink/8', factLabel: 'text-ink/35', factValue: 'text-ink', cta: 'bg-ink text-white hover:bg-navy-800', glow: false },
  ]

  const body = `
<div id="read-progress" class="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-gold-500 to-royal z-[60] w-0 transition-[width] duration-150" aria-hidden="true"></div>

${pageHero('Stories', '숫자가 아닌,<br><span class="font-disp text-shine">사람</span>의 이야기.', '치료 케이스 뒤에는 언제나 한 사람의 삶이 있습니다. 세 편의 기록을 매거진처럼 담았습니다.')}

<!-- 챕터 목차 -->
<nav id="chapter-index" class="max-w-6xl mx-auto px-5 -mt-8 relative z-[3]" aria-label="스토리 목차">
  <div class="grid sm:grid-cols-3 gap-3" data-stagger>
    ${STORIES.map((s, i) => {
      const m = STORY_META[s.id]
      return `
    <a href="#story-${s.id}" class="bento group rounded-3xl bg-white border border-ink/8 shadow-xl shadow-ink/5 p-6 flex flex-col">
      <p class="text-[10.5px] font-extrabold tracking-[0.3em] uppercase text-gold-600">Chapter ${String(i + 1).padStart(2, '0')} — ${m?.chapterEn || ''}</p>
      <h2 class="mt-2.5 font-extrabold text-ink text-[15.5px] leading-snug tracking-tight flex-1">${esc(s.title)}</h2>
      <p class="mt-4 text-[12.5px] font-bold text-ink/40 group-hover:text-royal transition">읽으러 가기 <i class="fas fa-arrow-down ml-1 text-[10px]"></i></p>
    </a>`
    }).join('')}
  </div>
</nav>

${STORIES.map((s, i) => {
  const t = getTreatment(s.treatment)
  const m = STORY_META[s.id]
  const tone = chapterTone[i % chapterTone.length]
  const [first, ...rest] = s.body
  return `
<section id="story-${s.id}" class="${tone.section} py-20 sm:py-28 relative overflow-hidden scroll-mt-24">
  ${tone.glow ? '<div class="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-navy-600/25 blur-[140px]" aria-hidden="true"></div><div class="absolute bottom-0 left-0 w-[380px] h-[380px] rounded-full bg-gold-500/10 blur-[110px]" aria-hidden="true"></div>' : ''}
  <span class="absolute -top-6 right-2 sm:right-10 text-[160px] sm:text-[260px] font-extrabold leading-none select-none ${tone.num}" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
  <div class="max-w-3xl mx-auto px-5 relative">
    <p class="reveal text-[11px] font-extrabold tracking-[0.35em] uppercase ${i === 0 ? 'text-gold-400' : 'text-gold-600'}">Chapter ${String(i + 1).padStart(2, '0')} — ${m?.chapterEn || 'Story'}</p>
    ${t ? `<a href="/treatments/${t.slug}" class="reveal mt-5 inline-flex items-center gap-2 text-[11.5px] font-bold ${tone.chip} rounded-full px-3.5 py-1.5 tracking-wide"><i class="fas ${t.icon}"></i>${t.name}</a>` : ''}
    <h2 class="reveal mt-5 text-3xl sm:text-5xl font-extrabold ${tone.title} tracking-tightest leading-[1.15]">${esc(s.title)}</h2>
    ${m ? `<p class="reveal mt-6 font-disp text-lg sm:text-xl ${i === 0 ? 'text-gold-400' : 'text-gold-600'} leading-relaxed">${esc(m.lead)}</p>` : ''}

    <div class="mt-10 space-y-5 ${tone.bodyTxt} leading-[1.95] text-[15.5px]">
      <p class="story-lead reveal">${esc(first)}</p>
      ${rest.slice(0, Math.ceil(rest.length / 2)).map((p) => `<p class="reveal">${esc(p)}</p>`).join('')}
    </div>

    ${m ? `
    <blockquote class="reveal-scale my-10 rounded-3xl ${tone.quoteBg} border p-8 sm:p-9 relative overflow-hidden" data-tilt data-tilt-max="3">
      <i class="fas fa-quote-left ${i === 0 ? 'text-gold-500/40' : 'text-gold-500/60'} text-2xl" aria-hidden="true"></i>
      <p class="mt-4 font-disp text-xl sm:text-2xl ${tone.quoteTxt} leading-[1.6]">"${esc(m.quote)}"</p>
      <footer class="mt-4 text-[12.5px] font-bold ${tone.quoteBy}">— ${esc(m.quoteBy)}</footer>
    </blockquote>` : ''}

    <div class="space-y-5 ${tone.bodyTxt} leading-[1.95] text-[15.5px]">
      ${rest.slice(Math.ceil(rest.length / 2)).map((p) => `<p class="reveal">${esc(p)}</p>`).join('')}
    </div>

    ${m ? `
    <div class="mt-10 grid grid-cols-3 gap-3" data-stagger>
      ${m.facts.map((f) => `
      <div class="rounded-2xl ${tone.factBg} border px-4 py-4 text-center">
        <p class="text-[10.5px] font-bold tracking-widest uppercase ${tone.factLabel}">${esc(f.label)}</p>
        <p class="mt-1.5 font-extrabold text-[13px] sm:text-[14.5px] ${tone.factValue} leading-snug">${esc(f.value)}</p>
      </div>`).join('')}
    </div>` : ''}

    ${t ? `
    <div class="reveal mt-10 flex flex-wrap items-center gap-3">
      <a href="/treatments/${t.slug}" class="btn-3d px-7 py-3.5 rounded-full ${tone.cta} font-extrabold text-sm transition"><i class="fas ${t.icon} mr-2"></i>${t.name} 자세히 보기</a>
      ${i < STORIES.length - 1 ? `<a href="#story-${STORIES[i + 1].id}" class="px-6 py-3.5 rounded-full border ${i === 0 ? 'border-white/25 text-white hover:bg-white/10' : 'border-ink/15 text-ink/70 hover:bg-ink/5'} font-bold text-sm transition">다음 이야기 <i class="fas fa-arrow-down ml-1 text-xs"></i></a>` : ''}
    </div>` : ''}
  </div>
</section>`
}).join('')}

<!-- 클로징 -->
<section id="stories-closing" class="max-w-6xl mx-auto px-5 py-20">
  <div class="reveal-scale rounded-3xl bg-ink text-white p-9 sm:p-14 relative overflow-hidden text-center" data-tilt data-tilt-max="3">
    <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-gold-500/12 blur-[110px]" aria-hidden="true"></div>
    <p class="relative text-gold-400 text-[11px] font-bold tracking-[0.35em] uppercase">Your Story Is Next</p>
    <h2 class="relative mt-4 text-2xl sm:text-4xl font-extrabold tracking-tightest leading-tight">다음 이야기의 주인공은,<br>당신일 수 있습니다.</h2>
    <p class="relative mt-4 text-white/50 text-[14.5px] max-w-xl mx-auto">과장 없이, 꼭 필요한 치료만 정직하게 말씀드립니다. 어떤 고민이든 편하게 들려주세요.</p>
    <div class="relative mt-8 flex flex-wrap justify-center gap-3">
      <a href="tel:${CLINIC.phone}" class="btn-3d px-8 py-4 rounded-full bg-gold-500 text-ink font-extrabold hover:bg-gold-400 transition"><i class="fas fa-phone mr-2"></i>${CLINIC.phone}</a>
      <a href="/cases" class="px-8 py-4 rounded-full border border-white/25 font-bold hover:bg-white/10 transition">치료사례 보기</a>
    </div>
    <p class="relative mt-8 text-[11.5px] text-white/30">* 본 스토리는 실제 환자 사례를 바탕으로 하며, 치료 방법과 결과는 개인의 상태에 따라 다를 수 있습니다.</p>
  </div>
</section>

<script>
(function(){
  var bar = document.getElementById('read-progress');
  if (!bar) return;
  function upd(){
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  }
  addEventListener('scroll', upd, { passive: true });
  upd();
})();
</script>`
  return c.html(layout({ title: '치료스토리 — 환자와 원장의 진짜 이야기', desc: '검단퍼스트치과 치료스토리 — 아버지께 직접 심어드린 전악 임플란트 16개, 응급실에서 못 넣은 턱을 5초 만에 정복한 이야기, 정확한 진단이 바꾼 턱관절 치료까지 — 숫자가 아닌 사람의 이야기입니다.', path: '/stories' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 내원안내 / 오시는길 ============
pages.get('/location', (c) => {
  const body = `
${pageHero('Location', '검단 한복판,<br><span class="font-disp text-shine">3층</span>입니다.', CLINIC.addressShort)}
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
      <p class="mt-3 text-[13.5px] text-ink/55 leading-relaxed">임플란트 90만원~, 라미네이트 55만원, 크라운 45만원~ — 의료법에 따라 전 항목을 홈페이지와 원내에 공개하고 있습니다.</p>
      <a href="/pricing" class="mt-3 inline-flex items-center gap-2 text-sm font-bold text-ink border-b border-gold-500 hover:text-gold-600 transition">비급여 수가표 전체 보기 <i class="fas fa-arrow-right text-xs"></i></a>
    </article>
  </div>
</section>

<section id="clinic-entrance" class="max-w-6xl mx-auto px-5 pb-16">
  <div class="grid md:grid-cols-2 gap-4">
    <figure class="reveal-scale rounded-3xl overflow-hidden border border-ink/8 bg-white">
      <img src="/static/images/entrance.webp" alt="검단퍼스트치과 입구 — 검단퍼스트프라자 3층" class="w-full h-72 sm:h-80 object-cover" loading="lazy" decoding="async">
      <figcaption class="p-5">
        <p class="text-gold-600 text-[11px] font-bold tracking-[0.25em] uppercase">Entrance</p>
        <p class="mt-1 font-extrabold text-ink">3층에서 이 입구를 찾아주세요</p>
        <p class="mt-1 text-[13px] text-ink/50">엘리베이터에서 내리시면 바로 보입니다.</p>
      </figcaption>
    </figure>
    <figure class="reveal-scale rounded-3xl overflow-hidden border border-ink/8 bg-white">
      <img src="/static/images/reception.webp" alt="검단퍼스트치과 인포메이션 데스크" class="w-full h-72 sm:h-80 object-cover" loading="lazy" decoding="async">
      <figcaption class="p-5">
        <p class="text-gold-600 text-[11px] font-bold tracking-[0.25em] uppercase">Information</p>
        <p class="mt-1 font-extrabold text-ink">접수는 이곳에서</p>
        <p class="mt-1 text-[13px] text-ink/50">처음 오셨다면 데스크에서 편하게 말씀해 주세요.</p>
      </figcaption>
    </figure>
  </div>
</section>`
  return c.html(layout({ title: '내원안내 · 오시는길 — 검단신도시 이음5로 치과', desc: `검단퍼스트치과 오시는 길 — ${CLINIC.address}. 진료시간 평일 09:30~18:30, 토요일 09:30~14:00, 목·일 휴진. 건물 주차장 완비. 예약 문의 ${CLINIC.phone}`, path: '/location' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 치료비용 안내 (비급여 수가표) ============
pages.get('/pricing', (c) => {
  const nonInsured = PRICING.filter((p) => !p.insured)
  const insured = PRICING.find((p) => p.insured)
  const totalItems = PRICING.reduce((n, p) => n + p.items.length, 0)
  const body = `
${pageHero('Pricing', '비용까지,<br><span class="font-disp text-shine">투명하게.</span>', `의료법 제45조에 따라 비급여 진료비용을 모두 공개합니다. 총 ${totalItems}개 항목 — 숨기는 비용은 없습니다.`)}

<section id="pricing-summary" class="max-w-6xl mx-auto px-5 pt-14">
  <div class="speakable-summary rounded-3xl bg-white border border-ink/8 p-7 sm:p-8">
    <p class="text-[14.5px] text-ink/65 leading-[1.9]"><strong class="text-ink">검단퍼스트치과 대표 비급여 수가</strong> — 임플란트(덴티스) 90만원·(오스템) 100만원, 지르코니아 크라운 50만원부터, 라미네이트 55만원, 세라믹인레이 30만원부터, 전문가미백 1회 14만원. 만 65세 이상 임플란트·틀니는 건강보험 적용이 가능합니다. 정확한 비용은 정밀진단 후 안내드리며, 진단 없이 부풀리거나 깎아 부르는 일은 없습니다. (기준: ${PRICING_UPDATED})</p>
  </div>
  <nav class="mt-8 flex flex-wrap gap-2" aria-label="비용 카테고리">
    ${PRICING.map((p) => `<a href="#price-${p.key}" class="px-4 py-2 rounded-full bg-white border border-ink/10 text-[13px] font-semibold text-ink/60 hover:bg-ink hover:text-white transition"><i class="fas ${p.icon} mr-1.5 text-gold-600"></i>${p.label}</a>`).join('')}
  </nav>
</section>

<section id="pricing-tables" class="max-w-6xl mx-auto px-5 py-12 space-y-10">
  ${nonInsured.map((p) => `
  <article id="price-${p.key}" class="scroll-mt-28">
    <header class="flex items-center justify-between gap-4 mb-4">
      <h2 class="text-xl sm:text-2xl font-extrabold text-ink tracking-tight flex items-center gap-2.5"><span class="w-9 h-9 rounded-xl bg-ink text-gold-400 flex items-center justify-center text-sm"><i class="fas ${p.icon}"></i></span>${p.label}</h2>
      <span class="text-[12px] text-ink/35 font-medium shrink-0">${p.items.length}개 항목</span>
    </header>
    <p class="text-[13px] text-ink/45 mb-4">${p.desc}</p>
    <div class="rounded-3xl bg-white border border-ink/8 overflow-hidden">
      <table class="w-full text-[13.5px]">
        <thead><tr class="bg-ink/[0.03] text-left"><th class="px-5 sm:px-6 py-3 font-bold text-ink/60 text-[12px] tracking-wider uppercase">항목</th><th class="px-5 sm:px-6 py-3 font-bold text-ink/60 text-[12px] tracking-wider uppercase text-right">비용</th></tr></thead>
        <tbody>
          ${p.items.map((it, i) => `<tr class="${i % 2 ? 'bg-ink/[0.015]' : ''} border-t border-ink/5"><td class="px-5 sm:px-6 py-3 text-ink/75 font-medium">${esc(it.name)}${it.note ? ` <span class="text-[11px] text-gold-600 font-semibold">(${esc(it.note)})</span>` : ''}</td><td class="px-5 sm:px-6 py-3 text-right font-bold text-ink whitespace-nowrap">${fmtPrice(it.price)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  </article>`).join('')}

  ${insured ? `
  <article id="price-${insured.key}" class="scroll-mt-28">
    <header class="flex items-center gap-2.5 mb-4">
      <h2 class="text-xl sm:text-2xl font-extrabold text-ink tracking-tight flex items-center gap-2.5"><span class="w-9 h-9 rounded-xl bg-ink text-gold-400 flex items-center justify-center text-sm"><i class="fas ${insured.icon}"></i></span>${insured.label} <span class="text-[12px] font-bold text-white bg-gold-500 rounded-full px-3 py-1">건강보험 적용</span></h2>
    </header>
    <p class="text-[13px] text-ink/45 mb-4">${insured.desc}</p>
    <div class="rounded-3xl bg-white border border-ink/8 p-6 sm:p-7">
      <p class="flex flex-wrap gap-2">${insured.items.map((it) => `<span class="px-3.5 py-1.5 rounded-full bg-ink/[0.04] text-[12.5px] font-semibold text-ink/65">${esc(it.name)}</span>`).join('')}</p>
      <p class="mt-4 text-[12.5px] text-ink/45 leading-relaxed"><i class="fas fa-shield-halved text-gold-600 mr-1.5"></i>위 항목은 건강보험이 적용되어 본인부담금 기준으로 진료받으실 수 있습니다. 만 65세 이상은 임플란트(평생 2개)·틀니 보험 적용 대상입니다.</p>
    </div>
  </article>` : ''}
</section>

<section class="max-w-6xl mx-auto px-5 pb-20">
  <div class="rounded-3xl bg-ink text-white p-9 sm:p-12 relative overflow-hidden">
    <div class="absolute -bottom-16 -right-12 w-64 h-64 rounded-full bg-gold-500/15 blur-[80px]" aria-hidden="true"></div>
    <div class="relative grid lg:grid-cols-[1fr_auto] gap-8 items-center">
      <div>
        <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tightest">견적이 다르다고요?<br>들고 오셔도 됩니다.</h2>
        <p class="mt-3 text-white/50 text-[14.5px] leading-relaxed max-w-xl">치아 상태에 따라 실제 비용은 달라질 수 있습니다. 정밀진단 후 필요한 치료와 필요 없는 치료를 구분해 정확한 견적을 드립니다. 상담은 강요 없이, 결정은 환자분이.</p>
        <p class="mt-4 text-[11.5px] text-white/30">* 본 수가표는 의료법 제45조에 따른 비급여 진료비용 고지이며, ${PRICING_UPDATED} 기준입니다. 세부 항목은 원내 게시물과 상담을 통해 확인하실 수 있습니다.</p>
      </div>
      <div class="flex flex-wrap lg:flex-col gap-3 shrink-0">
        <a href="tel:${CLINIC.phone}" class="btn-3d px-7 py-4 rounded-full bg-gold-500 text-ink font-extrabold hover:bg-gold-400 transition text-center"><i class="fas fa-phone mr-2"></i>${CLINIC.phone}</a>
        <a href="/location" class="px-7 py-4 rounded-full border border-white/25 font-bold hover:bg-white/10 transition text-center">오시는 길</a>
      </div>
    </div>
  </div>
</section>`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: CLINIC.siteUrl },
        { '@type': 'ListItem', position: 2, name: '치료비용 안내', item: `${CLINIC.siteUrl}/pricing` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: '검단퍼스트치과 임플란트 비용은 얼마인가요?', acceptedAnswer: { '@type': 'Answer', text: `덴티스 임플란트 90만원, 오스템 임플란트 100만원입니다(전치부 각 +10만원). 뼈이식은 기본 30만원부터이며, 만 65세 이상은 건강보험(평생 2개, 본인부담 30%)이 적용됩니다. 정확한 비용은 정밀진단 후 안내드립니다. 문의 ${CLINIC.phone}` } },
        { '@type': 'Question', name: '검단퍼스트치과 라미네이트 비용은 얼마인가요?', acceptedAnswer: { '@type': 'Answer', text: '라미네이트는 치아당 55만원입니다. 뉴욕대 무삭제 라미네이트 과정을 수료한 원장이 무삭제(Non-prep) 원칙으로 진행하며, 치료 전 3D 스캔으로 결과를 미리 확인할 수 있습니다.' } },
        { '@type': 'Question', name: '검단퍼스트치과 크라운·인레이 비용은 얼마인가요?', acceptedAnswer: { '@type': 'Answer', text: '지르코니아 크라운 50만원(전치부 PFZ 60만원), PFM 크라운 45만원, 세라믹인레이 30만~36만원, 세라믹온레이 40만원입니다.' } },
        { '@type': 'Question', name: '치아미백 비용은 얼마인가요?', acceptedAnswer: { '@type': 'Answer', text: '전문가미백 1회 14만원, 2회 27만원, 3회 38만원이며 전문가(3회)+자가(4회) 패키지는 63만원입니다.' } },
      ],
    },
  ]
  return c.html(layout({ title: `치료비용 안내 — 임플란트 90만원부터, 비급여 수가 전체 공개`, desc: `검단퍼스트치과 비급여 진료비용 안내 — 임플란트 90만원~, 라미네이트 55만원, 지르코니아 크라운 50만원, 세라믹인레이 30만원~, 전문가미백 14만원~. 의료법에 따라 ${totalItems}개 전 항목 투명 공개. 검단신도시·김포·청라 치과 비용 비교.`, path: '/pricing', jsonLd }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 통합 FAQ 페이지 (AEO 핵심) ============
pages.get('/faq', (c) => {
  const groups = TREATMENTS.filter((t) => FAQS[t.slug]?.length)
  const allFaqs = groups.flatMap((t) => FAQS[t.slug])
  const body = `
${pageHero('FAQ', '궁금한 건,<br><span class="font-disp text-shine">전부</span> 물어보세요.', `진료과목별로 환자분들이 가장 많이 묻는 질문 ${allFaqs.length}개를 모두 정리했습니다. 여기 없는 질문은 ${CLINIC.phone}로 편하게 전화 주세요.`)}
<section id="faq-page" class="max-w-4xl mx-auto px-5 py-14">
  <nav class="flex flex-wrap gap-2 mb-10" aria-label="FAQ 카테고리">
    ${groups.map((t) => `<a href="#faq-${t.slug}" class="px-4 py-2 rounded-full bg-white border border-ink/10 text-[13px] font-semibold text-ink/60 hover:bg-ink hover:text-white transition"><i class="fas ${t.icon} mr-1.5 text-gold-600"></i>${t.name}</a>`).join('')}
  </nav>
  ${groups.map((t) => `
  <div id="faq-${t.slug}" class="mb-12 scroll-mt-28">
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-xl sm:text-2xl font-extrabold text-ink tracking-tight flex items-center gap-2.5"><span class="w-9 h-9 rounded-xl bg-ink text-gold-400 flex items-center justify-center text-sm"><i class="fas ${t.icon}"></i></span>${t.name} FAQ</h2>
      <a href="/treatments/${t.slug}" class="shrink-0 text-[12.5px] font-bold text-gold-600 hover:underline underline-offset-4">진료 안내 <i class="fas fa-arrow-right text-[10px]"></i></a>
    </div>
    <div class="mt-5 space-y-2.5">
      ${FAQS[t.slug].map((f) => `<details class="group rounded-2xl bg-white border border-ink/8 overflow-hidden">
        <summary class="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none">
          <h3 class="text-[14.5px] font-bold text-ink leading-snug">${esc(f.q)}</h3>
          <span class="shrink-0 w-7 h-7 rounded-full bg-ink/5 flex items-center justify-center text-ink/40 group-open:rotate-45 transition-transform"><i class="fas fa-plus text-[10px]"></i></span>
        </summary>
        <p class="px-5 pb-5 text-[13.5px] text-ink/60 leading-[1.9]">${esc(f.a)}</p>
      </details>`).join('')}
    </div>
  </div>`).join('')}
  <div class="rounded-3xl bg-ink text-white p-9 relative overflow-hidden">
    <div class="absolute -bottom-16 -right-12 w-64 h-64 rounded-full bg-gold-500/15 blur-[80px]" aria-hidden="true"></div>
    <div class="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div>
        <h2 class="text-2xl font-extrabold tracking-tightest">원하는 답을 못 찾으셨나요?</h2>
        <p class="mt-2 text-white/50 text-[14px]">전화 주시면 원장이 직접 확인하고 답변드립니다.</p>
      </div>
      <a href="tel:${CLINIC.phone}" class="btn-3d shrink-0 px-7 py-4 rounded-full bg-gold-500 text-ink font-extrabold hover:bg-gold-400 transition"><i class="fas fa-phone mr-2"></i>${CLINIC.phone}</a>
    </div>
  </div>
</section>`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: allFaqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: CLINIC.siteUrl },
        { '@type': 'ListItem', position: 2, name: '자주 묻는 질문', item: `${CLINIC.siteUrl}/faq` },
      ],
    },
  ]
  return c.html(layout({ title: `자주 묻는 질문 ${allFaqs.length}가지 — 임플란트·라미네이트·턱관절`, desc: `검단퍼스트치과 FAQ — 임플란트, 무삭제 라미네이트, 턱관절, 신경치료, 충치, 잇몸, 사랑니 등 진료과목별 자주 묻는 질문 ${allFaqs.length}개와 원장이 직접 정리한 답변. 검단·김포·청라 치과 궁금증 해결.`, path: '/faq', jsonLd }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 지역 SEO/AEO 페이지 ============

// 지역별 FAQ 생성 (AEO — 답변엔진이 바로 인용할 수 있는 Q&A)
function regionFaqs(r: SeoRegion): { q: string; a: string }[] {
  return [
    { q: `${r.name}에서 검단퍼스트치과까지 어떻게 가나요?`, a: `${r.transport} 주소는 ${CLINIC.address}입니다.` },
    { q: `${r.name}에서 임플란트 잘하는 치과를 찾고 있어요.`, a: `검단퍼스트치과는 ${r.name}에서 ${r.distance} 거리로, 보건복지부 인증 통합치의학 전문의이자 우수보철의사인 김희수 원장이 상담·수술·보철·사후관리를 모두 직접 진행합니다. Harvard Implant CE 과정을 수료했으며 오스템·덴티스 임상자문연구위원으로 활동 중입니다. 만 65세 이상은 임플란트 건강보험(평생 2개, 본인부담 30%) 적용이 가능합니다.` },
    { q: `${r.name} 근처에 턱관절(TMJ) 치료하는 치과가 있나요?`, a: `검단퍼스트치과는 ${r.name}에서 ${r.distance} 거리에 있는 턱관절 특화 치과입니다. 아시안 턱관절 포럼 Advanced Course를 수료한 원장이 정확한 진단 후 스플린트·체외충격파(ESWT)·PDRN 인대강화주사 등으로 치료하며, 턱 탈구 응급 정복도 가능합니다.` },
    { q: `${r.name}에서 라미네이트 상담을 받고 싶은데 치아 삭제가 걱정돼요.`, a: `검단퍼스트치과의 루미네이트(LumiNate)는 미국 뉴욕대 무삭제 라미네이트 과정을 수료한 원장이 무삭제(Non-prep)·최소삭제 원칙으로 진행합니다. RAY 페이스 스캐너로 얼굴 전체와 조화로운 미소를 디자인하며, 무삭제 가능 여부를 정밀진단 후 정직하게 알려드립니다. ${r.name}에서 ${r.distance}면 도착합니다.` },
    { q: `진료시간과 예약 방법이 궁금해요.`, a: `평일(월·화·수·금) 09:30~18:30, 토요일 09:30~14:00(점심시간 없이 진료), 목·일·공휴일은 휴진입니다(공휴일이 있는 주 목요일은 정상진료). 예약 및 상담은 ${CLINIC.phone}로 전화 주시면 됩니다.` },
    { q: `다른 치과에서 받은 견적을 들고 가서 상담만 받아도 되나요?`, a: `물론입니다. 검단퍼스트치과는 "다른 병원도 다녀오세요. 그럼 저희의 가치를 더 느끼실 수 있습니다"를 원칙으로, 과잉진료 없이 꼭 필요한 치료만 말씀드립니다. 세컨드 오피니언 상담을 환영합니다.` },
  ]
}

// /region 인덱스 허브
pages.get('/region', (c) => {
  const body = `
${pageHero('Service Areas', '어디에 사시든,<br><span class="font-disp text-shine">가까운 정직함.</span>', `검단퍼스트치과는 인천 서구·계양·김포 생활권 전역에서 찾아주시는 치과입니다. 우리 동네에서 오시는 길을 확인해 보세요.`)}
<section id="region-index" class="max-w-6xl mx-auto px-5 py-16">
  ${REGION_GROUPS.map((g) => {
    const list = SEO_REGIONS.filter((r) => r.group === g)
    return `
  <div class="mb-12">
    <h2 class="reveal text-xl font-extrabold text-ink tracking-tight flex items-center gap-2.5"><span class="w-2 h-2 rounded-full bg-gold-500"></span>${g}</h2>
    <div class="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-stagger>
      ${list.map((r) => `<a href="/region/${r.slug}" class="bento group rounded-3xl bg-white border border-ink/8 p-6 block hover:border-gold-500/40 transition">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-extrabold text-ink tracking-tight">${r.name} <span class="font-normal text-ink/40 text-sm">치과</span></h3>
          <span class="text-[11px] font-bold text-gold-600 bg-gold-500/10 rounded-full px-3 py-1">${r.distance}</span>
        </div>
        <p class="mt-2.5 text-[13px] text-ink/50 leading-relaxed line-clamp-2">${esc(r.desc)}</p>
        <span class="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-ink/60 group-hover:text-gold-600 transition">오시는 길 · 진료안내 <i class="fas fa-arrow-right text-[10px]"></i></span>
      </a>`).join('')}
    </div>
  </div>`
  }).join('')}
  <div class="rounded-3xl bg-ink text-white p-9 sm:p-12 relative overflow-hidden">
    <div class="absolute -bottom-20 -right-16 w-72 h-72 rounded-full bg-gold-500/15 blur-[90px]" aria-hidden="true"></div>
    <div class="relative flex flex-col sm:flex-row sm:items-end justify-between gap-8">
      <div>
        <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tightest leading-tight">우리 동네가 없어도<br>걱정하지 마세요.</h2>
        <p class="mt-3 text-white/50 text-[14.5px]">${CLINIC.address} — 어디서 오시든 같은 진료, 같은 정직함입니다.</p>
      </div>
      <div class="flex flex-wrap gap-3 shrink-0">
        <a href="tel:${CLINIC.phone}" class="btn-3d px-7 py-4 rounded-full bg-gold-500 text-ink font-extrabold hover:bg-gold-400 transition"><i class="fas fa-phone mr-2"></i>${CLINIC.phone}</a>
        <a href="/location" class="px-7 py-4 rounded-full border border-white/25 font-bold hover:bg-white/10 transition">오시는 길</a>
      </div>
    </div>
  </div>
</section>`
  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: CLINIC.siteUrl },
      { '@type': 'ListItem', position: 2, name: '진료 지역 안내', item: `${CLINIC.siteUrl}/region` },
    ],
  }]
  return c.html(layout({ title: '진료 지역 안내 — 검단·김포·청라·계양', desc: '검단퍼스트치과 진료 지역 안내 — 검단신도시·원당동·당하동·마전동·아라동·김포 풍무동·한강신도시·청라·계양 등 인천 서구와 김포 전역에서 찾아오시는 길과 진료 정보를 확인하세요.', path: '/region', jsonLd }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// 지역 상세 페이지
pages.get('/region/:slug', (c) => {
  const r = SEO_REGIONS.find((x) => x.slug === c.req.param('slug'))
  if (!r) return c.notFound()
  const core = TREATMENTS.filter((t) => t.isCore)
  const faqs = regionFaqs(r)
  const nearby = SEO_REGIONS.filter((x) => x.slug !== r.slug && x.group === r.group).slice(0, 5)
  const others = SEO_REGIONS.filter((x) => x.slug !== r.slug && x.group !== r.group).slice(0, 6)

  const body = `
${pageHero('Local', `${r.name} 치과,<br><span class="font-disp text-shine">가까운 정직함.</span>`, `${esc(r.desc)} <span class="text-gold-400 font-bold">— ${r.name}에서 ${r.distance}</span>`)}

<!-- 요약 답변 박스 (AEO: 답변엔진 인용 최적화) -->
<section id="region-answer" class="max-w-6xl mx-auto px-5 -mt-8 relative z-10">
  <div class="reveal-scale rounded-3xl bg-white border border-ink/8 shadow-xl shadow-ink/5 p-7 sm:p-9">
    <p class="text-[11px] font-bold tracking-[0.3em] uppercase text-gold-600">한눈에 보기</p>
    <p class="speakable-summary mt-3 text-[15px] sm:text-base text-ink/75 leading-[1.9]"><strong class="text-ink">${r.name}에서 치과를 찾으신다면</strong> — 검단퍼스트치과는 ${esc(r.full)}에서 <strong class="text-ink">${r.distance}</strong> 거리(${CLINIC.address})에 있는 <strong class="text-ink">통합치의학 전문의 1인 원장 책임진료</strong> 치과입니다. 임플란트·무삭제 라미네이트·턱관절(체외충격파) 특화 진료를 하며, 평일 09:30~18:30 · 토요일 09:30~14:00 진료, 예약은 <a href="tel:${CLINIC.phone}" class="font-extrabold text-gold-600 underline underline-offset-4">${CLINIC.phone}</a>.</p>
    <div class="mt-4 flex flex-wrap gap-2">
      ${r.keywords.slice(0, 5).map((k) => `<span class="text-[11.5px] font-semibold text-ink/40 bg-ink/5 rounded-full px-3 py-1">#${k.replace(/ /g, '')}</span>`).join('')}
    </div>
  </div>
</section>

<section class="max-w-6xl mx-auto px-5 py-14">
  <div class="grid sm:grid-cols-3 gap-4" data-stagger>
    ${core.map((t, i) => `<a href="/treatments/${t.slug}" class="bento group relative rounded-3xl ${i === 0 ? 'bg-ink text-white' : 'bg-white border border-ink/8'} p-7 block"><span class="w-12 h-12 rounded-2xl ${i === 0 ? 'bg-gold-500 text-ink' : 'bg-ink text-gold-400'} flex items-center justify-center text-lg"><i class="fas ${t.icon}"></i></span><h2 class="mt-4 text-lg font-extrabold tracking-tight">${r.name} ${t.name}</h2><p class="mt-1 text-[13px] ${i === 0 ? 'text-gold-400' : 'text-gold-600'} font-semibold">${t.tagline}</p></a>`).join('')}
  </div>

  <div class="mt-14 grid lg:grid-cols-5 gap-10">
    <div class="lg:col-span-3">
      <div class="prose-clinic">
        <h2>${r.name} 주민을 위한 안내</h2>
        ${r.intro.map((p) => `<p>${esc(p)}</p>`).join('')}
        <p>검단퍼스트치과는 ${CLINIC.address}에 있으며, ${r.name}에서 ${r.distance} 거리입니다. 과잉진료 없는 1인 대표원장 책임진료를 원칙으로, 보건복지부 인증 통합치의학 전문의 김희수 원장이 상담부터 치료, 사후관리까지 직접 책임집니다.</p>
        <h2>${r.name}에서 오시는 길</h2>
        <p>${esc(r.transport)}</p>
      </div>
      <div class="mt-8 flex flex-wrap gap-3">
        <a href="tel:${CLINIC.phone}" class="px-7 py-4 rounded-full bg-ink text-white font-extrabold hover:bg-navy-800 transition"><i class="fas fa-phone mr-2 text-gold-400"></i>${CLINIC.phone}</a>
        <a href="/location" class="px-7 py-4 rounded-full bg-white border border-ink/15 font-bold text-ink hover:bg-ink hover:text-white transition">오시는 길 상세</a>
      </div>
    </div>
    <aside class="lg:col-span-2 space-y-4">
      <article class="rounded-3xl bg-ink text-white p-7">
        <h2 class="font-extrabold flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-gold-400"></span>진료시간</h2>
        <ul class="mt-4 space-y-2.5 text-[13.5px]">
          <li class="flex justify-between"><span class="text-white/40">월·화·수·금</span><span class="font-bold">09:30–18:30</span></li>
          <li class="flex justify-between"><span class="text-white/40">토요일</span><span class="font-bold">09:30–14:00 <span class="text-gold-400 text-[11px]">점심없이</span></span></li>
          <li class="flex justify-between"><span class="text-white/40">목·일·공휴일</span><span class="font-bold">휴진</span></li>
        </ul>
      </article>
      <article class="rounded-3xl bg-white border border-ink/8 p-7">
        <h2 class="font-extrabold text-ink flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-gold-500"></span>가까운 지역</h2>
        <nav class="mt-4 flex flex-wrap gap-2">
          ${nearby.map((n) => `<a href="/region/${n.slug}" class="px-3.5 py-2 rounded-full bg-ink/5 text-[12.5px] font-semibold text-ink/60 hover:bg-ink hover:text-white transition">${n.name} 치과</a>`).join('')}
        </nav>
      </article>
    </aside>
  </div>

  <!-- 지역 FAQ (AEO 핵심) -->
  <div id="region-faq" class="mt-16">
    <h2 class="reveal text-2xl sm:text-3xl font-extrabold text-ink tracking-tightest">${r.name}에서 자주 묻는 질문</h2>
    <div class="mt-6 space-y-3" data-stagger>
      ${faqs.map((f) => `<details class="group rounded-2xl bg-white border border-ink/8 overflow-hidden">
        <summary class="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none">
          <h3 class="text-[15px] font-bold text-ink leading-snug">${esc(f.q)}</h3>
          <span class="shrink-0 w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink/40 group-open:rotate-45 transition-transform"><i class="fas fa-plus text-xs"></i></span>
        </summary>
        <p class="px-6 pb-6 text-[14px] text-ink/60 leading-[1.9]">${esc(f.a)}</p>
      </details>`).join('')}
    </div>
    <p class="mt-5 text-[13px] text-ink/40">더 많은 질문과 답변은 <a href="/faq" class="font-bold text-gold-600 underline underline-offset-4">통합 FAQ 페이지</a>에서 확인하세요.</p>
  </div>

  <!-- 다른 지역 내부링크 -->
  <nav class="mt-14 pt-8 border-t border-ink/8 flex flex-wrap items-center gap-2" aria-label="다른 진료 지역">
    <span class="text-[12px] font-bold text-ink/35 tracking-widest uppercase mr-2">Other Areas</span>
    ${others.map((n) => `<a href="/region/${n.slug}" class="px-4 py-2 rounded-full bg-white border border-ink/10 text-[13px] font-semibold text-ink/60 hover:bg-ink hover:text-white transition">${n.name} 치과</a>`).join('')}
    <a href="/region" class="px-4 py-2 rounded-full bg-ink text-white text-[13px] font-bold">전체 지역 보기</a>
  </nav>
</section>`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: CLINIC.siteUrl },
        { '@type': 'ListItem', position: 2, name: '진료 지역 안내', item: `${CLINIC.siteUrl}/region` },
        { '@type': 'ListItem', position: 3, name: `${r.name} 치과`, item: `${CLINIC.siteUrl}/region/${r.slug}` },
      ],
    },
  ]
  return c.html(layout({ title: `${r.name} 치과 추천 — 임플란트·라미네이트·턱관절`, desc: `${r.name} 치과 찾으세요? ${r.desc} ${r.name}에서 ${r.distance}. 통합치의학 전문의 1인 원장 책임진료, 과잉진료 없는 정직한 치과. ${CLINIC.phone}`, path: `/region/${r.slug}`, jsonLd }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

export default pages
