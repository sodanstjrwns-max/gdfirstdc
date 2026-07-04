# 검단퍼스트치과 홈페이지 (webapp)

## Project Overview
- **Name**: 검단퍼스트치과의원 공식 홈페이지
- **Goal**: 과잉진료 없는 1인 대표원장 책임진료 철학을 담은 지역 SEO 최적화 치과 홈페이지
- **참고**: 백과사전(치과 용어 사전) 기능은 의학정보 특성상 제외됨

## URLs
- **개발(샌드박스)**: https://3000-i6855r7gxvdlqx169sebt-3844e1b6.sandbox.novita.ai
- **Production**: 미배포 (Cloudflare Pages 배포 예정)

## 완성된 기능
1. **메인 홈** (`/`) — 히어로, 신뢰 배너, 시그니처 진료 3종(임플란트/루미네이트/턱관절), 원장 소개, 장비 9종, 진료시간/오시는길
2. **병원소개** (`/about`) — 진료철학, 김희수 원장 학력·경력·수료·학회·논문·방송, 장비 전체
3. **진료과목** (`/treatments`, `/treatments/:slug`) — 10개 과목 상세 페이지 + 과목별 FAQ 아코디언 (FAQPage JSON-LD 포함)
4. **치료스토리** (`/stories`) — 아버지 전악 임플란트 등 스토리 3편
5. **치료사례** (`/cases`, `/cases/:id`) — 카테고리 필터, 페이지네이션, **전/후 비교 슬라이더** (구내포토·파노라마)
6. **건강칼럼** (`/blog`, `/blog/:slug`) — 블로그, Article JSON-LD
7. **공지사항** (`/notice`, `/notice/:id`) — 상단 고정 공지 지원
8. **내원안내** (`/location`) — OpenStreetMap 지도, 네이버/카카오맵 링크, 주차·교통·진료시간
9. **지역 SEO 페이지** (`/region/:slug`) — 검단신도시·원당동·김포·청라 등 10개 지역
10. **회원가입/로그인** (`/signup`, `/login`, `/logout`) — PBKDF2 해시 + HMAC 세션 쿠키, 개인정보 동의
11. **관리자** (`/admin`) — 대시보드, 치료사례/칼럼/공지 CRUD, R2 이미지 업로드, 지역 자동완성(`/api/regions`), 비밀번호 변경
12. **SEO** — sitemap.xml (DB 콘텐츠 자동 반영), robots.txt, canonical, OG, Dentist/FAQPage/Article JSON-LD

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

## 배포 시 필요 작업
1. `npx wrangler d1 create webapp-production` → database_id를 wrangler.jsonc에 반영
2. `npx wrangler r2 bucket create webapp-images`
3. `npx wrangler d1 migrations apply webapp-production` (프로덕션)
4. `npm run build && npx wrangler pages deploy dist --project-name <프로젝트명>`
5. `src/data/clinic.ts`의 `siteUrl`을 실제 도메인으로 교체
6. `src/lib/auth.ts`의 SESSION_SECRET을 환경변수로 교체 권장

## 미구현 / 다음 단계
- 실제 병원 사진·전후 사진 업로드 (관리자에서 직접 가능)
- 온라인 예약 시스템 (현재는 전화 예약 안내)
- 네이버 서치어드바이저/구글 서치콘솔 등록
- 커스텀 도메인 연결

## Tech Stack
- Hono + TypeScript + Cloudflare Pages (D1 + R2) + TailwindCSS(CDN) + FontAwesome
- **Last Updated**: 2026-07-04
