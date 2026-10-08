// ============================================================
// "검단 치과" 허브(/region/geomdan) 내부 링크 (2026-10-08)
// 관련 페이지가 대표 키워드 허브로 앵커 "검단 치과" 링크를 보낸다.
// 페이지당 허브 링크 최대 2개(전역 푸터 1 + 본문 1), nofollow 금지, 허브 자신에는 넣지 않음.
// ============================================================

export const HUB_PATH = '/region/geomdan'
export const HUB_ANCHOR = '검단 치과'

const esc = (t: string) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function hubA(cls = 'font-bold text-gold-600 underline underline-offset-4'): string {
  return `<a href="${HUB_PATH}" class="${cls}">${HUB_ANCHOR}</a>`
}

function slugHash(s: string, n: number): number {
  let h = 0
  for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h % n
}

/** 칼럼 상세 본문 끝(작성자 박스 위) 지역 안내 1문장 — 문형 4개 중 slug 해시로 고정 */
export function blogHubNote(slug: string, topic?: string | null): string {
  const a = hubA()
  const t = topic ? esc(topic) : ''
  const forms = [
    `검단퍼스트치과는 ${a}를 찾는 원당동·불로동·마전동 주민분들께 ${t ? `${t} 진료와 ` : ''}내원 방법을 안내하고 있습니다.`,
    `검단신도시에서 ${t ? `${t} ` : '치과 '}상담할 곳을 찾고 계신다면 ${a} 안내에서 위치·진료시간·의료진을 한 번에 확인하실 수 있습니다.`,
    `이음5로 80 검단퍼스트프라자 3층에 있는 검단퍼스트치과의 진료시간·주차·찾아오는 길은 ${a} 페이지에 정리해 두었습니다.`,
    `이 글의 내용을 직접 상담받고 싶은 검단 주민분은 ${a} 안내에서 화요일 야간·토요일 진료 일정과 오시는 길을 먼저 확인해 보세요.`,
  ]
  return `<p class="not-prose mt-12 rounded-2xl bg-white border border-ink/8 px-6 py-5 text-[14.5px] text-ink/70 leading-[1.9]"><i class="fas fa-location-dot text-gold-500 mr-2" aria-hidden="true"></i>${forms[slugHash(slug, forms.length)]}</p>`
}
