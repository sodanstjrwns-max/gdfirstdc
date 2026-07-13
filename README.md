# 검단퍼스트치과 홈페이지 (webapp)

## Project Overview
- **Name**: 검단퍼스트치과의원 공식 홈페이지
- **Goal**: 과잉진료 없는 1인 대표원장 책임진료 철학을 담은 지역 SEO 최적화 치과 홈페이지
- **참고**: 백과사전(치과 용어 사전) 기능은 의학정보 특성상 제외됨

## URLs
- **개발(샌드박스)**: https://3000-i6855r7gxvdlqx169sebt-3844e1b6.sandbox.novita.ai
- **Production**: https://gdfirst-dental.pages.dev ✅

## 완성된 기능
1. **메인 홈** (`/`) — 히어로, 신뢰 배너, 시그니처 진료 3종(임플란트/루미네이트/턱관절), 원장 소개, 장비 9종, 진료시간/오시는길
2. **병원소개** (`/about`) — 진료철학, 김희수 원장 학력·경력·수료·학회·논문·방송, 장비 전체
3. **진료과목** (`/treatments`, `/treatments/:slug`) — 10개 과목 상세 페이지 + 과목별 FAQ 아코디언 (FAQPage JSON-LD 포함)
4. **치료스토리** (`/stories`) — 아버지 전악 임플란트 등 스토리 3편
5. **치료사례** (`/cases`, `/cases/:id`) — 카테고리 필터, 페이지네이션, **전/후 비교 슬라이더** (구내포토·파노라마)
6. **건강칼럼** (`/blog`, `/blog/:slug`) — 블로그, Article JSON-LD
7. **공지사항** (`/notice`, `/notice/:id`) — 상단 고정 공지 지원
8. **내원안내** (`/location`) — OpenStreetMap 지도, 네이버/카카오맵 링크, 주차·교통·진료시간, 입구·접수데스크 실사진, /pricing 연결 비급여 카드
8-1. **치료비용 안내** (`/pricing`) — 원장 제공 수가표 기반 비급여 137항목 전체 공개(의료법 제45조). 9개 카테고리, 앵커 네비게이션, speakable 요약박스, 비용 FAQPage JSON-LD. 데이터: `src/data/pricing.ts`
8-2. **원내 실사진 7장** — 홈 갤러리 스트립(4장), 병원소개 갤러리 섹션(6장), 오시는길 입구·접수(2장) — webp 변환(1200px, q82)
9. **지역 SEO/AEO 페이지** (`/region`, `/region/:slug`) — **25개 지역** (검단·서구 12 / 청라·루원 3 / 계양·부평 3 / 김포 7). 지역별 고유 콘텐츠·교통안내·요약 답변박스(Speakable)·지역 FAQ 6개 + FAQPage/BreadcrumbList JSON-LD, 인근 지역 내부링크
10. **회원가입/로그인** (`/signup`, `/login`, `/logout`) — PBKDF2 해시 + HMAC 세션 쿠키, 개인정보 동의
11. **관리자** (`/admin`) — 대시보드, 치료사례/칼럼/공지 CRUD, R2 이미지 업로드, 지역 자동완성(`/api/regions`), 비밀번호 변경
12. **통합 FAQ** (`/faq`) — 진료과목 10종 FAQ 203개 전체 + FAQPage JSON-LD (AEO 핵심 페이지), 글로벌 네비에 추가
13. **SEO/AEO 슈퍼 머신**
    - sitemap.xml: lastmod/changefreq/priority, 45+ URL (DB 콘텐츠 자동 반영)
    - robots.txt: GPTBot·ClaudeBot·PerplexityBot·NaverBot 등 AI/검색봇 18종 명시 허용
    - `/llms.txt`: AI 답변엔진용 병원 요약 (진료·지역·연락처·주요 페이지)
    - Dentist JSON-LD 확장: areaServed 27개 지역, availableService 6개 진료, sameAs/hasMap/founder 상세
    - Speakable(WebPage) 스키마 전 페이지, geo.position/ICBM/geo.region 메타
    - 푸터 전 페이지 지역 키워드 내부링크 25개 ("OO동 치과")

## 관리자 초기 비밀번호
- `/admin/login` → 초기 비밀번호 `gdfirst2872!` (첫 로그인 후 반드시 변경!)

## Data Architecture
- **Storage**: Cloudflare D1 (users, before_after, blog_posts, notices, settings) + R2 (이미지: cases/, blog/, notice/)
- **마이그레이션**: `migrations/0001_initial_schema.sql`
- **로컬 개발**: `--local` 플래그로 로컬 SQLite/R2 자동 사용

## 개발 명령
```bash
npm run build                                            # 빌드
npx wrangler d1 migrations apply webapp-production --local  # 로컬 DB 마이그레이션
pm2 start ecosystem.config.cjs                           # 개발 서버 (port 3000)
```

## 배포 상태 (2026-07-08 완료 ✅)
- **Cloudflare Pages 프로젝트**: `gdfirst-dental` (사용자 본인 CF 계정, BYOK)
- **D1**: `gdfirst-dental-production` (id: cdc2e02b-69ae-4a36-a82c-d38dfa64df61) — 마이그레이션 적용 완료
- **R2**: `gdfirst-dental-images`
- **Secrets**: `SESSION_SECRET` 설정 완료 (세션 HMAC 서명용)
- **재배포**: `npm run build && npx wrangler pages deploy dist --project-name gdfirst-dental`
- **프로덕션 마이그레이션**: `npx wrangler d1 migrations apply gdfirst-dental-production --remote`

## 미구현 / 다음 단계
- 실제 병원 사진·전후 사진 업로드 (관리자에서 직접 가능)
- 온라인 예약 시스템 (현재는 전화 예약 안내)
- 네이버 서치어드바이저/구글 서치콘솔 등록
- 커스텀 도메인 연결 (`npx wrangler pages domain add <도메인> --project-name gdfirst-dental`)
- 관리자 초기 비밀번호 변경 (프로덕션 /admin/login 첫 로그인 후 필수!)

## Tech Stack
- Hono + TypeScript + Cloudflare Pages (D1 + R2) + TailwindCSS(CDN) + FontAwesome
- **디자인 v3 (2026 SUPER)**: View Transitions 페이지 전환, 커튼 인트로, 스크롤 프로그레스 바, 커스텀 lerp 커서, 오로라 히어로, per-char 스플릿 타이포, 스포트라이트 보더 카드, 마그네틱 버튼, 3D 틸트+글레어
- **Last Updated**: 2026-07-13 (치료비용 수가표 /pricing + 푸터 비용 정보 + 원내 실사진 7장 배치)
