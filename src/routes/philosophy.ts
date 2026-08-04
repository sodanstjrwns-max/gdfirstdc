// 진료철학 페이지 — 구 홈페이지 speciality 콘텐츠 + 원장 진료철학 4원칙
import { Hono } from 'hono'
import { layout, pageHero } from '../lib/layout'
import type { AppEnv } from '../types'

const philosophy = new Hono<AppEnv>()

// 진심이 담긴 치료 (구 홈페이지 speciality 윗부분)
const SINCERE = [
  {
    icon: 'fa-shield-halved',
    img: '/static/images/treatment_room.webp',
    imgAlt: '검단퍼스트치과 진료실 — 1인 1기구 멸균 시스템',
    title: '안전하고 깨끗한 기구만을<br>사용합니다',
    body: '1인 1기구 사용, 대학병원급 15단계 멸균 시스템 적용, 그리고 매달 전문 멸균 관리감독관에 의한 점검을 통해 항상 안심할 수 있는 환경을 만들겠습니다.',
  },
  {
    icon: 'fa-hand-holding-heart',
    img: '/static/images/consult_room.webp',
    imgAlt: '검단퍼스트치과 상담실 — 편안한 진료 환경',
    title: '환자분의 치과 두려움을<br>없애드리고자 노력합니다',
    body: '도포마취, 가글마취, 무통마취 등 환자분들의 치과공포증을 없애기 위해 최선을 다해 노력하고, 진료의 모든 과정에서 환자분의 불편함을 지속적으로 체크하여 편안하게 진료받으실 수 있습니다.',
  },
  {
    icon: 'fa-gem',
    img: '/static/images/doctor_study.webp',
    imgAlt: '김희수 대표원장의 심미 치료 연구',
    title: '치아의 기능뿐 아니라<br>아름다움을 연구하고 책임집니다',
    body: '치아의 배열과 모양 그리고 색이 이루는 조화는 안모와 인상에 결정적인 영향을 줍니다. 검단퍼스트치과는 단순히 기능적인 보철치료를 넘어, 디자인부터 시술까지 최고의 기술력으로 최선의 아름다움을 추구합니다.',
  },
  {
    icon: 'fa-heart',
    img: '/static/images/reception.webp',
    imgAlt: '검단퍼스트치과 리셉션 — 따뜻한 응대',
    title: '따뜻한 마음을 심는<br>치과입니다',
    body: '치과의사는 치아를 치료하는 것을 넘어, 결국 환자를 치료하는 의사입니다. 단순히 치료하는 것이 아닌 환자의 고통과 고민에 진심으로 공감하며 귀 기울이겠습니다.',
  },
  {
    icon: 'fa-flask',
    img: '/static/images/doctor_portrait.webp',
    imgAlt: '끊임없이 연구하는 김희수 대표원장',
    title: '만족감 있는 진료를 위해<br>끊임없이 연구하고 노력합니다',
    body: '의료기술은 나날이 발전합니다. 그에 맞춘 의료지식 습득 및 고가의 장비를 치료에 적극 활용하는 치과로 발전하고 있습니다.',
  },
]

// 왜 검단퍼스트치과여야 하는가 (원장님 직접 작성 4원칙)
const WHY = [
  {
    no: '01',
    icon: 'fa-people-roof',
    img: '/static/images/doctor_lobby.webp',
    imgAlt: '검단퍼스트치과 로비의 김희수 대표원장',
    title: '우리 직원들이<br>가족을 모셔오는 치과',
    body: '오직 실력으로 인정받는 원장님께 진료받는 특혜. 내부자만큼 잘 아는 사람은 없습니다. 검단퍼스트치과는 우리 직원들이 자신의 가족을 모셔오는 치과입니다.',
  },
  {
    no: '02',
    icon: 'fa-ban',
    img: '/static/images/interior_curve.webp',
    imgAlt: '검단퍼스트치과 내부 — 정직한 진료 공간',
    title: '절대 불필요한 진료는<br>권하지 않습니다',
    body: '불필요한 뼈이식, 불필요한 충치치료, 불필요한 교정치료 없습니다. 검단신도시에서 가장 오래된 치과이면서, 소개가 가장 많은 치과인 이유 중 하나입니다.',
  },
  {
    no: '03',
    icon: 'fa-hands-holding-heart',
    img: '/static/images/waiting_garden.webp',
    imgAlt: '검단퍼스트치과 대기 공간 — 편안한 분위기',
    title: '치아를 치료받으러 와서<br>마음까지 치료받는 병원',
    body: '편안하게 진료받으실 수 있도록 전 직원의 따뜻한 마음을 느낄 수 있는 치과. 치아를 치료받으러 와서 마음까지 치료받는 병원으로 기억되고 싶습니다.',
  },
  {
    no: '04',
    icon: 'fa-calendar-check',
    img: '/static/images/lobby_tmj.webp',
    imgAlt: '검단퍼스트치과 — 체계적인 사후관리',
    title: '사후관리에<br>철저한 치과',
    body: '첫날부터 끝날까지 대표원장이 환자분과 마주합니다. 치료가 끝난 뒤에도 체계적인 정기검진으로 저희가 계속 봐드릴 테니, 바쁘시더라도 꼭 내원해 주세요.',
  },
]

philosophy.get('/philosophy', (c) => {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://gdfirstdc.kr/philosophy',
      name: '검단퍼스트치과 진료철학',
      description:
        '불필요한 진료를 권하지 않는 정직한 진단, 대학병원급 15단계 멸균, 대표원장이 처음부터 끝까지 책임지는 사후관리 — 검단퍼스트치과의 진료철학입니다.',
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.speakable-summary', 'h1'] },
    },
  ]

  const body = `
${pageHero('Philosophy', '진료철학,<br><span class="font-disp text-shine">진심이 담긴 치료.</span>', '검단 주민분들이 믿고 맡기실 수 있는 평생 주치의가 되겠습니다.')}

<!-- ===== 원장 인용 ===== -->
<section id="doctor-quote" class="max-w-4xl mx-auto px-5 pt-16 sm:pt-20 text-center">
  <i class="fas fa-quote-left text-gold-500/40 text-3xl" aria-hidden="true"></i>
  <blockquote class="reveal mt-6 text-2xl sm:text-4xl font-extrabold text-ink tracking-tightest leading-[1.4]">
    환자분에게 쏟는 의사의<br><span class="text-shine font-disp">정성과 꼼꼼함</span>이<br>환자분의 10년을 좌우합니다.
  </blockquote>
  <p class="reveal speakable-summary mt-6 text-ink/55 text-[15px] leading-relaxed max-w-xl mx-auto">저는 검단 주민분들이 믿고 맡기실 수 있는 <strong class="text-ink">평생 주치의</strong>가 되겠습니다.</p>
  <p class="reveal mt-5 text-[13px] font-bold text-ink/40 tracking-wide">검단퍼스트치과 대표원장 <span class="text-ink text-[15px] font-extrabold ml-1">김 희 수</span></p>
</section>

<!-- ===== 진심이 담긴 치료 ===== -->
<section id="sincere-care" class="max-w-6xl mx-auto px-5 py-20 sm:py-24">
  <header class="mb-12 sm:mb-16">
    <p class="reveal text-gold-600 text-[11px] font-bold tracking-[0.35em] uppercase">Sincere Care</p>
    <h2 class="reveal mt-3 text-3xl sm:text-5xl font-extrabold text-ink tracking-tightest leading-[1.15]">검단퍼스트치과의<br><span class="font-disp text-shine">진심이 담긴 치료</span></h2>
    <p class="reveal mt-5 text-ink/50 text-[15px] max-w-xl leading-relaxed">정밀한 진단과 철저한 치료 계획으로, 안전한 치료를 최우선으로 생각합니다.</p>
  </header>
  <div class="space-y-14 sm:space-y-20">
    ${SINCERE.map((item, i) => `
    <article class="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
      <figure class="reveal-scale relative rounded-3xl overflow-hidden border border-ink/8 shadow-xl shadow-ink/10 ${i % 2 === 1 ? 'md:order-2' : ''}">
        <img src="${item.img}" alt="${item.imgAlt}" class="w-full h-64 sm:h-80 object-cover" loading="lazy" decoding="async">
      </figure>
      <div class="${i % 2 === 1 ? 'md:order-1' : ''}">
        <span class="reveal inline-flex w-12 h-12 rounded-2xl bg-gold-500/12 text-gold-600 items-center justify-center text-lg"><i class="fas ${item.icon}" aria-hidden="true"></i></span>
        <h3 class="reveal mt-5 text-xl sm:text-2xl font-extrabold text-ink tracking-tight leading-snug">${item.title}</h3>
        <p class="reveal mt-4 text-ink/55 text-[14.5px] leading-[1.9]">${item.body}</p>
      </div>
    </article>`).join('')}
  </div>
</section>

<!-- ===== 왜 검단퍼스트치과여야 하는가 ===== -->
<section id="why-first" class="bg-ink text-white py-20 sm:py-28 relative overflow-hidden">
  <div class="absolute -top-24 -left-24 w-[440px] h-[440px] rounded-full bg-navy-600/25 blur-[130px]" aria-hidden="true"></div>
  <div class="absolute bottom-0 right-0 w-[360px] h-[360px] rounded-full bg-gold-500/10 blur-[110px]" aria-hidden="true"></div>
  <div class="max-w-6xl mx-auto px-5 relative">
    <header class="mb-14 sm:mb-20 text-center">
      <p class="reveal text-gold-400 text-[11px] font-bold tracking-[0.35em] uppercase">Why Geomdan First</p>
      <h2 class="reveal mt-4 text-3xl sm:text-5xl font-extrabold tracking-tightest leading-[1.15]">왜, <span class="font-disp text-shine">검단퍼스트치과</span>여야<br>하는가?</h2>
    </header>
    <div class="space-y-14 sm:space-y-20">
      ${WHY.map((item, i) => `
      <article class="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <figure class="reveal-scale relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/30 ${i % 2 === 1 ? 'md:order-2' : ''}">
          <img src="${item.img}" alt="${item.imgAlt}" class="w-full h-64 sm:h-80 object-cover" loading="lazy" decoding="async">
          <span class="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-ink/70 backdrop-blur text-gold-400 text-[11px] font-extrabold tracking-[0.2em]">${item.no}</span>
        </figure>
        <div class="${i % 2 === 1 ? 'md:order-1' : ''}">
          <span class="reveal inline-flex w-12 h-12 rounded-2xl bg-gold-500/15 text-gold-400 items-center justify-center text-lg"><i class="fas ${item.icon}" aria-hidden="true"></i></span>
          <h3 class="reveal mt-5 text-xl sm:text-3xl font-extrabold tracking-tight leading-snug">${item.title}</h3>
          <p class="reveal mt-4 text-white/55 text-[14.5px] leading-[1.9]">${item.body}</p>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- ===== 마무리 CTA ===== -->
<section id="philosophy-cta" class="max-w-4xl mx-auto px-5 py-20 text-center">
  <h2 class="reveal text-2xl sm:text-3xl font-extrabold text-ink tracking-tightest leading-snug">"다른 병원도 다녀오세요.<br>그럼 저희의 가치를 더 느끼실 수 있습니다."</h2>
  <p class="reveal mt-5 text-ink/50 text-[14.5px] leading-relaxed">검단퍼스트치과는 광고 대신 진단으로, 화려함 대신 진심으로 승부합니다.</p>
  <div class="reveal mt-8 flex flex-wrap justify-center gap-3">
    <a href="/reserve" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-ink text-white text-[14px] font-extrabold hover:bg-navy-800 transition"><i class="fas fa-calendar-check text-gold-400"></i>예약·상담 신청</a>
    <a href="/about" class="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-ink/15 text-ink text-[14px] font-extrabold hover:border-ink transition">병원소개 보기 <i class="fas fa-arrow-right text-[11px]"></i></a>
  </div>
</section>`

  return c.html(
    layout(
      {
        title: '진료철학 — 진심이 담긴 치료',
        desc: '불필요한 진료를 권하지 않는 정직한 진단, 대학병원급 15단계 멸균, 대표원장이 처음부터 끝까지 책임지는 사후관리. 우리 직원들이 가족을 모셔오는 치과, 검단퍼스트치과의 진료철학입니다.',
        path: '/philosophy',
        jsonLd,
      },
      body,
      { user: c.get('user'), admin: c.get('isAdmin') }
    )
  )
})

export default philosophy
