/**
 * 칼럼·치료사례 SEO/AEO 헬퍼 (PFWE-COLUMN-CASE-SEO.md, 2026-10-03)
 *  - 칼럼 분류(자유 입력: '치주질환'·'gum' 등) → 진료 slug 매핑
 *  - 핵심 답변 박스: 원장이 쓴 요약(excerpt) → 없으면 본문 첫 문단. 내용은 새로 쓰지 않는다.
 *  - 질문형 H2/H3 → FAQPage (답변 = 그 제목 뒤 본문)
 *  - 본문 이미지 alt·lazy 보정
 *  - 치료사례 공개 요약: DB 구조 필드(진료명·기간·담당 원장)만으로 조립
 */
import { CLINIC } from '../data/clinic'
import { TREATMENTS } from '../data/treatments'

/** 진료 slug → 칼럼 분류 값(관리자 입력 그대로) */
export const BLOG_CATEGORY_ALIASES: Record<string, string[]> = {
  implant: ['implant', '임플란트'],
  bloomnate: ['bloomnate', 'luminate', '라미네이트', '블룸네이트'],
  tmj: ['tmj', '턱관절'],
  aesthetic: ['aesthetic', '미백', '심미보철'],
  endo: ['endo', '신경치료'],
  cavity: ['cavity', '충치치료', '충치'],
  gum: ['gum', '치주질환', '잇몸치료', '스케일링'],
  prosthetics: ['prosthetics', '보철치료', '틀니'],
  wisdom: ['wisdom', '사랑니'],
  botox: ['botox', '턱보톡스', '이갈이'],
}

/** 칼럼 분류 → 진료 slug (매핑 없으면 null — 예: '소아치과') */
export function treatmentSlugForCategory(cat: string | null | undefined): string | null {
  const v = String(cat || '').trim().toLowerCase()
  if (!v) return null
  for (const [slug, aliases] of Object.entries(BLOG_CATEGORY_ALIASES)) {
    if (aliases.some((a) => a.toLowerCase() === v)) return slug
  }
  return null
}

export function categoryAliases(slug: string): string[] {
  return BLOG_CATEGORY_ALIASES[slug] || [slug]
}

// ===== 칼럼 작성 주체 (2026-10-08, 사용자 승인) =====
// 원장을 저자·감수자로 표시하는 건 원장이 쓰거나 검토했다는 근거가 있을 때만.
// - 대행사 시드 글 3편: seed_content_2026-08-01.sql (커밋 df1ca99 '시뮬레이션 콘텐츠 시드')
//   → D1 blog_posts id 1 implant-longterm-care · 2 gum-bleeding-signal · 3 veneer-shade-selection
//   author 컬럼은 스키마 기본값('김희수 대표원장')일 뿐 원장 작성 근거가 아님
// - 그 밖의 글도 본문에 원장 이름(병원이 관리자 에디터로 넣은 '치과아빠 김희수입니다' 등)이 없으면 근거 없음
// → 근거 없는 글: 작성·발행 = 병원(#clinic), reviewedBy·lastReviewed 없음, 화면엔 일반 정보 안내 문구.
// 상세·RSS·llms 모두 이 함수만 사용한다. (2026-10-08 기준 id 4~36 은 원장 바이라인 있음 → 원장 표시 유지)
export const AGENCY_SEED_POST_IDS = new Set([1, 2, 3])
export const CLINIC_GENERAL_INFO_NOTE = '일반 건강정보입니다. 진료 판단은 내원 상담에서 원장이 직접 합니다.'
export function isClinicPublishedPost(p: { id: number | string; content_html?: string | null }): boolean {
  if (AGENCY_SEED_POST_IDS.has(Number(p.id))) return true
  if (p.content_html == null) return false // 본문을 조회하지 않은 호출 — 시드 id 만으로 판별
  return !flatText(p.content_html).includes(CLINIC.doctor)
}

export const procedureId = (slug: string) => `${CLINIC.siteUrl}/treatments/${slug}#procedure`

const decodeEntities = (s: string) =>
  s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")

/** HTML → 한 줄 텍스트 */
export function flatText(html: string | null | undefined): string {
  return decodeEntities(String(html || '').replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/[​\r]/g, '').replace(/\s+/g, ' ').trim()
}

/** 문장 경계(다./요./?/!)에서 max 자 이내로 자른다. 경계가 없으면 단어 경계 + … */
export function clipSentences(s: string, max: number, min = 40): string {
  const t = s.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  let end = -1
  const re = /(다\.|요\.|[?!。])(\s|$)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(cut))) end = m.index + m[1].length
  if (end >= min) return cut.slice(0, end)
  return cut.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
}

/**
 * 핵심 답변(2~3문장): excerpt(원장이 쓴 요약, 첫 줄이 제목과 같으면 제외) → 본문 첫 문단(인사말 제외).
 * 잘린 요약(200자 저장 한도)은 마지막 완결 문장까지만 쓴다.
 */
export function answerSummary(title: string, excerpt: string | null | undefined, html: string): string {
  const lines = String(excerpt || '').replace(/\*\*|__/g, '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const norm = (x: string) => x.replace(/[\s"“”'‘’?？.!]/g, '')
  if (lines.length && norm(lines[0]) === norm(title)) lines.shift()
  let src = lines.join(' ')
  // 요약이 문장이 아니면(예: 목차 나열) 본문에서
  if (src.length < 40 || !/(다\.|요\.|[.?!])/.test(src)) src = bodyAnswer(html) || src
  if (!src) return ''
  // 완결 문장만 (마지막 미완 문장 제거)
  const sentences = src.match(/[^.?!]+(다\.|요\.|[.?!])/g) || []
  let out = ''
  for (const s of sentences) {
    if ((out + s).length > 230 && out.length >= 60) break
    out += s
    if (out.length >= 160) break
  }
  return (out || clipSentences(src, 200)).trim()
}

/**
 * 본문에서 답변 문단 찾기: 첫 H2 아래 첫 문단(40자 이상). H2 가 '결론부터 …' 식의 답이면 그 문장을 앞에 붙인다.
 * H2 가 없으면 인사말을 뺀 첫 문단.
 */
function bodyAnswer(html: string): string {
  const src = String(html || '')
  const paras = (h: string) => [...h.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => flatText(m[1])).filter((p) => p.length >= 40 && !/^안녕하세요/.test(p))
  const m = src.match(/<h2[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2|$)/i)
  if (m) {
    const p = paras(m[2])[0]
    if (p) {
      const h = flatText(m[1])
      return /^결론부터/.test(h) && !/[?？]$/.test(h) ? `${h.replace(/[.\s]+$/, '')}. ${p}` : p
    }
  }
  return paras(src)[0] || ''
}

const CONNECTOR_Q = /^(그럼|그런데|그래서|그렇다면|그래도|그러면|하지만)[\s,]/

/**
 * 질문형 제목(H2·H3, '?'로 끝남) → FAQ. 답변 = 다음 H2/H3 전까지의 본문 텍스트(최대 600자, 문장 경계).
 * 앞 문단에 기대는 접속어 질문(그럼·그런데·그래서…)은 단독으로 읽히지 않아 제외.
 */
export function faqsFromArticleHtml(html: string): { q: string; a: string }[] {
  const src = String(html || '')
  const heads = [...src.matchAll(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi)]
  const out: { q: string; a: string }[] = []
  heads.forEach((m, i) => {
    const q = flatText(m[2])
    if (!/[?？]$/.test(q) || CONNECTOR_Q.test(q)) return
    const start = (m.index || 0) + m[0].length
    const end = i + 1 < heads.length ? heads[i + 1].index || src.length : src.length
    const a = clipSentences(flatText(src.slice(start, end).replace(/<hr[^>]*>/gi, ' ')), 600, 60)
    if (a.length >= 30 && !out.some((f) => f.q === q)) out.push({ q, a })
  })
  return out
}

/** 본문 이미지: alt 없음/'이미지' → 제목 기반, 첫 이미지 외 loading=lazy, decoding=async, contenteditable 제거 */
export function enhanceArticleImages(html: string, title: string, eagerFirst: boolean): string {
  let n = 0
  return String(html || '').replace(/<img\b([^>]*)>/gi, (_m, attrs: string) => {
    n++
    let a = attrs.replace(/\s*contenteditable=("[^"]*"|'[^']*')/gi, '')
    const altM = a.match(/\salt=("([^"]*)"|'([^']*)')/i)
    const alt = altM ? (altM[2] ?? altM[3] ?? '').trim() : ''
    if (!alt || /^(이미지|image|img|사진)$/i.test(alt)) {
      const nAlt = `${title.replace(/"/g, '&quot;')} — 본문 이미지 ${n}`
      a = altM ? a.replace(altM[0], ` alt="${nAlt}"`) : `${a} alt="${nAlt}"`
    }
    if (!/\sloading=/i.test(a) && !(eagerFirst && n === 1)) a += ' loading="lazy"'
    if (!/\sdecoding=/i.test(a)) a += ' decoding="async"'
    return `<img${a.replace(/\s+$/, '')}>`
  })
}

/** D1 CURRENT_TIMESTAMP(UTC 'YYYY-MM-DD HH:MM:SS') → ISO8601(+00:00) */
export function toIso(v: string | null | undefined): string | undefined {
  if (!v) return undefined
  const t = String(v).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
  const iso = t.replace(' ', 'T')
  return /([zZ]|[+-]\d\d:?\d\d)$/.test(iso) ? iso : `${iso}+00:00`
}

/** UTC 시각 → KST 날짜(YYYY-MM-DD) — 화면 '최종 검토일'·사이트맵 lastmod */
export function kstDate(v: string | null | undefined): string {
  const iso = toIso(v)
  if (!iso) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const d = new Date(iso)
  if (isNaN(d.getTime())) return String(v).slice(0, 10)
  return new Date(d.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10)
}

/** 치료사례 공개 요약 — DB 구조 필드만 사용(지어내지 않음). 환자 식별정보(나이·성별·동네)는 넣지 않는다. */
export function caseAutoSummary(r: { category: string | null; duration: string | null; doctor: string | null }): string {
  const t = r.category ? TREATMENTS.find((x) => x.slug === r.category) : null
  const parts: string[] = []
  parts.push(`${CLINIC.shortName}${t ? ` ${t.name}` : ''} 사례입니다.`)
  if (r.duration) parts.push(`치료 기간은 ${r.duration}입니다.`)
  if (r.doctor) parts.push(`${r.doctor} 원장이 진단부터 치료까지 직접 진료했습니다.`)
  parts.push('전후 사진은 같은 촬영 조건에서 기록했으며, 치료 결과는 개인에 따라 다를 수 있습니다.')
  return parts.join(' ')
}

/** 사례 제목의 따옴표 제거(“…” 환자 질문 형태) */
export const cleanCaseTitle = (s: string) => String(s || '').replace(/^[\s"“”'‘’]+|[\s"“”'‘’]+$/g, '').trim()

/** IndexNow 핑 (네이버·빙 등) — 응답 뒤 waitUntil 로 호출 */
export const INDEXNOW_KEY = 'df71908e181b46a5a01a62c02c5af9db'
export async function pingIndexNow(urls: string[]): Promise<void> {
  const list = urls.filter(Boolean)
  if (!list.length) return
  const host = new URL(CLINIC.siteUrl).host
  const body = JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: `${CLINIC.siteUrl}/${INDEXNOW_KEY}.txt`, urlList: list })
  await Promise.allSettled(
    ['https://api.indexnow.org/indexnow', 'https://searchadvisor.naver.com/indexnow'].map((ep) =>
      fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body }),
    ),
  )
}

/** JSON-LD 직렬화 — '</script>' 깨짐 방지 */
export const ldJson = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c')
