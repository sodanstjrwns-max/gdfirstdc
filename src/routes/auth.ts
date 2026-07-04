// 회원가입 / 로그인 / 로그아웃
import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { layout, esc } from '../lib/layout'
import { hashPassword, verifyPassword, createSession } from '../lib/auth'
import type { AppEnv } from '../types'

const auth = new Hono<AppEnv>()

const inputCls = 'w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600'

function authShell(title: string, inner: string): string {
  return `
<section class="min-h-[70vh] flex items-center justify-center bg-navy-50 py-14 px-4">
  <div class="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-8">
    <h1 class="text-2xl font-extrabold text-navy-900 text-center">${title}</h1>
    ${inner}
  </div>
</section>`
}

// ===== 회원가입 =====
auth.get('/signup', (c) => {
  const err = c.req.query('error')
  const body = authShell('회원가입', `
    <p class="text-center text-sm text-slate-500 mt-2">검단퍼스트치과 홈페이지 회원이 되어주세요.</p>
    ${err ? `<p class="mt-4 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-3"><i class="fas fa-circle-exclamation mr-1"></i>${esc(err)}</p>` : ''}
    <form id="signup-form" method="POST" action="/signup" class="mt-6 space-y-4">
      <div><label class="block text-sm font-bold text-slate-700 mb-1" for="name">이름</label><input id="name" name="name" required maxlength="30" class="${inputCls}" placeholder="홍길동"></div>
      <div><label class="block text-sm font-bold text-slate-700 mb-1" for="email">이메일</label><input id="email" name="email" type="email" required maxlength="100" class="${inputCls}" placeholder="example@email.com"></div>
      <div><label class="block text-sm font-bold text-slate-700 mb-1" for="phone">휴대전화</label><input id="phone" name="phone" type="tel" required maxlength="20" pattern="[0-9\\-]+" class="${inputCls}" placeholder="010-0000-0000"></div>
      <div><label class="block text-sm font-bold text-slate-700 mb-1" for="password">비밀번호</label><input id="password" name="password" type="password" required minlength="8" maxlength="72" class="${inputCls}" placeholder="8자 이상"></div>
      <div><label class="block text-sm font-bold text-slate-700 mb-1" for="password2">비밀번호 확인</label><input id="password2" name="password2" type="password" required minlength="8" maxlength="72" class="${inputCls}"></div>
      <label class="flex items-start gap-2 text-sm text-slate-600"><input type="checkbox" name="privacy_agree" value="1" required class="mt-1"><span><strong>[필수]</strong> 개인정보 수집·이용에 동의합니다. (이름·이메일·휴대전화 / 회원관리 목적 / 탈퇴 시 파기)</span></label>
      <label class="flex items-start gap-2 text-sm text-slate-600"><input type="checkbox" name="marketing_agree" value="1" class="mt-1"><span>[선택] 병원 소식·이벤트 안내 수신에 동의합니다.</span></label>
      <button type="submit" class="w-full py-3.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-bold">가입하기</button>
    </form>
    <p class="mt-5 text-center text-sm text-slate-500">이미 회원이신가요? <a href="/login" class="text-navy-700 font-bold hover:underline">로그인</a></p>`)
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

  const token = await createSession({ uid: res.meta.last_row_id, name })
  setCookie(c, 'session', token, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: 60 * 60 * 24 * 7 })
  return c.redirect('/?welcome=1')
})

// ===== 로그인 =====
auth.get('/login', (c) => {
  const err = c.req.query('error')
  const next = c.req.query('next') || '/'
  const body = authShell('로그인', `
    ${err ? `<p class="mt-4 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-3"><i class="fas fa-circle-exclamation mr-1"></i>${esc(err)}</p>` : ''}
    <form id="login-form" method="POST" action="/login" class="mt-6 space-y-4">
      <input type="hidden" name="next" value="${esc(next)}">
      <div><label class="block text-sm font-bold text-slate-700 mb-1" for="email">이메일</label><input id="email" name="email" type="email" required class="${inputCls}" placeholder="example@email.com"></div>
      <div><label class="block text-sm font-bold text-slate-700 mb-1" for="password">비밀번호</label><input id="password" name="password" type="password" required class="${inputCls}"></div>
      <button type="submit" class="w-full py-3.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-bold">로그인</button>
    </form>
    <p class="mt-5 text-center text-sm text-slate-500">아직 회원이 아니신가요? <a href="/signup" class="text-navy-700 font-bold hover:underline">회원가입</a></p>`)
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
  const token = await createSession({ uid: user.id, name: user.name })
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
