// 검단퍼스트치과 — 2026 인터랙션
document.addEventListener('DOMContentLoaded', () => {
  // ===== 모바일 풀스크린 메뉴 =====
  const btn = document.getElementById('mobile-menu-btn')
  const menu = document.getElementById('mobile-menu')
  const closeBtn = document.getElementById('mobile-menu-close')
  const openMenu = () => { menu.classList.remove('hidden'); menu.classList.add('open'); document.body.style.overflow = 'hidden' }
  const closeMenu = () => { menu.classList.add('hidden'); menu.classList.remove('open'); document.body.style.overflow = '' }
  if (btn && menu) {
    btn.addEventListener('click', openMenu)
    closeBtn && closeBtn.addEventListener('click', closeMenu)
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu))
  }

  // ===== 스크롤 시 네비 숨김/표시 =====
  const header = document.getElementById('site-header')
  let lastY = 0
  window.addEventListener('scroll', () => {
    const y = window.scrollY
    if (header) header.classList.toggle('nav-hidden', y > 120 && y > lastY)
    lastY = y
  }, { passive: true })

  // ===== 스크롤 리빌 =====
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
  }, { threshold: 0.12 })
  document.querySelectorAll('.reveal, .reveal-scale, [data-stagger]').forEach((el) => io.observe(el))

  // stagger 자식 딜레이
  document.querySelectorAll('[data-stagger]').forEach((wrap) => {
    Array.from(wrap.children).forEach((child, i) => { child.style.transitionDelay = (i * 0.07) + 's' })
  })

  // ===== 카운트업 =====
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return
      countIO.unobserve(e.target)
      const el = e.target
      const target = parseFloat(el.dataset.count)
      const suffix = el.dataset.suffix || ''
      const dur = 1600
      const start = performance.now()
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        el.textContent = Math.round(target * eased).toLocaleString() + suffix
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    })
  }, { threshold: 0.4 })
  document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el))

  // ===== FAQ 아코디언 =====
  document.querySelectorAll('.faq-item button').forEach((b) => {
    b.addEventListener('click', () => {
      const answer = b.parentElement.querySelector('.faq-answer')
      const icon = b.querySelector('.faq-icon')
      if (answer) {
        answer.classList.toggle('hidden')
        if (icon) icon.classList.toggle('rotate-45')
      }
    })
  })

  // ===== 비포애프터 슬라이더 =====
  document.querySelectorAll('.ba-compare').forEach((wrap) => {
    const range = wrap.querySelector('input[type=range]')
    const afterImg = wrap.querySelector('.ba-after')
    const divider = wrap.querySelector('.ba-divider')
    if (range && afterImg) {
      range.addEventListener('input', () => {
        afterImg.style.clipPath = 'inset(0 0 0 ' + range.value + '%)'
        if (divider) divider.style.left = range.value + '%'
      })
    }
  })
})
