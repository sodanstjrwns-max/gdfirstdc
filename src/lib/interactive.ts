// 진료과목별 인터랙티브 위젯 — SVG 모식도 + 자가체크/슬라이더/탐색기
// 동작 JS: /static/treatment.js · 의료광고법 고려: 효과 보장 배제, 모식도·개인차 고지
// 색: ink #0a1628 / navy #12365a / blue #1d5486 / silver #b7c1cf / cream #faf7f0

const DISCLAIMER = `<p class="mt-5 text-[11.5px] text-ink/35 flex items-start gap-1.5"><i class="fas fa-circle-info mt-0.5" aria-hidden="true"></i>이해를 돕기 위한 모식도입니다. 실제 진단과 치료 계획은 내원 검진 후 결정되며, 개인차가 있습니다.</p>`

function shell(id: string, kicker: string, title: string, sub: string, inner: string): string {
  return `
<!-- 인터랙티브: ${id} -->
<section id="${id}" class="max-w-5xl mx-auto px-5 pt-14">
  <div class="reveal rounded-3xl bg-white border border-ink/8 shadow-xl shadow-ink/5 overflow-hidden">
    <header class="px-7 sm:px-9 pt-7 sm:pt-9">
      <p class="text-gold-600 text-xs font-bold tracking-[0.3em] uppercase"><i class="fas fa-hand-pointer mr-1.5" aria-hidden="true"></i>${kicker}</p>
      <h2 class="mt-2 text-xl sm:text-2xl font-extrabold text-ink tracking-tight">${title}</h2>
      <p class="mt-1.5 text-[13px] text-ink/45">${sub}</p>
    </header>
    <div class="px-7 sm:px-9 pb-7 sm:pb-9 pt-5">${inner}${DISCLAIMER}</div>
  </div>
</section>`
}

// 공용: 스테퍼 버튼
function stepBtn(i: number, label: string, sub?: string): string {
  return `<button type="button" data-step="${i}" class="istep text-left rounded-2xl border border-ink/10 bg-cream px-4.5 px-5 py-3.5 transition hover:border-ink/30 w-full">
    <span class="block font-extrabold text-[14px] text-ink tracking-tight">${label}</span>
    ${sub ? `<span class="istep-sub block mt-0.5 text-[11.5px] text-ink/40 leading-snug">${sub}</span>` : ''}
  </button>`
}

/* ============ 1. 임플란트 — 구조 탐색기 ============ */
function implantWidget(): string {
  const parts = [
    { name: '크라운 (보철물)', desc: '눈에 보이는 치아 부분. 3D 구강스캐너로 정밀 본을 떠 자연치아의 색·모양에 맞춰 제작합니다. 보건복지부 인증 우수보철의사가 직접 디자인을 확인합니다.' },
    { name: '지대주 (어버트먼트)', desc: '크라운과 인공치근을 연결하는 기둥입니다. 잇몸 형태에 맞는 맞춤 지대주를 사용하면 음식물 끼임과 잇몸 염증을 줄이는 데 도움이 됩니다.' },
    { name: '픽스처 (인공치근)', desc: '잇몸뼈에 심는 티타늄 나사로, 임플란트의 뿌리 역할을 합니다. 뼈와 단단히 붙는 골유착 기간(하악 2~3개월·상악 3~5개월)을 거쳐 평생 치아의 기초가 됩니다.' },
    { name: '치조골 (잇몸뼈)', desc: '임플란트를 지탱하는 토대입니다. 뼈가 부족한 경우 뼈이식·상악동거상술을 병행하며, 디지털 CT로 골질·골량·신경관 위치를 3차원으로 분석한 뒤 계획합니다.' },
  ]
  return shell('implant-explorer', 'Interactive · 구조 탐색기', '임플란트, 눌러보며 이해하기', '각 부위를 선택하면 어떤 역할을 하는지 확인할 수 있습니다.', `
  <div class="grid md:grid-cols-2 gap-7 items-center" data-stepper="2">
    <div class="relative mx-auto w-full max-w-[300px]">
      <svg viewBox="0 0 300 360" class="w-full h-auto" role="img" aria-label="임플란트 구조 모식도 — 크라운, 지대주, 픽스처, 치조골">
        <!-- 치조골 -->
        <path data-hl="3" d="M20 190 Q20 172 45 170 L255 170 Q280 172 280 190 L280 340 Q280 356 262 356 L38 356 Q20 356 20 340 Z" fill="#ece3d0" stroke="#d8cbb2" stroke-width="2"/>
        <circle cx="60" cy="240" r="5" fill="#ddd0b8"/><circle cx="90" cy="300" r="4" fill="#ddd0b8"/><circle cx="235" cy="260" r="5" fill="#ddd0b8"/><circle cx="215" cy="320" r="4" fill="#ddd0b8"/><circle cx="70" cy="330" r="3.5" fill="#ddd0b8"/><circle cx="245" cy="205" r="3.5" fill="#ddd0b8"/>
        <!-- 잇몸 -->
        <path d="M20 178 Q75 148 118 156 L124 168 Q150 158 176 168 L182 156 Q225 148 280 178 L280 208 L20 208 Z" fill="#e59a90" stroke="#d3837a" stroke-width="2"/>
        <!-- 픽스처(나사) -->
        <g data-hl="2">
          <path d="M132 196 L168 196 L164 320 Q160 336 150 336 Q140 336 136 320 Z" fill="#9fb0c4" stroke="#5c6b82" stroke-width="2.5"/>
          <line x1="133" y1="216" x2="167" y2="222" stroke="#5c6b82" stroke-width="3"/>
          <line x1="134" y1="238" x2="166" y2="244" stroke="#5c6b82" stroke-width="3"/>
          <line x1="135" y1="260" x2="165" y2="266" stroke="#5c6b82" stroke-width="3"/>
          <line x1="137" y1="282" x2="163" y2="288" stroke="#5c6b82" stroke-width="3"/>
          <line x1="139" y1="303" x2="161" y2="308" stroke="#5c6b82" stroke-width="3"/>
        </g>
        <!-- 지대주 -->
        <path data-hl="1" d="M138 158 L162 158 L166 198 L134 198 Z" fill="#c8d2de" stroke="#5c6b82" stroke-width="2.5"/>
        <!-- 크라운 -->
        <path data-hl="0" d="M112 96 Q112 62 150 62 Q188 62 188 96 Q188 122 178 140 Q170 156 164 162 L136 162 Q130 156 122 140 Q112 122 112 96 Z" fill="#f6f1e6" stroke="#c9bfa8" stroke-width="2.5"/>
        <path d="M132 84 Q140 74 152 76" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/>
      </svg>
      <!-- 핫스팟 -->
      <button type="button" data-step="0" class="hotspot absolute left-[68%] top-[22%] w-8 h-8 rounded-full bg-royal text-white text-[11px] font-extrabold border-2 border-white shadow-lg" aria-label="크라운 보기">1</button>
      <button type="button" data-step="1" class="hotspot absolute left-[68%] top-[46%] w-8 h-8 rounded-full bg-royal text-white text-[11px] font-extrabold border-2 border-white shadow-lg" style="animation-delay:.3s" aria-label="지대주 보기">2</button>
      <button type="button" data-step="2" class="hotspot absolute left-[68%] top-[70%] w-8 h-8 rounded-full bg-royal text-white text-[11px] font-extrabold border-2 border-white shadow-lg" style="animation-delay:.6s" aria-label="픽스처 보기">3</button>
      <button type="button" data-step="3" class="hotspot absolute left-[10%] top-[80%] w-8 h-8 rounded-full bg-royal text-white text-[11px] font-extrabold border-2 border-white shadow-lg" style="animation-delay:.9s" aria-label="치조골 보기">4</button>
    </div>
    <div class="space-y-2.5">
      ${parts.map((p, i) => `
      <div>
        ${stepBtn(i, `${i + 1}. ${p.name}`)}
        <div data-pane="${i}" class="mt-2 rounded-2xl bg-ink text-white/75 text-[13px] leading-[1.8] px-5 py-4">${p.desc}</div>
      </div>`).join('')}
    </div>
  </div>`)
}

/* ============ 2. 블룸네이트 — 미소 밝기 미리보기 + 삭제량 비교 ============ */
function luminateWidget(): string {
  return shell('luminate-sim', 'Interactive · 미소 미리보기', '슬라이더로 밝아지는 미소를 미리 느껴보세요', '실제 진료에서는 RAY 페이스스캐너와 3D 프린터로 약 25분 만에 "나의 새 미소"를 눈으로 직접 확인합니다.', `
  <div class="grid md:grid-cols-2 gap-8">
    <!-- 밝기 시뮬레이터 -->
    <div data-lum class="rounded-3xl bg-cream border border-ink/6 p-6">
      <svg viewBox="0 0 320 170" class="w-full h-auto" role="img" aria-label="미소 밝기 시뮬레이션 모식도">
        <path d="M18 52 Q160 -14 302 52 Q276 142 160 152 Q44 142 18 52 Z" fill="#d3837a"/>
        <path d="M34 58 Q160 6 286 58 Q262 128 160 136 Q58 128 34 58 Z" fill="#8c2f3b"/>
        <g stroke="#c9bfa8" stroke-width="1.5">
          <rect class="lum-tooth" x="128" y="46" width="30" height="52" rx="9" fill="#e5d7b4"/>
          <rect class="lum-tooth" x="162" y="46" width="30" height="52" rx="9" fill="#e5d7b4"/>
          <rect class="lum-tooth" x="98" y="50" width="26" height="44" rx="8" fill="#e5d7b4"/>
          <rect class="lum-tooth" x="196" y="50" width="26" height="44" rx="8" fill="#e5d7b4"/>
          <rect class="lum-tooth" x="72" y="54" width="22" height="36" rx="7" fill="#e5d7b4"/>
          <rect class="lum-tooth" x="226" y="54" width="22" height="36" rx="7" fill="#e5d7b4"/>
        </g>
      </svg>
      <div class="mt-4 flex items-center gap-4">
        <i class="fas fa-moon text-ink/30" aria-hidden="true"></i>
        <input type="range" min="0" max="100" value="15" class="irange flex-1" aria-label="치아 밝기 조절">
        <i class="fas fa-sun text-gold-600" aria-hidden="true"></i>
      </div>
      <p class="mt-3 text-center text-[13px] font-bold text-ink">현재 톤: <span data-out class="text-royal">A3</span></p>
      <p class="mt-1 text-center text-[11px] text-ink/35">색상은 화면상 연출이며 실제 결과와 다를 수 있습니다</p>
    </div>
    <!-- 삭제량 비교 토글 -->
    <div data-stepper="0" class="rounded-3xl bg-cream border border-ink/6 p-6">
      <div class="grid grid-cols-2 gap-2 mb-4">
        ${stepBtn(0, '무삭제 · 최소삭제', 'BloomNate 방식')}
        ${stepBtn(1, '기존 라미네이트', '일반적 삭제 방식')}
      </div>
      <svg viewBox="0 0 320 190" class="w-full h-auto" role="img" aria-label="치아 삭제량 비교 모식도">
        <path d="M96 178 Q80 120 84 70 Q88 26 160 26 Q232 26 236 70 Q240 120 224 178 Q200 188 160 188 Q120 188 96 178 Z" fill="#f0e9da" stroke="#c9bfa8" stroke-width="2"/>
        <!-- 무삭제: 원본 보존 + 얇은 부착층 -->
        <g data-when="0">
          <path d="M96 178 Q80 120 84 70 Q88 26 160 26 Q232 26 236 70" fill="none" stroke="#0a4fc2" stroke-width="7" stroke-linecap="round" opacity=".85"/>
          <text x="160" y="112" text-anchor="middle" font-size="15" font-weight="800" fill="#12365a">치아 그대로</text>
          <text x="160" y="134" text-anchor="middle" font-size="11" fill="#5c6b82">표면에 0.2~0.3mm 부착</text>
        </g>
        <!-- 기존: 삭제된 영역 표시 -->
        <g data-when="1">
          <path d="M104 60 Q112 40 160 40 Q208 40 216 60 L216 100 L104 100 Z" fill="#d96a6a" opacity=".28"/>
          <path d="M104 40 L216 40" stroke="#d96a6a" stroke-width="3" stroke-dasharray="7 5"/>
          <text x="160" y="112" text-anchor="middle" font-size="15" font-weight="800" fill="#a13d3d">법랑질 삭제</text>
          <text x="160" y="134" text-anchor="middle" font-size="11" fill="#a13d3d">0.5~1.0mm 내외 삭제 후 부착</text>
        </g>
      </svg>
      <div data-pane="0" class="mt-3 rounded-2xl bg-ink text-white/75 text-[12.5px] leading-relaxed px-5 py-3.5">내 치아를 최대한 보존하는 뉴욕대 Non-prep Veneer 방식. 치아 상태에 따라 0.3~0.5mm 최소삭제를 병행할 수 있으며, 삭제량은 시술 전 수치로 안내합니다.</div>
      <div data-pane="1" class="mt-3 rounded-2xl bg-ink text-white/75 text-[12.5px] leading-relaxed px-5 py-3.5">기존 방식은 치아 두께 확보를 위해 법랑질을 상대적으로 많이 삭제합니다. 한 번 삭제한 치아는 되돌릴 수 없어, 저희는 보존을 우선합니다.</div>
    </div>
  </div>`)
}

/* ============ 3. 턱관절 — 자가진단 + 디스크 위치 비교 ============ */
function tmjWidget(): string {
  const quiz = [
    '입을 벌릴 때 턱에서 "딱" 소리가 난다',
    '아침에 일어나면 턱이 뻐근하거나 무겁다',
    '입이 손가락 세 개(세로) 이상 벌어지지 않는다',
    '음식을 씹을 때 귀 앞쪽이 아프다',
    '두통·목·어깨 결림이 잦다',
    '무의식중에 이를 악물거나, 자면서 이를 간다는 말을 들었다',
    '하품할 때 턱이 빠질 것 같은 느낌이 든 적 있다',
  ]
  return shell('tmj-check', 'Interactive · 자가 체크 & 디스크 모식도', '내 턱관절, 30초 자가 체크', '해당하는 항목을 모두 눌러보세요. 결과에 따라 검진 필요 여부를 안내해 드립니다.', `
  <div class="grid md:grid-cols-2 gap-8">
    <!-- 퀴즈 -->
    <div data-selfcheck data-t0="항목을 눌러 체크해 보세요." data-t1="1~2개 해당 — 초기 신호일 수 있습니다. 증상이 2주 이상 지속되면 검진을 권해드립니다." data-t3="3개 이상 해당 — 턱관절 장애가 진행 중일 수 있습니다. 정확한 진단을 받아보시길 권합니다.">
      <ul class="space-y-2">
        ${quiz.map((q) => `
        <li class="sc-item flex items-start gap-3 rounded-2xl bg-cream border border-ink/6 px-4 py-3" role="checkbox" aria-checked="false" tabindex="0">
          <span class="sc-box mt-0.5 w-5 h-5 rounded-md bg-white border border-ink/15 text-transparent flex items-center justify-center shrink-0 text-[10px]"><i class="fas fa-check"></i></span>
          <span class="sc-txt text-[13.5px] text-ink/75 font-medium leading-snug">${q}</span>
        </li>`).join('')}
      </ul>
      <div class="mt-4 rounded-2xl bg-ink text-white px-5 py-4 flex items-center gap-4">
        <span class="w-12 h-12 rounded-2xl bg-gold-500 text-ink font-extrabold text-lg flex items-center justify-center shrink-0"><span data-sc-count>0</span></span>
        <p data-sc-msg class="text-[13px] text-white/80 leading-snug"></p>
      </div>
    </div>
    <!-- 디스크 위치 비교 -->
    <div data-stepper="0" class="rounded-3xl bg-cream border border-ink/6 p-6">
      <div class="grid grid-cols-2 gap-2 mb-4">
        ${stepBtn(0, '정상 턱관절', '디스크가 제자리에')}
        ${stepBtn(1, '디스크 전방변위', '"딱" 소리의 원인')}
      </div>
      <svg viewBox="0 0 320 200" class="w-full h-auto" role="img" aria-label="턱관절 디스크 위치 비교 모식도">
        <!-- 측두골(관절와) -->
        <path d="M40 30 L280 30 L280 58 Q240 58 210 84 Q196 96 184 90 Q170 82 178 66 Q186 48 160 44 L40 44 Z" fill="#ece3d0" stroke="#d8cbb2" stroke-width="2"/>
        <text x="56" y="26" font-size="11" fill="#5c6b82" font-weight="700">측두골 (머리뼈)</text>
        <!-- 하악 과두 -->
        <ellipse cx="196" cy="128" rx="34" ry="30" fill="#e5d9c2" stroke="#c9bfa8" stroke-width="2.5"/>
        <path d="M176 152 Q160 186 108 190 L96 172 Q150 168 170 140 Z" fill="#e5d9c2" stroke="#c9bfa8" stroke-width="2.5"/>
        <text x="228" y="166" font-size="11" fill="#5c6b82" font-weight="700">하악 과두 (턱뼈)</text>
        <!-- 디스크: 정상(위) / 전방변위(앞으로 밀림) -->
        <g data-when="0"><path d="M168 96 Q196 84 226 98 Q224 110 196 106 Q170 110 168 96 Z" fill="#0a4fc2" opacity=".85"/><text x="248" y="94" font-size="11" fill="#0a4fc2" font-weight="800">디스크 ✓</text></g>
        <g data-when="1"><path d="M120 104 Q148 92 176 104 Q174 118 148 113 Q124 118 120 104 Z" fill="#d96a6a"/><text x="88" y="92" font-size="11" fill="#a13d3d" font-weight="800">디스크가 앞으로!</text><path d="M196 92 Q180 84 166 96" stroke="#a13d3d" stroke-width="2" fill="none" stroke-dasharray="4 3" marker-end="none"/></g>
      </svg>
      <div data-pane="0" class="mt-3 rounded-2xl bg-ink text-white/75 text-[12.5px] leading-relaxed px-5 py-3.5">디스크(관절원판)가 턱뼈와 머리뼈 사이에서 쿠션 역할을 합니다. 입을 벌리고 다물 때 소리 없이 부드럽게 움직입니다.</div>
      <div data-pane="1" class="mt-3 rounded-2xl bg-ink text-white/75 text-[12.5px] leading-relaxed px-5 py-3.5">디스크가 앞으로 밀려나면 턱을 벌릴 때 "딱" 소리가 나거나 걸리는 느낌이 듭니다. 진행되면 통증·개구제한이 올 수 있어, 정확한 진단 후 스플린트·체외충격파 등으로 치료합니다.</div>
    </div>
  </div>`)
}

/* ============ 4. 심미보철·미백 — 쉐이드 가이드 ============ */
function aestheticWidget(): string {
  const shades = [
    { code: 'B1', color: '#fbf8ef', label: '밝은 톤' },
    { code: 'A1', color: '#f5efdd', label: '' },
    { code: 'A2', color: '#efe4c8', label: '자연스러운 톤' },
    { code: 'A3', color: '#e8d8b2', label: '한국인 평균대' },
    { code: 'A3.5', color: '#ddc79a', label: '' },
    { code: 'C2', color: '#cdbd96', label: '회갈색 톤' },
  ]
  return shell('shade-guide', 'Interactive · 쉐이드 가이드', '지금 내 치아 톤은 어디쯤일까요?', '거울을 보며 가장 비슷한 톤을 골라보세요. 목표 톤까지의 여정을 안내해 드립니다.', `
  <div data-shadepick>
    <div class="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
      ${shades.map((s, i) => `
      <button type="button" data-sh="${i}" class="rounded-2xl border border-ink/10 bg-white p-2.5 transition hover:-translate-y-0.5" aria-label="쉐이드 ${s.code} 선택">
        <svg viewBox="0 0 60 72" class="w-full h-auto"><path d="M14 66 Q8 38 10 22 Q12 6 30 6 Q48 6 50 22 Q52 38 46 66 Q38 72 30 72 Q22 72 14 66 Z" fill="${s.color}" stroke="#c9bfa8" stroke-width="1.5"/></svg>
        <span class="block mt-1.5 text-[12px] font-extrabold text-ink">${s.code}</span>
        ${s.label ? `<span class="block text-[9.5px] text-ink/35 leading-tight">${s.label}</span>` : '<span class="block text-[9.5px] text-transparent leading-tight">.</span>'}
      </button>`).join('')}
    </div>
    <div data-sh-out class="mt-5 rounded-2xl bg-ink text-white/80 text-[13.5px] leading-relaxed px-6 py-5">위에서 내 치아와 가장 비슷한 톤을 선택해 보세요.</div>
  </div>`)
}

/* ============ 5. 신경치료 — 치아 단면 레이어 탐색 ============ */
function endoWidget(): string {
  const layers = [
    { name: '법랑질 (에나멜)', desc: '몸에서 가장 단단한 조직으로 치아의 갑옷입니다. 신경이 없어 초기 충치는 통증이 없습니다 — 그래서 정기검진과 Q-ray 형광검사가 중요합니다.' },
    { name: '상아질', desc: '법랑질 안쪽의 조직으로, 미세한 관을 통해 자극이 신경으로 전달됩니다. 충치가 여기까지 오면 차거나 단 것에 시리기 시작합니다.' },
    { name: '치수 (신경·혈관)', desc: '치아의 생명줄. 세균이 치수까지 침범하면 극심한 통증이 오고, 이때 신경치료(근관치료)가 필요합니다. 자연치아를 살리는 마지막 기회입니다.' },
    { name: '근관 (신경관)', desc: '머리카락보다 가는 통로가 치아 뿌리 속에 복잡하게 뻗어 있습니다. 저희는 ZEISS 독일 미세현미경 확대 시야로 숨은 근관까지 찾아 치료하고, 플라즈마 엔도로 살균을 더합니다.' },
  ]
  return shell('endo-explorer', 'Interactive · 치아 단면 탐색', '신경치료가 왜 필요한지, 치아 속을 들여다보세요', '각 층을 선택하면 역할과 치료 시점을 확인할 수 있습니다.', `
  <div class="grid md:grid-cols-2 gap-7 items-center" data-stepper="2">
    <div class="relative mx-auto w-full max-w-[280px]">
      <svg viewBox="0 0 280 360" class="w-full h-auto" role="img" aria-label="치아 단면 모식도 — 법랑질, 상아질, 치수, 근관">
        <!-- 잇몸/뼈 배경 -->
        <path d="M10 200 Q10 186 30 184 L250 184 Q270 186 270 200 L270 344 Q270 358 254 358 L26 358 Q10 358 10 344 Z" fill="#ece3d0"/>
        <path d="M10 190 Q70 168 108 176 L140 186 L172 176 Q210 168 270 190 L270 218 L10 218 Z" fill="#e59a90"/>
        <!-- 법랑질(바깥) -->
        <path data-hl="0" d="M62 96 Q62 30 140 30 Q218 30 218 96 Q218 140 202 168 Q192 186 184 192 L96 192 Q88 186 78 168 Q62 140 62 96 Z" fill="#f6f1e6" stroke="#c9bfa8" stroke-width="3"/>
        <!-- 상아질 -->
        <path data-hl="1" d="M84 100 Q84 52 140 52 Q196 52 196 100 Q196 138 184 162 Q176 178 170 184 L110 184 Q104 178 96 162 Q84 138 84 100 Z" fill="#ecdfc0" stroke="#d8c9a4" stroke-width="2"/>
        <!-- 치수 -->
        <path data-hl="2" d="M112 108 Q112 78 140 78 Q168 78 168 108 Q168 136 158 154 L122 154 Q112 136 112 108 Z" fill="#d96a6a" stroke="#b95050" stroke-width="2"/>
        <!-- 뿌리 + 근관 -->
        <path d="M96 192 Q92 250 84 316 Q82 336 96 336 Q108 336 112 316 L124 218 L140 210 L156 218 L168 316 Q172 336 184 336 Q198 336 196 316 Q188 250 184 192 Z" fill="#ecdfc0" stroke="#d8c9a4" stroke-width="2.5"/>
        <g data-hl="3">
          <path d="M122 158 L100 318" stroke="#d96a6a" stroke-width="7" stroke-linecap="round" fill="none"/>
          <path d="M158 158 L180 318" stroke="#d96a6a" stroke-width="7" stroke-linecap="round" fill="none"/>
        </g>
      </svg>
      <button type="button" data-step="0" class="hotspot absolute left-[75%] top-[12%] w-8 h-8 rounded-full bg-royal text-white text-[11px] font-extrabold border-2 border-white shadow-lg" aria-label="법랑질 보기">1</button>
      <button type="button" data-step="1" class="hotspot absolute left-[70%] top-[30%] w-8 h-8 rounded-full bg-royal text-white text-[11px] font-extrabold border-2 border-white shadow-lg" style="animation-delay:.3s" aria-label="상아질 보기">2</button>
      <button type="button" data-step="2" class="hotspot absolute left-[42%] top-[26%] w-8 h-8 rounded-full bg-royal text-white text-[11px] font-extrabold border-2 border-white shadow-lg" style="animation-delay:.6s" aria-label="치수 보기">3</button>
      <button type="button" data-step="3" class="hotspot absolute left-[58%] top-[74%] w-8 h-8 rounded-full bg-royal text-white text-[11px] font-extrabold border-2 border-white shadow-lg" style="animation-delay:.9s" aria-label="근관 보기">4</button>
    </div>
    <div class="space-y-2.5">
      ${layers.map((p, i) => `
      <div>
        ${stepBtn(i, `${i + 1}. ${p.name}`)}
        <div data-pane="${i}" class="mt-2 rounded-2xl bg-ink text-white/75 text-[13px] leading-[1.8] px-5 py-4">${p.desc}</div>
      </div>`).join('')}
    </div>
  </div>`)
}

/* ============ 6. 충치 — 진행 단계 슬라이더 (C1~C4) ============ */
function cavityWidget(): string {
  return shell('cavity-stages', 'Interactive · 진행 단계 슬라이더', '충치는 기다려주지 않습니다 — 단계별로 확인해 보세요', '슬라이더를 움직이면 충치의 깊이와 그에 따른 치료 방법이 바뀝니다.', `
  <div class="grid md:grid-cols-2 gap-7 items-center" data-cavity>
    <div class="rounded-3xl bg-cream border border-ink/6 p-6">
      <svg viewBox="0 0 280 300" class="w-full h-auto" role="img" aria-label="충치 진행 단계 모식도">
        <!-- 치아 -->
        <path d="M62 96 Q62 30 140 30 Q218 30 218 96 Q218 150 200 182 Q192 198 184 204 L96 204 Q88 198 80 182 Q62 150 62 96 Z" fill="#f6f1e6" stroke="#c9bfa8" stroke-width="3"/>
        <path d="M84 100 Q84 52 140 52 Q196 52 196 100 Q196 146 182 172 Q175 188 168 194 L112 194 Q105 188 98 172 Q84 146 84 100 Z" fill="#ecdfc0"/>
        <path d="M112 112 Q112 82 140 82 Q168 82 168 112 Q168 142 158 162 L122 162 Q112 142 112 112 Z" fill="#e8b8b0"/>
        <!-- 충치 단계별 침식 -->
        <ellipse data-cv="1" cx="140" cy="42" rx="26" ry="12" fill="#8a6d3b" opacity="0"/>
        <path data-cv="2" d="M116 34 Q140 24 164 34 Q172 52 162 68 Q140 78 118 68 Q108 52 116 34 Z" fill="#6b4f26" opacity="0"/>
        <path data-cv="3" d="M110 32 Q140 20 170 32 Q182 58 170 88 Q158 106 140 104 Q120 104 112 86 Q100 58 110 32 Z" fill="#53381a" opacity="0"/>
        <path data-cv="4" d="M106 30 Q140 16 174 30 Q188 62 176 96 Q166 122 152 138 Q140 148 128 138 Q112 120 104 94 Q94 60 106 30 Z" fill="#3d2711" opacity="0"/>
        <!-- 통증 표시 -->
        <g data-cv-pain opacity="0"><path d="M226 60 L242 44 M234 76 L254 68 M230 92 L250 96" stroke="#d96a6a" stroke-width="4" stroke-linecap="round"/></g>
      </svg>
      <input type="range" min="1" max="4" value="1" step="1" class="irange w-full mt-4" aria-label="충치 진행 단계 선택">
      <div class="flex justify-between text-[11px] font-bold text-ink/40 px-1 mt-1"><span>C1</span><span>C2</span><span>C3</span><span>C4</span></div>
    </div>
    <div>
      <p class="text-[12px] font-bold text-gold-600 tracking-[0.2em] uppercase">Stage <span data-cv-stage class="text-royal text-base">C1</span></p>
      <h3 data-cv-title class="mt-1.5 text-lg font-extrabold text-ink tracking-tight"></h3>
      <p data-cv-desc class="mt-2.5 text-[13.5px] text-ink/60 leading-[1.85]"></p>
      <div class="mt-4 rounded-2xl bg-ink text-white px-5 py-4">
        <p class="text-[11px] font-bold text-gold-400 tracking-[0.15em] uppercase"><i class="fas fa-tooth mr-1.5" aria-hidden="true"></i>이 단계의 치료</p>
        <p data-cv-tx class="mt-1.5 text-[13.5px] text-white/85 font-semibold leading-snug"></p>
      </div>
    </div>
  </div>`)
}

/* ============ 7. 잇몸 — 치주 단계 스테퍼 ============ */
function gumWidget(): string {
  return shell('gum-stages', 'Interactive · 잇몸 건강 3단계', '잇몸병은 소리 없이 진행됩니다', '단계를 선택하면 잇몸과 잇몸뼈의 변화를 확인할 수 있습니다.', `
  <div class="grid md:grid-cols-2 gap-7 items-center" data-stepper="0">
    <div class="rounded-3xl bg-cream border border-ink/6 p-6">
      <svg viewBox="0 0 320 240" class="w-full h-auto" role="img" aria-label="치주 질환 진행 단계 모식도">
        <!-- 치아 2개 -->
        <g stroke="#c9bfa8" stroke-width="2.5">
          <path d="M76 20 Q76 8 100 8 Q124 8 124 20 L122 120 Q118 200 104 200 Q94 200 90 160 L84 120 Z" fill="#f6f1e6"/>
          <path d="M186 20 Q186 8 210 8 Q234 8 234 20 L232 120 Q228 200 214 200 Q204 200 200 160 L194 120 Z" fill="#f6f1e6"/>
        </g>
        <!-- 뼈: 3단계 높이 -->
        <path data-when="0" d="M0 108 L70 104 Q100 118 130 104 L180 104 Q210 118 240 104 L320 108 L320 240 L0 240 Z" fill="#ece3d0" stroke="#d8cbb2" stroke-width="2"/>
        <path data-when="1" d="M0 116 L70 112 Q100 126 130 112 L180 112 Q210 126 240 112 L320 116 L320 240 L0 240 Z" fill="#ece3d0" stroke="#d8cbb2" stroke-width="2"/>
        <path data-when="2" d="M0 152 L70 146 Q100 160 130 146 L180 146 Q210 160 240 146 L320 152 L320 240 L0 240 Z" fill="#ece3d0" stroke="#d8cbb2" stroke-width="2"/>
        <!-- 잇몸: 3단계 -->
        <path data-when="0" d="M0 96 L64 92 Q100 112 136 92 L174 92 Q210 112 246 92 L320 96 L320 128 L0 128 Z" fill="#f0a29a" stroke="#d3837a" stroke-width="2"/>
        <path data-when="1" d="M0 100 L64 96 Q100 120 136 96 L174 96 Q210 120 246 96 L320 100 L320 132 L0 132 Z" fill="#e0736b" stroke="#c25a52" stroke-width="2"/>
        <path data-when="2" d="M0 128 L64 122 Q100 146 136 122 L174 122 Q210 146 246 122 L320 128 L320 158 L0 158 Z" fill="#c8544c" stroke="#a63d36" stroke-width="2"/>
        <!-- 치석 표시 (2,3단계) -->
        <g data-when="1"><circle cx="88" cy="92" r="6" fill="#d9c460"/><circle cx="238" cy="92" r="6" fill="#d9c460"/></g>
        <g data-when="2"><circle cx="88" cy="96" r="7" fill="#c4a83e"/><circle cx="94" cy="112" r="6" fill="#c4a83e"/><circle cx="236" cy="98" r="7" fill="#c4a83e"/><circle cx="230" cy="114" r="6" fill="#c4a83e"/></g>
      </svg>
    </div>
    <div class="space-y-2.5">
      <div>${stepBtn(0, '건강한 잇몸', '연분홍색 · 단단함')}<div data-pane="0" class="mt-2 rounded-2xl bg-ink text-white/75 text-[13px] leading-[1.8] px-5 py-4">잇몸이 연분홍색이고 칫솔질에도 피가 나지 않습니다. 이 상태를 지키는 가장 확실한 방법이 연 1~2회 스케일링입니다(만 19세 이상 연 1회 건강보험 적용).</div></div>
      <div>${stepBtn(1, '치은염', '잇몸만 붓고 피가 남')}<div data-pane="1" class="mt-2 rounded-2xl bg-ink text-white/75 text-[13px] leading-[1.8] px-5 py-4">치석 속 세균이 잇몸에 염증을 일으킨 단계. 칫솔질할 때 피가 나지만 뼈는 아직 건강합니다. 스케일링만으로 회복 가능한, 되돌릴 수 있는 마지막 단계입니다.</div></div>
      <div>${stepBtn(2, '치주염', '잇몸뼈가 녹기 시작')}<div data-pane="2" class="mt-2 rounded-2xl bg-ink text-white/75 text-[13px] leading-[1.8] px-5 py-4">염증이 잇몸뼈까지 진행된 단계. 한 번 녹은 뼈는 저절로 회복되지 않으며, 치아가 흔들리고 빠질 수 있습니다. 잇몸치료(치근활택술·치주소파술)로 진행을 멈추는 것이 최우선입니다.</div></div>
    </div>
  </div>`)
}

/* ============ 8. 보철 — 크라운/브릿지/틀니 탭 ============ */
function prosthWidget(): string {
  return shell('prosth-tabs', 'Interactive · 보철 선택 가이드', '크라운 · 브릿지 · 틀니, 뭐가 다를까요?', '각 방식을 선택해 구조의 차이를 확인해 보세요.', `
  <div data-stepper="0">
    <div class="grid grid-cols-3 gap-2 mb-5">
      ${stepBtn(0, '크라운', '치아 1개 씌움')}
      ${stepBtn(1, '브릿지', '옆 치아로 다리')}
      ${stepBtn(2, '부분틀니', '끼웠다 뺐다')}
    </div>
    <div class="rounded-3xl bg-cream border border-ink/6 p-6">
      <svg viewBox="0 0 400 180" class="w-full h-auto" role="img" aria-label="크라운, 브릿지, 부분틀니 구조 비교 모식도">
        <!-- 잇몸 라인 -->
        <path d="M0 120 Q200 100 400 120 L400 180 L0 180 Z" fill="#e59a90"/>
        <!-- 기본 치아들 -->
        <g stroke="#c9bfa8" stroke-width="2">
          <path d="M52 52 Q52 40 76 40 Q100 40 100 52 L96 128 L56 128 Z" fill="#f6f1e6"/>
          <path d="M300 52 Q300 40 324 40 Q348 40 348 52 L344 128 L304 128 Z" fill="#f6f1e6"/>
        </g>
        <!-- 크라운: 가운데 치아에 씌움 -->
        <g data-when="0">
          <path d="M176 60 L224 60 L220 128 L180 128 Z" fill="#ecdfc0" stroke="#c9bfa8" stroke-width="2"/>
          <path d="M170 58 Q170 38 200 38 Q230 38 230 58 Q230 66 226 70 L174 70 Q170 66 170 58 Z" fill="#9fb0c4" stroke="#5c6b82" stroke-width="2.5"/>
          <text x="200" y="26" text-anchor="middle" font-size="12" font-weight="800" fill="#12365a">크라운 (씌우기)</text>
        </g>
        <!-- 브릿지 -->
        <g data-when="1">
          <path d="M108 58 Q108 44 132 44 Q156 44 156 58 L152 124 L112 124 Z" fill="#9fb0c4" stroke="#5c6b82" stroke-width="2.5"/>
          <path d="M176 58 Q176 44 200 44 Q224 44 224 58 L220 116 L180 116 Z" fill="#9fb0c4" stroke="#5c6b82" stroke-width="2.5"/>
          <path d="M244 58 Q244 44 268 44 Q292 44 292 58 L288 124 L248 124 Z" fill="#9fb0c4" stroke="#5c6b82" stroke-width="2.5"/>
          <rect x="108" y="44" width="184" height="12" rx="6" fill="#5c6b82"/>
          <text x="200" y="26" text-anchor="middle" font-size="12" font-weight="800" fill="#12365a">브릿지 (양옆 치아 연결)</text>
          <path d="M132 140 L132 128 M268 140 L268 128" stroke="#a13d3d" stroke-width="3" stroke-linecap="round"/>
          <text x="200" y="156" text-anchor="middle" font-size="10.5" fill="#a13d3d" font-weight="700">양옆 치아를 삭제해야 함</text>
        </g>
        <!-- 부분틀니 -->
        <g data-when="2">
          <path d="M156 62 Q156 50 178 50 Q200 50 200 62 L197 120 L160 120 Z" fill="#f0d8d4" stroke="#c98e86" stroke-width="2.5"/>
          <path d="M212 62 Q212 50 234 50 Q256 50 256 62 L253 120 L216 120 Z" fill="#f0d8d4" stroke="#c98e86" stroke-width="2.5"/>
          <path d="M118 70 Q100 60 100 76 M292 70 Q312 60 312 76" stroke="#5c6b82" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M156 66 Q130 60 104 72 M256 66 Q282 60 308 72" stroke="#5c6b82" stroke-width="3.5" fill="none"/>
          <text x="200" y="26" text-anchor="middle" font-size="12" font-weight="800" fill="#12365a">부분틀니 (고리로 고정)</text>
        </g>
      </svg>
      <div data-pane="0" class="mt-4 rounded-2xl bg-ink text-white/75 text-[13px] leading-[1.8] px-5 py-4">신경치료 후나 크게 깨진 치아를 통째로 씌워 보호합니다. 내 치아 뿌리를 그대로 살리는 방법 — 지르코니아·금 등 재료별 특성은 진단 시 안내합니다.</div>
      <div data-pane="1" class="mt-4 rounded-2xl bg-ink text-white/75 text-[13px] leading-[1.8] px-5 py-4">빠진 치아 양옆을 기둥 삼아 다리를 놓습니다. 수술 없이 빠르지만(1~2주) 건강한 옆 치아를 삭제해야 하고, 기둥 치아에 부담이 갑니다. 임플란트와 꼭 비교해 보세요.</div>
      <div data-pane="2" class="mt-4 rounded-2xl bg-ink text-white/75 text-[13px] leading-[1.8] px-5 py-4">여러 개가 빠졌을 때 남은 치아에 고리를 걸어 사용합니다. 만 65세 이상은 건강보험이 적용됩니다(7년 주기). 임플란트 2~4개로 틀니를 고정하는 임플란트 틀니도 좋은 대안입니다.</div>
    </div>
  </div>`)
}

/* ============ 9. 사랑니 — 매복 유형 선택기 ============ */
function wisdomWidget(): string {
  return shell('wisdom-types', 'Interactive · 매복 유형 확인', '내 사랑니는 어떤 모양으로 누워 있을까요?', '유형을 선택하면 발치 난이도와 주의점을 확인할 수 있습니다. 정확한 위치는 CT로 확인합니다.', `
  <div class="grid md:grid-cols-2 gap-7 items-center" data-stepper="0">
    <div class="rounded-3xl bg-cream border border-ink/6 p-6">
      <svg viewBox="0 0 340 220" class="w-full h-auto" role="img" aria-label="사랑니 매복 유형 모식도">
        <!-- 잇몸/뼈 -->
        <path d="M0 96 L340 96 L340 220 L0 220 Z" fill="#ece3d0"/>
        <path d="M0 78 L340 78 L340 110 L0 110 Z" fill="#e59a90"/>
        <!-- 어금니(제2대구치) -->
        <g stroke="#c9bfa8" stroke-width="2.5">
          <path d="M60 34 Q60 20 92 20 Q124 20 124 34 L120 92 L110 92 L106 150 Q104 166 96 166 Q88 166 86 150 L82 92 L64 92 Z" fill="#f6f1e6"/>
        </g>
        <text x="92" y="196" text-anchor="middle" font-size="11" font-weight="700" fill="#5c6b82">어금니</text>
        <!-- 신경관 -->
        <path d="M0 186 Q170 174 340 186" stroke="#d9a545" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>
        <text x="300" y="206" text-anchor="middle" font-size="10" font-weight="700" fill="#b07f22">하치조 신경관</text>
        <!-- 유형 1: 정상 맹출 -->
        <g data-when="0" stroke="#5c6b82" stroke-width="2.5">
          <path d="M180 40 Q180 26 210 26 Q240 26 240 40 L236 94 L226 94 L222 146 Q220 160 210 160 Q200 160 198 146 L194 94 L184 94 Z" fill="#dce4ee"/>
        </g>
        <!-- 유형 2: 경사 매복 -->
        <g data-when="1" stroke="#5c6b82" stroke-width="2.5" transform="rotate(-42 210 120)">
          <path d="M180 66 Q180 52 210 52 Q240 52 240 66 L236 116 L226 116 L222 160 Q220 172 210 172 Q200 172 198 160 L194 116 L184 116 Z" fill="#dce4ee"/>
        </g>
        <!-- 유형 3: 수평 매복 -->
        <g data-when="2" stroke="#5c6b82" stroke-width="2.5" transform="rotate(-84 214 130)">
          <path d="M184 78 Q184 64 214 64 Q244 64 244 78 L240 126 L230 126 L226 166 Q224 178 214 178 Q204 178 202 166 L198 126 L188 126 Z" fill="#dce4ee"/>
        </g>
      </svg>
    </div>
    <div class="space-y-2.5">
      <div>${stepBtn(0, '정상 맹출', '똑바로 나온 사랑니')}<div data-pane="0" class="mt-2 rounded-2xl bg-ink text-white/75 text-[13px] leading-[1.8] px-5 py-4">위아래가 잘 맞물리고 칫솔질이 잘 된다면 뽑지 않고 쓸 수도 있습니다. 다만 위치상 관리가 어려워 충치·잇몸염증이 반복되면 발치를 권합니다 — 발치 여부부터 정직하게 말씀드립니다.</div></div>
      <div>${stepBtn(1, '경사 매복', '어금니 쪽으로 기울어짐')}<div data-pane="1" class="mt-2 rounded-2xl bg-ink text-white/75 text-[13px] leading-[1.8] px-5 py-4">앞 어금니를 밀며 비스듬히 난 유형. 어금니와 사랑니 사이에 음식물이 끼어 둘 다 충치가 생기기 쉽습니다. 소중한 어금니를 지키기 위해 발치를 권하는 대표적인 경우입니다.</div></div>
      <div>${stepBtn(2, '수평 매복', '잇몸뼈 속에 누워 있음')}<div data-pane="2" class="mt-2 rounded-2xl bg-ink text-white/75 text-[13px] leading-[1.8] px-5 py-4">뼈 속에 완전히 누워 있는 고난도 유형. 아래턱 신경관과의 거리가 관건이라, 저희는 디지털 CT로 신경 위치를 3차원으로 확인한 뒤 안전하게 계획합니다. 필요시 대학병원 연계도 정직하게 안내합니다.</div></div>
    </div>
  </div>`)
}

/* ============ 10. 보톡스 — 경과 타임라인 슬라이더 ============ */
function botoxWidget(): string {
  return shell('botox-timeline', 'Interactive · 경과 타임라인', '턱 보톡스, 시간에 따라 어떻게 달라질까요?', '슬라이더를 움직여 시술 후 경과를 확인해 보세요. 경과와 지속 기간에는 개인차가 있습니다.', `
  <div class="grid md:grid-cols-2 gap-7 items-center" data-botox>
    <div class="rounded-3xl bg-cream border border-ink/6 p-6">
      <svg viewBox="0 0 280 300" class="w-full h-auto" role="img" aria-label="턱 보톡스 경과 모식도 — 교근 변화">
        <!-- 얼굴 윤곽 -->
        <path d="M70 40 Q70 10 140 10 Q210 10 210 40 L212 120 Q212 170 190 210 Q168 250 140 258 Q112 250 90 210 Q68 170 68 120 Z" fill="#f5e3d3" stroke="#e0c4ac" stroke-width="2.5"/>
        <!-- 교근 (변화 대상) -->
        <ellipse data-bx-muscle cx="94" cy="196" rx="26" ry="34" fill="#d96a6a" opacity=".55"/>
        <ellipse data-bx-muscle2 cx="186" cy="196" rx="26" ry="34" fill="#d96a6a" opacity=".55"/>
        <!-- 이목구비 힌트 -->
        <path d="M108 108 Q120 100 132 108 M148 108 Q160 100 172 108" stroke="#b08d72" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M140 128 L136 152 Q140 158 148 154" stroke="#d8b79c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M118 214 Q140 224 162 214" stroke="#c98e86" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <text x="42" y="196" font-size="11" font-weight="700" fill="#a13d3d">교근</text>
      </svg>
      <input type="range" min="0" max="4" value="0" step="1" class="irange w-full mt-4" aria-label="시술 후 경과 시점 선택">
      <div class="flex justify-between text-[10.5px] font-bold text-ink/40 px-1 mt-1"><span>시술일</span><span>2주</span><span>1개월</span><span>3개월</span><span>6개월</span></div>
    </div>
    <div>
      <p class="text-[12px] font-bold text-gold-600 tracking-[0.2em] uppercase">Timeline · <span data-bx-when class="text-royal">시술 직후</span></p>
      <h3 data-bx-title class="mt-1.5 text-lg font-extrabold text-ink tracking-tight"></h3>
      <p data-bx-desc class="mt-2.5 text-[13.5px] text-ink/60 leading-[1.85]"></p>
      <div class="mt-4 rounded-2xl bg-cream border border-ink/6 px-5 py-4">
        <p class="text-[11px] font-bold text-ink/40 tracking-[0.15em] uppercase">진행률 (통상적 경과)</p>
        <div class="mt-2 h-2.5 rounded-full bg-ink/8 overflow-hidden"><div data-bx-bar class="h-full rounded-full bg-royal transition-all duration-500" style="width:5%"></div></div>
      </div>
    </div>
  </div>`)
}

export function interactiveSection(slug: string): string {
  switch (slug) {
    case 'implant': return implantWidget()
    case 'bloomnate': return luminateWidget()
    case 'tmj': return tmjWidget()
    case 'aesthetic': return aestheticWidget()
    case 'endo': return endoWidget()
    case 'cavity': return cavityWidget()
    case 'gum': return gumWidget()
    case 'prosthetics': return prosthWidget()
    case 'wisdom': return wisdomWidget()
    case 'botox': return botoxWidget()
    default: return ''
  }
}
