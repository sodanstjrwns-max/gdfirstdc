import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

// 메인 몰입 연출 파일은 내용 해시로 ?v= 를 붙인다(고정 번호 금지 — 바뀌면 바로 새 파일)
const assetHash = (f: string) => createHash('sha256').update(readFileSync(f)).digest('hex').slice(0, 10)

// 진료 콘텐츠 최종 검토일 — 진료 본문·FAQ 데이터 파일의 실제 마지막 커밋 날짜를 빌드 시 상수로 고정한다.
// (요청마다 오늘 날짜를 넣지 않는다. git 이력이 없는 환경에서는 아래 고정값을 쓴다.)
const TX_CONTENT_FILES = ['src/data/treatments.ts', 'src/data/treatment_extras.ts', 'src/data/faqs.ts']
const TX_REVIEWED_FALLBACK = '2026-09-03'
function lastCommitDate(files: string[], fallback: string): string {
  try {
    const d = execSync(`git log -1 --format=%cs -- ${files.join(' ')}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : fallback
  } catch {
    return fallback
  }
}

export default defineConfig({
  define: {
    __TX_REVIEWED__: JSON.stringify(lastCommitDate(TX_CONTENT_FILES, TX_REVIEWED_FALLBACK)),
    __IMMERSIVE_JS_V__: JSON.stringify(assetHash('public/static/immersive.js')),
    __IMMERSIVE_CSS_V__: JSON.stringify(assetHash('public/static/immersive.css')),
    // 공용 style.css 도 내용 해시로(2026-10-31 CLS 수정 — ?v= 없이 두면 브라우저 4시간 캐시에 옛 파일이 남음)
    __STYLE_CSS_V__: JSON.stringify(assetHash('public/static/style.css')),
    // Tailwind 빌드 CSS(2026-11-01 CDN → 빌드): npm run build 가 css:build 를 먼저 실행하므로 항상 새 CSS 의 해시
    __TAILWIND_CSS_V__: JSON.stringify(assetHash('public/static/tailwind.css')),
  },
  plugins: [
    build(),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
