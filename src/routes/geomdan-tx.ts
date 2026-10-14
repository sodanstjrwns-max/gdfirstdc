// ============================================================
// "검단 {진료}" 하위 페이지 6장 (/region/geomdan-*) + 홈·허브 사진 카드 그리드 (2026-10-14)
// 데이터: src/data/geomdan-cards.ts — og:image·본문 첫 img·JSON-LD image·사이트맵 image:image 가 모두 같은 사진
// ============================================================
import { Hono } from 'hono'
import { layout, esc, pageHero } from '../lib/layout'
import { CLINIC } from '../data/clinic'
import { getTreatment } from '../data/treatments'
import { GEOMDAN_HUB_PATH } from './geomdan-hub'
import { GEOMDAN_CARDS, GEOMDAN_CARD_DATE, geomdanCardImg, type GeomdanCard } from '../data/geomdan-cards'
import type { AppEnv } from '../types'

const geomdanTx = new Hono<AppEnv>()

/** 홈·허브 공용 6장 사진 카드 그리드 — ItemList JSON-LD(geomdanItemListJsonLd)와 같은 순서 */
export function geomdanCardGrid(opts: { id: string; heading: string; sub: string; exclude?: string; compact?: boolean }): string {
  const list = GEOMDAN_CARDS.filter((c) => c.path !== opts.exclude)
  return `
<section id="${opts.id}" class="max-w-6xl mx-auto px-5 ${opts.compact ? 'pt-6 pb-14' : 'pb-20'}" aria-labelledby="${opts.id}-h">
  <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p class="reveal text-gold-600 text-xs font-bold tracking-[0.3em] uppercase">Geomdan · 진료별 안내</p>
      <h2 id="${opts.id}-h" class="reveal mt-2 text-2xl sm:text-4xl font-extrabold text-ink tracking-tightest">${opts.heading}</h2>
      <p class="reveal mt-3 text-[14.5px] text-ink/55 leading-relaxed">${opts.sub}</p>
    </div>
    <a href="${GEOMDAN_HUB_PATH}" class="reveal px-5 py-2.5 rounded-full border border-ink/15 text-sm font-bold text-ink/70 hover:bg-ink hover:text-white transition">검단 치과 안내 <i class="fas fa-arrow-right ml-1 text-xs"></i></a>
  </header>
  <ul class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4" role="list">
    ${list.map((c) => `<li>
      <a href="${c.path}" class="group block rounded-3xl overflow-hidden bg-white border border-ink/8 hover:border-ink/25 hover:shadow-xl hover:shadow-ink/5 transition h-full">
        <div class="aspect-square overflow-hidden bg-ink/5">
          <img src="${geomdanCardImg(c, 'card')}" alt="${esc(c.name)}" width="600" height="600" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500">
        </div>
        <div class="p-4 sm:p-5">
          <h3 class="font-extrabold text-ink tracking-tight text-[15px] sm:text-lg">${esc(c.name)}</h3>
          <p class="mt-1.5 text-[12.5px] sm:text-[13.5px] text-ink/50 leading-relaxed">${esc(c.line)}</p>
        </div>
      </a>
    </li>`).join('')}
  </ul>
</section>`
}

function pageBody(card: GeomdanCard): string {
  const t = getTreatment(card.tx)
  const p = 'text-[15px] text-ink/70 leading-[1.95] mt-4'
  const h2 = 'text-2xl sm:text-[28px] font-extrabold text-ink tracking-tightest mt-14'
  const rest = card.name.replace(/^검단 /, '')
  return `
${pageHero('Geomdan · ' + (t?.nameEn || ''), `검단 <span class="font-disp text-shine">${esc(rest)}</span>`, esc(card.line))}

<section class="max-w-4xl mx-auto px-5 -mt-8 relative z-10">
  <figure class="rounded-3xl overflow-hidden bg-white border border-ink/8 shadow-xl shadow-ink/5">
    <img src="${geomdanCardImg(card, 'body')}" alt="${esc(card.alt)}" width="1200" height="800" fetchpriority="high" decoding="async" class="w-full h-auto block">
  </figure>
  <div class="mt-6 rounded-3xl bg-white border border-ink/8 p-7 sm:p-9">
    <p class="text-[11px] font-bold tracking-[0.3em] uppercase text-gold-600">핵심 요약</p>
    <p class="speakable-summary mt-3 text-[15px] sm:text-base text-ink/80 leading-[1.9]">${esc(card.answer)}</p>
    <dl class="mt-6 grid sm:grid-cols-[7.5em_1fr] gap-x-5 gap-y-2.5 text-[14px]">
      <dt class="font-bold text-ink">위치</dt><dd class="text-ink/60">${esc(CLINIC.addressShort)} · 아라역 1번 출구 도보 5분</dd>
      <dt class="font-bold text-ink">진료시간</dt><dd class="text-ink/60">월·수·금 09:30~18:30 · 화 09:30~20:30(야간) · 토 09:30~14:00 · 목·일·공휴일 휴진</dd>
      <dt class="font-bold text-ink">진료</dt><dd class="text-ink/60">통합치의학 전문의 ${esc(CLINIC.doctor)} 대표원장 1인 진료</dd>
    </dl>
  </div>
</section>

<section class="max-w-4xl mx-auto px-5 py-14">
  ${card.sections.map((s, i) => `<h2 class="${h2}${i === 0 ? ' !mt-0' : ''}">${esc(s.h2)}</h2>
  ${s.ps.map((x) => `<p class="${p}">${esc(x)}</p>`).join('\n  ')}`).join('\n  ')}

  <div class="mt-10 flex flex-wrap gap-2.5">
    ${t ? `<a href="/treatments/${t.slug}" class="px-5 py-3 rounded-full bg-ink text-white text-sm font-bold hover:bg-ink-soft transition">${esc(t.name)} 진료 자세히 보기 <i class="fas fa-arrow-right ml-1 text-xs"></i></a>` : ''}
    <a href="${GEOMDAN_HUB_PATH}" class="px-5 py-3 rounded-full bg-white border border-ink/15 text-sm font-bold text-ink hover:bg-ink hover:text-white transition">검단 치과 안내 — 오시는 길·진료시간</a>
    <a href="/pricing" class="px-5 py-3 rounded-full bg-white border border-ink/15 text-sm font-bold text-ink hover:bg-ink hover:text-white transition">치료비용 안내</a>
  </div>

  <h2 class="${h2}" id="tx-faq">${esc(card.name)} 자주 묻는 질문</h2>
  <div class="mt-6 space-y-3">
    ${card.faqs.map((f, i) => `<details id="q-${i + 1}" class="group rounded-2xl bg-white border border-ink/8 overflow-hidden">
      <summary class="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none">
        <h3 class="text-[15px] font-bold text-ink leading-snug">${esc(f.q)}</h3>
        <span class="shrink-0 w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink/40 group-open:rotate-45 transition-transform" aria-hidden="true"><i class="fas fa-plus text-xs"></i></span>
      </summary>
      <p class="px-6 pb-6 text-[14px] text-ink/60 leading-[1.9]">${esc(f.a)}</p>
    </details>`).join('')}
  </div>

  <div class="mt-12 rounded-3xl bg-ink text-white p-8 sm:p-10">
    <h2 class="text-2xl font-extrabold tracking-tightest">${esc(card.name)} 상담 예약</h2>
    <p class="mt-3 text-white/55 text-[14.5px] leading-relaxed">검사 결과를 화면으로 함께 보며 꼭 필요한 치료부터 차례로 설명해 드립니다.</p>
    <div class="mt-6 flex flex-wrap gap-3">
      <a href="/reserve" class="btn-3d px-7 py-4 rounded-full bg-gold-500 text-ink font-extrabold hover:bg-gold-400 transition"><i class="fas fa-calendar-check mr-2"></i>예약·상담 신청</a>
      <a href="tel:${CLINIC.phone}" class="px-7 py-4 rounded-full border border-white/25 font-bold hover:bg-white/10 transition"><i class="fas fa-phone mr-2 text-gold-400"></i>${CLINIC.phone}</a>
      <a href="${CLINIC.naverBooking}" target="_blank" rel="noopener" class="px-6 py-4 rounded-full bg-[#03c75a] text-white font-extrabold hover:brightness-110 transition">네이버 예약</a>
    </div>
  </div>
  <p class="mt-6 text-[12px] text-ink/40 leading-relaxed">※ 치료 방법과 경과는 개인의 구강 상태에 따라 다를 수 있으며, 정확한 진단은 내원 상담을 통해 받으시기 바랍니다. · 최종 수정 <time datetime="${GEOMDAN_CARD_DATE}">${GEOMDAN_CARD_DATE}</time></p>
</section>
${geomdanCardGrid({ id: 'geomdan-siblings', heading: '검단에서 받을 수 있는 다른 진료', sub: '진료별로 검단 생활권에서 다니실 때의 기준과 일정을 정리했습니다.', exclude: card.path, compact: true })}`
}

for (const card of GEOMDAN_CARDS) {
  geomdanTx.get(card.path, (c) => {
    const url = `${CLINIC.siteUrl}${card.path}`
    const ogImg = `${CLINIC.siteUrl}${geomdanCardImg(card, 'og')}`
    const t = getTreatment(card.tx)
    const jsonLd: object[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: card.faqs.map((f, i) => ({ '@type': 'Question', '@id': `${url}#q-${i + 1}`, name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: `${CLINIC.siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: '검단 치과', item: `${CLINIC.siteUrl}${GEOMDAN_HUB_PATH}` },
          { '@type': 'ListItem', position: 3, name: card.name, item: url },
        ],
      },
    ]
    const webPage = {
      '@type': ['WebPage', 'MedicalWebPage'],
      name: card.title,
      headline: card.name,
      description: card.answer,
      inLanguage: 'ko-KR',
      image: { '@type': 'ImageObject', url: ogImg, width: 1200, height: 630, caption: card.alt },
      primaryImageOfPage: { '@type': 'ImageObject', url: ogImg, width: 1200, height: 630 },
      about: t ? { '@type': 'MedicalProcedure', name: t.name, url: `${CLINIC.siteUrl}/treatments/${t.slug}` } : undefined,
      audience: { '@type': 'Patient', geographicArea: { '@type': 'AdministrativeArea', name: '인천광역시 검단구' } },
      // author/reviewedBy 없음 — 2026-10-14 병원 발행 안내 페이지(원장 검토 기록 없음)
      publisher: { '@id': `${CLINIC.siteUrl}/#clinic` },
      isPartOf: { '@id': `${CLINIC.siteUrl}/#website` },
      mainEntity: { '@id': `${url}#faq` },
      dateModified: GEOMDAN_CARD_DATE,
      relatedLink: [`${CLINIC.siteUrl}${GEOMDAN_HUB_PATH}`, ...(t ? [`${CLINIC.siteUrl}/treatments/${t.slug}`] : [])],
    }
    return c.html(layout({ title: card.name, fullTitle: card.title, desc: card.desc, path: card.path, ogImage: ogImg, ogImageAlt: card.alt, jsonLd, webPage }, pageBody(card), { user: c.get('user'), admin: c.get('isAdmin') }))
  })
}

export default geomdanTx
