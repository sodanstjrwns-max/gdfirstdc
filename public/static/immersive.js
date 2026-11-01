/* 검단퍼스트치과 메인 스크롤 몰입 연출 (GSAP ScrollTrigger + Lenis) — '정밀 초점' 테마
   - 현미경 초점이 맞듯: 흐림→선명, 살짝 큰 배율→제자리. 단단하고 짧은 감속(power4)
   - 글자는 모두 HTML에 그대로 두고 움직임만 더한다(크롤러·AEO 영향 없음)
   - 동작 줄이기 사용자는 아무것도 하지 않는다. 관성 스크롤은 마우스·트랙패드에서만
   - 기존 커튼·히어로 글자 분할·커서·틸트·카운트업은 그대로, .reveal/.reveal-scale/[data-stagger] 는 넘겨받는다 */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.gsap || !window.ScrollTrigger || !document.getElementById('hero-section')) return;
  gsap.registerPlugin(ScrollTrigger);
  // app.js 는 DOMContentLoaded 에서 IntersectionObserver 를 붙인다 — 같은 이벤트 뒤에 이어서 클래스를 넘겨받는다
  function boot() { start(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 0); }); else boot();

  function start() {
  var root = document.documentElement;
  root.classList.add('mx');
  var mobile = matchMedia('(max-width: 767px)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var EASE = 'power4.out';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return gsap.utils.toArray((c || document).querySelectorAll(s)); };

  // 1) 관성 스크롤 — 마우스·트랙패드만(터치는 기본 스크롤)
  if (fine && window.Lenis) {
    var lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -90 });
    });
  }

  // 화면에 들어오면 한 번 재생 — 빠르게 지나쳐도 onEnter 가 불려 끝 상태를 보장한다
  var TIMING = ['duration', 'ease', 'stagger', 'delay'];
  function enter(targets, vars, trigger, start) {
    var list = gsap.utils.toArray(targets);
    if (!list.length) return;
    var from = {}, to = { opacity: 1, x: 0, y: 0, yPercent: 0, rotate: 0, rotateX: 0, scale: 1, paused: true,
      onStart: function () { gsap.set(list, { transition: 'none' }); },
      onComplete: function () { gsap.set(list, { clearProps: 'opacity,transform,transition,filter,clipPath' }); } };
    Object.keys(vars).forEach(function (k) { (TIMING.indexOf(k) > -1 ? to : from)[k] = vars[k]; });
    if ('filter' in from) to.filter = 'blur(0px)';
    if ('clipPath' in from) to.clipPath = vars.clipTo || 'inset(0% 0% 0% 0%)';
    delete from.clipTo;
    var tw = gsap.fromTo(list, from, to);
    ScrollTrigger.create({ trigger: trigger || list[0], start: start || 'top 88%', once: true, onEnter: function () {
      tw.play();
      setTimeout(function () { if (tw.progress() < 1) tw.progress(1); }, (tw.totalDuration() + 0.6) * 1000);
    } });
  }
  var claimed = [];
  function claim(list) { gsap.utils.toArray(list).forEach(function (el) { claimed.push(el); }); }
  function isClaimed(el) { return claimed.some(function (c) { return c === el || c.contains(el); }); }
  // 기존 등장 클래스 떼기(같은 틱에 GSAP 시작 상태를 넣으므로 깜빡임 없음). 이미 보인(.in) 블록은 다시 숨기지 않는다
  function release(el) {
    var was = el.classList.contains('in');
    el.classList.remove('reveal', 'reveal-scale');
    if (el.hasAttribute('data-stagger')) {
      was = el.classList.contains('in');
      el.removeAttribute('data-stagger');
      Array.prototype.forEach.call(el.children, function (c) { c.style.transitionDelay = ''; });
    }
    return was;
  }

  // 그라데이션 글씨(background-clip:text) 안을 낱말로 쪼개면 글자가 투명해진다(대구 2026-11-01 사고)
  // → .text-shine/.text-lux 외의 clip:text 요소도 계산된 스타일로 찾아 통째로 한 낱말처럼 움직인다.
  function clipTextHost(node) {
    for (var e = node.parentElement; e; e = e.parentElement) {
      var cs = getComputedStyle(e);
      if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') return e;
    }
    return null;
  }

  // 낱말 감싸기(하위 태그·br 보존). 글자 분할(data-split)·그라데이션 글자는 건드리지 않는다
  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], hosts = [];
    while (walker.nextNode()) {
      var host = clipTextHost(walker.currentNode);
      if (host) { if (hosts.indexOf(host) < 0) hosts.push(host); continue; }
      nodes.push(walker.currentNode);
    }
    // 제목 전체가 그라데이션(또는 그 안)이면 쪼개지 않는다
    if (hosts.some(function (h) { return h === el || h.contains(el); })) return [];
    nodes.forEach(function (node) {
      if (node.parentElement.closest('.text-shine, .text-lux, [data-split]')) return;
      var parts = node.textContent.split(/(\s+)/);
      if (parts.join('').trim() === '') return;
      var frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        var w = document.createElement('span'); w.className = 'mx-w';
        var i = document.createElement('span'); i.className = 'mx-wi'; i.textContent = p;
        w.appendChild(i); frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
    // 그라데이션 글자 덩어리는 통째로 하나의 낱말처럼 움직인다
    $$('.text-shine, .text-lux', el).concat(hosts).forEach(function (s) {
      if (s.parentElement.classList.contains('mx-wi')) return;
      if (s.parentElement.closest('.text-shine, .text-lux')) return; // 그라데이션 안의 그라데이션은 바깥과 함께
      var w = document.createElement('span'); w.className = 'mx-w';
      var i = document.createElement('span'); i.className = 'mx-wi';
      s.parentNode.insertBefore(w, s); w.appendChild(i); i.appendChild(s);
    });
    return $$('.mx-wi', el);
  }

  // ── 히어로: 내려가면 영상은 천천히 다가오고, 글은 먼저 떠오르며 흐려진다(깊이)
  var hero = $('#hero-section');
  var vid = $('video', hero);
  if (vid) { claim(vid); gsap.fromTo(vid, { scale: 1 }, { scale: 1.16, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } }); }
  var heroInner = $('#hero-section > .relative.max-w-6xl');
  if (heroInner) gsap.fromTo(heroInner, { y: 0, opacity: 1 }, { y: mobile ? -40 : -120, opacity: 0.2, ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

  // ── 띠: 스크롤 속도만큼 비스듬히 기울었다가 바로 선다
  var band = $('#hero-section .marquee');
  if (band) {
    var skewTo = gsap.quickTo(band, 'skewX', { duration: 0.45, ease: 'power4' });
    ScrollTrigger.create({ trigger: band, start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) { skewTo(gsap.utils.clamp(-7, 7, self.getVelocity() / -260)); },
      onLeave: function () { skewTo(0); }, onLeaveBack: function () { skewTo(0); } });
  }

  // ── 모든 섹션 제목: 낱말이 마스크 아래에서 짧고 단단하게 올라온다
  $$('main section h2').forEach(function (h) {
    if (h.closest('#hero-section, #home-faq')) return;
    var parentCard = h.closest('.reveal, .reveal-scale');
    if (h.classList.contains('reveal')) release(h);
    if (parentCard && parentCard !== h) return;   // 카드 속 제목은 카드와 함께
    claim(h);
    enter(splitWords(h), { yPercent: 105, duration: 0.95, ease: EASE, stagger: 0.045 }, h, 'top 88%');
  });

  // ── 숫자 4칸: 현미경 초점이 맞듯 큰 배율·흐림에서 선명하게
  var stats = $('#stats-section [data-stagger]');
  if (stats) {
    var statsShown = release(stats);
    claim(stats);
    if (!statsShown) {
      enter(stats.children, { y: 30, opacity: 0, duration: 0.9, ease: EASE, stagger: 0.09 }, stats, 'top 88%');
      enter($$('.stat-num', stats), { scale: 1.35, filter: 'blur(10px)', opacity: 0, transformOrigin: '0% 100%', duration: 1.1, ease: EASE, stagger: 0.09, delay: 0.1 }, stats, 'top 88%');
    }
  }

  // ── 한눈에 보기: 검은 큰 카드가 가장자리부터 열리며 다가오고, 정보 칩이 하나씩
  var sum = $('#clinic-summary > div');
  if (sum) {
    var sumShown = release(sum);
    claim(sum);
    if (!sumShown) enter(sum, { clipPath: mobile ? 'inset(4% 4% 4% 4% round 40px)' : 'inset(10% 8% 10% 8% round 64px)', clipTo: 'inset(0% 0% 0% 0% round 32px)', duration: 1.3, ease: 'expo.out' }, sum, 'top 85%');
    var chips = $$('.flex > *', sum);
    enter(chips, { y: 16, scale: 0.9, opacity: 0, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.07, delay: 0.35 }, sum, 'top 85%');
  }

  // ── 시그니처 진료 3장: 초점 맞추기 — 흐림·작게에서 차례로 또렷하게
  var bentos = $$('#core-treatments .bento');
  if (bentos.length) {
    bentos.forEach(release); claim(bentos);
    enter(bentos, { y: 50, scale: 0.94, filter: 'blur(8px)', opacity: 0, duration: 1.05, ease: EASE, stagger: 0.12 }, bentos[0], 'top 88%');
  }
  // 그 밖의 진료 7칸: 왼쪽부터 톡톡 튀어나온다
  var others = $('#core-treatments [data-stagger]');
  if (others) {
    var othersShown = release(others); claim(others);
    if (!othersShown) enter(others.children, { y: 24, scale: 0.8, opacity: 0, duration: 0.7, ease: 'back.out(1.8)', stagger: 0.05 }, others, 'top 92%');
  }

  // ── 검단 진료 카드 6장: 차례로 오르며 사진은 카드 안에서 천천히 줌아웃
  var gcards = $$('#geomdan-cards li');
  if (gcards.length) {
    claim(gcards);
    enter(gcards, { y: mobile ? 36 : 70, opacity: 0, duration: 1, ease: EASE, stagger: 0.08 }, gcards[0], 'top 88%');
    gcards.forEach(function (li) {
      var box = $('.aspect-square', li), img = $('img', li);
      if (!box || !img) return;
      gsap.fromTo(box, { '--mx-z': 1.18 }, { '--mx-z': 1, ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom 40%', scrub: true } });
      box.classList.add('mx-zoom');
    });
  }

  // ── 원장: 글은 차례로, 사진은 카드 안에서 초점이 맞듯 줌아웃
  var dIntro = $('#doctor-intro');
  if (dIntro) {
    var dCopy = $$('.reveal', dIntro);
    dCopy.forEach(release); claim(dCopy);
    enter(dCopy, { y: 26, opacity: 0, duration: 0.9, ease: EASE, stagger: 0.08 }, dCopy[0], 'top 86%');
    var dCard = $('.reveal-scale', dIntro);
    if (dCard) {
      var dShown = release(dCard); claim(dCard);
      if (!dShown) enter(dCard, { y: 60, scale: 0.94, opacity: 0, duration: 1.2, ease: EASE }, dCard, 'top 86%');
      var portrait = $('img', dCard);
      if (portrait) {
        portrait.parentElement.classList.add('mx-zoom');
        gsap.fromTo(portrait.parentElement, { '--mx-z': 1.22 }, { '--mx-z': 1, ease: 'none', scrollTrigger: { trigger: dCard, start: 'top bottom', end: 'center 45%', scrub: true } });
      }
    }
  }

  // ── 방송·연구 두 장: 왼쪽·오른쪽에서 맞물리며 초점
  var media = $$('#media-section .bento');
  if (media.length) {
    media.forEach(release); claim(media);
    media.forEach(function (m, i) {
      enter(m, { x: mobile ? 0 : (i ? 70 : -70), y: mobile ? 40 : 0, filter: 'blur(6px)', opacity: 0, duration: 1.15, ease: EASE, delay: mobile ? 0 : i * 0.08 }, media[0], 'top 85%');
    });
  }

  // ── 장비 9종: 카드가 위쪽 경첩으로 차례로 젖혀 내려온다(정밀 장비 목록을 한 장씩 넘기듯)
  var eq = $('#equipment-section [data-stagger]');
  if (eq) {
    var eqShown = release(eq); claim(eq);
    gsap.set(eq, { perspective: 1100 });
    if (!eqShown) enter(eq.children, { rotateX: mobile ? 0 : -70, y: mobile ? 30 : 10, opacity: 0, transformOrigin: '50% 0%', duration: 1, ease: EASE, stagger: { each: 0.07, grid: 'auto', from: 'start' } }, eq, 'top 86%');
  }

  // ── 원내 사진 4장: 셔터가 아래에서 위로 열린다
  var gal = $('#gallery-strip [data-stagger]');
  if (gal) {
    var galShown = release(gal); claim(gal);
    var figs = Array.prototype.slice.call(gal.children);
    figs.forEach(release);
    if (!galShown) enter(figs, { clipPath: 'inset(100% 0% 0% 0% round 24px)', clipTo: 'inset(0% 0% 0% 0% round 24px)', duration: 1.1, ease: 'expo.out', stagger: 0.1 }, gal, 'top 88%');
  }

  // ── 자주 묻는 질문: 질문 줄이 차례로
  var faqs = $$('#home-faq details');
  if (faqs.length) { claim(faqs); enter(faqs, { y: 24, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.06 }, faqs[0], 'top 92%'); }
  var faqHead = $$('#home-faq > p:first-child, #home-faq > h2');
  if (faqHead.length) { claim(faqHead); enter(faqHead, { y: 20, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.08 }, faqHead[0], 'top 92%'); }

  // ── 예약·진료시간: 두 카드가 양쪽에서, 시간표 점선이 왼쪽부터 그어진다
  var visit = $$('#visit-info .reveal-scale');
  if (visit.length) {
    visit.forEach(function (v, i) {
      var shown = release(v); claim(v);
      if (!shown) enter(v, { x: mobile ? 0 : (i ? 50 : -50), y: mobile ? 40 : 0, opacity: 0, duration: 1.1, ease: EASE }, visit[0], 'top 88%');
    });
    enter($$('#visit-info .tick-line'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.9, ease: 'power3.out', stagger: 0.06, delay: 0.3 }, visit[0], 'top 88%');
  }

  // ── 나머지(.reveal/.reveal-scale/[data-stagger]) — 같은 모양으로 넘겨받는다
  $$('main .reveal, main .reveal-scale').forEach(function (el) {
    if (el.closest('#hero-section') || isClaimed(el)) return;
    var scaleIn = el.classList.contains('reveal-scale');
    if (release(el)) return;
    enter(el, scaleIn ? { scale: 0.94, opacity: 0, duration: 0.8, ease: 'expo.out' } : { y: 28, opacity: 0, duration: 0.8, ease: 'expo.out' }, el, 'top 90%');
  });
  $$('main [data-stagger]').forEach(function (g) {
    if (isClaimed(g)) return;
    if (release(g)) return;
    enter(g.children, { y: 24, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.07 }, g, 'top 90%');
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();
