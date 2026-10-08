// 콘텐츠 라우트 — 치료사례(비포애프터), 건강칼럼(블로그), 공지사항, 이미지 서빙 (2026 리뉴얼)
import { Hono } from 'hono'
import { layout, esc, pageHero, PHYSICIAN_ID } from '../lib/layout'
import { CLINIC } from '../data/clinic'
import { TREATMENTS, getTreatment } from '../data/treatments'
import { isThinCase, isThinNotice, isThinList, NOINDEX_FOLLOW } from '../lib/thin-content'
import { isClinicPublishedPost, CLINIC_GENERAL_INFO_NOTE, answerSummary, faqsFromArticleHtml, enhanceArticleImages, flatText, clipSentences, toIso, kstDate, caseAutoSummary, cleanCaseTitle, categoryAliases, treatmentSlugForCategory, procedureId } from '../lib/column-seo'
import type { AppEnv } from '../types'

const content = new Hono<AppEnv>()

interface BARow {
  id: number; title: string; description: string | null; age_group: string | null; gender: string | null
  category: string | null; region: string | null; doctor: string; duration: string | null
  pano_before_key: string | null; pano_after_key: string | null; intra_before_key: string | null; intra_after_key: string | null
  views: number; created_at: string; updated_at?: string | null
}
interface BlogRow { id: number; title: string; slug: string; content_html: string; excerpt: string | null; thumbnail_key: string | null; author: string; category: string | null; views: number; created_at: string; updated_at?: string | null }
interface NoticeRow { id: number; title: string; content_html: string; image_keys: string | null; is_pinned: number; views: number; created_at: string }

function fmtDate(s: string): string {
  return (s || '').slice(0, 10).replace(/-/g, '.')
}

function imgUrl(key: string | null): string {
  return key ? `/images/${key}` : ''
}

function pager(base: string, page: number, pages: number): string {
  if (pages <= 1) return ''
  // 1페이지는 쿼리 없는 주소(canonical)로, 나머지는 ?page=N — 서버 렌더 a 링크
  const href = (p: number) => (p === 1 ? base.replace(/[?&]$/, '') : `${base}page=${p}`)
  return `<nav class="mt-12 flex justify-center gap-1.5 flex-wrap" aria-label="페이지">${Array.from({ length: pages }, (_, i) => i + 1).map((p) => `<a href="${href(p)}"${p === page ? ' aria-current="page"' : ''} class="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition ${p === page ? 'bg-ink text-white' : 'bg-white border border-ink/10 text-ink/60 hover:border-ink'}">${p}</a>`).join('')}</nav>`
}

function baCompare(beforeKey: string | null, afterKey: string | null, label: string, txName = '치과'): string {
  if (!beforeKey && !afterKey) return ''
  if (beforeKey && afterKey) {
    return `
<figure class="mb-8">
  <figcaption class="flex items-center justify-between mb-3">
    <span class="text-[13px] font-extrabold text-ink tracking-wide uppercase">${label}</span>
    <span class="text-[11.5px] text-ink/35"><i class="fas fa-arrows-left-right mr-1"></i>드래그해서 비교</span>
  </figcaption>
  <div class="ba-compare rounded-3xl overflow-hidden border border-ink/8 relative shadow-xl shadow-ink/5">
    <img src="${imgUrl(beforeKey)}" alt="${txName} 치료 전 (${label})" class="w-full block" loading="lazy" decoding="async">
    <img src="${imgUrl(afterKey)}" alt="${txName} 치료 후 (${label})" class="ba-after w-full block absolute inset-0" loading="lazy" decoding="async">
    <div class="ba-divider"></div>
    <span class="absolute bottom-3 left-3 text-[10px] font-extrabold tracking-[0.15em] bg-ink/70 backdrop-blur text-white rounded-full px-3 py-1.5 pointer-events-none">BEFORE</span>
    <span class="absolute bottom-3 right-3 text-[10px] font-extrabold tracking-[0.15em] bg-gold-500 text-ink rounded-full px-3 py-1.5 pointer-events-none">AFTER</span>
    <input type="range" min="0" max="100" value="50" aria-label="${label} 전후 비교 슬라이더">
  </div>
</figure>`
  }
  const key = beforeKey || afterKey
  const suffix = beforeKey ? '치료 전' : '치료 후'
  return `<figure class="mb-8"><figcaption class="text-[13px] font-extrabold text-ink mb-3 uppercase tracking-wide">${label} <span class="text-ink/35 font-medium">(${suffix})</span></figcaption><img src="${imgUrl(key)}" alt="${txName} ${suffix} (${label})" class="w-full rounded-3xl border border-ink/8" loading="lazy" decoding="async"></figure>`
}

// ============ 치료사례 목록 ============
const CASES_PER = 12
content.get('/cases', async (c) => {
  const catQ = c.req.query('category') || ''
  const cat = getTreatment(catQ) ? catQ : ''
  const page = Math.max(1, parseInt(c.req.query('page') || '1') || 1)
  const where = cat ? 'WHERE published = 1 AND category = ?' : 'WHERE published = 1'
  const binds = cat ? [cat] : []
  const total = (await c.env.DB.prepare(`SELECT COUNT(*) AS n FROM before_after ${where}`).bind(...binds).first<{ n: number }>())?.n || 0
  const rows = (await c.env.DB.prepare(`SELECT * FROM before_after ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...binds, CASES_PER, (page - 1) * CASES_PER).all<BARow>()).results
  const pages = Math.max(1, Math.ceil(total / CASES_PER))
  if (page > pages && total > 0) return c.redirect(`/cases${cat ? `?category=${cat}` : ''}`, 302)
  const catT = cat ? getTreatment(cat) : null
  const qs = [cat ? `category=${cat}` : '', page > 1 ? `page=${page}` : ''].filter(Boolean).join('&')
  const selfPath = `/cases${qs ? `?${qs}` : ''}`

  const body = `
${pageHero('Before &amp; After', '결과로<br><span class="font-disp text-shine">증명</span>합니다.', '환자 동의 하에 게시된 실제 치료 전후 기록입니다.')}
<section class="max-w-6xl mx-auto px-5 py-12">
  <nav id="case-filter" aria-label="진료별 치료사례" class="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 mb-8 scrollbar-none">
    <a href="/cases" class="shrink-0 px-5 py-2.5 rounded-full text-[13.5px] font-bold transition ${!cat ? 'bg-ink text-white' : 'bg-white border border-ink/10 text-ink/60 hover:border-ink'}">전체</a>
    ${TREATMENTS.map((t) => `<a href="/cases?category=${t.slug}" class="shrink-0 px-5 py-2.5 rounded-full text-[13.5px] font-bold transition ${cat === t.slug ? 'bg-ink text-white' : 'bg-white border border-ink/10 text-ink/60 hover:border-ink'}">${t.name}</a>`).join('')}
  </nav>
  ${catT ? `<p class="mb-6 text-[13.5px] text-ink/50">${catT.name} 치료사례 ${total}건 · <a href="/treatments/${catT.slug}" class="font-bold text-ink underline decoration-gold-500 underline-offset-4">${catT.name} 진료 안내</a> · <a href="/blog?category=${catT.slug}" class="font-bold text-ink underline decoration-gold-500 underline-offset-4">${catT.name} 칼럼</a></p>` : ''}
  ${rows.length === 0 ? `<div class="text-center py-24"><span class="inline-flex w-16 h-16 rounded-3xl bg-ink/5 items-center justify-center text-2xl text-ink/25 mb-4"><i class="fas fa-folder-open"></i></span><p class="text-ink/40 font-medium">등록된 치료사례가 없습니다.</p></div>` : `
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-stagger>
    ${rows.map((r) => {
      const t = r.category ? getTreatment(r.category) : null
      const thumb = r.intra_after_key || r.pano_after_key || r.intra_before_key || r.pano_before_key
      const thumbAlt = `${t ? t.name : '치과'} ${r.intra_after_key || r.pano_after_key ? '치료 후' : '치료 전'}`
      return `
    <a href="/cases/${r.id}" class="bento case-card group block rounded-3xl bg-white border border-ink/8 overflow-hidden">
      <div class="aspect-[4/3] bg-ink/[0.03] overflow-hidden flex items-center justify-center relative">
        ${thumb ? `<img src="${imgUrl(thumb)}" alt="${esc(thumbAlt)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async">` : '<i class="fas fa-tooth text-5xl text-ink/10"></i>'}
        ${t ? `<span class="absolute top-3 left-3 text-[10.5px] font-extrabold tracking-wide bg-ink/75 backdrop-blur text-gold-400 rounded-full px-3 py-1.5">${t.name}</span>` : ''}
      </div>
      <div class="p-6">
        <h2 class="font-extrabold text-ink text-[15.5px] tracking-tight line-clamp-2 leading-snug">${esc(r.title)}</h2>
        <p class="mt-2.5 text-[12px] text-ink/40 flex items-center gap-2 flex-wrap">${[r.age_group, r.gender, r.region].filter(Boolean).map((x) => `<span>${esc(String(x))}</span>`).join('<span class="w-0.5 h-0.5 rounded-full bg-ink/25"></span>')}</p>
        <p class="mt-3 pt-3 border-t border-ink/5 text-[11.5px] text-ink/30 flex justify-between"><span>${fmtDate(r.created_at)}</span><span><i class="fas fa-eye mr-1"></i>${r.views}</span></p>
      </div>
    </a>`
    }).join('')}
  </div>
  ${pager(`/cases?${cat ? `category=${cat}&` : ''}`, page, pages)}`}
</section>`
  const listUrl = `${CLINIC.siteUrl}${selfPath}`
  const jsonLd = [{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        '@id': `${listUrl}#itemlist`,
        name: `${catT ? `${catT.name} ` : ''}치료사례 목록${page > 1 ? ` ${page}페이지` : ''}`,
        numberOfItems: total,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: rows.map((r, i) => ({ '@type': 'ListItem', position: (page - 1) * CASES_PER + i + 1, url: `${CLINIC.siteUrl}/cases/${r.id}`, name: cleanCaseTitle(r.title) })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: `${CLINIC.siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: '치료사례', item: `${CLINIC.siteUrl}/cases` },
          ...(catT ? [{ '@type': 'ListItem', position: 3, name: catT.name, item: `${CLINIC.siteUrl}/cases?category=${catT.slug}` }] : []),
        ],
      },
    ],
  }]
  const title = `${catT ? `${catT.name} ` : ''}치료사례 — ${catT ? '실제 치료 전후 기록' : '임플란트·라미네이트 전후사진'}${page > 1 ? ` (${page}페이지)` : ''}`
  const desc = catT
    ? `검단퍼스트치과 ${catT.name} 치료사례 ${total}건 — 환자 동의 하에 게시한 실제 치료 전후 기록입니다. 치료 결과는 개인에 따라 다를 수 있습니다.`
    : '검단퍼스트치과 치료사례 — 임플란트, 무삭제 라미네이트, 턱관절 치료 등 실제 환자 치료 전후 사진을 확인하세요. 모든 사례는 환자 동의 하에 게시됩니다.'
  return c.html(layout({ title, desc: page > 1 ? `${desc} (${page}페이지)` : desc, path: '/cases', canonicalPath: selfPath, jsonLd, webPage: { '@type': 'CollectionPage', name: title, mainEntity: { '@id': `${listUrl}#itemlist` } } }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 치료사례 상세 ============
content.get('/cases/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  if (!id) return c.notFound()
  const r = await c.env.DB.prepare('SELECT * FROM before_after WHERE id = ? AND published = 1').bind(id).first<BARow>()
  if (!r) return c.notFound()
  await c.env.DB.prepare('UPDATE before_after SET views = views + 1 WHERE id = ?').bind(id).run()
  const t = r.category ? getTreatment(r.category) : null
  const txName = t ? t.name : '치과'

  // 같은 진료의 다른 사례 3건 + 관련 칼럼 3편 (D1 실패해도 페이지는 동작)
  let sibCases: { id: number; title: string }[] = []
  let relPosts: { slug: string; title: string }[] = []
  if (t) {
    try {
      const al = categoryAliases(t.slug)
      const [cs, ps] = await Promise.all([
        c.env.DB.prepare('SELECT id, title FROM before_after WHERE published = 1 AND category = ? AND id <> ? ORDER BY created_at DESC LIMIT 3').bind(t.slug, r.id).all<{ id: number; title: string }>(),
        c.env.DB.prepare(`SELECT slug, title FROM blog_posts WHERE published = 1 AND category IN (${al.map(() => '?').join(',')}) ORDER BY created_at DESC LIMIT 3`).bind(...al).all<{ slug: string; title: string }>(),
      ])
      sibCases = cs.results
      relPosts = ps.results
    } catch { /* noop */ }
  }

  const isMember = !!c.get('user') || !!c.get('isAdmin')
  const repAfter = r.intra_after_key || r.pano_after_key
  const repKey = repAfter || r.intra_before_key || r.pano_before_key
  const summary = caseAutoSummary(r)
  const lockedBlock = `
  ${repKey ? `<figure class="mb-8"><figcaption class="text-[13px] font-extrabold text-ink mb-3 uppercase tracking-wide">대표 사진</figcaption><img src="${imgUrl(repKey)}" alt="${esc(`${txName} ${repAfter ? '치료 후' : '치료 전'}`)}" class="w-full rounded-3xl border border-ink/8" loading="lazy" decoding="async"></figure>` : ''}
  <div id="member-lock" class="relative rounded-3xl bg-ink text-white p-9 sm:p-12 text-center overflow-hidden">
    <div class="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gold-500/15 blur-[80px]" aria-hidden="true"></div>
    <span class="relative inline-flex w-14 h-14 rounded-2xl bg-white/10 items-center justify-center text-xl text-gold-400 mb-5"><i class="fas fa-lock"></i></span>
    <h2 class="relative text-xl sm:text-2xl font-extrabold tracking-tight">전후비교 슬라이더와 치료 이야기는<br>회원에게만 공개됩니다.</h2>
    <p class="relative mt-3 text-[13.5px] text-white/50 leading-relaxed">환자 프라이버시 보호를 위해 상세 기록은 회원 인증 후 열람하실 수 있습니다.<br>가입은 30초면 충분합니다.</p>
    <div class="relative mt-7 flex flex-wrap justify-center gap-2.5">
      <a href="/signup" rel="nofollow" class="btn-3d px-7 py-3.5 rounded-full bg-gold-500 text-ink text-sm font-extrabold hover:bg-gold-400 transition">30초 회원가입</a>
      <a href="/login?next=${encodeURIComponent(`/cases/${r.id}`)}" rel="nofollow" class="px-7 py-3.5 rounded-full border border-white/20 text-white text-sm font-extrabold hover:bg-white/10 transition">로그인</a>
    </div>
  </div>`
  const memberBlock = `
  ${baCompare(r.intra_before_key, r.intra_after_key, '구내포토', txName)}
  ${baCompare(r.pano_before_key, r.pano_after_key, '파노라마', txName)}
  ${r.description ? `<div class="prose-clinic mt-4"><h2>치료 이야기</h2>${r.description.split('\n').filter((p) => p.trim()).map((p) => `<p>${esc(p)}</p>`).join('')}</div>` : ''}`

  const facts: [string, string][] = [
    ['진료', t ? `<a href="/treatments/${t.slug}" class="font-bold text-ink underline decoration-gold-500 underline-offset-4">${t.name}</a>` : ''],
    ['치료 기간', r.duration ? esc(r.duration) : ''],
    ['담당', r.doctor ? `<a href="/about" class="font-bold text-ink underline decoration-gold-500 underline-offset-4">${esc(r.doctor)} 대표원장</a>` : ''],
    ['게시일', fmtDate(r.created_at)],
  ]
  const body = `
<section class="page-hero relative bg-ink text-white pt-36 pb-14 sm:pt-44 px-5 overflow-hidden">
  <div class="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-navy-600/25 blur-[130px]" aria-hidden="true"></div>
  <div class="max-w-3xl mx-auto relative">
    <nav aria-label="breadcrumb" class="reveal text-[12px] text-white/35 font-medium"><a href="/" class="hover:text-gold-400">홈</a> / <a href="/cases" class="hover:text-gold-400">치료사례</a>${t ? ` / <a href="/cases?category=${t.slug}" class="hover:text-gold-400">${t.name}</a>` : ''}</nav>
    <h1 class="reveal mt-5 text-3xl sm:text-5xl font-extrabold tracking-tightest leading-tight">${esc(r.title)}</h1>
    <div class="reveal mt-6 flex flex-wrap gap-2">
      ${[t?.name, r.age_group, r.gender, r.region, r.duration ? `치료기간 ${r.duration}` : '', `담당 ${r.doctor} 원장`].filter(Boolean).map((x) => `<span class="text-[12px] font-bold bg-white/[0.08] border border-white/10 rounded-full px-3.5 py-1.5 text-white/70">${esc(String(x))}</span>`).join('')}
    </div>
  </div>
</section>
<article class="max-w-3xl mx-auto px-5 py-12">
  <div class="case-summary mb-8 rounded-3xl bg-white border border-ink/8 p-6 sm:p-7">
    <p class="answer-summary text-[15px] leading-[1.85] text-ink/75">${esc(summary)}</p>
    <dl class="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12.5px]">
      ${facts.filter(([, v]) => v).map(([k, v]) => `<div><dt class="text-ink/35 font-semibold">${k}</dt><dd class="mt-1 text-ink/80">${v}</dd></div>`).join('')}
    </dl>
  </div>
  ${isMember ? memberBlock : lockedBlock}
  <p class="mt-10 text-[11.5px] text-ink/35 bg-white border border-ink/8 rounded-2xl p-5 leading-relaxed"><i class="fas fa-circle-info mr-1.5"></i>본 치료사례는 환자 동의 하에 게시되었으며, 전후 사진은 같은 촬영 조건에서 기록했습니다. 치료 결과는 개인에 따라 다를 수 있습니다.</p>
  ${sibCases.length || relPosts.length ? `
  <section class="mt-10" aria-label="관련 콘텐츠">
    ${sibCases.length ? `<h2 class="text-[15px] font-extrabold text-ink">${txName} 다른 치료사례</h2>
    <ul class="mt-3 space-y-2">${sibCases.map((s) => `<li><a href="/cases/${s.id}" class="block rounded-2xl bg-white border border-ink/8 px-5 py-3.5 text-[14px] font-semibold text-ink/80 hover:border-ink/30 transition">${esc(s.title)}</a></li>`).join('')}</ul>
    <p class="mt-2 text-right"><a href="/cases?category=${t!.slug}" class="text-[12.5px] font-bold text-ink/50 hover:text-ink">${txName} 사례 전체 보기 →</a></p>` : ''}
    ${relPosts.length ? `<h2 class="mt-8 text-[15px] font-extrabold text-ink">${txName} 관련 원장 칼럼</h2>
    <ul class="mt-3 space-y-2">${relPosts.map((p) => `<li><a href="/blog/${esc(p.slug)}" class="block rounded-2xl bg-white border border-ink/8 px-5 py-3.5 text-[14px] font-semibold text-ink/80 hover:border-ink/30 transition">${esc(p.title)}</a></li>`).join('')}</ul>` : ''}
  </section>` : ''}
  ${t ? `
  <div class="mt-10 rounded-3xl bg-ink text-white p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden" data-tilt data-tilt-max="5">
    <div class="absolute -bottom-14 -right-10 w-48 h-48 rounded-full bg-gold-500/15 blur-[70px]" aria-hidden="true"></div>
    <div class="relative"><p class="text-lg font-extrabold tracking-tight">${t.name}, 더 알아보시겠어요?</p><p class="mt-1 text-[13px] text-white/45">${t.tagline}</p></div>
    <a href="/treatments/${t.slug}" class="btn-3d relative shrink-0 px-6 py-3.5 rounded-full bg-gold-500 text-ink text-sm font-extrabold hover:bg-gold-400 transition">진료 안내 <i class="fas fa-arrow-right ml-1 text-xs"></i></a>
  </div>` : ''}
</article>`
  // 얇은 사례(비로그인 고유 본문 300자 미만) → noindex, follow (페이지·링크 유지) — 2026-09-29 GSC 결정 유지
  const thin = isThinCase(r)
  if (thin) c.header('X-Robots-Tag', NOINDEX_FOLLOW)
  const pageUrl = `${CLINIC.siteUrl}/cases/${r.id}`
  const ct = cleanCaseTitle(r.title)
  const titleText = `${t ? `${t.name} 사례 — ` : ''}${ct}${r.duration ? ` (치료 ${r.duration})` : ''}`
  const jsonLd = [{
    '@context': 'https://schema.org',
    '@graph': [{
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${CLINIC.siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: '치료사례', item: `${CLINIC.siteUrl}/cases` },
        ...(t ? [{ '@type': 'ListItem', position: 3, name: t.name, item: `${CLINIC.siteUrl}/cases?category=${t.slug}` }] : []),
        { '@type': 'ListItem', position: t ? 4 : 3, name: ct, item: pageUrl },
      ],
    }],
  }]
  // 페이지 노드 = MedicalWebPage (Review·Rating 없음 — 의료법)
  const webPage: Record<string, unknown> = {
    '@type': 'MedicalWebPage',
    name: titleText,
    description: summary,
    breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
    ...(t ? { about: { '@id': procedureId(t.slug) } } : {}),
    reviewedBy: { '@id': PHYSICIAN_ID },
    lastReviewed: kstDate(r.updated_at || r.created_at),
    datePublished: toIso(r.created_at),
    dateModified: toIso(r.updated_at || r.created_at),
    inLanguage: 'ko-KR',
    medicalAudience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.answer-summary'] },
  }
  const desc = clipSentences(`${ct} — ${summary}`, 155)
  return c.html(layout({ title: titleText, desc, path: `/cases/${r.id}`, robots: thin ? NOINDEX_FOLLOW : undefined, jsonLd, webPage }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 건강칼럼(블로그) 목록 ============
const BLOG_PER = 10
content.get('/blog', async (c) => {
  const catQ = c.req.query('category') || ''
  const catT = getTreatment(catQ) || null
  const page = Math.max(1, parseInt(c.req.query('page') || '1') || 1)
  const al = catT ? categoryAliases(catT.slug) : []
  const where = catT ? `WHERE published = 1 AND category IN (${al.map(() => '?').join(',')})` : 'WHERE published = 1'
  const total = (await c.env.DB.prepare(`SELECT COUNT(*) AS n FROM blog_posts ${where}`).bind(...al).first<{ n: number }>())?.n || 0
  const rows = (await c.env.DB.prepare(`SELECT id, title, slug, excerpt, thumbnail_key, author, category, views, created_at FROM blog_posts ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...al, BLOG_PER, (page - 1) * BLOG_PER).all<BlogRow>()).results
  const pages = Math.max(1, Math.ceil(total / BLOG_PER))
  if (page > pages && total > 0) return c.redirect(`/blog${catT ? `?category=${catT.slug}` : ''}`, 302)
  // 칼럼이 있는 진료만 필터 칩으로
  let catCounts: Record<string, number> = {}
  try {
    const cc = (await c.env.DB.prepare('SELECT category, COUNT(*) AS n FROM blog_posts WHERE published = 1 GROUP BY category').all<{ category: string | null; n: number }>()).results
    for (const x of cc) { const s = treatmentSlugForCategory(x.category); if (s) catCounts[s] = (catCounts[s] || 0) + x.n }
  } catch { catCounts = {} }
  const qs = [catT ? `category=${catT.slug}` : '', page > 1 ? `page=${page}` : ''].filter(Boolean).join('&')
  const selfPath = `/blog${qs ? `?${qs}` : ''}`
  const catLabel = (cat: string | null) => { const s = treatmentSlugForCategory(cat); const tt = s ? getTreatment(s) : null; return tt ? tt.name : (cat || '') }

  const body = `
${pageHero('Column', '원장이 직접 쓰는<br><span class="font-disp text-shine">치아 이야기.</span>', '광고 글이 아닌, 진짜 도움이 되는 정보만 씁니다.')}
<section class="max-w-4xl mx-auto px-5 py-12">
  <nav id="blog-filter" aria-label="진료별 칼럼" class="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 mb-8 scrollbar-none">
    <a href="/blog" class="shrink-0 px-5 py-2.5 rounded-full text-[13.5px] font-bold transition ${!catT ? 'bg-ink text-white' : 'bg-white border border-ink/10 text-ink/60 hover:border-ink'}">전체</a>
    ${TREATMENTS.filter((t) => catCounts[t.slug]).map((t) => `<a href="/blog?category=${t.slug}" class="shrink-0 px-5 py-2.5 rounded-full text-[13.5px] font-bold transition ${catT?.slug === t.slug ? 'bg-ink text-white' : 'bg-white border border-ink/10 text-ink/60 hover:border-ink'}">${t.name} <span class="opacity-50">${catCounts[t.slug]}</span></a>`).join('')}
  </nav>
  ${catT ? `<p class="mb-6 text-[13.5px] text-ink/50">${catT.name} 칼럼 ${total}편 · <a href="/treatments/${catT.slug}" class="font-bold text-ink underline decoration-gold-500 underline-offset-4">${catT.name} 진료 안내</a> · <a href="/cases?category=${catT.slug}" class="font-bold text-ink underline decoration-gold-500 underline-offset-4">${catT.name} 치료사례</a></p>` : ''}
  ${rows.length === 0 ? `<div class="text-center py-24"><span class="inline-flex w-16 h-16 rounded-3xl bg-ink/5 items-center justify-center text-2xl text-ink/25 mb-4"><i class="fas fa-pen-nib"></i></span><p class="text-ink/40 font-medium">등록된 칼럼이 없습니다.</p></div>` : `
  <div class="space-y-3" data-stagger>
    ${rows.map((r) => `
    <a href="/blog/${esc(r.slug)}" class="bento blog-card group flex gap-6 rounded-3xl bg-white border border-ink/8 p-6 items-center">
      ${r.thumbnail_key ? `<img src="${imgUrl(r.thumbnail_key)}" alt="${esc(r.title)}" class="w-28 h-28 rounded-2xl object-cover shrink-0 hidden sm:block" width="112" height="112" loading="lazy" decoding="async">` : `<span class="w-28 h-28 rounded-2xl bg-ink/[0.04] text-ink/15 hidden sm:flex items-center justify-center text-3xl shrink-0"><i class="fas fa-tooth"></i></span>`}
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2.5 text-[11.5px]">
          ${r.category ? `<span class="font-extrabold text-gold-600 tracking-wide uppercase">${esc(catLabel(r.category))}</span><span class="w-0.5 h-0.5 rounded-full bg-ink/25"></span>` : ''}
          <span class="text-ink/35">${fmtDate(r.created_at)}</span>
        </div>
        <h2 class="mt-2 font-extrabold text-ink text-lg tracking-tight line-clamp-2 leading-snug group-hover:underline decoration-gold-500 decoration-2 underline-offset-4">${esc(r.title)}</h2>
        ${r.excerpt ? `<p class="mt-1.5 text-[13.5px] text-ink/45 line-clamp-2 leading-relaxed">${esc(answerSummary(r.title, r.excerpt, ''))}</p>` : ''}
      </div>
      <span class="hidden sm:flex w-11 h-11 rounded-full bg-ink/[0.04] items-center justify-center text-ink/40 group-hover:bg-ink group-hover:text-gold-400 transition shrink-0"><i class="fas fa-arrow-right text-sm"></i></span>
    </a>`).join('')}
  </div>
  ${pager(`/blog?${catT ? `category=${catT.slug}&` : ''}`, page, pages)}`}
</section>`
  const listUrl = `${CLINIC.siteUrl}${selfPath}`
  const jsonLd = [{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        '@id': `${listUrl}#itemlist`,
        name: `${catT ? `${catT.name} ` : ''}건강칼럼 목록${page > 1 ? ` ${page}페이지` : ''}`,
        numberOfItems: total,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: rows.map((r, i) => ({ '@type': 'ListItem', position: (page - 1) * BLOG_PER + i + 1, url: `${CLINIC.siteUrl}/blog/${r.slug}`, name: r.title })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: `${CLINIC.siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: '건강칼럼', item: `${CLINIC.siteUrl}/blog` },
          ...(catT ? [{ '@type': 'ListItem', position: 3, name: catT.name, item: `${CLINIC.siteUrl}/blog?category=${catT.slug}` }] : []),
        ],
      },
    ],
  }]
  const title = `${catT ? `${catT.name} ` : ''}건강칼럼 — 원장이 직접 쓰는 치아 이야기${page > 1 ? ` (${page}페이지)` : ''}`
  const desc = catT
    ? `검단퍼스트치과 ${catT.name} 칼럼 ${total}편 — 통합치의학 전문의 김희수 원장이 직접 쓰는 ${catT.name} 치료 정보와 관리법.`
    : '검단퍼스트치과 건강칼럼 — 임플란트, 라미네이트, 턱관절, 신경치료 등 통합치의학 전문의 김희수 원장이 직접 쓰는 치아 건강 정보와 치료 상식을 전해드립니다.'
  return c.html(layout({ title, desc: page > 1 ? `${desc} (${page}페이지)` : desc, path: '/blog', canonicalPath: selfPath, jsonLd, webPage: { '@type': 'CollectionPage', name: title, mainEntity: { '@id': `${listUrl}#itemlist` } } }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 건강칼럼 상세 ============
content.get('/blog/:slug', async (c) => {
  const slug = c.req.param('slug')
  const r = await c.env.DB.prepare('SELECT * FROM blog_posts WHERE slug = ? AND published = 1').bind(slug).first<BlogRow>()
  if (!r) return c.notFound()
  await c.env.DB.prepare('UPDATE blog_posts SET views = views + 1 WHERE id = ?').bind(r.id).run()

  const pageUrl = `${CLINIC.siteUrl}/blog/${r.slug}`
  const txSlug = treatmentSlugForCategory(r.category)
  const tx = txSlug ? getTreatment(txSlug) : null

  // 관련 칼럼 3편(같은 진료 → 없으면 최신) + 관련 치료사례 3건 (D1 실패해도 페이지는 동작)
  let relPosts: { slug: string; title: string; created_at: string }[] = []
  let relCases: { id: number; title: string }[] = []
  try {
    const al = tx ? categoryAliases(tx.slug) : []
    const [ps, cs] = await Promise.all([
      tx
        ? c.env.DB.prepare(`SELECT slug, title, created_at FROM blog_posts WHERE published = 1 AND id <> ? AND category IN (${al.map(() => '?').join(',')}) ORDER BY created_at DESC LIMIT 3`).bind(r.id, ...al).all<{ slug: string; title: string; created_at: string }>()
        : c.env.DB.prepare('SELECT slug, title, created_at FROM blog_posts WHERE published = 1 AND id <> ? ORDER BY created_at DESC LIMIT 3').bind(r.id).all<{ slug: string; title: string; created_at: string }>(),
      tx ? c.env.DB.prepare('SELECT id, title FROM before_after WHERE published = 1 AND category = ? ORDER BY created_at DESC LIMIT 3').bind(tx.slug).all<{ id: number; title: string }>() : Promise.resolve({ results: [] as { id: number; title: string }[] }),
    ])
    relPosts = ps.results
    relCases = cs.results
    if (tx && relPosts.length < 3) {
      const more = (await c.env.DB.prepare('SELECT slug, title, created_at FROM blog_posts WHERE published = 1 AND id <> ? ORDER BY created_at DESC LIMIT 6').bind(r.id).all<{ slug: string; title: string; created_at: string }>()).results
      for (const m of more) if (relPosts.length < 3 && !relPosts.some((x) => x.slug === m.slug)) relPosts.push(m)
    }
  } catch { /* noop */ }

  const firstImg = (r.content_html.match(/<img[^>]+src=["']([^"']+)["']/i) || [])[1]
  const absUrl = (u: string) => (u.startsWith('http') ? u : `${CLINIC.siteUrl}${u.startsWith('/') ? '' : '/'}${u}`)
  const postImage = r.thumbnail_key ? absUrl(imgUrl(r.thumbnail_key)) : firstImg ? absUrl(firstImg) : `${CLINIC.siteUrl}/static/images/og_default.jpg`
  // 원장 작성 근거 없는 글(대행사 시드 등, lib/column-seo.ts) → 병원 발행
  const clinicPost = isClinicPublishedPost(r)
  const isDirector = !clinicPost && (!r.author || (r.author || '').includes(CLINIC.doctor))
  const summary = answerSummary(r.title, r.excerpt, r.content_html)
  const metaDesc = clipSentences(summary || flatText(r.content_html) || `${r.title} — 검단퍼스트치과 건강칼럼`, 155, 60)
  const faqs = faqsFromArticleHtml(r.content_html)
  if (summary && /[?？]$/.test(r.title.trim()) && !faqs.some((f) => f.q === r.title.trim())) faqs.unshift({ q: r.title.trim(), a: summary })
  const published = toIso(r.created_at)
  const modified = toIso(r.updated_at || r.created_at)
  const reviewed = kstDate(r.updated_at || r.created_at)
  const authorRef = clinicPost ? { '@id': `${CLINIC.siteUrl}/#clinic` } : isDirector ? { '@id': PHYSICIAN_ID } : { '@type': 'Person', name: r.author }

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BlogPosting',
      '@id': `${pageUrl}#article`,
      headline: r.title.slice(0, 110),
      description: metaDesc,
      image: { '@type': 'ImageObject', url: postImage },
      datePublished: published,
      dateModified: modified,
      inLanguage: 'ko-KR',
      author: authorRef,
      ...(isDirector ? { reviewedBy: { '@id': PHYSICIAN_ID } } : {}),
      publisher: { '@id': `${CLINIC.siteUrl}/#clinic` },
      mainEntityOfPage: { '@id': pageUrl },
      isPartOf: { '@id': `${CLINIC.siteUrl}/#website` },
      ...(tx ? { about: { '@id': procedureId(tx.slug) }, articleSection: tx.name } : r.category ? { articleSection: r.category } : {}),
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.answer-summary'] },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${CLINIC.siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: '건강칼럼', item: `${CLINIC.siteUrl}/blog` },
        ...(tx ? [{ '@type': 'ListItem', position: 3, name: tx.name, item: `${CLINIC.siteUrl}/blog?category=${tx.slug}` }] : []),
        { '@type': 'ListItem', position: tx ? 4 : 3, name: r.title, item: pageUrl },
      ],
    },
  ]
  if (faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    })
  }
  // 페이지 노드(layout 의 WebPage @id = URL) = MedicalWebPage
  const webPage: Record<string, unknown> = {
    '@type': 'MedicalWebPage',
    name: r.title,
    mainEntity: { '@id': `${pageUrl}#article` },
    breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
    ...(tx ? { about: { '@id': procedureId(tx.slug) } } : {}),
    ...(isDirector ? { reviewedBy: { '@id': PHYSICIAN_ID }, lastReviewed: reviewed } : {}),
    datePublished: published,
    dateModified: modified,
    inLanguage: 'ko-KR',
    medicalAudience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.answer-summary'] },
  }

  const authorBox = clinicPost ? `
  <aside class="author-box mt-12 rounded-3xl bg-white border border-ink/8 p-6 sm:p-7 flex gap-5 items-start" aria-label="발행">
    <img src="/static/images/logo.png" alt="${CLINIC.shortName} 로고" width="88" height="88" class="w-[88px] h-[88px] rounded-2xl object-contain bg-white border border-ink/8 p-2 shrink-0" loading="lazy" decoding="async">
    <div class="min-w-0">
      <p class="text-[11px] font-extrabold tracking-[0.2em] uppercase text-gold-600">발행</p>
      <p class="mt-1 text-[17px] font-extrabold text-ink tracking-tight"><a href="/about" class="hover:underline decoration-gold-500 underline-offset-4">${CLINIC.shortName}</a></p>
      <p class="mt-1 text-[13px] text-ink/55 leading-relaxed">${CLINIC_GENERAL_INFO_NOTE}</p>
      <p class="mt-2 text-[12px] text-ink/40">게시 ${fmtDate(r.created_at)}${r.updated_at && fmtDate(r.updated_at) !== fmtDate(r.created_at) ? ` · 수정 ${fmtDate(r.updated_at)}` : ''}</p>
    </div>
  </aside>
  <p class="mt-4 text-[11.5px] text-ink/35 leading-relaxed"><i class="fas fa-circle-info mr-1.5"></i>이 글은 일반적인 건강 정보이며 진단을 대신하지 않습니다. 치료 방법과 결과는 개인에 따라 다를 수 있으니 정확한 판단은 내원 상담으로 확인하세요.</p>` : `
  <aside class="author-box mt-12 rounded-3xl bg-white border border-ink/8 p-6 sm:p-7 flex gap-5 items-start" aria-label="글쓴이">
    <img src="/static/images/doctor_portrait.webp" alt="${CLINIC.doctor} 대표원장" width="88" height="88" class="w-[88px] h-[88px] rounded-2xl object-cover shrink-0" loading="lazy" decoding="async">
    <div class="min-w-0">
      <p class="text-[11px] font-extrabold tracking-[0.2em] uppercase text-gold-600">글·감수</p>
      <p class="mt-1 text-[17px] font-extrabold text-ink tracking-tight"><a href="/about" class="hover:underline decoration-gold-500 underline-offset-4">${CLINIC.doctor} 대표원장</a></p>
      <p class="mt-1 text-[13px] text-ink/55 leading-relaxed">보건복지부 인증 통합치의학 전문의 · 대한치과보철학회 인증 우수보철의사</p>
      <p class="mt-2 text-[12px] text-ink/40">게시 ${fmtDate(r.created_at)} · 최종 검토 ${reviewed.replace(/-/g, '.')}</p>
    </div>
  </aside>
  <p class="mt-4 text-[11.5px] text-ink/35 leading-relaxed"><i class="fas fa-circle-info mr-1.5"></i>이 글은 일반적인 건강 정보이며 진단을 대신하지 않습니다. 치료 방법과 결과는 개인에 따라 다를 수 있으니 정확한 판단은 내원 상담으로 확인하세요.</p>`

  const relatedBlock = tx || relPosts.length || relCases.length ? `
  <section class="mt-12 not-prose" aria-label="관련 콘텐츠">
    ${tx ? `<a href="/treatments/${tx.slug}" class="block rounded-3xl bg-white border border-ink/8 p-6 hover:border-ink/30 transition"><span class="text-[11px] font-extrabold tracking-[0.2em] uppercase text-gold-600">관련 진료</span><span class="mt-1 block text-[17px] font-extrabold text-ink">${tx.name} 진료 안내 →</span><span class="mt-1 block text-[13px] text-ink/50">${esc(tx.tagline)}</span></a>` : ''}
    ${relCases.length ? `<h2 class="mt-8 !text-[15px] font-extrabold text-ink">${tx ? tx.name : ''} 치료사례</h2>
    <ul class="mt-3 space-y-2 list-none p-0">${relCases.map((s) => `<li><a href="/cases/${s.id}" class="block rounded-2xl bg-white border border-ink/8 px-5 py-3.5 text-[14px] font-semibold text-ink/80 hover:border-ink/30 transition">${esc(s.title)}</a></li>`).join('')}</ul>` : ''}
    ${relPosts.length ? `<h2 class="mt-8 !text-[15px] font-extrabold text-ink">함께 읽으면 좋은 칼럼</h2>
    <ul class="mt-3 space-y-2 list-none p-0">${relPosts.map((p) => `<li><a href="/blog/${esc(p.slug)}" class="block rounded-2xl bg-white border border-ink/8 px-5 py-3.5 text-[14px] font-semibold text-ink/80 hover:border-ink/30 transition">${esc(p.title)}</a></li>`).join('')}</ul>` : ''}
  </section>` : ''

  const body = `
<section class="page-hero relative bg-ink text-white pt-36 pb-14 sm:pt-44 px-5 overflow-hidden">
  <div class="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-navy-600/25 blur-[130px]" aria-hidden="true"></div>
  <div class="max-w-3xl mx-auto relative">
    <nav aria-label="breadcrumb" class="reveal text-[12px] text-white/35 font-medium"><a href="/" class="hover:text-gold-400">홈</a> / <a href="/blog" class="hover:text-gold-400">건강칼럼</a>${tx ? ` / <a href="/blog?category=${tx.slug}" class="hover:text-gold-400">${tx.name}</a>` : ''}</nav>
    ${r.category ? `<p class="reveal mt-5 text-gold-400 text-xs font-extrabold tracking-[0.25em] uppercase">${esc(tx ? tx.name : r.category)}</p>` : ''}
    <h1 class="reveal mt-3 text-3xl sm:text-5xl font-extrabold tracking-tightest leading-tight">${esc(r.title)}</h1>
    <p class="reveal mt-5 text-[13px] text-white/40 font-medium">${clinicPost ? CLINIC.shortName : esc(r.author || `${CLINIC.doctor} 대표원장`)} · ${fmtDate(r.created_at)} · <i class="fas fa-eye"></i> ${r.views + 1}</p>
  </div>
</section>
<article class="max-w-3xl mx-auto px-5 py-12 blog-content">
  ${summary ? `<div class="answer-box not-prose mb-10 rounded-3xl bg-white border border-ink/8 border-l-4 border-l-gold-500 p-6 sm:p-7"><p class="text-[11px] font-extrabold tracking-[0.2em] uppercase text-gold-600">핵심 답변</p><p class="answer-summary mt-2 text-[15.5px] leading-[1.85] text-ink/80 font-medium">${esc(summary)}</p></div>` : ''}
  ${r.thumbnail_key ? `<img src="${imgUrl(r.thumbnail_key)}" alt="${esc(r.title)}" class="w-full rounded-3xl mb-10" decoding="async" fetchpriority="high">` : ''}
  ${enhanceArticleImages(r.content_html, r.title, !r.thumbnail_key)}
  ${authorBox}
  ${relatedBlock}
  <footer class="mt-12 rounded-3xl bg-ink text-white p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 not-prose relative overflow-hidden" data-tilt data-tilt-max="5">
    <div class="absolute -bottom-14 -right-10 w-48 h-48 rounded-full bg-gold-500/15 blur-[70px]" aria-hidden="true"></div>
    <p class="relative text-lg font-extrabold tracking-tight">궁금한 점이 있으신가요?</p>
    <a href="tel:032-563-2872" class="btn-3d relative shrink-0 px-6 py-3.5 rounded-full bg-gold-500 text-ink text-sm font-extrabold hover:bg-gold-400 transition"><i class="fas fa-phone mr-2"></i>032-563-2872</a>
  </footer>
</article>`
  return c.html(layout({
    title: r.title,
    desc: metaDesc,
    path: `/blog/${r.slug}`,
    jsonLd: [{ '@context': 'https://schema.org', '@graph': graph }],
    webPage,
    ogType: 'article',
    article: { published, modified, section: tx ? tx.name : r.category || undefined },
    ogImage: r.thumbnail_key ? absUrl(imgUrl(r.thumbnail_key)) : undefined,
  }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 공지사항 목록 ============
content.get('/notice', async (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '1') || 1)
  const per = 15
  const total = (await c.env.DB.prepare('SELECT COUNT(*) AS n FROM notices WHERE published = 1').first<{ n: number }>())?.n || 0
  const rows = (await c.env.DB.prepare('SELECT id, title, is_pinned, views, created_at FROM notices WHERE published = 1 ORDER BY is_pinned DESC, created_at DESC LIMIT ? OFFSET ?').bind(per, (page - 1) * per).all<NoticeRow>()).results
  const pages = Math.max(1, Math.ceil(total / per))

  const body = `
${pageHero('Notice', '병원 소식을<br><span class="font-disp text-shine">전해드립니다.</span>')}
<section class="max-w-3xl mx-auto px-5 py-12">
  ${rows.length === 0 ? `<div class="text-center py-24"><span class="inline-flex w-16 h-16 rounded-3xl bg-ink/5 items-center justify-center text-2xl text-ink/25 mb-4"><i class="fas fa-bullhorn"></i></span><p class="text-ink/40 font-medium">등록된 공지사항이 없습니다.</p></div>` : `
  <ul class="space-y-2.5" data-stagger>
    ${rows.map((r) => `
    <li>
      <a href="/notice/${r.id}" class="bento group flex items-center gap-4 rounded-2xl bg-white border border-ink/8 py-5 px-6">
        ${r.is_pinned ? '<span class="shrink-0 text-[10.5px] font-extrabold tracking-wide bg-gold-500 text-ink rounded-full px-3 py-1">공지</span>' : '<span class="shrink-0 w-1.5 h-1.5 rounded-full bg-ink/15"></span>'}
        <span class="font-bold text-ink text-[14.5px] line-clamp-1 flex-1 group-hover:underline decoration-gold-500 decoration-2 underline-offset-4">${esc(r.title)}</span>
        <span class="text-[12px] text-ink/30 shrink-0 font-medium">${fmtDate(r.created_at)}</span>
      </a>
    </li>`).join('')}
  </ul>
  ${pager('/notice?', page, pages)}`}
</section>`
  // 공지가 적어 목록 본문이 얇으면 noindex, follow (공지가 쌓이면 자동 복귀)
  const thinList = isThinList(rows.map((r) => r.title))
  if (thinList) c.header('X-Robots-Tag', NOINDEX_FOLLOW)
  return c.html(layout({ robots: thinList ? NOINDEX_FOLLOW : undefined, title: '공지사항 — 진료일정·휴진 안내', desc: '검단퍼스트치과 공지사항 — 진료일정 변경, 공휴일·휴진 안내, 병원 소식을 가장 빠르게 확인하실 수 있습니다. 진료 문의 032-563-2872.', path: '/notice' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 공지사항 상세 ============
content.get('/notice/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  if (!id) return c.notFound()
  const r = await c.env.DB.prepare('SELECT * FROM notices WHERE id = ? AND published = 1').bind(id).first<NoticeRow>()
  if (!r) return c.notFound()
  await c.env.DB.prepare('UPDATE notices SET views = views + 1 WHERE id = ?').bind(id).run()
  let images: string[] = []
  try { images = r.image_keys ? JSON.parse(r.image_keys) : [] } catch { /* noop */ }

  const body = `
<section class="page-hero relative bg-ink text-white pt-36 pb-14 sm:pt-44 px-5 overflow-hidden">
  <div class="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-navy-600/25 blur-[130px]" aria-hidden="true"></div>
  <div class="max-w-3xl mx-auto relative">
    <a href="/notice" class="reveal inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-gold-400 font-semibold transition"><i class="fas fa-arrow-left"></i>공지사항</a>
    <h1 class="reveal mt-5 text-3xl sm:text-4xl font-extrabold tracking-tightest leading-tight">${r.is_pinned ? '<span class="text-[11px] align-middle font-extrabold bg-gold-500 text-ink rounded-full px-3 py-1.5 mr-3 tracking-wide">공지</span>' : ''}${esc(r.title)}</h1>
    <p class="reveal mt-4 text-[13px] text-white/40 font-medium">${fmtDate(r.created_at)} · <i class="fas fa-eye"></i> ${r.views + 1}</p>
  </div>
</section>
<article class="max-w-3xl mx-auto px-5 py-12 blog-content">
  ${r.content_html}
  ${images.map((k) => `<img src="${imgUrl(k)}" alt="공지 이미지" class="w-full rounded-3xl my-5" loading="lazy" decoding="async">`).join('')}
</article>`
  const thin = isThinNotice(r)
  if (thin) c.header('X-Robots-Tag', NOINDEX_FOLLOW)
  return c.html(layout({ title: r.title, desc: `${r.title} — 검단퍼스트치과 공지사항`, path: `/notice/${r.id}`, robots: thin ? NOINDEX_FOLLOW : undefined }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ R2 이미지 서빙 ============
content.get('/images/*', async (c) => {
  const key = c.req.path.replace(/^\/images\//, '')
  if (!key) return c.notFound()
  const obj = await c.env.R2.get(key)
  if (!obj) return c.notFound()
  const headers = new Headers()
  headers.set('Content-Type', obj.httpMetadata?.contentType || 'image/jpeg')
  headers.set('Cache-Control', 'public, max-age=86400')
  return new Response(obj.body, { headers })
})

export default content
