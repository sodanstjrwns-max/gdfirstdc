// 검단퍼스트치과 공통 스크립트
document.addEventListener('DOMContentLoaded', () => {
  // 모바일 메뉴
  const btn = document.getElementById('mobile-menu-btn')
  const menu = document.getElementById('mobile-menu')
  if (btn && menu) {
    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden')
      const icon = btn.querySelector('i')
      if (icon) icon.className = menu.classList.contains('hidden') ? 'fas fa-bars' : 'fas fa-times'
    })
  }

  // FAQ 아코디언
  document.querySelectorAll('.faq-item button').forEach((b) => {
    b.addEventListener('click', () => {
      const answer = b.parentElement.querySelector('.faq-answer')
      const icon = b.querySelector('.faq-icon')
      if (answer) {
        answer.classList.toggle('hidden')
        if (icon) icon.classList.toggle('rotate-180')
      }
    })
  })

  // 스크롤 페이드인
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('fade-in-visible'); observer.unobserve(e.target) } }),
    { threshold: 0.08 }
  )
  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el))

  // 비포애프터 슬라이더 (전/후 비교)
  document.querySelectorAll('.ba-compare').forEach((wrap) => {
    const range = wrap.querySelector('input[type=range]')
    const afterImg = wrap.querySelector('.ba-after')
    const divider = wrap.querySelector('.ba-divider')
    if (range && afterImg) {
      range.addEventListener('input', () => {
        afterImg.style.clipPath = `inset(0 0 0 ${range.value}%)`
        if (divider) divider.style.left = range.value + '%'
      })
    }
  })
})
