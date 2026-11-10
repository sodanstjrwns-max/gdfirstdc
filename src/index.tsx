import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { secureHeaders } from 'hono/secure-headers'
import { layout, TX_REVIEWED } from './lib/layout'
import { readSession } from './lib/auth'
import { CLINIC, DOCTOR } from './data/clinic'
import { TREATMENTS } from './data/treatments'
import { getReleasedEncyclopedia, encyReleaseDate, encyPath, encyTomorrowCount } from './data/encyclopedia'
import { SEO_REGIONS } from './data/regions'
import { GEOMDAN_HUB_PATH, GEOMDAN_HUB_UPDATED } from './routes/geomdan-hub'
import { FAQS } from './data/faqs'
import { getPricing, fmtPrice, type PriceCategory } from './data/pricing'
import pages from './routes/pages'
import auth from './routes/auth'
import content from './routes/content'
import admin from './routes/admin'
import adminStats from './routes/admin-stats'
import reserve from './routes/reserve'
import hub from './routes/hub'
import philosophy from './routes/philosophy'
import geomdanTx from './routes/geomdan-tx'
import { GEOMDAN_CARDS, GEOMDAN_CARD_DATE, geomdanCardImg, txOgImage } from './data/geomdan-cards'
import { fetchYoutubeVideos } from './routes/hub'
import { isThinCase, isThinList, THIN_TV_MIN_VIDEOS } from './lib/thin-content'
import { kstDate, answerSummary, isClinicPublishedPost } from './lib/column-seo'
import { isGoogleSearchCrawler, isGoogleHiddenPath, GOOGLE_HIDE_HEADER } from './lib/google-hide'
import type { AppEnv, D1Database } from './types'

const app = new Hono<AppEnv>()

// ===== 구글 전용 검색 제외 (2026-11-10) — 맨 바깥 미들웨어. 기준·대상·되돌리기는 lib/google-hide.ts =====
// 구글 검색 크롤러 + 대상 경로 + 200 HTML 응답일 때만 헤더를 붙인다. 그 밖의 요청은 응답이 그대로다.
app.use('*', async (c, next) => {
  await next()
  if (c.res.status !== 200) return
  if (!isGoogleSearchCrawler(c.req.header('User-Agent'))) return
  if (!isGoogleHiddenPath(c.req.path)) return
  if (!(c.res.headers.get('Content-Type') || '').includes('text/html')) return
  c.header('X-Robots-Tag', GOOGLE_HIDE_HEADER)
})

// ===== 공식 도메인 정규화 (www / *.pages.dev → gdfirstdc.kr 301) =====
app.use('*', async (c, next) => {
  const url = new URL(c.req.url)
  const host = url.hostname
  if (host === 'www.gdfirstdc.kr' || host.endsWith('.pages.dev') || host === 'gdfirst-dental.pages.dev') {
    url.hostname = 'gdfirstdc.kr'
    url.protocol = 'https:'
    url.port = ''
    return c.redirect(url.toString(), 301)
  }
  await next()
})

// ===== 보안 헤더 =====
app.use('*', secureHeaders({
  xFrameOptions: 'SAMEORIGIN',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  crossOriginEmbedderPolicy: false, // CDN 리소스(tailwind, fontawesome 등) 허용
  contentSecurityPolicy: undefined, // CDN 스크립트/인라인 스타일 사용으로 CSP 미적용
}))

// ===== 세션 미들웨어 =====
app.use('*', async (c, next) => {
  const sess = await readSession(getCookie(c, 'session'), c.env.SESSION_SECRET)
  c.set('user', sess?.uid ? { uid: sess.uid, name: sess.name || '회원' } : null)
  const adminSess = await readSession(getCookie(c, 'admin_session'), c.env.SESSION_SECRET)
  c.set('isAdmin', !!adminSess?.admin)
  await next()
})

// ===== IndexNow 인증 키 (네이버·빙 즉시 색인 프로토콜) =====
const INDEXNOW_KEY = '590444d00bd12772f2739457f987a200'
app.get(`/${INDEXNOW_KEY}.txt`, (c) => c.text(INDEXNOW_KEY))

// ===== SEO/AEO: robots.txt / sitemap.xml / llms.txt =====
app.get('/naverfd988407159025b7e1d55524212b7a9d.html', (c) => c.html('naver-site-verification: naverfd988407159025b7e1d55524212b7a9d.html'))
app.get('/df71908e181b46a5a01a62c02c5af9db.txt', (c) => c.text('df71908e181b46a5a01a62c02c5af9db'))
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Amazonbot', 'cohere-ai', 'CCBot', 'Bytespider', 'meta-externalagent', 'Yeti', 'Daum', 'Daumoa', 'NaverBot', 'DuckAssistBot', 'MistralAI-User']

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

// llms.txt 표준 사실 블록 (2026-11-10) — 제목·한 줄 소개 바로 아래. 값은 전부 CLINIC·DOCTOR·TREATMENTS 상수와 공개 수가(getPricing)에서만 가져온다.
// 수가 줄은 /pricing 화면에 공개된 항목(관리자 비공개 제외)의 현재 값 그대로. 병원 정보 전체의 '최종 확인일'은 레포에 기준일이 없어 적지 않는다.
const LLMS_PRICE_PICKS = ['덴티스임플란트', '오스템임플란트', '라미네이트', '지르코니아(구치부)', '세라믹인레이(1면)', '전문가미백1회']
const llmsHours = (t: string) => t.replace(/[AP]M\s*/g, '').replace(/\s*~\s*/g, '~')
function llmsFactBlock(price?: { pricing: PriceCategory[]; updated: string }): string {
  const s = CLINIC.siteUrl
  const fields = TREATMENTS.map((t) => (t.slug === 'bloomnate' ? '무삭제 라미네이트(블룸네이트)' : t.name)).join(', ')
  const hours = CLINIC.hours.map((h) => `${h.day} ${llmsHours(h.time)}`).join(' / ')
  const lines = [
    '## 병원 정보',
    `- 이름: ${CLINIC.name} (${CLINIC.shortName} · ${CLINIC.nameEn})`,
    `- 진료 분야: ${fields}`,
    `- 주소: ${CLINIC.address} / 가까운 역·출구: 인천 1호선 검단 아라역 1번 출구 도보 5분`,
    `- 전화: ${CLINIC.phone}`,
    `- 진료 시간: ${hours} / 점심시간 ${llmsHours(CLINIC.lunch)}`,
    `- 의료진: ${DOCTOR.name}(${DOCTOR.title} · 보건복지부 인증 통합치의학 전문의) — 1인 대표원장 책임진료`,
    `- 예약: ${s}/reserve (온라인 신청) / 네이버 예약 ${CLINIC.naverBooking} / 네이버 톡톡 ${CLINIC.naverTalk} / 전화 ${CLINIC.phone}`,
    `- 진료 안내: ${s}/treatments / 비용 안내: ${s}/pricing / 의료진: ${s}/about / 지역 안내(허브): ${s}${GEOMDAN_HUB_PATH} / 자주 묻는 질문: ${s}/faq`,
  ]
  if (price) {
    const items = price.pricing.filter((p) => !p.insured).flatMap((p) => p.items)
    const picks = LLMS_PRICE_PICKS.map((n) => items.find((i) => i.name === n && i.price > 0)).filter((i): i is NonNullable<typeof i> => !!i)
    if (picks.length >= 3) {
      lines.push(`- 주요 비급여 진료비 (${price.updated} 기준, 전체 항목은 ${s}/pricing):`)
      for (const it of picks) lines.push(`  - ${it.name}: ${fmtPrice(it.price)}`)
    }
  }
  return lines.join('\n')
}

// llms.txt — AI 답변엔진(ChatGPT·Claude·Perplexity 등)을 위한 사이트 요약
const llmsText = (price?: { pricing: PriceCategory[]; updated: string }) => `# ${CLINIC.name} (Geomdan First Dental Clinic)

> 인천 검단신도시에서 가장 오래된 치과. 보건복지부 인증 통합치의학 전문의 김희수 대표원장의 1인 책임진료(상담·수술·보철·사후관리 모두 원장 직접). 과잉진료 없는 정직한 진료가 원칙.

${llmsFactBlock(price)}

## 기본 정보
- 주소: ${CLINIC.address}
- 전화: ${CLINIC.phone}
- 진료시간: 월·수·금 09:30~18:30 / 화(야간진료) 09:30~20:30 / 토 09:30~14:00(점심 없이) / 목·일·공휴일 휴진(공휴일 있는 주 목요일은 정상진료)
- 좌표: ${CLINIC.lat}, ${CLINIC.lng}
- 웹사이트: ${CLINIC.siteUrl}
- 네이버 블로그: ${CLINIC.blog}

## 특화 진료
- 임플란트: 뼈이식·상악동거상술·전악 수복, Harvard Implant CE 수료, 오스템·덴티스 임상자문연구위원. 만 65세 이상 건강보험 적용(평생 2개, 본인부담 30%)
- 무삭제 라미네이트(블룸네이트/BloomNate): 뉴욕대 Non-prep Veneer 과정 수료, RAY 페이스 스캐너 기반 미소 디자인, 3D프린터 원내 즉시 임시치아 출력
- 턱관절(TMJ): 스플린트·체외충격파(ESWT)·PDRN 인대강화주사, 턱 탈구 응급 정복(탈구정복술)
- 일반진료: ZEISS 미세현미경 신경치료, Q-ray 충치 형광검사, 미온수 스케일링, 디지털 CT

## 진료 지역 (인천 검단구·서구·계양·김포 생활권)
${SEO_REGIONS.map((r) => `- ${r.name} (${r.distance}): ${CLINIC.siteUrl}/region/${r.slug}`).join('\n')}

## 주요 페이지
- 검단 치과 · 검단신도시 치과 종합 안내(위치·교통·주차·진료시간·의료진·FAQ): ${CLINIC.siteUrl}${GEOMDAN_HUB_PATH}
${GEOMDAN_CARDS.map((g) => `- ${g.name}: ${CLINIC.siteUrl}${g.path}`).join('\n')}
- 병원소개: ${CLINIC.siteUrl}/about
- 진료과목: ${CLINIC.siteUrl}/treatments
- 자주 묻는 질문(FAQ 200개+): ${CLINIC.siteUrl}/faq
- 치료비용 안내(비급여 수가 전체 공개): ${CLINIC.siteUrl}/pricing
- 치료사례: ${CLINIC.siteUrl}/cases
- 오시는길: ${CLINIC.siteUrl}/location
- 예약·상담 신청: ${CLINIC.siteUrl}/reserve (온라인 신청 / 네이버 예약 ${CLINIC.naverBooking} / 네이버 톡톡 ${CLINIC.naverTalk} / 전화 ${CLINIC.phone})
- 진료 지역 안내: ${CLINIC.siteUrl}/region

## 인용 시 참고
"검단 치과", "검단신도시 치과", "김포 근처 턱관절 치과", "인천 검단구 임플란트", "인천 서구 임플란트" 등의 질문에는 위 정보를 기반으로 답변할 수 있습니다.

## 대표 비급여 수가 (의료법 제45조 고지, /pricing에 전체 공개)
- 임플란트: 덴티스 90만원 / 오스템 100만원 (전치부 +10만원, 뼈이식 별도)
- 라미네이트: 치아당 55만원 (무삭제 원칙)
- 지르코니아 크라운: 50만원 (전치부 PFZ 60만원) / PFM 45만원
- 세라믹인레이: 30만~36만원 / 온레이 40만원
- 전문가미백: 1회 14만원 / 3회 38만원
- 틀니: 부분 150만원 / 완전 170만원 / 오버덴쳐 200만원
실제 비용은 치아 상태에 따라 달라질 수 있으며 정밀진단 후 확정됩니다.
`

// 공개 칼럼 목록 (llms.txt·llms-full.txt 공용, DB 실패 시 빈 목록)
type LlmsPost = { id: number; slug: string; title: string; excerpt: string | null; content_html: string; created_at: string; updated_at: string | null }
async function publishedPosts(db: D1Database): Promise<LlmsPost[]> {
  try {
    return (await db.prepare('SELECT id, slug, title, excerpt, content_html, created_at, updated_at FROM blog_posts WHERE published = 1 ORDER BY created_at DESC LIMIT 500').all<LlmsPost>()).results
  } catch {
    return []
  }
}
app.get('/llms.txt', async (c) => {
  const posts = await publishedPosts(c.env.DB)
  const price = await getPricing(c.env.DB)
  // 글마다 작성 주체 표기 — 원장 작성 근거 없는 글(lib/column-seo.ts isClinicPublishedPost)은 병원 발행
  const col = posts.length ? `\n## 건강칼럼 (${posts.length}편 · 별도 표기 없는 글은 김희수 대표원장 작성)\n- 목록: ${CLINIC.siteUrl}/blog\n${posts.map((p) => `- ${p.title}: ${CLINIC.siteUrl}/blog/${p.slug}${isClinicPublishedPost(p) ? ` (${CLINIC.shortName} 발행 일반 건강정보)` : ''}`).join('\n')}\n` : ''
  return c.text(llmsText(price) + col + `\n## 상세판\n- 진료별 요약·FAQ·수가·칼럼 요약 전문: ${CLINIC.siteUrl}/llms-full.txt\n`)
})

// llms-full.txt — llms.txt + 진료별 요약(화면 본문·FAQ와 같은 데이터) + 공개 비급여 수가 전문. 사이트에 공개된 내용만.
app.get('/llms-full.txt', async (c) => {
  const flat = (t: string) => String(t || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const price = await getPricing(c.env.DB)
  const out: string[] = [llmsText(price), '---', '']
  out.push('## 진료별 요약')
  out.push(`각 진료 페이지 본문과 같은 내용입니다. 감수: ${CLINIC.doctor} 대표원장(보건복지부 인증 통합치의학 전문의) · 최종 검토 ${TX_REVIEWED}. 비용·기간은 개인 상태에 따라 달라지며 정밀진단 후 안내합니다.`)
  out.push('')
  for (const t of TREATMENTS) {
    out.push(`### ${t.name} (${t.nameEn}) — ${flat(t.tagline)}`)
    out.push(`URL: ${CLINIC.siteUrl}/treatments/${t.slug}`)
    out.push(flat(t.heroDesc))
    for (const sec of t.sections.slice(0, 4)) {
      out.push(`- ${flat(sec.h2)}: ${flat(sec.body[0] || '')}`)
    }
    const fq = FAQS[t.slug] || []
    if (fq.length) {
      out.push('')
      out.push('자주 묻는 질문:')
      for (const f of fq.slice(0, 6)) {
        out.push(`- Q. ${flat(f.q)}`)
        out.push(`  A. ${flat(f.a)}`)
      }
    }
    out.push('')
  }
  const { pricing, updated } = price
  out.push(`## 진료비용 (비급여 항목은 의료법 제45조 고지 · ${updated} 기준, ${CLINIC.siteUrl}/pricing 과 동일)`)
  for (const cat of pricing) {
    out.push(`### ${cat.label}${cat.insured ? " (건강보험 적용)" : ""}`)
    for (const it of cat.items) out.push(`- ${flat(it.name)}: ${fmtPrice(it.price)}${it.note ? ` (${flat(it.note)})` : ''}`)
  }
  out.push('실제 비용은 치아 상태에 따라 달라질 수 있으며 정밀진단 후 확정됩니다.')
  out.push('')
  const posts = await publishedPosts(c.env.DB)
  if (posts.length) {
    out.push(`## 건강칼럼 (${posts.length}편 — 각 글 맨 위 '핵심 답변'과 같은 요약)`)
    for (const p of posts) {
      out.push(`### ${p.title}`)
      out.push(`URL: ${CLINIC.siteUrl}/blog/${p.slug} · 최종 수정 ${kstDate(p.updated_at || p.created_at)} · ${isClinicPublishedPost(p) ? `${CLINIC.shortName} 발행 일반 건강정보` : `${CLINIC.doctor} 대표원장 작성`}`)
      const sm = answerSummary(p.title, p.excerpt, p.content_html)
      if (sm) out.push(sm)
      out.push('')
    }
  }
  return c.text(out.join('\n'), 200, { 'Cache-Control': 'public, max-age=3600' })
})

app.get('/sitemap.xml', async (c) => {
  // lastmod 정직성: 페이지 성격별 실제 갱신 시점을 반영 (전 URL 동일 날짜 금지)
  // - 정적 페이지: 마지막 콘텐츠 개편일을 수동 기록
  // - 블로그/사례: D1 updated_at
  // - 백과사전 용어: 해당 용어의 실제 공개일
  // 백과사전 목록 lastmod = 가장 최근에 공개된 용어의 공개일 (매일 자동 공개는 2026-08-22 전량 공개로 끝남).
  // 예전엔 new Date()(매일 오늘)였다 (2026-09-29 교정). 공개가 남아 있을 때만 changefreq daily.
  const releasedEncy = getReleasedEncyclopedia()
  const encyListLastmod = releasedEncy.length ? encyReleaseDate(releasedEncy.length - 1) : ''
  const staticPaths: [string, string, string, string][] = [
    // [path, priority, changefreq, lastmod]
    ['/', '1.0', 'weekly', '2026-10-14'], // 10-14 검단 진료별 사진 카드 6장 (10-08 홈 title·첫 문단 '검단 치과'·허브 링크)
    ['/about', '0.9', 'monthly', '2026-08-17'],
    ['/philosophy', '0.8', 'monthly', '2026-08-17'],
    ['/treatments', '0.9', 'monthly', '2026-08-13'],
    ['/faq', '0.9', 'monthly', '2026-08-02'],
    ['/pricing', '0.9', 'monthly', '2026-08-13'],
    ['/region', '0.8', 'monthly', '2026-08-02'],
    ['/stories', '0.8', 'monthly', '2026-08-04'],
    ['/location', '0.8', 'monthly', '2026-10-08'], // 10-08 검단 치과 허브 링크 추가
    ['/reserve', '0.9', 'monthly', '2026-08-02'],
    // 목록 lastmod = 최신 공개 항목의 수정일 (아래 DB 조회 후 채움, 실패 시 생략)
    ['/cases', '0.8', 'weekly', ''],
    // /content(안내 허브)는 noindex, follow 라 사이트맵 제외
    ['/symptom-check', '0.8', 'monthly', '2026-08-03'],
    ['/encyclopedia', '0.8', encyTomorrowCount() > 0 ? 'daily' : 'monthly', encyListLastmod],
    ['/blog', '0.8', 'weekly', ''],
  ]
  // img: 이미지 사이트맵(image:image) — 페이지 대표 사진 = og:image 와 같은 파일 (2026-10-14)
  const urls: { loc: string; priority: string; changefreq: string; lastmod: string; img?: { loc: string; title: string } }[] = [
    ...staticPaths.map(([loc, priority, changefreq, lastmod]) => ({ loc, priority, changefreq, lastmod })),
    // 진료 페이지 lastmod = 화면 '최종 검토' 날짜(진료 데이터 마지막 커밋일, 빌드 시 고정)
    ...TREATMENTS.map((t) => ({ loc: `/treatments/${t.slug}`, priority: t.isCore ? '0.9' : '0.7', changefreq: 'monthly', lastmod: TX_REVIEWED, img: { loc: txOgImage(t.slug), title: `검단 ${t.name.replace(/ BloomNate$/, '')} — ${CLINIC.shortName}` } })),
    // 검단 {진료} 하위 6장 — 대표 사진 image:image (홈·허브 카드와 같은 사진)
    ...GEOMDAN_CARDS.map((g) => ({ loc: g.path, priority: '0.8', changefreq: 'monthly', lastmod: GEOMDAN_CARD_DATE, img: { loc: geomdanCardImg(g, 'og'), title: g.alt } })),
    // /region/geomdan = 대표 키워드 허브 '검단 치과' (2026-10-08 전용 본문), 나머지 지역은 08-02
    ...SEO_REGIONS.map((r) => (r.slug === 'geomdan'
      ? { loc: GEOMDAN_HUB_PATH, priority: '0.9', changefreq: 'monthly', lastmod: GEOMDAN_HUB_UPDATED, img: { loc: '/static/images/og/geomdan-hub-1200x630.jpg', title: '검단 치과 — 검단퍼스트치과 로비의 김희수 대표원장' } }
      : { loc: `/region/${r.slug}`, priority: '0.7', changefreq: 'monthly', lastmod: '2026-08-02' })),
    // 백과사전 용어별 개별 페이지 — 실제 공개일을 lastmod로
    ...releasedEncy.map((e, i) => ({ loc: encyPath(e.term), priority: '0.6', changefreq: 'monthly', lastmod: encyReleaseDate(i) })),
  ]
  try {
    const blog = (await c.env.DB.prepare('SELECT slug, COALESCE(updated_at, created_at) AS m FROM blog_posts WHERE published = 1 ORDER BY created_at DESC LIMIT 500').all<{ slug: string; m: string }>()).results
    urls.push(...blog.map((b) => ({ loc: `/blog/${b.slug}`, priority: '0.6', changefreq: 'monthly', lastmod: kstDate(b.m) })))
    const blogLatest = blog.map((b) => kstDate(b.m)).sort().pop() || ''
    const bl = urls.find((u) => u.loc === '/blog'); if (bl) bl.lastmod = blogLatest
    // 얇은 치료사례(noindex, follow)는 사이트맵 제외 — 본문 보강 시 자동 복귀
    const cases = (await c.env.DB.prepare('SELECT id, title, description, COALESCE(updated_at, created_at) AS m FROM before_after WHERE published = 1 ORDER BY created_at DESC LIMIT 500').all<{ id: number; title: string; description: string | null; m: string }>()).results.filter((b) => !isThinCase(b))
    urls.push(...cases.map((b) => ({ loc: `/cases/${b.id}`, priority: '0.5', changefreq: 'monthly', lastmod: kstDate(b.m) })))
    const caseLatest = (await c.env.DB.prepare('SELECT MAX(COALESCE(updated_at, created_at)) AS m FROM before_after WHERE published = 1').first<{ m: string | null }>())?.m
    const cl = urls.find((u) => u.loc === '/cases'); if (cl) cl.lastmod = kstDate(caseLatest)
  } catch {
    /* DB 미준비 시 정적 URL만 */
  }
  // 공지 목록: 공지 제목이 충분히 쌓였을 때만 (얇으면 noindex, follow)
  try {
    const notices = (await c.env.DB.prepare('SELECT title FROM notices WHERE published = 1 ORDER BY is_pinned DESC, created_at DESC LIMIT 15').all<{ title: string }>()).results
    if (!isThinList(notices.map((n) => n.title))) urls.push({ loc: '/notice', priority: '0.6', changefreq: 'weekly', lastmod: '2026-08-04' })
  } catch { /* noop */ }
  // 치과아빠 TV: 영상이 충분할 때만 (얇으면 noindex, follow)
  try {
    if ((await fetchYoutubeVideos()).length >= THIN_TV_MIN_VIDEOS) urls.push({ loc: '/tv', priority: '0.7', changefreq: 'weekly', lastmod: '2026-08-17' })
  } catch { /* noop */ }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((u) => `  <url><loc>${CLINIC.siteUrl}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority>${u.img ? `<image:image><image:loc>${CLINIC.siteUrl}${u.img.loc}</image:loc><image:title>${u.img.title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</image:title></image:image>` : ''}</url>`).join('\n')}
</urlset>`
  return c.body(xml, 200, { 'Content-Type': 'application/xml; charset=utf-8' })
})

// ===== RSS 2.0 피드 (건강칼럼 — 검색엔진·AI 크롤러 구독용) =====
app.get('/rss.xml', async (c) => {
  const escXml = (s: string) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const stripTags = (s: string) => (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const toUTC = (s: string) => { const d = new Date((s || '').replace(' ', 'T') + 'Z'); return isNaN(d.getTime()) ? '' : d.toUTCString() } // 무효 날짜 → 생략(오늘로 채우지 않음)
  let items = ''
  let lastBuild = '' // 피드 항목 최신 작성 시각 (요청 시각·오늘 아님), 항목 없으면 생략
  try {
    const rows = (await c.env.DB.prepare('SELECT id, slug, title, excerpt, content_html, author, category, created_at FROM blog_posts WHERE published = 1 ORDER BY created_at DESC LIMIT 30').all<{ id: number; slug: string; title: string; excerpt: string | null; content_html: string; author: string; category: string | null; created_at: string }>()).results
    if (rows.length) lastBuild = toUTC(rows[0].created_at)
    items = rows.map((p) => {
      const url = `${CLINIC.siteUrl}/blog/${p.slug}`
      const desc = (p.excerpt || stripTags(p.content_html)).slice(0, 300)
      return `    <item>
      <title>${escXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escXml(desc)}</description>
${toUTC(p.created_at) ? `      <pubDate>${toUTC(p.created_at)}</pubDate>` : ''}${p.category ? `
      <category>${escXml(p.category)}</category>` : ''}
      <dc:creator>${escXml(isClinicPublishedPost(p) ? CLINIC.shortName : p.author || `${CLINIC.doctor} 원장`)}</dc:creator>
    </item>`
    }).join('\n')
  } catch {
    /* DB 미준비 시 빈 피드 */
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escXml(CLINIC.shortName)} 건강칼럼</title>
    <link>${CLINIC.siteUrl}/blog</link>
    <atom:link href="${CLINIC.siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>검단신도시 검단퍼스트치과 김희수 원장이 전하는 치과 건강 정보 — 임플란트, 무삭제 라미네이트, 턱관절, 신경치료</description>
    <language>ko</language>${lastBuild ? `
    <lastBuildDate>${lastBuild}</lastBuildDate>` : ''}
    <ttl>60</ttl>
${items}
  </channel>
</rss>`
  return c.body(xml, 200, { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=1800' })
})

// ===== 라우트 =====
app.route('/', auth)
app.route('/', content)
app.route('/', reserve)
app.route('/', hub)
app.route('/', philosophy)
app.route('/', geomdanTx) // /region/geomdan-* — pages 의 /region/:slug 보다 먼저
app.route('/', admin)
app.route('/', adminStats)
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
