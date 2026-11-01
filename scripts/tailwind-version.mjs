// Tailwind 빌드 CSS 의 ?v= 를 내용 해시로 맞춘다(고정 ?v= 금지). css:build 직후 실행.
// - 공용 화면: public/static/tailwind.css → vite.config.ts 의 __TAILWIND_CSS_V__ 가 빌드 때 같은 방식으로 계산(여기선 출력만).
// - 납품 안내서(정적 HTML): public/static/handover-tailwind.css 해시를 HTML 의 href ?v= 에 직접 기록.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

const h = (f) => createHash('sha256').update(readFileSync(new URL('../' + f, import.meta.url))).digest('hex').slice(0, 10)
console.log(`tailwind.css ?v=${h('public/static/tailwind.css')}`)
const hv = h('public/static/handover-tailwind.css')
const page = new URL('../public/static/handover-gdfirst-2026.html', import.meta.url)
const html = readFileSync(page, 'utf8')
const next = html.replace(/handover-tailwind\.css\?v=[0-9a-f]*/, `handover-tailwind.css?v=${hv}`)
if (next !== html) writeFileSync(page, next)
console.log(`handover-tailwind.css ?v=${hv}`)
