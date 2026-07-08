// 회원가입 / 로그인 / 로그아웃
import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { layout, esc } from '../lib/layout'
import { hashPassword, verifyPassword, createSession } from '../lib/auth'
import type { AppEnv } from '../types'

const auth = new Hono<AppEnv>()

const inputCls = 'w-full rounded-2xl border border-ink/10 bg-white px-5 py-3.5 text-sm text-ink placeholder:text-ink-mute/50 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/30 transition'
const labelCls = 'block text-[11px] font-bold tracking-[0.15em] uppercase text-ink-mute mb-2'

function authShell(kicker: string, title: string, accent: string, inner: string): string {
  return `
<section class="relative min-h-screen flex items-center justify-center bg-cream px-4 pt-32 pb-20 overflow-hidden">
  <div class="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-gold-400/10 blur-3xl pointer-events-none"></div>
  <div class="absolute -bottom-40 -left-32 w-[420px] h-[420px] rounded-full bg-ink/5 blur-3xl pointer-events-none"></div>
  <div class="relative w-full max-w-md">
    <div class="text-center mb-8 reveal in">
      <div class="text-[11px] font-bold tracking-[0.3em] uppercase text-gold-600 mb-3">${kicker}</div>
      <h1 class="text-4xl md:text-5xl font-black text-ink leading-tight">${title} <span class="font-disp italic font-medium text-shine">${accent}</span></h1>
    </div>
    <div class="rounded-3xl bg-white border border-ink/10 shadow-[0_24px_60px_-20px_rgba(10,22,40,0.18)] p-8 md:p-10" data-tilt data-tilt-max="4">
      ${inner}
    </div>
  </div>
</section>`
}

// ===== 회원가입 =====
auth.get('/signup', (c) => {
  const err = c.req.query('error')
  const body = authShell('Join Us', '처음', '뵙겠습니다', `
    <p class="text-center text-sm text-ink-mute">검단퍼스트치과 홈페이지 회원이 되어주세요.</p>
    ${err ? `<p class="mt-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm px-5 py-3.5"><i class="fas fa-circle-exclamation mr-1.5"></i>${esc(err)}</p>` : ''}
    <form id="signup-form" method="POST" action="/signup" class="mt-7 space-y-5">
      <div><label class="${labelCls}" for="name">이름 · Name</label><input id="name" name="name" required maxlength="30" class="${inputCls}" placeholder="홍길동"></div>
      <div><label class="${labelCls}" for="email">이메일 · Email</label><input id="email" name="email" type="email" required maxlength="100" class="${inputCls}" placeholder="example@email.com"></div>
      <div><label class="${labelCls}" for="phone">휴대전화 · Phone</label><input id="phone" name="phone" type="tel" required maxlength="20" pattern="[0-9\\-]+" class="${inputCls}" placeholder="010-0000-0000"></div>
      <div><label class="${labelCls}" for="password">비밀번호 · Password</label><input id="password" name="password" type="password" required minlength="8" maxlength="72" class="${inputCls}" placeholder="8자 이상"></div>
      <div><label class="${labelCls}" for="password2">비밀번호 확인</label><input id="password2" name="password2" type="password" required minlength="8" maxlength="72" class="${inputCls}"></div>
      <div class="space-y-3 pt-1">
        <label class="flex items-start gap-3 text-[13px] leading-relaxed text-ink-mute rounded-2xl bg-cream px-4 py-3.5 cursor-pointer"><input type="checkbox" name="privacy_agree" value="1" required class="mt-0.5 accent-gold-500 w-4 h-4"><span><strong class="text-ink">[필수]</strong> 개인정보 수집·이용에 동의합니다. (이름·이메일·휴대전화 / 회원관리 목적 / 탈퇴 시 파기)</span></label>
        <label class="flex items-start gap-3 text-[13px] leading-relaxed text-ink-mute rounded-2xl bg-cream px-4 py-3.5 cursor-pointer"><input type="checkbox" name="marketing_agree" value="1" class="mt-0.5 accent-gold-500 w-4 h-4"><span>[선택] 병원 소식·이벤트 안내 수신에 동의합니다.</span></label>
      </div>
      <button type="submit" class="group w-full py-4 rounded-full bg-ink hover:bg-ink-soft text-white font-bold text-sm tracking-wide transition flex items-center justify-center gap-2">가입하기 <i class="fas fa-arrow-right text-gold-400 text-xs group-hover:translate-x-1 transition-transform"></i></button>
    </form>
    <p class="mt-6 text-center text-sm text-ink-mute">이미 회원이신가요? <a href="/login" class="text-ink font-bold border-b border-gold-500 hover:text-gold-600 transition">로그인</a></p>`)
  return c.html(layout({ title: '회원가입', desc: '검단퍼스트치과 회원가입', path: '/signup', noindex: true }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

auth.post('/signup', async (c) => {
  const form = await c.req.parseBody()
  const name = String(form.name || '').trim()
  const email = String(form.email || '').trim().toLowerCase()
  const phone = String(form.phone || '').trim()
  const password = String(form.password || '')
  const password2 = String(form.password2 || '')
  const privacy = form.privacy_agree === '1'
  const marketing = form.marketing_agree === '1'

  const fail = (msg: string) => c.redirect(`/signup?error=${encodeURIComponent(msg)}`)
  if (!name || !email || !phone || !password) return fail('모든 필수 항목을 입력해 주세요.')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('올바른 이메일 형식이 아닙니다.')
  if (password.length < 8) return fail('비밀번호는 8자 이상이어야 합니다.')
  if (password !== password2) return fail('비밀번호가 일치하지 않습니다.')
  if (!privacy) return fail('개인정보 수집·이용 동의가 필요합니다.')

  const exists = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (exists) return fail('이미 가입된 이메일입니다.')

  const hash = await hashPassword(password)
  const res = await c.env.DB.prepare(
    'INSERT INTO users (email, phone, name, password_hash, privacy_agree, marketing_agree) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(email, phone, name, hash, 1, marketing ? 1 : 0).run()

  const token = await createSession({ uid: res.meta.last_row_id, name }, c.env.SESSION_SECRET)
  setCookie(c, 'session', token, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: 60 * 60 * 24 * 7 })
  return c.redirect('/?welcome=1')
})

// ===== 로그인 =====
auth.get('/login', (c) => {
  const err = c.req.query('error')
  const next = c.req.query('next') || '/'
  const body = authShell('Welcome Back', '다시', '반갑습니다', `
    ${err ? `<p class="rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm px-5 py-3.5 mb-5"><i class="fas fa-circle-exclamation mr-1.5"></i>${esc(err)}</p>` : ''}
    <form id="login-form" method="POST" action="/login" class="space-y-5">
      <input type="hidden" name="next" value="${esc(next)}">
      <div><label class="${labelCls}" for="email">이메일 · Email</label><input id="email" name="email" type="email" required class="${inputCls}" placeholder="example@email.com"></div>
      <div><label class="${labelCls}" for="password">비밀번호 · Password</label><input id="password" name="password" type="password" required class="${inputCls}"></div>
      <button type="submit" class="group w-full py-4 rounded-full bg-ink hover:bg-ink-soft text-white font-bold text-sm tracking-wide transition flex items-center justify-center gap-2">로그인 <i class="fas fa-arrow-right text-gold-400 text-xs group-hover:translate-x-1 transition-transform"></i></button>
    </form>
    <p class="mt-6 text-center text-sm text-ink-mute">아직 회원이 아니신가요? <a href="/signup" class="text-ink font-bold border-b border-gold-500 hover:text-gold-600 transition">회원가입</a></p>`)
  return c.html(layout({ title: '로그인', desc: '검단퍼스트치과 로그인', path: '/login', noindex: true }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

auth.post('/login', async (c) => {
  const form = await c.req.parseBody()
  const email = String(form.email || '').trim().toLowerCase()
  const password = String(form.password || '')
  const next = String(form.next || '/')
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'

  const user = await c.env.DB.prepare('SELECT id, name, password_hash FROM users WHERE email = ?').bind(email).first<{ id: number; name: string; password_hash: string }>()
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return c.redirect(`/login?error=${encodeURIComponent('이메일 또는 비밀번호가 올바르지 않습니다.')}&next=${encodeURIComponent(safeNext)}`)
  }
  const token = await createSession({ uid: user.id, name: user.name }, c.env.SESSION_SECRET)
  setCookie(c, 'session', token, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: 60 * 60 * 24 * 7 })
  return c.redirect(safeNext)
})

// ===== 로그아웃 =====
auth.get('/logout', (c) => {
  deleteCookie(c, 'session', { path: '/' })
  deleteCookie(c, 'admin_session', { path: '/' })
  return c.redirect('/')
})

export default auth
export { getCookie }
