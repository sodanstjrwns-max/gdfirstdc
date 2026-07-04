// 관리자 — 치료사례/칼럼/공지 CRUD + 이미지 업로드(R2)
import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { layout, esc } from '../lib/layout'
import { hashPassword, verifyPassword, createSession, readSession } from '../lib/auth'
import { TREATMENTS } from '../data/treatments'
import { searchRegions } from '../data/regions'
import type { AppEnv } from '../types'

const admin = new Hono<AppEnv>()

const DEFAULT_ADMIN_PW = 'gdfirst2872!'
const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600'

async function isAdminReq(c: any): Promise<boolean> {
  const sess = await readSession(getCookie(c, 'admin_session'))
  return !!sess?.admin
}

function adminShell(title: string, inner: string, active: string): string {
  const menu = [
    { href: '/admin', key: 'home', label: '대시보드', icon: 'fa-gauge' },
    { href: '/admin/cases', key: 'cases', label: '치료사례', icon: 'fa-images' },
    { href: '/admin/blog', key: 'blog', label: '건강칼럼', icon: 'fa-pen-nib' },
    { href: '/admin/notice', key: 'notice', label: '공지사항', icon: 'fa-bullhorn' },
    { href: '/admin/password', key: 'password', label: '비밀번호 변경', icon: 'fa-key' },
  ]
  return `
<div class="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-[210px_1fr] gap-6">
  <aside id="admin-sidebar" class="md:sticky md:top-20 h-fit rounded-2xl border border-slate-200 p-3">
    <p class="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Admin</p>
    <nav class="space-y-1">
      ${menu.map((m) => `<a href="${m.href}" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold ${active === m.key ? 'bg-navy-800 text-white' : 'text-slate-600 hover:bg-navy-50'}"><i class="fas ${m.icon} w-4"></i>${m.label}</a>`).join('')}
      <a href="/admin/logout" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50"><i class="fas fa-right-from-bracket w-4"></i>관리자 로그아웃</a>
    </nav>
  </aside>
  <section id="admin-content">
    <h1 class="text-2xl font-extrabold text-navy-900 mb-6">${title}</h1>
    ${inner}
  </section>
</div>`
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
      <input name="password" type="password" required class="${inputCls}" placeholder="관리자 비밀번호">
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
  const token = await createSession({ admin: true, name: '관리자' })
  setCookie(c, 'admin_session', token, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: 60 * 60 * 8 })
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
  const [ba, blog, notice, users] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) AS n FROM before_after').first<{ n: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) AS n FROM blog_posts').first<{ n: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) AS n FROM notices').first<{ n: number }>(),
    c.env.DB.prepare('SELECT COUNT(*) AS n FROM users').first<{ n: number }>(),
  ])
  const stats = [
    { label: '치료사례', n: ba?.n || 0, href: '/admin/cases', icon: 'fa-images' },
    { label: '건강칼럼', n: blog?.n || 0, href: '/admin/blog', icon: 'fa-pen-nib' },
    { label: '공지사항', n: notice?.n || 0, href: '/admin/notice', icon: 'fa-bullhorn' },
    { label: '회원 수', n: users?.n || 0, href: '#', icon: 'fa-users' },
  ]
  const inner = `
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
  ${stats.map((s) => `<a href="${s.href}" class="rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition"><i class="fas ${s.icon} text-gold-600 text-xl"></i><p class="mt-2 text-3xl font-extrabold text-navy-900">${s.n}</p><p class="text-sm text-slate-500">${s.label}</p></a>`).join('')}
</div>
<div class="mt-8 rounded-2xl bg-navy-50 p-6 text-sm text-slate-600 leading-relaxed">
  <p class="font-bold text-navy-900 mb-2"><i class="fas fa-circle-info text-gold-600 mr-1"></i>안내</p>
  <ul class="list-disc pl-5 space-y-1">
    <li>치료사례는 파노라마/구내포토 전·후 이미지를 업로드하면 홈페이지에 비교 슬라이더로 표시됩니다.</li>
    <li>지역 입력란은 자동완성을 지원합니다 (예: "원당" 입력 → 인천시 서구 원당동).</li>
    <li>초기 관리자 비밀번호는 반드시 [비밀번호 변경] 메뉴에서 변경해 주세요.</li>
  </ul>
</div>`
  return c.html(layout({ title: '관리자', desc: '관리자', path: '/admin', noindex: true }, adminShell('대시보드', inner, 'home')))
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

// =========================================================
// 치료사례 관리
// =========================================================
const AGE_GROUPS = ['10대', '20대', '30대', '40대', '50대', '60대', '70대 이상']

admin.get('/admin/cases', async (c) => {
  const rows = (await c.env.DB.prepare('SELECT id, title, category, region, published, views, created_at FROM before_after ORDER BY created_at DESC LIMIT 100').all<any>()).results
  const inner = `
<a href="/admin/cases/new" class="inline-block mb-5 px-5 py-2.5 rounded-xl bg-gold-500 text-white font-bold text-sm hover:bg-gold-600"><i class="fas fa-plus mr-1"></i>새 치료사례</a>
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
  ${currentKey ? `<img src="/images/${currentKey}" alt="${label}" class="w-32 rounded-lg border mb-2">` : ''}
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
  const keyOf = async (field: string, oldKey: string | null) => (await uploadImage(c, form[field], 'cases')) || oldKey
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
<a href="/admin/blog/new" class="inline-block mb-5 px-5 py-2.5 rounded-xl bg-gold-500 text-white font-bold text-sm hover:bg-gold-600"><i class="fas fa-plus mr-1"></i>새 칼럼</a>
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
  <div><label class="block text-sm font-bold mb-1">본문 (HTML 사용 가능: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt; 등)</label><textarea name="content_html" rows="16" required class="${inputCls} font-mono text-xs">${esc(r?.content_html || '')}</textarea></div>
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
<a href="/admin/notice/new" class="inline-block mb-5 px-5 py-2.5 rounded-xl bg-gold-500 text-white font-bold text-sm hover:bg-gold-600"><i class="fas fa-plus mr-1"></i>새 공지</a>
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
  <div><label class="block text-sm font-bold mb-1">본문 (HTML 사용 가능)</label><textarea name="content_html" rows="10" required class="${inputCls} font-mono text-xs">${esc(r?.content_html || '')}</textarea></div>
  <div><label class="block text-sm font-bold mb-1">이미지 첨부 (최대 3개)</label>
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
