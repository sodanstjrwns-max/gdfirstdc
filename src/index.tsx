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
  const sess = await readSession(getCookie(c, 'session'), c.env.SESSION_SECRET)
  c.set('user', sess?.uid ? { uid: sess.uid, name: sess.name || '회원' } : null)
  const adminSess = await readSession(getCookie(c, 'admin_session'), c.env.SESSION_SECRET)
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
      `<section class="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 bg-cream overflow-hidden">
        <div class="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-gold-400/10 blur-3xl pointer-events-none"></div>
        <p class="idx-num text-[clamp(7rem,22vw,16rem)] leading-none font-black select-none">404</p>
        <h1 class="mt-2 text-3xl md:text-4xl font-black text-ink">길을 <span class="font-disp italic font-medium text-shine">잃으셨네요</span></h1>
        <p class="mt-4 text-ink-mute">주소가 변경되었거나 삭제된 페이지입니다.<br class="md:hidden"> 치아 건강처럼, 다시 제자리로 돌아가면 됩니다.</p>
        <a href="/" class="group mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-ink hover:bg-ink-soft text-white font-bold text-sm transition">홈으로 돌아가기 <i class="fas fa-arrow-right text-gold-400 text-xs group-hover:translate-x-1 transition-transform"></i></a>
      </section>`,
      { user: c.get('user'), admin: c.get('isAdmin') }
    ),
    404
  )
)

export default app
