// 검단퍼스트치과 — 2026.5 SUPER 인터랙션
document.addEventListener('DOMContentLoaded', () => {
  const noMotionQ = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const canHoverQ = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  // ===== 커튼 인트로 (세션당 1회) =====
  const curtain = document.getElementById('curtain')
  if (curtain) {
    if (sessionStorage.getItem('curtainDone') || noMotionQ) {
      curtain.classList.add('off')
    } else {
      sessionStorage.setItem('curtainDone', '1')
      setTimeout(() => curtain.classList.add('done'), 750)
      setTimeout(() => curtain.classList.add('off'), 1750)
    }
  }

  // ===== 히어로 per-char 스플릿 =====
  document.querySelectorAll('[data-split]').forEach((el) => {
    const base = parseFloat(el.dataset.splitDelay || 0)
    const text = el.textContent
    el.textContent = ''
    el.setAttribute('aria-label', text)
    const mask = document.createElement('span')
    mask.className = 'line-mask'
    mask.setAttribute('aria-hidden', 'true')
    Array.from(text).forEach((ch, i) => {
      const s = document.createElement('span')
      s.className = 'char'
      s.style.setProperty('--cd', (base + i * 0.035) + 's')
      s.textContent = ch === ' ' ? '\u00A0' : ch
      mask.appendChild(s)
    })
    el.appendChild(mask)
  })

  // ===== 스크롤 프로그레스 바 =====
  const progress = document.getElementById('scroll-progress')
  if (progress) {
    let pRaf = null
    const updateProgress = () => {
      pRaf = null
      const h = document.documentElement.scrollHeight - window.innerHeight
      progress.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')'
    }
    window.addEventListener('scroll', () => { if (!pRaf) pRaf = requestAnimationFrame(updateProgress) }, { passive: true })
    updateProgress()
  }

  // ===== 커스텀 커서 (lerp 추적) =====
  const dot = document.getElementById('cursor-dot')
  const ring = document.getElementById('cursor-ring')
  if (dot && ring && canHoverQ && !noMotionQ) {
    document.documentElement.classList.add('has-cursor')
    let mx = -100, my = -100, rx = -100, ry = -100
    document.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY }, { passive: true })
    const loop = () => {
      rx += (mx - rx) * 0.16
      ry += (my - ry) * 0.16
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)'
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)'
      requestAnimationFrame(loop)
    }
    loop()
    document.addEventListener('pointerover', (e) => {
      ring.classList.toggle('cursor-hover', !!e.target.closest('a, button, input, [data-tilt], .bento'))
    }, { passive: true })
  }

  // ===== 마그네틱 버튼 =====
  if (canHoverQ && !noMotionQ) {
    document.querySelectorAll('.btn-3d, #logo, #mobile-menu-btn').forEach((el) => {
      el.classList.add('magnetic-el')
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect()
        el.style.translate = ((e.clientX - r.left - r.width / 2) * 0.22) + 'px ' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px'
      })
      el.addEventListener('pointerleave', () => { el.style.translate = '0px 0px' })
    })
  }
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

  // ===== 3D 틸트 카드 (마우스 따라 기울기 + 글레어 + 스포트라이트) =====
  const canHover = canHoverQ
  const noMotion = noMotionQ
  if (canHover && !noMotion) {
    document.querySelectorAll('.bento, [data-tilt]').forEach((card) => {
      card.classList.add('tilt-3d', 'spotlight')
      const glare = document.createElement('span')
      glare.className = 'tilt-glare'
      glare.setAttribute('aria-hidden', 'true')
      card.appendChild(glare)
      let raf = null
      card.addEventListener('pointermove', (e) => {
        if (raf) return
        raf = requestAnimationFrame(() => {
          raf = null
          const r = card.getBoundingClientRect()
          const px = (e.clientX - r.left) / r.width
          const py = (e.clientY - r.top) / r.height
          const max = parseFloat(card.dataset.tiltMax || 10)
          card.style.transform = `perspective(850px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateY(-6px) scale(1.02)`
          glare.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,.3), transparent 58%)`
          glare.style.opacity = '1'
          card.style.setProperty('--mx', (px * 100) + '%')
          card.style.setProperty('--my', (py * 100) + '%')
        })
      })
      card.addEventListener('pointerleave', () => {
        card.style.transform = ''
        glare.style.opacity = '0'
      })
    })
  }

  // ===== 스크롤 패럴랙스 ([data-parallax="0.2"]) =====
  const pxEls = document.querySelectorAll('[data-parallax]')
  if (pxEls.length && !noMotion) {
    const onScroll = () => {
      const vh = window.innerHeight
      pxEls.forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.bottom < 0 || r.top > vh) return
        const speed = parseFloat(el.dataset.parallax || 0.2)
        el.style.transform = `translateY(${(r.top + r.height / 2 - vh / 2) * -speed}px)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  }

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
