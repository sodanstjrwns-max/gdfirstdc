import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { layout } from './lib/layout'
import { readSession } from './lib/auth'
import { CLINIC } from './data/clinic'
import { TREATMENTS } from './data/treatments'
import { SEO_REGIONS } from './data/regions'
import pages from './routes/pages'
import auth from './routes/auth'
import content from './routes/content'
import admin from './routes/admin'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

// ===== 세션 미들웨어 =====
app.use('*', async (c, next) => {
  const sess = await readSession(getCookie(c, 'session'))
  c.set('user', sess?.uid ? { uid: sess.uid, name: sess.name || '회원' } : null)
  const adminSess = await readSession(getCookie(c, 'admin_session'))
  c.set('isAdmin', !!adminSess?.admin)
  await next()
})

// ===== SEO: robots.txt / sitemap.xml =====
app.get('/robots.txt', (c) =>
  c.text(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /signup

Sitemap: ${CLINIC.siteUrl}/sitemap.xml
`)
)

app.get('/sitemap.xml', async (c) => {
  const staticPaths = ['/', '/about', '/treatments', '/stories', '/location', '/cases', '/blog', '/notice']
  const urls: { loc: string; priority: string }[] = [
    ...staticPaths.map((p) => ({ loc: p, priority: p === '/' ? '1.0' : '0.8' })),
    ...TREATMENTS.map((t) => ({ loc: `/treatments/${t.slug}`, priority: t.isCore ? '0.9' : '0.7' })),
    ...SEO_REGIONS.map((r) => ({ loc: `/region/${r.slug}`, priority: '0.6' })),
  ]
  try {
    const blog = (await c.env.DB.prepare('SELECT slug FROM blog_posts WHERE published = 1 ORDER BY created_at DESC LIMIT 500').all<{ slug: string }>()).results
    urls.push(...blog.map((b) => ({ loc: `/blog/${b.slug}`, priority: '0.6' })))
    const cases = (await c.env.DB.prepare('SELECT id FROM before_after WHERE published = 1 ORDER BY created_at DESC LIMIT 500').all<{ id: number }>()).results
    urls.push(...cases.map((b) => ({ loc: `/cases/${b.id}`, priority: '0.5' })))
  } catch {
    /* DB 미준비 시 정적 URL만 */
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${CLINIC.siteUrl}${u.loc}</loc><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`
  return c.body(xml, 200, { 'Content-Type': 'application/xml; charset=utf-8' })
})

// ===== 라우트 =====
app.route('/', auth)
app.route('/', content)
app.route('/', admin)
app.route('/', pages)

// ===== 404 =====
app.notFound((c) =>
  c.html(
    layout(
      { title: '페이지를 찾을 수 없습니다', desc: '요청하신 페이지를 찾을 수 없습니다.', path: '/404', noindex: true },
      `<section class="min-h-[55vh] flex flex-col items-center justify-center text-center px-4">
        <p class="text-7xl font-extrabold text-navy-100">404</p>
        <h1 class="mt-3 text-2xl font-extrabold text-navy-900">페이지를 찾을 수 없습니다</h1>
        <p class="mt-2 text-slate-500">주소가 변경되었거나 삭제된 페이지입니다.</p>
        <a href="/" class="mt-6 px-6 py-3 rounded-full bg-navy-800 text-white font-bold text-sm hover:bg-navy-700"><i class="fas fa-home mr-1"></i>홈으로</a>
      </section>`,
      { user: c.get('user'), admin: c.get('isAdmin') }
    ),
    404
  )
)

export default app
