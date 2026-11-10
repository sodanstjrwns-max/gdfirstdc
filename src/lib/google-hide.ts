/**
 * 구글 전용 검색 제외 (2026-11-10)
 *
 * 배경: 구글이 이 사이트를 사이트 단위로 낮게 평가해 홈 위주로만 색인하고 있다(백과·지역 페이지 대량 공개 뒤 급락).
 *       방문 대부분은 네이버에서 오므로, 대량 생성 구역을 "구글에만" 검색 제외해 구글이 보는 사이트를
 *       병원 핵심 페이지 위주로 줄인다.
 *
 * 동작: 요청 User-Agent 가 구글 검색 크롤러(Googlebot · Google-InspectionTool)이고, 경로가 아래 대상이고,
 *       응답이 200 HTML 일 때만 응답 헤더 `X-Robots-Tag: googlebot: noindex` 를 붙인다(index.tsx 맨 바깥 미들웨어).
 *       네이버(Yeti)·Bing·일반 브라우저·AI 봇 응답은 헤더·본문 모두 그대로다.
 *       HTML 메타 태그·robots.txt·sitemap.xml·canonical 은 건드리지 않는다.
 *
 * 대상(가린다):
 *   - /encyclopedia, /encyclopedia/* : 치과 백과사전 목록 + 용어 전체 (새로 공개되는 용어도 경로로 자동 포함)
 *   - /region                        : 진료 지역 목록
 *   - /region/{지역}                 : 주 지역 허브(/region/geomdan)와 "검단 {진료}" 6장(/region/geomdan-*)을 뺀 나머지 지역 페이지
 *   - /blog/{대행사 시드 글 3편}     : seed_content_2026-08-01.sql 로 넣은 글 (lib/column-seo.ts AGENCY_SEED_POST_IDS 와 같은 3편)
 * 남긴다: 홈, 진료, 의료진·철학·스토리, 비용, FAQ, 오시는 길, 예약, 치료사례, 치과아빠 TV, 공지,
 *         /region/geomdan(허브), /region/geomdan-*(검단 진료 6장), 관리자 화면으로 올린 건강칼럼(/blog, /blog/*).
 *
 * 되돌리기: isGoogleHiddenPath 가 항상 false 를 돌려주게 하면(첫 줄에 `return false`) 끝. 재배포 후 구글이 다시 읽으면 풀린다.
 */

/** 구글 검색 크롤러만. Google-Extended · GoogleOther · AdsBot · Mediapartners 는 대상이 아니다. */
export function isGoogleSearchCrawler(ua: string | null | undefined): boolean {
  return /googlebot|google-inspectiontool/i.test(ua || '')
}

/** 대행사 시드 칼럼 3편 (D1 blog_posts id 1·2·3) — 관리자 화면으로 올린 글과 slug 로 구분된다 */
const SEED_BLOG_SLUGS = new Set(['implant-longterm-care', 'gum-bleeding-signal', 'veneer-shade-selection'])

/** 구글에만 검색 제외할 경로인가 (pathname, 쿼리 제외) */
export function isGoogleHiddenPath(pathname: string): boolean {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

  // 백과사전: 목록 + 용어 전체
  if (p === '/encyclopedia' || p.startsWith('/encyclopedia/')) return true

  // 지역: 목록 + 주 지역(검단) 계열을 뺀 나머지
  if (p === '/region') return true
  if (p.startsWith('/region/')) {
    const slug = p.slice('/region/'.length)
    if (slug.includes('/')) return false
    return !(slug === 'geomdan' || slug.startsWith('geomdan-'))
  }

  // 건강칼럼: 시드 글 3편만
  if (p.startsWith('/blog/')) return SEED_BLOG_SLUGS.has(p.slice('/blog/'.length))

  return false
}

export const GOOGLE_HIDE_HEADER = 'googlebot: noindex'
