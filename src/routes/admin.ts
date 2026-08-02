// 관리자 — 치료사례/칼럼/공지 CRUD + 이미지 업로드(R2)
import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { layout, esc } from '../lib/layout'
import { hashPassword, verifyPassword, createSession, readSession } from '../lib/auth'
import { TREATMENTS } from '../data/treatments'
import { PRICING } from '../data/pricing'
import { searchRegions } from '../data/regions'
import type { AppEnv } from '../types'

const admin = new Hono<AppEnv>()

const DEFAULT_ADMIN_PW = 'gdfirst2872!'
const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600'

async function isAdminReq(c: any): Promise<boolean> {
  const sess = await readSession(getCookie(c, 'admin_session'), c.env.SESSION_SECRET)
  return !!sess?.admin
}

function adminShell(title: string, inner: string, active: string): string {
  const menu = [
    { href: '/admin', key: 'home', label: '대시보드', icon: 'fa-gauge' },
    { href: '/admin/reservations', key: 'reservations', label: '예약 문의', icon: 'fa-calendar-check' },
    { href: '/admin/cases', key: 'cases', label: '치료사례', icon: 'fa-images' },
    { href: '/admin/blog', key: 'blog', label: '건강칼럼', icon: 'fa-pen-nib' },
    { href: '/admin/notice', key: 'notice', label: '공지사항', icon: 'fa-bullhorn' },
    { href: '/admin/pricing', key: 'pricing', label: '수가표', icon: 'fa-won-sign' },
    { href: '/admin/password', key: 'password', label: '비밀번호 변경', icon: 'fa-key' },
  ]
  return `
<div class="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-[210px_1fr] gap-6">
  <aside id="admin-sidebar" class="md:sticky md:top-20 h-fit rounded-2xl border border-slate-200 p-3">
    <p class="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Admin</p>
    <nav class="space-y-1">
      ${menu.map((m) => `<a href="${m.href}" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold ${active === m.key ? 'bg-navy-800 text-white' : 'text-slate-600 hover:bg-navy-50'}"><i class="fas ${m.icon} w-4"></i>${m.label}${m.key === 'reservations' ? '<span id="resv-badge" class="hidden ml-auto min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-white text-[11px] font-extrabold items-center justify-center animate-pulse"></span>' : ''}</a>`).join('')}
      <a href="/admin/logout" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50"><i class="fas fa-right-from-bracket w-4"></i>관리자 로그아웃</a>
    </nav>
  </aside>
  <section id="admin-content">
    <h1 class="text-2xl font-extrabold text-navy-900 mb-6">${title}</h1>
    ${inner}
  </section>
</div>
<script>
(function(){
  fetch('/admin/api/new-reservations').then(function(r){ return r.json() }).then(function(d){
    var b = document.getElementById('resv-badge');
    if (b && d && d.n > 0) { b.textContent = d.n > 99 ? '99+' : d.n; b.classList.remove('hidden'); b.classList.add('inline-flex'); }
  }).catch(function(){});
})();
</script>`
}

// ===== 관리자 로그인 =====
admin.get('/admin/login', (c) => {
  const err = c.req.query('error')
  const body = `
<section class="min-h-[60vh] flex items-center justify-center bg-navy-50 py-14 px-4">
  <div class="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-xl p-8">
    <h1 class="text-xl font-extrabold text-navy-900 text-center"><i class="fas fa-lock text-gold-600 mr-2"></i>관리자 로그인</h1>
    ${err ? `<p class="mt-4 rounded-lg bg-red-50 text-red-600 text-sm px-4 py-3">${esc(err)}</p>` : ''}
    <form method="POST" action="/admin/login" class="mt-6 space-y-4">
      <input name="password" type="password" required autocomplete="current-password" class="${inputCls}" placeholder="관리자 비밀번호">
      <button type="submit" class="w-full py-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-bold">로그인</button>
    </form>
  </div>
</section>`
  return c.html(layout({ title: '관리자 로그인', desc: '관리자 로그인', path: '/admin/login', noindex: true }, body))
})

admin.post('/admin/login', async (c) => {
  const form = await c.req.parseBody()
  const password = String(form.password || '')
  let row = await c.env.DB.prepare("SELECT value FROM settings WHERE key = 'admin_password_hash'").first<{ value: string }>()
  if (!row) {
    // 최초 로그인 시 기본 비밀번호 해시 저장
    const hash = await hashPassword(DEFAULT_ADMIN_PW)
    await c.env.DB.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password_hash', ?)").bind(hash).run()
    row = { value: hash }
  }
  if (!(await verifyPassword(password, row.value))) {
    return c.redirect(`/admin/login?error=${encodeURIComponent('비밀번호가 올바르지 않습니다.')}`)
  }
  const token = await createSession({ admin: true, name: '관리자' }, c.env.SESSION_SECRET)
  setCookie(c, 'admin_session', token, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: 60 * 60 * 8, secure: new URL(c.req.url).protocol === 'https:' })
  return c.redirect('/admin')
})

admin.get('/admin/logout', (c) => {
  deleteCookie(c, 'admin_session', { path: '/' })
  return c.redirect('/')
})

// ===== 관리자 인증 미들웨어 =====
admin.use('/admin', async (c, next) => {
  if (!(await isAdminReq(c))) return c.redirect('/admin/login')
  await next()
})
admin.use('/admin/*', async (c, next) => {
  const p = c.req.path
  if (p === '/admin/login' || p === '/admin/logout') return next()
  if (!(await isAdminReq(c))) return c.redirect('/admin/login')
  await next()
})

// ===== 대시보드 =====
admin.get('/admin', async (c) => {
  const [ba, blog, notice, users, resv, resvNew] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) AS n FROM before_after').first<{ n: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) AS n FROM blog_posts').first<{ n: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) AS n FROM notices').first<{ n: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) AS n FROM users').first<{ n: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) AS n FROM reservations').first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM reservations WHERE status = 'new'").first<{ n: number }>(),
  ])
  const newN = resvNew?.n || 0
  const stats = [
    { label: '예약 문의', n: resv?.n || 0, href: '/admin/reservations', icon: 'fa-calendar-check', badge: newN },
    { label: '치료사례', n: ba?.n || 0, href: '/admin/cases', icon: 'fa-images' },
    { label: '건강칼럼', n: blog?.n || 0, href: '/admin/blog', icon: 'fa-pen-nib' },
    { label: '공지사항', n: notice?.n || 0, href: '/admin/notice', icon: 'fa-bullhorn' },
    { label: '회원 수', n: users?.n || 0, href: '#', icon: 'fa-users' },
  ]
  const inner = `
<div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
  ${stats.map((s: any) => `<a href="${s.href}" class="relative rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition"><i class="fas ${s.icon} text-gold-600 text-xl"></i><p class="mt-2 text-3xl font-extrabold text-navy-900">${s.n}</p><p class="text-sm text-slate-500">${s.label}</p>${s.badge ? `<span class="absolute top-4 right-4 min-w-[26px] h-[26px] px-1.5 rounded-full bg-red-500 text-white text-xs font-extrabold flex items-center justify-center animate-pulse">${s.badge}</span>` : ''}</a>`).join('')}
</div>
<div class="mt-8 rounded-2xl bg-navy-50 p-6 text-sm text-slate-600 leading-relaxed">
  <p class="font-bold text-navy-900 mb-2"><i class="fas fa-circle-info text-gold-600 mr-1"></i>안내</p>
  <ul class="list-disc pl-5 space-y-1">
    <li>홈페이지 [예약·상담 신청]으로 들어온 문의는 [예약 문의] 메뉴에서 확인하고, 연락 후 상태를 변경해 주세요.</li>
    <li>치료사례는 파노라마/구내포토 전·후 이미지를 업로드하면 홈페이지에 비교 슬라이더로 표시됩니다.</li>
    <li>지역 입력란은 자동완성을 지원합니다 (예: "원당" 입력 → 인천시 서구 원당동).</li>
    <li>진료 비용이 바뀌면 [수가표] 메뉴에서 수정하세요 — 홈페이지 치료비용 페이지와 각 진료 페이지에 즉시 반영됩니다.</li>
    <li>초기 관리자 비밀번호는 반드시 [비밀번호 변경] 메뉴에서 변경해 주세요.</li>
  </ul>
</div>`
  return c.html(layout({ title: '관리자', desc: '관리자', path: '/admin', noindex: true }, adminShell('대시보드', inner, 'home')))
})

// =========================================================
// 예약 문의 관리
// =========================================================
const RESV_STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: '신규', cls: 'bg-red-100 text-red-600' },
  contacted: { label: '연락완료', cls: 'bg-blue-100 text-blue-700' },
  confirmed: { label: '예약확정', cls: 'bg-green-100 text-green-700' },
  cancelled: { label: '취소', cls: 'bg-slate-100 text-slate-400' },
}

admin.get('/admin/reservations', async (c) => {
  const filter = c.req.query('status') || ''
  const q = filter && RESV_STATUS[filter]
    ? c.env.DB.prepare('SELECT * FROM reservations WHERE status = ? ORDER BY created_at DESC LIMIT 200').bind(filter)
    : c.env.DB.prepare("SELECT * FROM reservations ORDER BY CASE WHEN status = 'new' THEN 0 ELSE 1 END, created_at DESC LIMIT 200")
  const rows = (await q.all<any>()).results
  const counts = (await c.env.DB.prepare('SELECT status, COUNT(*) AS n FROM reservations GROUP BY status').all<any>()).results
  const countOf = (k: string) => counts.find((r: any) => r.status === k)?.n || 0
  const total = counts.reduce((a: number, r: any) => a + r.n, 0)
  const tabs = [
    { key: '', label: `전체 ${total}` },
    ...Object.entries(RESV_STATUS).map(([k, v]) => ({ key: k, label: `${v.label} ${countOf(k)}` })),
  ]
  const inner = `
<div class="flex flex-wrap gap-2 mb-5">
  ${tabs.map((t) => `<a href="/admin/reservations${t.key ? `?status=${t.key}` : ''}" class="px-4 py-2 rounded-full text-sm font-bold ${filter === t.key ? 'bg-navy-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-navy-50'}">${t.label}</a>`).join('')}
</div>
${rows.length === 0 ? '<p class="text-slate-400 py-10 text-center">예약 문의가 없습니다.</p>' : `
<div class="space-y-3">
  ${rows.map((r: any) => {
    const st = RESV_STATUS[r.status] || RESV_STATUS.new
    return `<div class="rounded-2xl border ${r.status === 'new' ? 'border-red-200 bg-red-50/40' : 'border-slate-200 bg-white'} p-5">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span class="px-2.5 py-1 rounded-full text-xs font-extrabold ${st.cls}">${st.label}</span>
      <strong class="text-navy-900 text-[15px]">${esc(r.name)}</strong>
      <a href="tel:${esc(r.phone)}" class="font-bold text-royal hover:underline"><i class="fas fa-phone text-[11px] mr-1"></i>${esc(r.phone)}</a>
      <span class="text-xs text-slate-400 ml-auto">${(r.created_at || '').replace('T', ' ').slice(0, 16)}</span>
    </div>
    <div class="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
      ${r.category ? `<span><i class="fas fa-tooth text-gold-600 mr-1"></i>${esc(r.category)}</span>` : ''}
      ${r.preferred_at ? `<span><i class="fas fa-clock text-gold-600 mr-1"></i>희망: ${esc(r.preferred_at)}</span>` : ''}
    </div>
    ${r.message ? `<p class="mt-2 text-sm text-slate-500 leading-relaxed whitespace-pre-line rounded-xl bg-slate-50 px-4 py-3">${esc(r.message)}</p>` : ''}
    <div class="mt-3 flex flex-wrap items-center gap-2">
      <form method="POST" action="/admin/reservations/${r.id}/status" class="flex items-center gap-2">
        <select name="status" class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-bold">
          ${Object.entries(RESV_STATUS).map(([k, v]) => `<option value="${k}" ${r.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}
        </select>
        <button class="px-4 py-1.5 rounded-lg bg-navy-800 text-white text-sm font-bold">상태 변경</button>
      </form>
      <form method="POST" action="/admin/reservations/${r.id}/delete" class="ml-auto" onsubmit="return confirm('이 예약 문의를 삭제하시겠습니까?')"><button class="px-4 py-1.5 rounded-lg text-red-500 text-sm font-bold hover:bg-red-50">삭제</button></form>
    </div>
  </div>`
  }).join('')}
</div>`}`
  return c.html(layout({ title: '예약 문의 관리', desc: '관리자', path: '/admin/reservations', noindex: true }, adminShell('예약 문의 관리', inner, 'reservations')))
})

admin.post('/admin/reservations/:id/status', async (c) => {
  const form = await c.req.parseBody()
  const status = String(form.status || 'new')
  if (RESV_STATUS[status]) {
    await c.env.DB.prepare('UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(status, parseInt(c.req.param('id'))).run()
  }
  return c.redirect('/admin/reservations')
})

admin.post('/admin/reservations/:id/delete', async (c) => {
  await c.env.DB.prepare('DELETE FROM reservations WHERE id = ?').bind(parseInt(c.req.param('id'))).run()
  return c.redirect('/admin/reservations')
})

// =========================================================
// 수가표 관리 (비급여 진료비용)
// =========================================================
admin.get('/admin/pricing', async (c) => {
  const catKey = c.req.query('cat') || 'implant'
  const cat = PRICING.find((p) => p.key === catKey) || PRICING[1]
  const [rows, counts, upd] = await Promise.all([
    c.env.DB.prepare('SELECT id, name, price, note, sort FROM price_items WHERE category_key = ? ORDER BY sort, id').bind(cat.key).all<any>(),
    c.env.DB.prepare('SELECT category_key, COUNT(*) AS n FROM price_items GROUP BY category_key').all<any>(),
    c.env.DB.prepare("SELECT value FROM settings WHERE key = 'pricing_updated'").first<{ value: string }>(),
  ])
  const countOf = (k: string) => counts.results.find((r: any) => r.category_key === k)?.n || 0
  const msg = c.req.query('msg')
  const inner = `
${msg ? `<p class="mb-4 rounded-xl bg-green-50 text-green-700 text-sm font-bold px-4 py-3"><i class="fas fa-check mr-1"></i>${esc(msg)}</p>` : ''}
<div class="flex flex-wrap items-center gap-3 mb-5">
  <form method="POST" action="/admin/pricing/updated" class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
    <span class="text-sm font-bold text-slate-500">고지 기준월</span>
    <input name="value" value="${esc(upd?.value || '')}" required pattern="[0-9]{4}-[0-9]{2}" placeholder="2026-07" class="w-24 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-bold text-center">
    <button class="px-3 py-1.5 rounded-lg bg-navy-800 text-white text-sm font-bold">저장</button>
  </form>
  <p class="text-xs text-slate-400">수정 즉시 홈페이지 <a href="/pricing" target="_blank" class="text-royal font-bold underline">치료비용 페이지</a>와 각 진료 페이지에 반영됩니다.</p>
</div>
<div class="flex flex-wrap gap-2 mb-6">
  ${PRICING.map((p) => `<a href="/admin/pricing?cat=${p.key}" class="px-4 py-2 rounded-full text-sm font-bold ${cat.key === p.key ? 'bg-navy-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-navy-50'}"><i class="fas ${p.icon} mr-1.5 ${cat.key === p.key ? 'text-gold-400' : 'text-gold-600'}"></i>${p.label} ${countOf(p.key)}</a>`).join('')}
</div>

<form method="POST" action="/admin/pricing/add" class="mb-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-4 flex flex-wrap items-end gap-3">
  <input type="hidden" name="category_key" value="${cat.key}">
  <label class="flex-1 min-w-[180px]"><span class="block text-xs font-bold text-slate-500 mb-1">새 항목명 *</span><input name="name" required class="${inputCls}" placeholder="예: 오스템임플란트"></label>
  <label class="w-32"><span class="block text-xs font-bold text-slate-500 mb-1">비용(원)</span><input name="price" type="number" min="0" step="1000" value="0" class="${inputCls}"></label>
  <label class="w-36"><span class="block text-xs font-bold text-slate-500 mb-1">비고</span><input name="note" class="${inputCls}" placeholder="선택"></label>
  <button class="px-5 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-900 text-sm font-extrabold"><i class="fas fa-plus mr-1"></i>${cat.label}에 추가</button>
  <p class="w-full text-[11px] text-slate-400 mt-1">비용 0원 = "보험 적용"으로 표시됩니다${cat.insured ? ' (보험 항목은 0원이 기본)' : ''}.</p>
</form>

<div class="rounded-2xl border border-slate-200 bg-white overflow-hidden">
  <div class="hidden sm:grid grid-cols-[1fr_130px_140px_150px] gap-3 px-5 py-3 bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider"><span>항목명</span><span>비용(원)</span><span>비고</span><span class="text-right">동작</span></div>
  ${rows.results.length === 0 ? '<p class="text-slate-400 py-10 text-center">항목이 없습니다. 위에서 추가하세요.</p>' : rows.results.map((r: any, i: number) => `
  <form method="POST" action="/admin/pricing/${r.id}/update" class="grid sm:grid-cols-[1fr_130px_140px_150px] gap-2 sm:gap-3 items-center px-5 py-3 ${i % 2 ? 'bg-slate-50/50' : ''} border-t border-slate-100">
    <input type="hidden" name="cat" value="${cat.key}">
    <input name="name" value="${esc(r.name)}" required class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium focus:border-navy-600 focus:outline-none">
    <input name="price" type="number" min="0" step="1000" value="${r.price}" class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-right focus:border-navy-600 focus:outline-none">
    <input name="note" value="${esc(r.note || '')}" placeholder="비고" class="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-navy-600 focus:outline-none">
    <div class="flex items-center justify-end gap-1.5">
      <button class="px-3.5 py-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-white text-xs font-bold">저장</button>
      <button formaction="/admin/pricing/${r.id}/delete" formnovalidate onclick="return confirm('[${esc(r.name)}] 항목을 삭제하시겠습니까?')" class="px-3 py-2 rounded-lg text-red-500 text-xs font-bold hover:bg-red-50">삭제</button>
    </div>
  </form>`).join('')}
</div>`
  return c.html(layout({ title: '수가표 관리', desc: '관리자', path: '/admin/pricing', noindex: true }, adminShell('수가표 관리', inner, 'pricing')))
})

admin.post('/admin/pricing/updated', async (c) => {
  const form = await c.req.parseBody()
  const v = String(form.value || '').trim()
  if (/^[0-9]{4}-[0-9]{2}$/.test(v)) {
    await c.env.DB.prepare("INSERT INTO settings (key, value) VALUES ('pricing_updated', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(v).run()
  }
  return c.redirect('/admin/pricing?msg=' + encodeURIComponent('고지 기준월이 저장되었습니다.'))
})

admin.post('/admin/pricing/add', async (c) => {
  const form = await c.req.parseBody()
  const catKey = String(form.category_key || '')
  const name = String(form.name || '').trim()
  const price = Math.max(0, parseInt(String(form.price || '0')) || 0)
  const note = String(form.note || '').trim() || null
  if (name && PRICING.some((p) => p.key === catKey)) {
    const mx = await c.env.DB.prepare('SELECT COALESCE(MAX(sort), 0) AS m FROM price_items WHERE category_key = ?').bind(catKey).first<{ m: number }>()
    await c.env.DB.prepare('INSERT INTO price_items (category_key, name, price, note, sort) VALUES (?, ?, ?, ?, ?)').bind(catKey, name, price, note, (mx?.m || 0) + 10).run()
  }
  return c.redirect(`/admin/pricing?cat=${catKey}&msg=` + encodeURIComponent('항목이 추가되었습니다.'))
})

admin.post('/admin/pricing/:id/update', async (c) => {
  const form = await c.req.parseBody()
  const name = String(form.name || '').trim()
  const price = Math.max(0, parseInt(String(form.price || '0')) || 0)
  const note = String(form.note || '').trim() || null
  const cat = String(form.cat || 'implant')
  if (name) {
    await c.env.DB.prepare('UPDATE price_items SET name = ?, price = ?, note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(name, price, note, parseInt(c.req.param('id'))).run()
  }
  return c.redirect(`/admin/pricing?cat=${cat}&msg=` + encodeURIComponent('저장되었습니다.'))
})

admin.post('/admin/pricing/:id/delete', async (c) => {
  const form = await c.req.parseBody()
  const cat = String(form.cat || 'implant')
  await c.env.DB.prepare('DELETE FROM price_items WHERE id = ?').bind(parseInt(c.req.param('id'))).run()
  return c.redirect(`/admin/pricing?cat=${cat}&msg=` + encodeURIComponent('삭제되었습니다.'))
})

// ===== 신규 예약 카운트 API (사이드메뉴 빨간 뱃지용) =====
admin.get('/admin/api/new-reservations', async (c) => {
  const row = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM reservations WHERE status = 'new'").first<{ n: number }>()
  return c.json({ n: row?.n || 0 })
})

// ===== 비밀번호 변경 =====
admin.get('/admin/password', (c) => {
  const msg = c.req.query('msg')
  const inner = `
${msg ? `<p class="mb-4 rounded-lg bg-green-50 text-green-700 text-sm px-4 py-3">${esc(msg)}</p>` : ''}
<form method="POST" action="/admin/password" class="max-w-sm space-y-4">
  <div><label class="block text-sm font-bold mb-1">현재 비밀번호</label><input name="current" type="password" required class="${inputCls}"></div>
  <div><label class="block text-sm font-bold mb-1">새 비밀번호 (8자 이상)</label><input name="next" type="password" required minlength="8" class="${inputCls}"></div>
  <button class="px-6 py-3 rounded-xl bg-navy-800 text-white font-bold text-sm">변경하기</button>
</form>`
  return c.html(layout({ title: '비밀번호 변경', desc: '관리자', path: '/admin/password', noindex: true }, adminShell('비밀번호 변경', inner, 'password')))
})

admin.post('/admin/password', async (c) => {
  const form = await c.req.parseBody()
  const current = String(form.current || '')
  const nextPw = String(form.next || '')
  const row = await c.env.DB.prepare("SELECT value FROM settings WHERE key = 'admin_password_hash'").first<{ value: string }>()
  if (!row || !(await verifyPassword(current, row.value))) {
    return c.redirect(`/admin/password?msg=${encodeURIComponent('현재 비밀번호가 올바르지 않습니다.')}`)
  }
  if (nextPw.length < 8) return c.redirect(`/admin/password?msg=${encodeURIComponent('새 비밀번호는 8자 이상이어야 합니다.')}`)
  const hash = await hashPassword(nextPw)
  await c.env.DB.prepare("UPDATE settings SET value = ? WHERE key = 'admin_password_hash'").bind(hash).run()
  return c.redirect(`/admin/password?msg=${encodeURIComponent('비밀번호가 변경되었습니다.')}`)
})

// ===== 이미지 업로드 헬퍼 =====
async function uploadImage(c: any, file: unknown, prefix: string): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null
  if (file.size > 8 * 1024 * 1024) return null
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const key = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  await c.env.R2.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type || 'image/jpeg' } })
  return key
}

// ===== 지역 자동완성 API =====
admin.get('/api/regions', (c) => {
  const q = c.req.query('q') || ''
  return c.json({ results: searchRegions(q) })
})

// ===== 에디터 인라인 이미지 업로드 API (드래그·붙여넣기 지원) =====
admin.post('/admin/api/upload-image', async (c) => {
  const form = await c.req.parseBody()
  const key = await uploadImage(c, form.image, 'editor')
  if (!key) return c.json({ error: '이미지 업로드에 실패했습니다. (8MB 이하 이미지 파일만 가능)' }, 400)
  return c.json({ url: `/images/${key}` })
})

// ===== 최고수준 WYSIWYG 에디터 (Toast UI Editor — 한국어 UI) =====
function editorField(initialHtml: string): string {
  return `
<div>
  <label class="block text-sm font-bold mb-1">본문 *</label>
  <textarea name="content_html" id="content-html-field" class="hidden" aria-hidden="true">${esc(initialHtml)}</textarea>
  <div id="tui-editor" class="rounded-xl overflow-hidden border border-slate-300 bg-white"></div>
  <p class="mt-2 text-xs text-slate-400"><i class="fas fa-circle-info mr-1"></i>이미지는 본문에 바로 드래그하거나 붙여넣으면 자동 업로드됩니다. 네이버 블로그처럼 제목·굵기·목록·표·링크를 툴바에서 바로 쓰시면 됩니다.</p>
</div>
<link rel="stylesheet" href="https://uicdn.toast.com/editor/latest/toastui-editor.min.css">
<script src="https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js"></script>
<script src="https://uicdn.toast.com/editor/latest/i18n/ko-kr.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
  const field = document.getElementById('content-html-field')
  const form = field.closest('form')
  const editor = new toastui.Editor({
    el: document.getElementById('tui-editor'),
    height: '560px',
    initialEditType: 'wysiwyg',
    hideModeSwitch: false,
    language: 'ko-KR',
    usageStatistics: false,
    autofocus: false,
    placeholder: '여기에 본문을 작성하세요. 사진은 드래그하거나 복사-붙여넣기 하면 됩니다.',
    toolbarItems: [
      ['heading', 'bold', 'italic', 'strike'],
      ['hr', 'quote'],
      ['ul', 'ol', 'indent', 'outdent'],
      ['table', 'image', 'link'],
      ['scrollSync'],
    ],
    hooks: {
      addImageBlobHook: async (blob, callback) => {
        try {
          const fd = new FormData()
          fd.append('image', blob, blob.name || 'image-' + Date.now() + '.png')
          const res = await fetch('/admin/api/upload-image', { method: 'POST', body: fd })
          const data = await res.json()
          if (data.url) callback(data.url, '이미지')
          else alert(data.error || '이미지 업로드 실패')
        } catch (e) { alert('이미지 업로드 중 오류가 발생했습니다.') }
      },
    },
  })
  if (field.value.trim()) editor.setHTML(field.value)
  form.addEventListener('submit', (e) => {
    const html = editor.getHTML()
    const text = html.replace(/<[^>]*>/g, '').trim()
    const hasMedia = /<(img|table|iframe)/i.test(html)
    if (!text && !hasMedia) { e.preventDefault(); alert('본문을 입력해 주세요.'); return }
    field.value = html
  })
})
</script>`
}

// =========================================================
// 치료사례 관리
// =========================================================
const AGE_GROUPS = ['10대', '20대', '30대', '40대', '50대', '60대', '70대 이상']

admin.get('/admin/cases', async (c) => {
  const rows = (await c.env.DB.prepare('SELECT id, title, category, region, published, views, created_at FROM before_after ORDER BY created_at DESC LIMIT 100').all<any>()).results
  const inner = `
<a href="/admin/cases/new" class="inline-block mb-5 px-5 py-2.5 rounded-xl bg-royal text-white font-bold text-sm hover:bg-royal-600"><i class="fas fa-plus mr-1"></i>새 치료사례</a>
${rows.length === 0 ? '<p class="text-slate-400 py-10 text-center">등록된 치료사례가 없습니다.</p>' : `
<div class="overflow-x-auto rounded-xl border border-slate-200">
<table class="w-full text-sm">
  <thead class="bg-navy-50 text-navy-900"><tr><th class="px-3 py-2.5 text-left">제목</th><th class="px-3 py-2.5">카테고리</th><th class="px-3 py-2.5">지역</th><th class="px-3 py-2.5">상태</th><th class="px-3 py-2.5">조회</th><th class="px-3 py-2.5">관리</th></tr></thead>
  <tbody class="divide-y divide-slate-100">
    ${rows.map((r: any) => `<tr>
      <td class="px-3 py-2.5"><a href="/cases/${r.id}" target="_blank" class="font-medium text-navy-800 hover:underline">${esc(r.title)}</a></td>
      <td class="px-3 py-2.5 text-center text-slate-500">${esc(r.category || '-')}</td>
      <td class="px-3 py-2.5 text-center text-slate-500">${esc(r.region || '-')}</td>
      <td class="px-3 py-2.5 text-center">${r.published ? '<span class="text-green-600 font-bold">게시</span>' : '<span class="text-slate-400">숨김</span>'}</td>
      <td class="px-3 py-2.5 text-center text-slate-500">${r.views}</td>
      <td class="px-3 py-2.5 text-center whitespace-nowrap">
        <a href="/admin/cases/${r.id}/edit" class="text-navy-700 font-bold hover:underline">수정</a>
        <form method="POST" action="/admin/cases/${r.id}/delete" class="inline ml-2" onsubmit="return confirm('삭제하시겠습니까?')"><button class="text-red-500 font-bold hover:underline">삭제</button></form>
      </td>
    </tr>`).join('')}
  </tbody>
</table>
</div>`}`
  return c.html(layout({ title: '치료사례 관리', desc: '관리자', path: '/admin/cases', noindex: true }, adminShell('치료사례 관리', inner, 'cases')))
})

function caseForm(action: string, r?: any): string {
  const regionScript = `
<script>
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('region-input')
  const list = document.getElementById('region-suggest')
  let timer
  input.addEventListener('input', () => {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      const q = input.value.trim()
      if (!q) { list.classList.add('hidden'); return }
      const res = await fetch('/api/regions?q=' + encodeURIComponent(q))
      const data = await res.json()
      if (!data.results.length) { list.classList.add('hidden'); return }
      list.innerHTML = data.results.map(r => '<button type="button" class="block w-full text-left px-3 py-2 text-sm hover:bg-navy-50">' + r + '</button>').join('')
      list.classList.remove('hidden')
      list.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { input.value = b.textContent; list.classList.add('hidden') }))
    }, 200)
  })
  document.addEventListener('click', (e) => { if (!list.contains(e.target) && e.target !== input) list.classList.add('hidden') })
})
</script>`
  const imgField = (name: string, label: string, currentKey?: string | null) => `
<div>
  <label class="block text-sm font-bold mb-1">${label}</label>
  ${currentKey ? `<img src="/images/${currentKey}" alt="${label}" class="w-32 rounded-lg border mb-1"><label class="flex items-center gap-1.5 text-xs text-red-500 font-bold mb-2"><input type="checkbox" name="remove_${name}" value="1"> 현재 이미지 삭제</label>` : ''}
  <input type="file" name="${name}" accept="image/*" class="block w-full text-sm text-slate-500 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-navy-50 file:text-navy-700 file:font-bold file:text-sm">
</div>`
  return `
<form method="POST" action="${action}" enctype="multipart/form-data" class="space-y-5 max-w-2xl">
  <div><label class="block text-sm font-bold mb-1">제목 *</label><input name="title" required maxlength="120" value="${esc(r?.title || '')}" class="${inputCls}" placeholder="예: 60대 남성 상악 전악 임플란트"></div>
  <div class="grid sm:grid-cols-3 gap-4">
    <div><label class="block text-sm font-bold mb-1">카테고리</label><select name="category" class="${inputCls}">${TREATMENTS.map((t) => `<option value="${t.slug}" ${r?.category === t.slug ? 'selected' : ''}>${t.name}</option>`).join('')}</select></div>
    <div><label class="block text-sm font-bold mb-1">연령대</label><select name="age_group" class="${inputCls}"><option value="">선택안함</option>${AGE_GROUPS.map((a) => `<option ${r?.age_group === a ? 'selected' : ''}>${a}</option>`).join('')}</select></div>
    <div><label class="block text-sm font-bold mb-1">성별</label><select name="gender" class="${inputCls}"><option value="">선택안함</option><option ${r?.gender === '남성' ? 'selected' : ''}>남성</option><option ${r?.gender === '여성' ? 'selected' : ''}>여성</option></select></div>
  </div>
  <div class="grid sm:grid-cols-2 gap-4">
    <div class="relative">
      <label class="block text-sm font-bold mb-1">지역 (자동완성)</label>
      <input id="region-input" name="region" autocomplete="off" value="${esc(r?.region || '')}" class="${inputCls}" placeholder="예: 원당 → 인천시 서구 원당동">
      <div id="region-suggest" class="hidden absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto"></div>
    </div>
    <div><label class="block text-sm font-bold mb-1">치료기간</label><input name="duration" maxlength="40" value="${esc(r?.duration || '')}" class="${inputCls}" placeholder="예: 5개월"></div>
  </div>
  <div><label class="block text-sm font-bold mb-1">치료 이야기</label><textarea name="description" rows="6" class="${inputCls}" placeholder="치료 배경과 과정을 적어주세요. 줄바꿈으로 문단이 나뉩니다.">${esc(r?.description || '')}</textarea></div>
  <fieldset class="rounded-xl border border-slate-200 p-4 grid sm:grid-cols-2 gap-4">
    <legend class="px-2 text-sm font-bold text-navy-900">구내포토</legend>
    ${imgField('intra_before', '치료 전', r?.intra_before_key)}
    ${imgField('intra_after', '치료 후', r?.intra_after_key)}
  </fieldset>
  <fieldset class="rounded-xl border border-slate-200 p-4 grid sm:grid-cols-2 gap-4">
    <legend class="px-2 text-sm font-bold text-navy-900">파노라마</legend>
    ${imgField('pano_before', '치료 전', r?.pano_before_key)}
    ${imgField('pano_after', '치료 후', r?.pano_after_key)}
  </fieldset>
  <label class="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="published" value="1" ${!r || r.published ? 'checked' : ''}> 홈페이지에 게시</label>
  <div class="flex gap-2">
    <button class="px-6 py-3 rounded-xl bg-navy-800 text-white font-bold text-sm">저장</button>
    <a href="/admin/cases" class="px-6 py-3 rounded-xl border border-slate-300 font-bold text-sm text-slate-600">취소</a>
  </div>
</form>
${regionScript}`
}

admin.get('/admin/cases/new', (c) =>
  c.html(layout({ title: '치료사례 등록', desc: '관리자', path: '/admin/cases/new', noindex: true }, adminShell('치료사례 등록', caseForm('/admin/cases/new'), 'cases')))
)

admin.post('/admin/cases/new', async (c) => {
  const form = await c.req.parseBody()
  const keys: Record<string, string | null> = {}
  for (const f of ['intra_before', 'intra_after', 'pano_before', 'pano_after']) {
    keys[f] = await uploadImage(c, form[f], 'cases')
  }
  await c.env.DB.prepare(
    `INSERT INTO before_after (title, description, age_group, gender, category, region, duration, intra_before_key, intra_after_key, pano_before_key, pano_after_key, published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    String(form.title || '').trim(), String(form.description || ''), String(form.age_group || ''), String(form.gender || ''),
    String(form.category || ''), String(form.region || ''), String(form.duration || ''),
    keys.intra_before, keys.intra_after, keys.pano_before, keys.pano_after, form.published === '1' ? 1 : 0
  ).run()
  return c.redirect('/admin/cases')
})

admin.get('/admin/cases/:id/edit', async (c) => {
  const r = await c.env.DB.prepare('SELECT * FROM before_after WHERE id = ?').bind(parseInt(c.req.param('id'))).first<any>()
  if (!r) return c.notFound()
  return c.html(layout({ title: '치료사례 수정', desc: '관리자', path: '/admin/cases/edit', noindex: true }, adminShell('치료사례 수정', caseForm(`/admin/cases/${r.id}/edit`, r), 'cases')))
})

admin.post('/admin/cases/:id/edit', async (c) => {
  const id = parseInt(c.req.param('id'))
  const old = await c.env.DB.prepare('SELECT * FROM before_after WHERE id = ?').bind(id).first<any>()
  if (!old) return c.notFound()
  const form = await c.req.parseBody()
  const keyOf = async (field: string, oldKey: string | null) => {
    const uploaded = await uploadImage(c, form[field], 'cases')
    if (uploaded) return uploaded
    if (form[`remove_${field}`] === '1') return null
    return oldKey
  }
  await c.env.DB.prepare(
    `UPDATE before_after SET title=?, description=?, age_group=?, gender=?, category=?, region=?, duration=?,
     intra_before_key=?, intra_after_key=?, pano_before_key=?, pano_after_key=?, published=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
  ).bind(
    String(form.title || '').trim(), String(form.description || ''), String(form.age_group || ''), String(form.gender || ''),
    String(form.category || ''), String(form.region || ''), String(form.duration || ''),
    await keyOf('intra_before', old.intra_before_key), await keyOf('intra_after', old.intra_after_key),
    await keyOf('pano_before', old.pano_before_key), await keyOf('pano_after', old.pano_after_key),
    form.published === '1' ? 1 : 0, id
  ).run()
  return c.redirect('/admin/cases')
})

admin.post('/admin/cases/:id/delete', async (c) => {
  await c.env.DB.prepare('DELETE FROM before_after WHERE id = ?').bind(parseInt(c.req.param('id'))).run()
  return c.redirect('/admin/cases')
})

// =========================================================
// 건강칼럼 관리
// =========================================================
admin.get('/admin/blog', async (c) => {
  const rows = (await c.env.DB.prepare('SELECT id, title, slug, published, views, created_at FROM blog_posts ORDER BY created_at DESC LIMIT 100').all<any>()).results
  const inner = `
<a href="/admin/blog/new" class="inline-block mb-5 px-5 py-2.5 rounded-xl bg-royal text-white font-bold text-sm hover:bg-royal-600"><i class="fas fa-plus mr-1"></i>새 칼럼</a>
${rows.length === 0 ? '<p class="text-slate-400 py-10 text-center">등록된 칼럼이 없습니다.</p>' : `
<div class="overflow-x-auto rounded-xl border border-slate-200">
<table class="w-full text-sm">
  <thead class="bg-navy-50 text-navy-900"><tr><th class="px-3 py-2.5 text-left">제목</th><th class="px-3 py-2.5">상태</th><th class="px-3 py-2.5">조회</th><th class="px-3 py-2.5">등록일</th><th class="px-3 py-2.5">관리</th></tr></thead>
  <tbody class="divide-y divide-slate-100">
    ${rows.map((r: any) => `<tr>
      <td class="px-3 py-2.5"><a href="/blog/${esc(r.slug)}" target="_blank" class="font-medium text-navy-800 hover:underline">${esc(r.title)}</a></td>
      <td class="px-3 py-2.5 text-center">${r.published ? '<span class="text-green-600 font-bold">게시</span>' : '<span class="text-slate-400">숨김</span>'}</td>
      <td class="px-3 py-2.5 text-center text-slate-500">${r.views}</td>
      <td class="px-3 py-2.5 text-center text-slate-500">${(r.created_at || '').slice(0, 10)}</td>
      <td class="px-3 py-2.5 text-center whitespace-nowrap">
        <a href="/admin/blog/${r.id}/edit" class="text-navy-700 font-bold hover:underline">수정</a>
        <form method="POST" action="/admin/blog/${r.id}/delete" class="inline ml-2" onsubmit="return confirm('삭제하시겠습니까?')"><button class="text-red-500 font-bold hover:underline">삭제</button></form>
      </td>
    </tr>`).join('')}
  </tbody>
</table>
</div>`}`
  return c.html(layout({ title: '건강칼럼 관리', desc: '관리자', path: '/admin/blog', noindex: true }, adminShell('건강칼럼 관리', inner, 'blog')))
})

function blogForm(action: string, r?: any): string {
  return `
<form method="POST" action="${action}" enctype="multipart/form-data" class="space-y-5 max-w-2xl">
  <div><label class="block text-sm font-bold mb-1">제목 *</label><input name="title" required maxlength="150" value="${esc(r?.title || '')}" class="${inputCls}"></div>
  <div><label class="block text-sm font-bold mb-1">슬러그(URL) — 비우면 자동생성</label><input name="slug" maxlength="120" value="${esc(r?.slug || '')}" class="${inputCls}" placeholder="예: implant-care-guide"></div>
  <div class="grid sm:grid-cols-2 gap-4">
    <div><label class="block text-sm font-bold mb-1">카테고리</label><input name="category" maxlength="30" value="${esc(r?.category || '')}" class="${inputCls}" placeholder="예: 임플란트"></div>
    <div><label class="block text-sm font-bold mb-1">썸네일 이미지</label>${r?.thumbnail_key ? `<img src="/images/${r.thumbnail_key}" class="w-24 rounded-lg border mb-1" alt="썸네일">` : ''}<input type="file" name="thumbnail" accept="image/*" class="block w-full text-sm text-slate-500 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-navy-50 file:text-navy-700 file:font-bold file:text-sm"></div>
  </div>
  <div><label class="block text-sm font-bold mb-1">요약 (목록/검색 노출)</label><textarea name="excerpt" rows="2" maxlength="200" class="${inputCls}">${esc(r?.excerpt || '')}</textarea></div>
  ${editorField(r?.content_html || '')}
  <label class="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="published" value="1" ${!r || r.published ? 'checked' : ''}> 홈페이지에 게시</label>
  <div class="flex gap-2">
    <button class="px-6 py-3 rounded-xl bg-navy-800 text-white font-bold text-sm">저장</button>
    <a href="/admin/blog" class="px-6 py-3 rounded-xl border border-slate-300 font-bold text-sm text-slate-600">취소</a>
  </div>
</form>`
}

function slugify(title: string, fallback: string): string {
  const s = title.toLowerCase().replace(/[^a-z0-9가-힣\s-]/g, '').trim().replace(/[\s]+/g, '-').slice(0, 80)
  return s || fallback
}

admin.get('/admin/blog/new', (c) =>
  c.html(layout({ title: '칼럼 등록', desc: '관리자', path: '/admin/blog/new', noindex: true }, adminShell('칼럼 등록', blogForm('/admin/blog/new'), 'blog')))
)

admin.post('/admin/blog/new', async (c) => {
  const form = await c.req.parseBody()
  const title = String(form.title || '').trim()
  let slug = String(form.slug || '').trim() || slugify(title, `post-${Date.now()}`)
  const dup = await c.env.DB.prepare('SELECT id FROM blog_posts WHERE slug = ?').bind(slug).first()
  if (dup) slug = `${slug}-${Date.now().toString(36)}`
  const thumb = await uploadImage(c, form.thumbnail, 'blog')
  await c.env.DB.prepare(
    'INSERT INTO blog_posts (title, slug, content_html, excerpt, thumbnail_key, category, published) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(title, slug, String(form.content_html || ''), String(form.excerpt || ''), thumb, String(form.category || ''), form.published === '1' ? 1 : 0).run()
  return c.redirect('/admin/blog')
})

admin.get('/admin/blog/:id/edit', async (c) => {
  const r = await c.env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(parseInt(c.req.param('id'))).first<any>()
  if (!r) return c.notFound()
  return c.html(layout({ title: '칼럼 수정', desc: '관리자', path: '/admin/blog/edit', noindex: true }, adminShell('칼럼 수정', blogForm(`/admin/blog/${r.id}/edit`, r), 'blog')))
})

admin.post('/admin/blog/:id/edit', async (c) => {
  const id = parseInt(c.req.param('id'))
  const old = await c.env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(id).first<any>()
  if (!old) return c.notFound()
  const form = await c.req.parseBody()
  const thumb = (await uploadImage(c, form.thumbnail, 'blog')) || old.thumbnail_key
  const slug = String(form.slug || '').trim() || old.slug
  await c.env.DB.prepare(
    'UPDATE blog_posts SET title=?, slug=?, content_html=?, excerpt=?, thumbnail_key=?, category=?, published=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).bind(String(form.title || '').trim(), slug, String(form.content_html || ''), String(form.excerpt || ''), thumb, String(form.category || ''), form.published === '1' ? 1 : 0, id).run()
  return c.redirect('/admin/blog')
})

admin.post('/admin/blog/:id/delete', async (c) => {
  await c.env.DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(parseInt(c.req.param('id'))).run()
  return c.redirect('/admin/blog')
})

// =========================================================
// 공지사항 관리
// =========================================================
admin.get('/admin/notice', async (c) => {
  const rows = (await c.env.DB.prepare('SELECT id, title, is_pinned, published, views, created_at FROM notices ORDER BY is_pinned DESC, created_at DESC LIMIT 100').all<any>()).results
  const inner = `
<a href="/admin/notice/new" class="inline-block mb-5 px-5 py-2.5 rounded-xl bg-royal text-white font-bold text-sm hover:bg-royal-600"><i class="fas fa-plus mr-1"></i>새 공지</a>
${rows.length === 0 ? '<p class="text-slate-400 py-10 text-center">등록된 공지가 없습니다.</p>' : `
<div class="overflow-x-auto rounded-xl border border-slate-200">
<table class="w-full text-sm">
  <thead class="bg-navy-50 text-navy-900"><tr><th class="px-3 py-2.5 text-left">제목</th><th class="px-3 py-2.5">고정</th><th class="px-3 py-2.5">상태</th><th class="px-3 py-2.5">등록일</th><th class="px-3 py-2.5">관리</th></tr></thead>
  <tbody class="divide-y divide-slate-100">
    ${rows.map((r: any) => `<tr>
      <td class="px-3 py-2.5"><a href="/notice/${r.id}" target="_blank" class="font-medium text-navy-800 hover:underline">${esc(r.title)}</a></td>
      <td class="px-3 py-2.5 text-center">${r.is_pinned ? '<i class="fas fa-thumbtack text-gold-600"></i>' : '-'}</td>
      <td class="px-3 py-2.5 text-center">${r.published ? '<span class="text-green-600 font-bold">게시</span>' : '<span class="text-slate-400">숨김</span>'}</td>
      <td class="px-3 py-2.5 text-center text-slate-500">${(r.created_at || '').slice(0, 10)}</td>
      <td class="px-3 py-2.5 text-center whitespace-nowrap">
        <a href="/admin/notice/${r.id}/edit" class="text-navy-700 font-bold hover:underline">수정</a>
        <form method="POST" action="/admin/notice/${r.id}/delete" class="inline ml-2" onsubmit="return confirm('삭제하시겠습니까?')"><button class="text-red-500 font-bold hover:underline">삭제</button></form>
      </td>
    </tr>`).join('')}
  </tbody>
</table>
</div>`}`
  return c.html(layout({ title: '공지사항 관리', desc: '관리자', path: '/admin/notice', noindex: true }, adminShell('공지사항 관리', inner, 'notice')))
})

function noticeForm(action: string, r?: any): string {
  return `
<form method="POST" action="${action}" enctype="multipart/form-data" class="space-y-5 max-w-2xl">
  <div><label class="block text-sm font-bold mb-1">제목 *</label><input name="title" required maxlength="150" value="${esc(r?.title || '')}" class="${inputCls}"></div>
  ${editorField(r?.content_html || '')}
  ${(() => { let ks: string[] = []; try { ks = r?.image_keys ? JSON.parse(r.image_keys) : [] } catch { /* noop */ } return ks.length ? `<div><label class="block text-sm font-bold mb-1">첨부된 이미지</label><div class="flex flex-wrap gap-3">${ks.map((k, i) => `<div class="text-center"><img src="/images/${k}" alt="첨부 이미지 ${i + 1}" class="w-24 h-24 object-cover rounded-lg border"><label class="flex items-center justify-center gap-1 text-xs text-red-500 font-bold mt-1"><input type="checkbox" name="remove_image_${i}" value="1"> 삭제</label></div>`).join('')}</div></div>` : '' })()}
  <div><label class="block text-sm font-bold mb-1">이미지 첨부 (최대 3개 — 본문 아래 자동 표시)</label>
    <input type="file" name="image1" accept="image/*" class="block w-full text-sm text-slate-500 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-navy-50 file:text-navy-700 file:font-bold file:text-sm mb-2">
    <input type="file" name="image2" accept="image/*" class="block w-full text-sm text-slate-500 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-navy-50 file:text-navy-700 file:font-bold file:text-sm mb-2">
    <input type="file" name="image3" accept="image/*" class="block w-full text-sm text-slate-500 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-navy-50 file:text-navy-700 file:font-bold file:text-sm">
  </div>
  <div class="flex gap-6">
    <label class="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="is_pinned" value="1" ${r?.is_pinned ? 'checked' : ''}> 상단 고정 (공지)</label>
    <label class="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="published" value="1" ${!r || r.published ? 'checked' : ''}> 게시</label>
  </div>
  <div class="flex gap-2">
    <button class="px-6 py-3 rounded-xl bg-navy-800 text-white font-bold text-sm">저장</button>
    <a href="/admin/notice" class="px-6 py-3 rounded-xl border border-slate-300 font-bold text-sm text-slate-600">취소</a>
  </div>
</form>`
}

admin.get('/admin/notice/new', (c) =>
  c.html(layout({ title: '공지 등록', desc: '관리자', path: '/admin/notice/new', noindex: true }, adminShell('공지 등록', noticeForm('/admin/notice/new'), 'notice')))
)

admin.post('/admin/notice/new', async (c) => {
  const form = await c.req.parseBody()
  const keys: string[] = []
  for (const f of ['image1', 'image2', 'image3']) {
    const k = await uploadImage(c, form[f], 'notice')
    if (k) keys.push(k)
  }
  await c.env.DB.prepare(
    'INSERT INTO notices (title, content_html, image_keys, is_pinned, published) VALUES (?, ?, ?, ?, ?)'
  ).bind(String(form.title || '').trim(), String(form.content_html || ''), JSON.stringify(keys), form.is_pinned === '1' ? 1 : 0, form.published === '1' ? 1 : 0).run()
  return c.redirect('/admin/notice')
})

admin.get('/admin/notice/:id/edit', async (c) => {
  const r = await c.env.DB.prepare('SELECT * FROM notices WHERE id = ?').bind(parseInt(c.req.param('id'))).first<any>()
  if (!r) return c.notFound()
  return c.html(layout({ title: '공지 수정', desc: '관리자', path: '/admin/notice/edit', noindex: true }, adminShell('공지 수정', noticeForm(`/admin/notice/${r.id}/edit`, r), 'notice')))
})

admin.post('/admin/notice/:id/edit', async (c) => {
  const id = parseInt(c.req.param('id'))
  const old = await c.env.DB.prepare('SELECT * FROM notices WHERE id = ?').bind(id).first<any>()
  if (!old) return c.notFound()
  const form = await c.req.parseBody()
  let keys: string[] = []
  try { keys = old.image_keys ? JSON.parse(old.image_keys) : [] } catch { /* noop */ }
  keys = keys.filter((_, i) => form[`remove_image_${i}`] !== '1')
  for (const f of ['image1', 'image2', 'image3']) {
    const k = await uploadImage(c, form[f], 'notice')
    if (k) keys.push(k)
  }
  await c.env.DB.prepare(
    'UPDATE notices SET title=?, content_html=?, image_keys=?, is_pinned=?, published=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).bind(String(form.title || '').trim(), String(form.content_html || ''), JSON.stringify(keys.slice(0, 3)), form.is_pinned === '1' ? 1 : 0, form.published === '1' ? 1 : 0, id).run()
  return c.redirect('/admin/notice')
})

admin.post('/admin/notice/:id/delete', async (c) => {
  await c.env.DB.prepare('DELETE FROM notices WHERE id = ?').bind(parseInt(c.req.param('id'))).run()
  return c.redirect('/admin/notice')
})

export default admin
