// 콘텐츠 라우트 — 치료사례(비포애프터), 건강칼럼(블로그), 공지사항, 이미지 서빙 (2026 리뉴얼)
import { Hono } from 'hono'
import { layout, esc, pageHero } from '../lib/layout'
import { TREATMENTS, getTreatment } from '../data/treatments'
import type { AppEnv } from '../types'

const content = new Hono<AppEnv>()

interface BARow {
  id: number; title: string; description: string | null; age_group: string | null; gender: string | null
  category: string | null; region: string | null; doctor: string; duration: string | null
  pano_before_key: string | null; pano_after_key: string | null; intra_before_key: string | null; intra_after_key: string | null
  views: number; created_at: string
}
interface BlogRow { id: number; title: string; slug: string; content_html: string; excerpt: string | null; thumbnail_key: string | null; author: string; category: string | null; views: number; created_at: string }
interface NoticeRow { id: number; title: string; content_html: string; image_keys: string | null; is_pinned: number; views: number; created_at: string }

function fmtDate(s: string): string {
  return (s || '').slice(0, 10).replace(/-/g, '.')
}

function imgUrl(key: string | null): string {
  return key ? `/images/${key}` : ''
}

function pager(base: string, page: number, pages: number): string {
  if (pages <= 1) return ''
  return `<nav class="mt-12 flex justify-center gap-1.5">${Array.from({ length: pages }, (_, i) => i + 1).map((p) => `<a href="${base}page=${p}" class="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition ${p === page ? 'bg-ink text-white' : 'bg-white border border-ink/10 text-ink/60 hover:border-ink'}">${p}</a>`).join('')}</nav>`
}

function baCompare(beforeKey: string | null, afterKey: string | null, label: string): string {
  if (!beforeKey && !afterKey) return ''
  if (beforeKey && afterKey) {
    return `
<figure class="mb-8">
  <figcaption class="flex items-center justify-between mb-3">
    <span class="text-[13px] font-extrabold text-ink tracking-wide uppercase">${label}</span>
    <span class="text-[11.5px] text-ink/35"><i class="fas fa-arrows-left-right mr-1"></i>드래그해서 비교</span>
  </figcaption>
  <div class="ba-compare rounded-3xl overflow-hidden border border-ink/8 relative shadow-xl shadow-ink/5">
    <img src="${imgUrl(beforeKey)}" alt="${label} 치료 전" class="w-full block" loading="lazy">
    <img src="${imgUrl(afterKey)}" alt="${label} 치료 후" class="ba-after w-full block absolute inset-0" loading="lazy">
    <div class="ba-divider"></div>
    <span class="absolute bottom-3 left-3 text-[10px] font-extrabold tracking-[0.15em] bg-ink/70 backdrop-blur text-white rounded-full px-3 py-1.5 pointer-events-none">BEFORE</span>
    <span class="absolute bottom-3 right-3 text-[10px] font-extrabold tracking-[0.15em] bg-gold-500 text-ink rounded-full px-3 py-1.5 pointer-events-none">AFTER</span>
    <input type="range" min="0" max="100" value="50" aria-label="${label} 전후 비교 슬라이더">
  </div>
</figure>`
  }
  const key = beforeKey || afterKey
  const suffix = beforeKey ? '치료 전' : '치료 후'
  return `<figure class="mb-8"><figcaption class="text-[13px] font-extrabold text-ink mb-3 uppercase tracking-wide">${label} <span class="text-ink/35 font-medium">(${suffix})</span></figcaption><img src="${imgUrl(key)}" alt="${label} ${suffix}" class="w-full rounded-3xl border border-ink/8" loading="lazy"></figure>`
}

// ============ 치료사례 목록 ============
content.get('/cases', async (c) => {
  const cat = c.req.query('category') || ''
  const page = Math.max(1, parseInt(c.req.query('page') || '1') || 1)
  const per = 12
  const where = cat ? 'WHERE published = 1 AND category = ?' : 'WHERE published = 1'
  const binds = cat ? [cat] : []
  const total = (await c.env.DB.prepare(`SELECT COUNT(*) AS n FROM before_after ${where}`).bind(...binds).first<{ n: number }>())?.n || 0
  const rows = (await c.env.DB.prepare(`SELECT * FROM before_after ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...binds, per, (page - 1) * per).all<BARow>()).results
  const pages = Math.max(1, Math.ceil(total / per))

  const body = `
${pageHero('Before &amp; After', '결과로<br><span class="font-disp text-shine">증명</span>합니다.', '환자 동의 하에 게시된 실제 치료 전후 기록입니다.')}
<section class="max-w-6xl mx-auto px-5 py-12">
  <nav id="case-filter" class="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 mb-8 scrollbar-none">
    <a href="/cases" class="shrink-0 px-5 py-2.5 rounded-full text-[13.5px] font-bold transition ${!cat ? 'bg-ink text-white' : 'bg-white border border-ink/10 text-ink/60 hover:border-ink'}">전체</a>
    ${TREATMENTS.map((t) => `<a href="/cases?category=${t.slug}" class="shrink-0 px-5 py-2.5 rounded-full text-[13.5px] font-bold transition ${cat === t.slug ? 'bg-ink text-white' : 'bg-white border border-ink/10 text-ink/60 hover:border-ink'}">${t.name}</a>`).join('')}
  </nav>
  ${rows.length === 0 ? `<div class="text-center py-24"><span class="inline-flex w-16 h-16 rounded-3xl bg-ink/5 items-center justify-center text-2xl text-ink/25 mb-4"><i class="fas fa-folder-open"></i></span><p class="text-ink/40 font-medium">등록된 치료사례가 없습니다.</p></div>` : `
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-stagger>
    ${rows.map((r) => {
      const t = r.category ? getTreatment(r.category) : null
      const thumb = r.intra_after_key || r.pano_after_key || r.intra_before_key || r.pano_before_key
      return `
    <a href="/cases/${r.id}" class="bento case-card group block rounded-3xl bg-white border border-ink/8 overflow-hidden">
      <div class="aspect-[4/3] bg-ink/[0.03] overflow-hidden flex items-center justify-center relative">
        ${thumb ? `<img src="${imgUrl(thumb)}" alt="${esc(r.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy">` : '<i class="fas fa-tooth text-5xl text-ink/10"></i>'}
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
  return c.html(layout({ title: '치료사례', desc: '검단퍼스트치과 치료사례 — 임플란트, 라미네이트, 턱관절 등 실제 치료 전후 사진. 환자 동의 하에 게시.', path: '/cases' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 치료사례 상세 ============
content.get('/cases/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  if (!id) return c.notFound()
  const r = await c.env.DB.prepare('SELECT * FROM before_after WHERE id = ? AND published = 1').bind(id).first<BARow>()
  if (!r) return c.notFound()
  await c.env.DB.prepare('UPDATE before_after SET views = views + 1 WHERE id = ?').bind(id).run()
  const t = r.category ? getTreatment(r.category) : null

  const body = `
<section class="page-hero relative bg-ink text-white pt-36 pb-14 sm:pt-44 px-5 overflow-hidden">
  <div class="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-navy-600/25 blur-[130px]" aria-hidden="true"></div>
  <div class="max-w-3xl mx-auto relative">
    <a href="/cases" class="reveal inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-gold-400 font-semibold transition"><i class="fas fa-arrow-left"></i>치료사례</a>
    <h1 class="reveal mt-5 text-3xl sm:text-5xl font-extrabold tracking-tightest leading-tight">${esc(r.title)}</h1>
    <div class="reveal mt-6 flex flex-wrap gap-2">
      ${[t?.name, r.age_group, r.gender, r.region, r.duration ? `치료기간 ${r.duration}` : '', `담당 ${r.doctor} 원장`].filter(Boolean).map((x) => `<span class="text-[12px] font-bold bg-white/[0.08] border border-white/10 rounded-full px-3.5 py-1.5 text-white/70">${esc(String(x))}</span>`).join('')}
    </div>
  </div>
</section>
<article class="max-w-3xl mx-auto px-5 py-12">
  ${baCompare(r.intra_before_key, r.intra_after_key, '구내포토')}
  ${baCompare(r.pano_before_key, r.pano_after_key, '파노라마')}
  ${r.description ? `<div class="prose-clinic mt-4"><h2>치료 이야기</h2>${r.description.split('\n').filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('')}</div>` : ''}
  <p class="mt-10 text-[11.5px] text-ink/35 bg-white border border-ink/8 rounded-2xl p-5 leading-relaxed"><i class="fas fa-circle-info mr-1.5"></i>본 치료사례는 환자 동의 하에 게시되었으며, 치료 결과는 개인에 따라 다를 수 있습니다.</p>
  ${t ? `
  <div class="mt-6 rounded-3xl bg-ink text-white p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden" data-tilt data-tilt-max="5">
    <div class="absolute -bottom-14 -right-10 w-48 h-48 rounded-full bg-gold-500/15 blur-[70px]" aria-hidden="true"></div>
    <div class="relative"><p class="text-lg font-extrabold tracking-tight">${t.name}, 더 알아보시겠어요?</p><p class="mt-1 text-[13px] text-white/45">${t.tagline}</p></div>
    <a href="/treatments/${t.slug}" class="btn-3d relative shrink-0 px-6 py-3.5 rounded-full bg-gold-500 text-ink text-sm font-extrabold hover:bg-gold-400 transition">진료 안내 <i class="fas fa-arrow-right ml-1 text-xs"></i></a>
  </div>` : ''}
</article>`
  return c.html(layout({ title: r.title, desc: `${r.title} — 검단퍼스트치과 치료사례. ${[t?.name, r.age_group, r.gender].filter(Boolean).join(', ')} 치료 전후 기록.`, path: `/cases/${r.id}` }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 건강칼럼(블로그) 목록 ============
content.get('/blog', async (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') || '1') || 1)
  const per = 10
  const total = (await c.env.DB.prepare('SELECT COUNT(*) AS n FROM blog_posts WHERE published = 1').first<{ n: number }>())?.n || 0
  const rows = (await c.env.DB.prepare('SELECT id, title, slug, excerpt, thumbnail_key, author, category, views, created_at FROM blog_posts WHERE published = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?').bind(per, (page - 1) * per).all<BlogRow>()).results
  const pages = Math.max(1, Math.ceil(total / per))

  const body = `
${pageHero('Column', '원장이 직접 쓰는<br><span class="font-disp text-shine">치아 이야기.</span>', '광고 글이 아닌, 진짜 도움이 되는 정보만 씁니다.')}
<section class="max-w-4xl mx-auto px-5 py-12">
  ${rows.length === 0 ? `<div class="text-center py-24"><span class="inline-flex w-16 h-16 rounded-3xl bg-ink/5 items-center justify-center text-2xl text-ink/25 mb-4"><i class="fas fa-pen-nib"></i></span><p class="text-ink/40 font-medium">등록된 칼럼이 없습니다.</p></div>` : `
  <div class="space-y-3" data-stagger>
    ${rows.map((r) => `
    <a href="/blog/${esc(r.slug)}" class="bento blog-card group flex gap-6 rounded-3xl bg-white border border-ink/8 p-6 items-center">
      ${r.thumbnail_key ? `<img src="${imgUrl(r.thumbnail_key)}" alt="${esc(r.title)}" class="w-28 h-28 rounded-2xl object-cover shrink-0 hidden sm:block" loading="lazy">` : `<span class="w-28 h-28 rounded-2xl bg-ink/[0.04] text-ink/15 hidden sm:flex items-center justify-center text-3xl shrink-0"><i class="fas fa-tooth"></i></span>`}
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2.5 text-[11.5px]">
          ${r.category ? `<span class="font-extrabold text-gold-600 tracking-wide uppercase">${esc(r.category)}</span><span class="w-0.5 h-0.5 rounded-full bg-ink/25"></span>` : ''}
          <span class="text-ink/35">${fmtDate(r.created_at)}</span>
        </div>
        <h2 class="mt-2 font-extrabold text-ink text-lg tracking-tight line-clamp-2 leading-snug group-hover:underline decoration-gold-500 decoration-2 underline-offset-4">${esc(r.title)}</h2>
        ${r.excerpt ? `<p class="mt-1.5 text-[13.5px] text-ink/45 line-clamp-2 leading-relaxed">${esc(r.excerpt)}</p>` : ''}
      </div>
      <span class="hidden sm:flex w-11 h-11 rounded-full bg-ink/[0.04] items-center justify-center text-ink/40 group-hover:bg-ink group-hover:text-gold-400 transition shrink-0"><i class="fas fa-arrow-right text-sm"></i></span>
    </a>`).join('')}
  </div>
  ${pager('/blog?', page, pages)}`}
</section>`
  return c.html(layout({ title: '건강칼럼', desc: '검단퍼스트치과 건강칼럼 — 임플란트, 라미네이트, 턱관절 등 김희수 원장이 직접 쓰는 치아 건강 정보.', path: '/blog' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 건강칼럼 상세 ============
content.get('/blog/:slug', async (c) => {
  const slug = c.req.param('slug')
  const r = await c.env.DB.prepare('SELECT * FROM blog_posts WHERE slug = ? AND published = 1').bind(slug).first<BlogRow>()
  if (!r) return c.notFound()
  await c.env.DB.prepare('UPDATE blog_posts SET views = views + 1 WHERE id = ?').bind(r.id).run()

  const articleLd = [{
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: r.title,
    author: { '@type': 'Person', name: r.author },
    datePublished: r.created_at,
    publisher: { '@type': 'Organization', name: '검단퍼스트치과의원' },
  }]
  const body = `
<section class="page-hero relative bg-ink text-white pt-36 pb-14 sm:pt-44 px-5 overflow-hidden">
  <div class="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-navy-600/25 blur-[130px]" aria-hidden="true"></div>
  <div class="max-w-3xl mx-auto relative">
    <a href="/blog" class="reveal inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-gold-400 font-semibold transition"><i class="fas fa-arrow-left"></i>건강칼럼</a>
    ${r.category ? `<p class="reveal mt-5 text-gold-400 text-xs font-extrabold tracking-[0.25em] uppercase">${esc(r.category)}</p>` : ''}
    <h1 class="reveal mt-3 text-3xl sm:text-5xl font-extrabold tracking-tightest leading-tight">${esc(r.title)}</h1>
    <p class="reveal mt-5 text-[13px] text-white/40 font-medium">${esc(r.author)} · ${fmtDate(r.created_at)} · <i class="fas fa-eye"></i> ${r.views + 1}</p>
  </div>
</section>
<article class="max-w-3xl mx-auto px-5 py-12 blog-content">
  ${r.thumbnail_key ? `<img src="${imgUrl(r.thumbnail_key)}" alt="${esc(r.title)}" class="w-full rounded-3xl mb-10">` : ''}
  ${r.content_html}
  <footer class="mt-12 rounded-3xl bg-ink text-white p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 not-prose relative overflow-hidden" data-tilt data-tilt-max="5">
    <div class="absolute -bottom-14 -right-10 w-48 h-48 rounded-full bg-gold-500/15 blur-[70px]" aria-hidden="true"></div>
    <p class="relative text-lg font-extrabold tracking-tight">궁금한 점이 있으신가요?</p>
    <a href="tel:032-563-2872" class="btn-3d relative shrink-0 px-6 py-3.5 rounded-full bg-gold-500 text-ink text-sm font-extrabold hover:bg-gold-400 transition"><i class="fas fa-phone mr-2"></i>032-563-2872</a>
  </footer>
</article>`
  return c.html(layout({ title: r.title, desc: r.excerpt || `${r.title} — 검단퍼스트치과 건강칼럼`, path: `/blog/${r.slug}`, jsonLd: articleLd, ogImage: r.thumbnail_key ? imgUrl(r.thumbnail_key) : undefined }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
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
  return c.html(layout({ title: '공지사항', desc: '검단퍼스트치과 공지사항 — 진료일정, 휴진 안내, 병원 소식.', path: '/notice' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
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
  ${images.map((k) => `<img src="${imgUrl(k)}" alt="공지 이미지" class="w-full rounded-3xl my-5" loading="lazy">`).join('')}
</article>`
  return c.html(layout({ title: r.title, desc: `${r.title} — 검단퍼스트치과 공지사항`, path: `/notice/${r.id}` }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
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
