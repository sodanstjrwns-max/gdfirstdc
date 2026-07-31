// 진료과목 인터랙티브 위젯 동작 — 검단퍼스트치과
(function () {
  'use strict';

  /* ---------- 1. 공용 스테퍼 (버튼 → 패널/SVG 전환) ---------- */
  document.querySelectorAll('[data-stepper]').forEach(function (root) {
    var btns = root.querySelectorAll('[data-step]');
    var panes = root.querySelectorAll('[data-pane]');
    var whens = root.querySelectorAll('[data-when]');
    var hls = root.querySelectorAll('[data-hl]');

    function activate(i) {
      btns.forEach(function (b) {
        var on = b.getAttribute('data-step') === String(i);
        b.classList.toggle('istep-on', on && b.classList.contains('istep'));
        if (b.classList.contains('hotspot')) b.classList.toggle('hotspot-on', on);
      });
      panes.forEach(function (p) { p.style.display = p.getAttribute('data-pane') === String(i) ? '' : 'none'; });
      whens.forEach(function (w) { w.style.opacity = w.getAttribute('data-when') === String(i) ? '1' : '0'; w.style.transition = 'opacity .35s'; });
      hls.forEach(function (h) { h.classList.toggle('svg-hl', h.getAttribute('data-hl') === String(i)); });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { activate(b.getAttribute('data-step')); });
    });
    activate(root.getAttribute('data-stepper') || '0');
    root.classList.add('iw-ready');
  });

  /* ---------- 2. 자가 체크 (턱관절 퀴즈 + 공용 체크리스트) ---------- */
  document.querySelectorAll('[data-selfcheck]').forEach(function (root) {
    var items = root.querySelectorAll('.sc-item');
    var countEl = root.querySelector('[data-sc-count]');
    var msgEl = root.querySelector('[data-sc-msg]');
    var t0 = root.getAttribute('data-t0') || '항목을 눌러 체크해 보세요.';
    var t1 = root.getAttribute('data-t1') || '';
    var t3 = root.getAttribute('data-t3') || '';

    function update() {
      var n = root.querySelectorAll('.sc-item.sc-on').length;
      if (countEl) countEl.textContent = n;
      if (msgEl) msgEl.textContent = n === 0 ? t0 : (n >= 3 ? t3 : t1);
    }
    items.forEach(function (it) {
      function toggle() {
        it.classList.toggle('sc-on');
        it.setAttribute('aria-checked', it.classList.contains('sc-on') ? 'true' : 'false');
        update();
      }
      it.addEventListener('click', toggle);
      it.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
    });
    update();
  });

  /* ---------- 3. 루미네이트 밝기 슬라이더 ---------- */
  document.querySelectorAll('[data-lum]').forEach(function (root) {
    var range = root.querySelector('input[type=range]');
    var teeth = root.querySelectorAll('.lum-tooth');
    var out = root.querySelector('[data-out]');
    if (!range) return;
    var stops = [
      { p: 0, c: '#e0cfa4', label: 'A3.5' },
      { p: 25, c: '#e5d7b4', label: 'A3' },
      { p: 50, c: '#eee3c6', label: 'A2' },
      { p: 75, c: '#f5eedb', label: 'A1' },
      { p: 100, c: '#fbf9f1', label: 'B1' },
    ];
    function render() {
      var v = Number(range.value);
      var s = stops[0];
      for (var i = 0; i < stops.length; i++) if (v >= stops[i].p - 12) s = stops[i];
      teeth.forEach(function (t) { t.style.transition = 'fill .3s'; t.setAttribute('fill', s.c); });
      if (out) out.textContent = s.label;
    }
    range.addEventListener('input', render);
    render();
  });

  /* ---------- 4. 쉐이드 가이드 ---------- */
  document.querySelectorAll('[data-shadepick]').forEach(function (root) {
    var out = root.querySelector('[data-sh-out]');
    var msgs = [
      '<strong class="text-white">B1 — 이미 밝은 톤입니다.</strong> 지금의 밝기를 유지하는 관리(정기 스케일링, 착색 음식 후 물양치)가 더 중요합니다.',
      '<strong class="text-white">A1 — 밝고 건강한 톤입니다.</strong> 한 단계 더 원하신다면 자가미백으로도 충분한 경우가 많습니다.',
      '<strong class="text-white">A2 — 자연스러운 톤입니다.</strong> 전문가 미백으로 1~2단계 개선을 기대할 수 있습니다. 목표 톤은 상담에서 함께 정합니다.',
      '<strong class="text-white">A3 — 한국인 평균대입니다.</strong> 전문가 미백의 효과가 가장 잘 체감되는 구간입니다. 시림이 걱정되면 저농도 프로그램도 있습니다.',
      '<strong class="text-white">A3.5 — 다소 어두운 톤입니다.</strong> 원인(착색·연령·신경 문제)에 따라 방법이 달라 정확한 진단이 먼저입니다.',
      '<strong class="text-white">C2 — 회갈색 계열입니다.</strong> 일반 미백만으로 한계가 있을 수 있어, 미백+라미네이트 조합 등 맞춤 플랜을 안내합니다.',
    ];
    root.querySelectorAll('[data-sh]').forEach(function (b) {
      b.addEventListener('click', function () {
        root.querySelectorAll('[data-sh]').forEach(function (x) { x.classList.remove('sh-on'); });
        b.classList.add('sh-on');
        if (out) out.innerHTML = msgs[Number(b.getAttribute('data-sh'))] + ' <span class="block mt-1.5 text-[11px] text-white/40">※ 화면 색상 기준의 참고용이며, 실제 쉐이드는 진료실에서 측정합니다.</span>';
      });
    });
  });

  /* ---------- 5. 충치 단계 슬라이더 ---------- */
  document.querySelectorAll('[data-cavity]').forEach(function (root) {
    var range = root.querySelector('input[type=range]');
    if (!range) return;
    var stages = [
      { s: 'C1', t: '법랑질 초기 충치', d: '치아 표면(법랑질)에만 생긴 충치. 신경이 없는 층이라 통증이 전혀 없습니다 — Q-ray 형광검사로 이런 숨은 충치를 찾아냅니다.', tx: '레진 충전 (당일 치료, 치아색 재료)' },
      { s: 'C2', t: '상아질 충치', d: '충치가 상아질까지 진행되어 차거나 단 음식에 시리기 시작합니다. 이 단계에서 치료하면 신경을 지킬 수 있습니다.', tx: '레진 또는 인레이 (범위에 따라)' },
      { s: 'C3', t: '신경 근접·침범', d: '찬물에 오래 시리고, 가만히 있어도 욱신거리기 시작합니다. 세균이 신경(치수)까지 도달한 상태입니다.', tx: '신경치료 + 크라운 (미세현미경 정밀 근관치료)' },
      { s: 'C4', t: '치아 붕괴·뿌리 감염', d: '치아 머리가 무너지고 뿌리 끝에 염증(고름주머니)이 생길 수 있습니다. 발치가 필요할 수 있는 마지막 단계입니다.', tx: '신경치료 가능성 평가 → 불가 시 발치 후 임플란트' },
    ];
    var st = root.querySelector('[data-cv-stage]'), ti = root.querySelector('[data-cv-title]'), de = root.querySelector('[data-cv-desc]'), tx = root.querySelector('[data-cv-tx]');
    var pain = root.querySelector('[data-cv-pain]');
    function render() {
      var v = Number(range.value);
      for (var i = 1; i <= 4; i++) {
        var el = root.querySelector('[data-cv="' + i + '"]');
        if (el) { el.style.transition = 'opacity .4s'; el.style.opacity = i <= v ? '1' : '0'; }
      }
      if (pain) { pain.style.transition = 'opacity .4s'; pain.style.opacity = v >= 3 ? '1' : '0'; }
      var s = stages[v - 1];
      if (st) st.textContent = s.s;
      if (ti) ti.textContent = s.t;
      if (de) de.textContent = s.d;
      if (tx) tx.textContent = s.tx;
    }
    range.addEventListener('input', render);
    render();
  });

  /* ---------- 6. 보톡스 타임라인 ---------- */
  document.querySelectorAll('[data-botox]').forEach(function (root) {
    var range = root.querySelector('input[type=range]');
    if (!range) return;
    var steps = [
      { w: '시술 직후', t: '5~10분, 마취 없이 간단하게', d: '교근(깨물근) 몇 곳에 소량 주사합니다. 시술 당일 세안·일상생활이 가능하며, 주사 부위를 세게 문지르는 것만 피하면 됩니다.', pct: 5, scale: 1 },
      { w: '2주 차', t: '악물기 힘이 서서히 줄어듭니다', d: '보통 1~2주부터 이를 악무는 힘이 줄어드는 것을 느낍니다. 이갈이·이악물기로 인한 아침 턱 뻐근함이 줄어드는 시기입니다.', pct: 35, scale: 0.9 },
      { w: '1개월 차', t: '변화가 본격적으로 나타나는 시기', d: '과하게 발달했던 교근의 부피가 서서히 줄기 시작합니다. 통상 1~3개월에 걸쳐 변화가 진행됩니다.', pct: 60, scale: 0.78 },
      { w: '3개월 차', t: '통상적인 최대 변화 시점', d: '교근 축소 변화가 가장 잘 나타나는 시기입니다. 결과와 정도는 근육량·생활습관에 따라 개인차가 있습니다.', pct: 90, scale: 0.66 },
      { w: '6개월 차', t: '유지 관리 상담 시점', d: '효과는 통상 4~6개월 유지되며 이후 서서히 원래 상태로 돌아갑니다. 지속을 원하시면 재시술 주기를 상담에서 안내합니다.', pct: 100, scale: 0.74 },
    ];
    var whenEl = root.querySelector('[data-bx-when]'), ti = root.querySelector('[data-bx-title]'), de = root.querySelector('[data-bx-desc]'), bar = root.querySelector('[data-bx-bar]');
    var m1 = root.querySelector('[data-bx-muscle]'), m2 = root.querySelector('[data-bx-muscle2]');
    function render() {
      var s = steps[Number(range.value)];
      if (whenEl) whenEl.textContent = s.w;
      if (ti) ti.textContent = s.t;
      if (de) de.textContent = s.d;
      if (bar) bar.style.width = s.pct + '%';
      [m1, m2].forEach(function (m) {
        if (!m) return;
        m.style.transition = 'all .5s';
        m.setAttribute('rx', 26 * s.scale);
        m.setAttribute('ry', 34 * s.scale);
        m.style.opacity = 0.25 + 0.3 * s.scale;
      });
    }
    range.addEventListener('input', render);
    render();
  });
})();
