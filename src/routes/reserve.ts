// 예약/상담 신청 — 폼 → D1 저장 → 관리자 페이지에서 확인
import { Hono } from 'hono'
import { layout, esc, pageHero } from '../lib/layout'
import { CLINIC } from '../data/clinic'
import { TREATMENTS } from '../data/treatments'
import type { AppEnv } from '../types'

const reserve = new Hono<AppEnv>()

const inputCls = 'w-full rounded-xl border border-ink/15 bg-white px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-royal placeholder:text-ink/30'

// ===== 예약/상담 신청 폼 =====
reserve.get('/reserve', (c) => {
  const err = c.req.query('error')
  const body = `
${pageHero('Reservation', '예약·상담 <span class="font-disp text-shine">신청</span>', '남겨주시면 확인 후 순차적으로 연락드립니다. 급하신 경우 전화가 가장 빠릅니다.')}

<section id="reserve-channels" class="max-w-6xl mx-auto px-5 pt-12">
  <div class="grid sm:grid-cols-3 gap-4">
    <a href="tel:${CLINIC.phone}" class="reveal rounded-3xl bg-ink text-white p-7 hover:-translate-y-1 transition-transform" data-tilt data-tilt-max="5">
      <i class="fas fa-phone text-gold-400 text-2xl"></i>
      <p class="mt-4 font-extrabold text-lg">전화 예약</p>
      <p class="mt-1 text-white/50 text-[13.5px]">가장 빠른 방법 · ${CLINIC.phone}</p>
    </a>
    <a href="${CLINIC.naverBooking}" target="_blank" rel="noopener" class="reveal rounded-3xl bg-[#03c75a] text-white p-7 hover:-translate-y-1 transition-transform" data-tilt data-tilt-max="5">
      <span class="inline-flex w-8 h-8 rounded-lg bg-white text-[#03c75a] items-center justify-center font-black text-lg">N</span>
      <p class="mt-4 font-extrabold text-lg">네이버 예약</p>
      <p class="mt-1 text-white/70 text-[13.5px]">원하는 날짜·시간 직접 선택</p>
    </a>
    <a href="${CLINIC.kakao}" target="_blank" rel="noopener" class="reveal rounded-3xl bg-[#fee500] text-[#191919] p-7 hover:-translate-y-1 transition-transform" data-tilt data-tilt-max="5">
      <i class="fas fa-comment text-2xl"></i>
      <p class="mt-4 font-extrabold text-lg">카카오톡 상담</p>
      <p class="mt-1 text-[#191919]/60 text-[13.5px]">채팅으로 편하게 문의</p>
    </a>
  </div>
</section>

<section id="reserve-form-section" class="max-w-6xl mx-auto px-5 py-14">
  <div class="grid lg:grid-cols-5 gap-6">
    <div class="lg:col-span-3">
      <div class="reveal rounded-3xl bg-white border border-ink/8 p-7 sm:p-10 shadow-xl shadow-ink/5">
        <h2 class="text-2xl font-extrabold text-ink tracking-tightest"><i class="fas fa-calendar-check text-gold-600 mr-2"></i>온라인 예약·상담 신청</h2>
        <p class="mt-2 text-ink/45 text-[14px]">확인 후 해당 번호로 연락드려 예약을 확정해 드립니다.</p>
        ${err ? `<p class="mt-5 rounded-xl bg-red-50 text-red-600 text-sm px-4 py-3"><i class="fas fa-circle-exclamation mr-1"></i>${esc(err)}</p>` : ''}
        <form method="POST" action="/reserve" class="mt-7 space-y-5">
          <div class="grid sm:grid-cols-2 gap-4">
            <div><label for="rv-name" class="block text-sm font-bold text-ink mb-1.5">성함 *</label><input id="rv-name" name="name" required maxlength="30" class="${inputCls}" placeholder="홍길동"></div>
            <div><label for="rv-phone" class="block text-sm font-bold text-ink mb-1.5">연락처 *</label><input id="rv-phone" name="phone" type="tel" required maxlength="20" pattern="[0-9\\-\\s]{9,}" class="${inputCls}" placeholder="010-1234-5678"></div>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div><label for="rv-category" class="block text-sm font-bold text-ink mb-1.5">진료 항목</label>
              <select id="rv-category" name="category" class="${inputCls}">
                <option value="">선택 안 함 / 잘 모르겠어요</option>
                ${TREATMENTS.map((t) => `<option value="${esc(t.name)}">${t.name}</option>`).join('')}
                <option value="정기검진·스케일링">정기검진·스케일링</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div><label for="rv-when" class="block text-sm font-bold text-ink mb-1.5">희망 날짜·시간</label><input id="rv-when" name="preferred_at" maxlength="60" class="${inputCls}" placeholder="예: 이번 주 토요일 오전"></div>
          </div>
          <div><label for="rv-msg" class="block text-sm font-bold text-ink mb-1.5">문의 내용</label><textarea id="rv-msg" name="message" rows="4" maxlength="800" class="${inputCls}" placeholder="증상이나 궁금한 점을 편하게 적어주세요. (선택)"></textarea></div>
          <label class="flex items-start gap-2.5 text-[13.5px] text-ink/60 leading-relaxed">
            <input type="checkbox" name="privacy_agree" value="1" required class="mt-0.5 w-4 h-4 accent-royal">
            <span><strong class="text-ink">[필수]</strong> 개인정보 수집·이용 동의 — 수집항목: 성함·연락처·문의내용 / 이용목적: 예약 상담 및 안내 연락 / 보유기간: 목적 달성 후 지체 없이 파기</span>
          </label>
          <button type="submit" class="btn-3d w-full py-4.5 py-4 rounded-2xl bg-ink hover:bg-navy-800 text-white font-extrabold text-[16px] transition"><i class="fas fa-paper-plane mr-2 text-gold-400"></i>예약·상담 신청하기</button>
        </form>
      </div>
    </div>
    <aside class="lg:col-span-2 space-y-4">
      <div class="reveal rounded-3xl bg-ink text-white p-7 relative overflow-hidden">
        <div class="absolute -bottom-14 -right-14 w-52 h-52 rounded-full bg-gold-500/15 blur-[70px]" aria-hidden="true"></div>
        <h2 class="font-extrabold flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-gold-400"></span>진료시간</h2>
        <ul class="mt-4 space-y-2 text-[13.5px] relative">
          ${CLINIC.hours.map((h) => `<li class="flex justify-between gap-3"><span class="text-white/40">${h.day}</span><span class="font-bold text-right">${h.time.replace('AM 09:30 ~ PM 18:30', '09:30–18:30').replace('AM 09:30 ~ PM 14:00 (점심시간 없이 진료)', '09:30–14:00').replace('휴진 (공휴일이 있는 주는 정상진료)', '휴진*')}</span></li>`).join('')}
          <li class="flex justify-between gap-3"><span class="text-white/40">점심시간</span><span class="font-bold">13:00–14:00</span></li>
        </ul>
        <p class="mt-3 text-[11px] text-white/35">* 공휴일이 있는 주 목요일은 정상진료</p>
      </div>
      <div class="reveal rounded-3xl bg-white border border-ink/8 p-7">
        <h2 class="font-extrabold text-ink flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-gold-500"></span>오시는 길</h2>
        <p class="mt-3 text-[13.5px] text-ink/60 leading-relaxed">${CLINIC.addressShort}</p>
        <a href="/location" class="mt-3 inline-flex items-center gap-1.5 text-royal font-bold text-[13.5px]">지도·주차 안내 보기 <i class="fas fa-arrow-right text-[10px]"></i></a>
      </div>
    </aside>
  </div>
</section>`
  return c.html(layout({ title: '예약·상담 신청', desc: `검단퍼스트치과 예약·상담 신청 — 온라인 신청, 네이버 예약, 카카오톡 상담, 전화 ${CLINIC.phone}. 확인 후 순차적으로 연락드립니다.`, path: '/reserve' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

reserve.post('/reserve', async (c) => {
  const form = await c.req.parseBody()
  const name = String(form.name || '').trim().slice(0, 30)
  const phone = String(form.phone || '').trim().slice(0, 20)
  if (!name || phone.replace(/[^0-9]/g, '').length < 9) {
    return c.redirect(`/reserve?error=${encodeURIComponent('성함과 올바른 연락처를 입력해 주세요.')}`)
  }
  if (form.privacy_agree !== '1') {
    return c.redirect(`/reserve?error=${encodeURIComponent('개인정보 수집·이용에 동의해 주세요.')}`)
  }
  await c.env.DB.prepare(
    'INSERT INTO reservations (name, phone, category, preferred_at, message, privacy_agree) VALUES (?, ?, ?, ?, ?, 1)'
  ).bind(name, phone, String(form.category || '').slice(0, 60), String(form.preferred_at || '').slice(0, 60), String(form.message || '').slice(0, 800)).run()
  return c.redirect('/reserve/done')
})

reserve.get('/reserve/done', (c) => {
  const body = `
<section id="reserve-done" class="min-h-[70vh] flex items-center justify-center px-5 pt-32 pb-20 bg-cream">
  <div class="max-w-lg w-full text-center">
    <div class="reveal-scale mx-auto w-20 h-20 rounded-full bg-ink text-gold-400 flex items-center justify-center text-3xl shadow-2xl shadow-ink/20"><i class="fas fa-check"></i></div>
    <h1 class="reveal mt-7 text-3xl sm:text-4xl font-extrabold text-ink tracking-tightest">신청이 <span class="font-disp text-shine">접수</span>되었습니다</h1>
    <p class="reveal mt-4 text-ink/50 leading-relaxed">남겨주신 연락처로 확인 후 순차적으로 연락드려<br>예약을 확정해 드리겠습니다.</p>
    <p class="reveal mt-2 text-[13px] text-ink/35">진료 중에는 연락이 다소 늦을 수 있습니다. 급하신 경우 전화 주세요.</p>
    <div class="reveal mt-8 flex flex-wrap justify-center gap-3">
      <a href="tel:${CLINIC.phone}" class="btn-3d px-7 py-4 rounded-full bg-ink text-white font-extrabold"><i class="fas fa-phone mr-2 text-gold-400"></i>${CLINIC.phone}</a>
      <a href="/" class="px-7 py-4 rounded-full border border-ink/15 font-bold text-ink/70 hover:bg-ink hover:text-white transition">홈으로</a>
    </div>
  </div>
</section>`
  return c.html(layout({ title: '예약 신청 완료', desc: '예약·상담 신청이 접수되었습니다. 확인 후 연락드리겠습니다.', path: '/reserve/done', noindex: true }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

export default reserve
