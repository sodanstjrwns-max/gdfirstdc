import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'
import { execSync } from 'node:child_process'

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
  },
  plugins: [
    build(),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
