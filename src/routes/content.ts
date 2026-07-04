// 콘텐츠 라우트 — 치료사례(비포애프터), 건강칼럼(블로그), 공지사항, 이미지 서빙
import { Hono } from 'hono'
import { layout, esc } from '../lib/layout'
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
  return (s || '').slice(0, 10)
}

function imgUrl(key: string | null): string {
  return key ? `/images/${key}` : ''
}

function baCompare(beforeKey: string | null, afterKey: string | null, label: string): string {
  if (!beforeKey && !afterKey) return ''
  if (beforeKey && afterKey) {
    return `
<figure class="mb-6">
  <figcaption class="text-sm font-bold text-navy-900 mb-2"><i class="fas fa-images text-gold-600 mr-1"></i>${label} <span class="text-xs text-slate-400 font-normal ml-2">슬라이더를 좌우로 움직여 비교해 보세요</span></figcaption>
  <div class="ba-compare rounded-xl overflow-hidden border border-slate-200 relative">
    <img src="${imgUrl(beforeKey)}" alt="${label} 치료 전" class="w-full block" loading="lazy">
    <img src="${imgUrl(afterKey)}" alt="${label} 치료 후" class="ba-after w-full block absolute inset-0" loading="lazy">
    <div class="ba-divider"></div>
    <span class="absolute top-2 left-2 text-xs font-bold bg-black/60 text-white rounded px-2 py-0.5 pointer-events-none">BEFORE</span>
    <span class="absolute top-2 right-2 text-xs font-bold bg-gold-500 text-white rounded px-2 py-0.5 pointer-events-none">AFTER</span>
    <input type="range" min="0" max="100" value="50" aria-label="${label} 전후 비교 슬라이더">
  </div>
</figure>`
  }
  const key = beforeKey || afterKey
  const suffix = beforeKey ? '치료 전' : '치료 후'
  return `<figure class="mb-6"><figcaption class="text-sm font-bold text-navy-900 mb-2">${label} (${suffix})</figcaption><img src="${imgUrl(key)}" alt="${label} ${suffix}" class="w-full rounded-xl border border-slate-200" loading="lazy"></figure>`
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
<section class="bg-navy-900 text-white py-16 text-center px-4">
  <p class="text-gold-400 tracking-widest text-sm uppercase">Before & After</p>
  <h1 class="text-3xl md:text-4xl font-extrabold mt-2">치료사례</h1>
  <p class="mt-4 text-slate-300">환자 동의 하에 게시된 실제 치료 전후 기록입니다.</p>
</section>
<section class="max-w-6xl mx-auto px-4 py-10">
  <nav id="case-filter" class="flex flex-wrap gap-2 justify-center mb-8">
    <a href="/cases" class="px-4 py-2 rounded-full text-sm font-bold ${!cat ? 'bg-navy-800 text-white' : 'border border-slate-200 text-slate-600 hover:border-navy-600'}">전체</a>
    ${TREATMENTS.map((t) => `<a href="/cases?category=${t.slug}" class="px-4 py-2 rounded-full text-sm font-bold ${cat === t.slug ? 'bg-navy-800 text-white' : 'border border-slate-200 text-slate-600 hover:border-navy-600'}">${t.name}</a>`).join('')}
  </nav>
  ${rows.length === 0 ? `<p class="text-center text-slate-400 py-20"><i class="fas fa-folder-open text-4xl block mb-3"></i>등록된 치료사례가 없습니다.</p>` : `
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
    ${rows.map((r) => {
      const t = r.category ? getTreatment(r.category) : null
      const thumb = r.intra_after_key || r.pano_after_key || r.intra_before_key || r.pano_before_key
      return `
    <a href="/cases/${r.id}" class="case-card group block rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition">
      <div class="aspect-[4/3] bg-navy-50 overflow-hidden flex items-center justify-center">
        ${thumb ? `<img src="${imgUrl(thumb)}" alt="${esc(r.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy">` : '<i class="fas fa-tooth text-5xl text-navy-200"></i>'}
      </div>
      <div class="p-5">
        ${t ? `<span class="text-[11px] font-bold bg-navy-50 text-navy-700 rounded-full px-2.5 py-0.5">${t.name}</span>` : ''}
        <h2 class="mt-2 font-extrabold text-navy-900 line-clamp-2">${esc(r.title)}</h2>
        <p class="mt-1.5 text-xs text-slate-400">${[r.age_group, r.gender, r.region].filter(Boolean).map((x) => esc(String(x))).join(' · ')}</p>
        <p class="mt-1 text-xs text-slate-400"><i class="fas fa-eye mr-1"></i>${r.views} · ${fmtDate(r.created_at)}</p>
      </div>
    </a>`
    }).join('')}
  </div>
  ${pages > 1 ? `<nav class="mt-10 flex justify-center gap-1.5">${Array.from({ length: pages }, (_, i) => i + 1).map((p) => `<a href="/cases?${cat ? `category=${cat}&` : ''}page=${p}" class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold ${p === page ? 'bg-navy-800 text-white' : 'border border-slate-200 text-slate-600'}">${p}</a>`).join('')}</nav>` : ''}`}
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
<section class="bg-navy-900 text-white py-12 px-4">
  <div class="max-w-3xl mx-auto">
    <a href="/cases" class="text-sm text-slate-400 hover:text-gold-400"><i class="fas fa-arrow-left mr-1"></i>치료사례 목록</a>
    <h1 class="text-2xl md:text-3xl font-extrabold mt-3">${esc(r.title)}</h1>
    <p class="mt-3 text-sm text-slate-300">${[t?.name, r.age_group, r.gender, r.region, r.duration ? `치료기간 ${r.duration}` : '', `담당 ${r.doctor} 원장`].filter(Boolean).map((x) => esc(String(x))).join(' · ')}</p>
  </div>
</section>
<article class="max-w-3xl mx-auto px-4 py-10">
  ${baCompare(r.intra_before_key, r.intra_after_key, '구내포토')}
  ${baCompare(r.pano_before_key, r.pano_after_key, '파노라마')}
  ${r.description ? `<div class="prose-clinic mt-6"><h2>치료 이야기</h2>${r.description.split('\n').filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('')}</div>` : ''}
  <p class="mt-8 text-xs text-slate-400 bg-slate-50 rounded-lg p-4">* 본 치료사례는 환자 동의 하에 게시되었으며, 치료 결과는 개인에 따라 다를 수 있습니다.</p>
  ${t ? `<div class="mt-8 rounded-2xl bg-navy-50 p-6 text-center"><p class="font-bold text-navy-900">${t.name}에 대해 더 알아보시겠어요?</p><a href="/treatments/${t.slug}" class="inline-block mt-3 px-6 py-2.5 rounded-full bg-navy-800 text-white text-sm font-bold hover:bg-navy-700">${t.name} 진료 안내 보기</a></div>` : ''}
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
<section class="bg-navy-900 text-white py-16 text-center px-4">
  <p class="text-gold-400 tracking-widest text-sm uppercase">Column</p>
  <h1 class="text-3xl md:text-4xl font-extrabold mt-2">건강칼럼</h1>
  <p class="mt-4 text-slate-300">김희수 원장이 직접 쓰는 치아 건강 이야기</p>
</section>
<section class="max-w-4xl mx-auto px-4 py-10">
  ${rows.length === 0 ? `<p class="text-center text-slate-400 py-20"><i class="fas fa-pen-nib text-4xl block mb-3"></i>등록된 칼럼이 없습니다.</p>` : `
  <div class="space-y-5">
    ${rows.map((r) => `
    <a href="/blog/${esc(r.slug)}" class="blog-card flex gap-5 rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition items-center">
      ${r.thumbnail_key ? `<img src="${imgUrl(r.thumbnail_key)}" alt="${esc(r.title)}" class="w-28 h-28 rounded-xl object-cover shrink-0 hidden sm:block" loading="lazy">` : `<span class="w-28 h-28 rounded-xl bg-navy-50 text-navy-200 hidden sm:flex items-center justify-center text-3xl shrink-0"><i class="fas fa-tooth"></i></span>`}
      <div class="min-w-0">
        ${r.category ? `<span class="text-[11px] font-bold bg-navy-50 text-navy-700 rounded-full px-2.5 py-0.5">${esc(r.category)}</span>` : ''}
        <h2 class="mt-1.5 font-extrabold text-navy-900 text-lg line-clamp-2">${esc(r.title)}</h2>
        ${r.excerpt ? `<p class="mt-1 text-sm text-slate-500 line-clamp-2">${esc(r.excerpt)}</p>` : ''}
        <p class="mt-2 text-xs text-slate-400">${esc(r.author)} · ${fmtDate(r.created_at)} · <i class="fas fa-eye"></i> ${r.views}</p>
      </div>
    </a>`).join('')}
  </div>
  ${pages > 1 ? `<nav class="mt-10 flex justify-center gap-1.5">${Array.from({ length: pages }, (_, i) => i + 1).map((p) => `<a href="/blog?page=${p}" class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold ${p === page ? 'bg-navy-800 text-white' : 'border border-slate-200 text-slate-600'}">${p}</a>`).join('')}</nav>` : ''}`}
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
<section class="bg-navy-900 text-white py-12 px-4">
  <div class="max-w-3xl mx-auto">
    <a href="/blog" class="text-sm text-slate-400 hover:text-gold-400"><i class="fas fa-arrow-left mr-1"></i>건강칼럼 목록</a>
    <h1 class="text-2xl md:text-3xl font-extrabold mt-3">${esc(r.title)}</h1>
    <p class="mt-3 text-sm text-slate-300">${esc(r.author)} · ${fmtDate(r.created_at)} · <i class="fas fa-eye"></i> ${r.views + 1}</p>
  </div>
</section>
<article class="max-w-3xl mx-auto px-4 py-10 blog-content">
  ${r.thumbnail_key ? `<img src="${imgUrl(r.thumbnail_key)}" alt="${esc(r.title)}" class="w-full rounded-2xl mb-8">` : ''}
  ${r.content_html}
  <footer class="mt-10 rounded-2xl bg-navy-50 p-6 text-center not-prose">
    <p class="font-bold text-navy-900">궁금한 점이 있으신가요?</p>
    <a href="tel:032-563-2872" class="inline-block mt-3 px-6 py-2.5 rounded-full bg-gold-500 text-white text-sm font-bold hover:bg-gold-600"><i class="fas fa-phone mr-1"></i>032-563-2872</a>
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
<section class="bg-navy-900 text-white py-16 text-center px-4">
  <p class="text-gold-400 tracking-widest text-sm uppercase">Notice</p>
  <h1 class="text-3xl md:text-4xl font-extrabold mt-2">공지사항</h1>
</section>
<section class="max-w-3xl mx-auto px-4 py-10">
  ${rows.length === 0 ? `<p class="text-center text-slate-400 py-20"><i class="fas fa-bullhorn text-4xl block mb-3"></i>등록된 공지사항이 없습니다.</p>` : `
  <ul class="divide-y divide-slate-100 border-t-2 border-navy-800">
    ${rows.map((r) => `
    <li>
      <a href="/notice/${r.id}" class="flex items-center gap-3 py-4 px-2 hover:bg-navy-50 rounded-lg">
        ${r.is_pinned ? '<span class="shrink-0 text-[11px] font-bold bg-gold-500 text-white rounded-full px-2.5 py-0.5">공지</span>' : ''}
        <span class="font-medium text-slate-800 line-clamp-1 flex-1">${esc(r.title)}</span>
        <span class="text-xs text-slate-400 shrink-0">${fmtDate(r.created_at)}</span>
      </a>
    </li>`).join('')}
  </ul>
  ${pages > 1 ? `<nav class="mt-8 flex justify-center gap-1.5">${Array.from({ length: pages }, (_, i) => i + 1).map((p) => `<a href="/notice?page=${p}" class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold ${p === page ? 'bg-navy-800 text-white' : 'border border-slate-200 text-slate-600'}">${p}</a>`).join('')}</nav>` : ''}`}
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
<section class="bg-navy-900 text-white py-12 px-4">
  <div class="max-w-3xl mx-auto">
    <a href="/notice" class="text-sm text-slate-400 hover:text-gold-400"><i class="fas fa-arrow-left mr-1"></i>공지사항 목록</a>
    <h1 class="text-2xl md:text-3xl font-extrabold mt-3">${r.is_pinned ? '<span class="text-sm align-middle font-bold bg-gold-500 text-white rounded-full px-3 py-1 mr-2">공지</span>' : ''}${esc(r.title)}</h1>
    <p class="mt-3 text-sm text-slate-300">${fmtDate(r.created_at)} · <i class="fas fa-eye"></i> ${r.views + 1}</p>
  </div>
</section>
<article class="max-w-3xl mx-auto px-4 py-10 blog-content">
  ${r.content_html}
  ${images.map((k) => `<img src="${imgUrl(k)}" alt="공지 이미지" class="w-full rounded-xl my-4" loading="lazy">`).join('')}
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
