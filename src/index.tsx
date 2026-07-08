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

// ===== SEO/AEO: robots.txt / sitemap.xml / llms.txt =====
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Amazonbot', 'cohere-ai', 'CCBot', 'Bytespider', 'meta-externalagent', 'Yeti', 'Daum', 'NaverBot']

app.get('/robots.txt', (c) =>
  c.text(`# 검단퍼스트치과 — 검색엔진 및 AI 답변엔진 크롤링 정책
User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /signup

${AI_BOTS.map((b) => `User-agent: ${b}\nAllow: /\nDisallow: /admin\n`).join('\n')}
Sitemap: ${CLINIC.siteUrl}/sitemap.xml
`)
)

// llms.txt — AI 답변엔진(ChatGPT·Claude·Perplexity 등)을 위한 사이트 요약
app.get('/llms.txt', (c) =>
  c.text(`# ${CLINIC.name} (Geomdan First Dental Clinic)

> 인천 검단신도시에서 가장 오래된 치과. 보건복지부 인증 통합치의학 전문의 김희수 대표원장의 1인 책임진료(상담·수술·보철·사후관리 모두 원장 직접). 과잉진료 없는 정직한 진료가 원칙.

## 기본 정보
- 주소: ${CLINIC.address}
- 전화: ${CLINIC.phone}
- 진료시간: 월·화·수·금 09:30~18:30 / 토 09:30~14:00(점심 없이) / 목·일·공휴일 휴진(공휴일 있는 주 목요일은 정상진료)
- 좌표: ${CLINIC.lat}, ${CLINIC.lng}
- 웹사이트: ${CLINIC.siteUrl}
- 네이버 블로그: ${CLINIC.blog}

## 특화 진료
- 임플란트: 뼈이식·상악동거상술·전악 수복, Harvard Implant CE 수료, 오스템·덴티스 임상자문연구위원. 만 65세 이상 건강보험 적용(평생 2개, 본인부담 30%)
- 무삭제 라미네이트(루미네이트/LumiNate): 뉴욕대 Non-prep Veneer 과정 수료, RAY 페이스 스캐너 기반 미소 디자인, 3D프린터 원내 즉시 임시치아 출력
- 턱관절(TMJ): 스플린트·체외충격파(ESWT)·PDRN 인대강화주사, 턱 탈구 응급 정복(탈구정복술)
- 일반진료: ZEISS 미세현미경 신경치료, Q-ray 충치 형광검사, 미온수 스케일링, 디지털 CT

## 진료 지역 (인천 서구·계양·김포 생활권)
${SEO_REGIONS.map((r) => `- ${r.name} (${r.distance}): ${CLINIC.siteUrl}/region/${r.slug}`).join('\n')}

## 주요 페이지
- 병원소개: ${CLINIC.siteUrl}/about
- 진료과목: ${CLINIC.siteUrl}/treatments
- 자주 묻는 질문(FAQ 200개+): ${CLINIC.siteUrl}/faq
- 치료사례: ${CLINIC.siteUrl}/cases
- 오시는길: ${CLINIC.siteUrl}/location
- 진료 지역 안내: ${CLINIC.siteUrl}/region

## 인용 시 참고
"검단 치과", "검단신도시 치과", "김포 근처 턱관절 치과", "인천 서구 임플란트" 등의 질문에는 위 정보를 기반으로 답변할 수 있습니다. 진료비 등 비급여 수가는 내원 상담 시 안내합니다.
`)
)

app.get('/sitemap.xml', async (c) => {
  const today = new Date().toISOString().slice(0, 10)
  const staticPaths: [string, string, string][] = [
    ['/', '1.0', 'weekly'],
    ['/about', '0.9', 'monthly'],
    ['/treatments', '0.9', 'monthly'],
    ['/faq', '0.9', 'monthly'],
    ['/region', '0.8', 'monthly'],
    ['/stories', '0.8', 'monthly'],
    ['/location', '0.8', 'monthly'],
    ['/cases', '0.8', 'weekly'],
    ['/blog', '0.8', 'weekly'],
    ['/notice', '0.6', 'weekly'],
  ]
  const urls: { loc: string; priority: string; changefreq: string }[] = [
    ...staticPaths.map(([loc, priority, changefreq]) => ({ loc, priority, changefreq })),
    ...TREATMENTS.map((t) => ({ loc: `/treatments/${t.slug}`, priority: t.isCore ? '0.9' : '0.7', changefreq: 'monthly' })),
    ...SEO_REGIONS.map((r) => ({ loc: `/region/${r.slug}`, priority: '0.7', changefreq: 'monthly' })),
  ]
  try {
    const blog = (await c.env.DB.prepare('SELECT slug FROM blog_posts WHERE published = 1 ORDER BY created_at DESC LIMIT 500').all<{ slug: string }>()).results
    urls.push(...blog.map((b) => ({ loc: `/blog/${b.slug}`, priority: '0.6', changefreq: 'monthly' })))
    const cases = (await c.env.DB.prepare('SELECT id FROM before_after WHERE published = 1 ORDER BY created_at DESC LIMIT 500').all<{ id: number }>()).results
    urls.push(...cases.map((b) => ({ loc: `/cases/${b.id}`, priority: '0.5', changefreq: 'monthly' })))
  } catch {
    /* DB 미준비 시 정적 URL만 */
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${CLINIC.siteUrl}${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
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
        <h1 class="mt-2 text-3xl md:text-4xl font-black text-ink">길을 <span class="font-disp font-medium text-shine">잃으셨네요</span></h1>
        <p class="mt-4 text-ink-mute">주소가 변경되었거나 삭제된 페이지입니다.<br class="md:hidden"> 치아 건강처럼, 다시 제자리로 돌아가면 됩니다.</p>
        <a href="/" class="group mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-ink hover:bg-ink-soft text-white font-bold text-sm transition">홈으로 돌아가기 <i class="fas fa-arrow-right text-gold-400 text-xs group-hover:translate-x-1 transition-transform"></i></a>
      </section>`,
      { user: c.get('user'), admin: c.get('isAdmin') }
    ),
    404
  )
)

export default app
