/**
 * 얇은(thin) 페이지 판정 — GSC "발견됨/크롤링됨-미색인" 정리용 (2026-09-29)
 *
 * 원칙 (PF Web Engine 공통 규칙, 이음치과 79fab5b 와 동일):
 *  - 검색엔진(비로그인)에게 보이는 고유 본문(태그 제거·공백 제외 글자 수)이 기준 미만이면
 *    <meta name="robots" content="noindex, follow"> + X-Robots-Tag noindex + 사이트맵 제외.
 *  - 페이지와 내부 링크는 그대로 유지 → 본문이 기준을 넘는 즉시 자동 색인 복귀.
 *
 * 2026-09-29 라이브 크롤 실측:
 *  - 치료사례 상세 143개(사이트맵의 41%): 비로그인 본문 약 390자, 사례 고유 본문 중앙값 77자
 *    (제목·나이·지역 칩뿐 — 전후 슬라이더와 '치료 이야기'는 회원 전용)
 *  - /content 허브 292자(카드 4장), /tv 297자(영상 3편), /notice 90자(공지 2건)
 */

export const THIN_CASE_MIN_CHARS = 300
export const THIN_NOTICE_MIN_CHARS = 300
export const THIN_LIST_MIN_CHARS = 300
/** /tv 는 영상이 이 개수 이상 쌓이면 자동 색인 복귀 (RSS 최대 9편) */
export const THIN_TV_MIN_VIDEOS = 6

/**
 * 치료사례 '치료 이야기'(description)를 비로그인에게도 공개하는지.
 * 현재는 환자 프라이버시 정책상 회원 전용 → 검색엔진이 보는 사례 고유 본문은 제목뿐이라 전부 thin.
 * 공개 요약을 노출하도록 바꾸면 true 로 바꾸는 즉시 300자 이상 사례가 색인 대상으로 돌아온다.
 */
export const CASE_DESCRIPTION_PUBLIC = false

export const NOINDEX_FOLLOW = 'noindex, follow'

/** HTML/마크다운 → 화면에 보이는 글자 수 (태그·엔티티·공백 제외) */
export function visibleTextLength(s?: string | null): number {
  if (!s) return 0
  return String(s)
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/[#*_>`\-|]+/g, ' ')
    .replace(/\s+/g, '')
    .length
}

/** 치료사례 상세: 비로그인에게 보이는 사례 고유 본문(제목 + 공개 시 치료 이야기) */
export function isThinCase(cs: { title?: string | null; description?: string | null }): boolean {
  const len = visibleTextLength(cs.title) + (CASE_DESCRIPTION_PUBLIC ? visibleTextLength(cs.description) : 0)
  return len < THIN_CASE_MIN_CHARS
}

/** 공지 상세: 본문 */
export function isThinNotice(n: { content_html?: string | null }): boolean {
  return visibleTextLength(n.content_html) < THIN_NOTICE_MIN_CHARS
}

/** 목록형 페이지: 항목 제목을 합친 글자 수 */
export function isThinList(titles: (string | null | undefined)[]): boolean {
  return titles.reduce((n, t) => n + visibleTextLength(t), 0) < THIN_LIST_MIN_CHARS
}
