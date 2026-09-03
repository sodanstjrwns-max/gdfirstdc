// 콘텐츠 허브 — AI 증상체크(규칙 기반) / 치과아빠 TV(유튜브) / 치과 백과사전
import { Hono } from 'hono'
import { layout, esc, pageHero } from '../lib/layout'
import { CLINIC } from '../data/clinic'
import { TREATMENTS, getTreatment } from '../data/treatments'
import { SYMPTOM_GROUPS } from '../data/symptoms'
import { ENCY_CATEGORIES, getReleasedEncyclopedia, encyTomorrowCount, ENCY_PER_DAY, getReleasedEncyTerm, encyReleaseDate } from '../data/encyclopedia'
import type { AppEnv } from '../types'

const hub = new Hono<AppEnv>()

const YT_CHANNEL_ID = 'UCyV995OcYtvSJqqz24ydRmA'
// RSS/스크래핑 모두 실패 시 최후 폴백 (채널 초기 영상)
const YT_FALLBACK = [{ id: 'diToLde5Jtk', title: '치과아빠의 첫번째 이야기' }]

// ============ 콘텐츠 허브 랜딩 ============
hub.get('/content', (c) => {
  const cards = [
    { href: '/symptom-check', icon: 'fa-wand-magic-sparkles', badge: 'AI Check', title: 'AI 증상체크', desc: '증상을 선택하면 알맞은 진료과목과 실제 치료사례를 바로 안내해 드립니다.', cta: '증상 체크 시작' },
    { href: '/tv', icon: 'fa-circle-play', badge: 'YouTube', title: '치과아빠 TV', desc: '김희수 원장이 유튜브 「치과아빠」에서 전하는 솔직한 치아 이야기.', cta: '영상 보러가기' },
    { href: '/encyclopedia', icon: 'fa-book-open', badge: 'Dictionary', title: '치과 백과사전', desc: '임플란트부터 신경치료까지 — 어려운 치과 용어를 쉽게 풀었습니다.', cta: '용어 찾아보기' },
    { href: '/blog', icon: 'fa-pen-nib', badge: 'Column', title: '건강칼럼', desc: '원장이 직접 쓰는 치아 건강 정보와 치료 상식.', cta: '칼럼 읽기' },
  ]
  const body = `
${pageHero('Contents', '알수록 지키기 쉬운<br><span class="font-disp text-shine">치아 건강</span>', '검단퍼스트치과가 직접 만드는 치아 건강 콘텐츠입니다.')}
<section id="content-hub" class="max-w-6xl mx-auto px-5 py-14">
  <div class="grid sm:grid-cols-2 gap-5" data-stagger>
    ${cards.map((k) => `
    <a href="${k.href}" class="bento group block rounded-3xl bg-white border border-ink/8 p-8 relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-gold-400/10 blur-2xl" aria-hidden="true"></div>
      <span class="inline-flex items-center gap-2 text-[10.5px] font-extrabold tracking-[0.2em] uppercase text-gold-600 bg-gold-500/10 rounded-full px-3 py-1.5">${k.badge}</span>
      <div class="mt-5 flex items-start gap-4">
        <span class="shrink-0 w-14 h-14 rounded-2xl bg-ink text-gold-400 flex items-center justify-center text-xl"><i class="fas ${k.icon}"></i></span>
        <div>
          <h2 class="text-xl font-extrabold text-ink tracking-tight">${k.title}</h2>
          <p class="mt-2 text-[13.5px] text-ink/50 leading-relaxed">${k.desc}</p>
        </div>
      </div>
      <p class="mt-6 text-[13px] font-extrabold text-ink group-hover:text-gold-600 transition">${k.cta} <i class="fas fa-arrow-right ml-1 text-[11px] group-hover:translate-x-1 transition-transform inline-block"></i></p>
    </a>`).join('')}
  </div>
</section>`
  return c.html(layout({ title: '콘텐츠 — AI 증상체크·치과아빠 TV·백과사전', desc: '검단퍼스트치과 콘텐츠 허브 — AI 증상체크, 유튜브 치과아빠, 치과 백과사전, 건강칼럼까지 치아 건강 정보를 한곳에서 만나보세요.', path: '/content' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ AI 증상체크 ============
hub.get('/symptom-check', (c) => {
  const body = `
${pageHero('AI Symptom Check', '어디가<br><span class="font-disp text-shine">불편하신가요?</span>', '해당하는 증상을 모두 선택해 주세요. 알맞은 진료 방향과 실제 치료사례를 안내해 드립니다.')}
<section id="symptom-check-app" class="max-w-3xl mx-auto px-5 py-12">
  <form id="sc-form" class="space-y-8">
    ${SYMPTOM_GROUPS.map((g, gi) => `
    <fieldset class="rounded-3xl bg-white border border-ink/8 p-6 sm:p-8">
      <legend class="sr-only">${g.title}</legend>
      <p class="text-[11px] font-extrabold tracking-[0.25em] uppercase text-gold-600 mb-1">Step 0${gi + 1}</p>
      <h2 class="text-lg font-extrabold text-ink tracking-tight mb-5">${g.title}</h2>
      <div class="grid sm:grid-cols-2 gap-2.5">
        ${g.items.map((it) => `
        <label class="sc-item group flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3.5 cursor-pointer transition hover:border-ink/30 has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white">
          <input type="checkbox" class="sr-only" data-weights='${JSON.stringify(it.weights)}'>
          <span class="shrink-0 w-9 h-9 rounded-xl bg-ink/5 group-has-[:checked]:bg-gold-500/20 text-ink/40 group-has-[:checked]:text-gold-400 flex items-center justify-center text-sm transition"><i class="fas ${it.icon}"></i></span>
          <span class="text-[13.5px] font-semibold leading-snug">${it.label}</span>
        </label>`).join('')}
      </div>
    </fieldset>`).join('')}
    <button type="submit" id="sc-submit" class="btn-3d w-full py-5 rounded-full bg-ink text-white font-extrabold text-[15px] tracking-wide hover:bg-navy-800 transition flex items-center justify-center gap-2.5">
      <i class="fas fa-wand-magic-sparkles text-gold-400"></i>결과 확인하기 <span id="sc-count" class="hidden min-w-[24px] h-6 px-1.5 rounded-full bg-gold-500 text-ink text-[12px] font-black items-center justify-center"></span>
    </button>
  </form>

  <div id="sc-result" class="hidden mt-10 scroll-mt-28"></div>

  <p class="mt-10 text-[11.5px] text-ink/35 bg-white border border-ink/8 rounded-2xl p-5 leading-relaxed"><i class="fas fa-circle-info mr-1.5"></i>본 증상체크는 진료 방향을 안내하기 위한 참고 자료이며, 의학적 진단을 대신하지 않습니다. 정확한 진단은 내원 검진을 통해 받으실 수 있습니다.</p>
</section>

<script>
(function(){
  var T = ${JSON.stringify(TREATMENTS.map((t) => ({ slug: t.slug, name: t.name, nameEn: t.nameEn, tagline: t.tagline, icon: t.icon })))};
  var form = document.getElementById('sc-form');
  var result = document.getElementById('sc-result');
  var countEl = document.getElementById('sc-count');
  var boxes = form.querySelectorAll('input[type=checkbox]');

  boxes.forEach(function(b){ b.addEventListener('change', function(){
    var n = form.querySelectorAll('input:checked').length;
    if (n > 0) { countEl.textContent = n; countEl.classList.remove('hidden'); countEl.classList.add('inline-flex'); }
    else { countEl.classList.add('hidden'); countEl.classList.remove('inline-flex'); }
  }); });

  function caseCard(cs){
    return '<a href="/cases/' + cs.id + '" class="group block rounded-2xl bg-white border border-ink/8 overflow-hidden">'
      + '<div class="aspect-[4/3] bg-ink/[0.04] overflow-hidden flex items-center justify-center">'
      + (cs.thumb ? '<img src="' + cs.thumb + '" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">' : '<i class="fas fa-tooth text-3xl text-ink/10"></i>')
      + '</div><p class="p-3.5 text-[12.5px] font-bold text-ink line-clamp-2 leading-snug">' + cs.title + '</p></a>';
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var scores = {};
    var checked = form.querySelectorAll('input:checked');
    if (checked.length === 0) {
      result.innerHTML = '<div class="rounded-3xl bg-white border border-ink/8 p-8 text-center"><p class="text-ink/50 font-semibold">선택된 증상이 없습니다. 해당하는 항목을 눌러 체크해 주세요.</p></div>';
      result.classList.remove('hidden');
      return;
    }
    checked.forEach(function(b){
      var w = JSON.parse(b.getAttribute('data-weights'));
      for (var k in w) scores[k] = (scores[k] || 0) + w[k];
    });
    var ranked = Object.keys(scores).sort(function(a, b){ return scores[b] - scores[a]; }).slice(0, 2);

    var html = '<div class="rounded-3xl bg-ink text-white p-8 sm:p-10 relative overflow-hidden">'
      + '<div class="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gold-500/15 blur-[80px]"></div>'
      + '<p class="relative text-gold-400 text-[11px] font-extrabold tracking-[0.3em] uppercase">Result</p>'
      + '<h2 class="relative mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">선택하신 증상 ' + checked.length + '개를 분석했습니다.</h2>'
      + '<p class="relative mt-3 text-white/50 text-[13.5px] leading-relaxed">아래 진료과목과 관련이 있을 수 있습니다. 정확한 원인은 검진을 통해 확인해 보세요.</p></div>';

    ranked.forEach(function(slug, i){
      var t = T.find(function(x){ return x.slug === slug; });
      if (!t) return;
      html += '<div class="mt-5 rounded-3xl bg-white border border-ink/8 p-7 sm:p-8">'
        + '<div class="flex items-start gap-4">'
        + '<span class="shrink-0 w-14 h-14 rounded-2xl bg-ink text-gold-400 flex items-center justify-center text-xl"><i class="fas ' + t.icon + '"></i></span>'
        + '<div class="min-w-0">'
        + '<p class="text-[10.5px] font-extrabold tracking-[0.2em] uppercase text-gold-600">' + (i === 0 ? 'Best Match' : 'Also Consider') + ' · ' + t.nameEn + '</p>'
        + '<h3 class="mt-1 text-xl font-extrabold text-ink tracking-tight">' + t.name + '</h3>'
        + '<p class="mt-1.5 text-[13px] text-ink/50">' + t.tagline + '</p>'
        + '</div></div>'
        + '<div id="sc-cases-' + slug + '" class="hidden mt-6"><p class="text-[11.5px] font-extrabold tracking-[0.15em] uppercase text-ink/35 mb-3">실제 치료사례</p><div class="grid grid-cols-2 sm:grid-cols-3 gap-3" data-cases></div></div>'
        + '<div class="mt-6 flex flex-wrap gap-2.5">'
        + '<a href="/treatments/' + slug + '" class="px-5 py-3 rounded-full bg-ink text-white text-[13px] font-extrabold hover:bg-navy-800 transition">진료 안내 보기</a>'
        + '<a href="/cases?category=' + slug + '" class="px-5 py-3 rounded-full border border-ink/15 text-ink text-[13px] font-extrabold hover:border-ink transition">치료사례 전체</a>'
        + '</div></div>';
    });

    html += '<div class="mt-5 rounded-3xl bg-gold-500/10 border border-gold-500/25 p-7 sm:p-8 text-center">'
      + '<p class="text-ink font-extrabold text-lg tracking-tight">증상이 계속된다면, 미루지 마세요.</p>'
      + '<p class="mt-1.5 text-[13px] text-ink/50">검진 상담으로 정확한 원인을 확인하실 수 있습니다.</p>'
      + '<div class="mt-5 flex flex-wrap justify-center gap-2.5">'
      + '<a href="/reserve" class="btn-3d px-7 py-3.5 rounded-full bg-ink text-white text-sm font-extrabold hover:bg-navy-800 transition"><i class="fas fa-calendar-check mr-1.5 text-gold-400"></i>예약·상담 신청</a>'
      + '<a href="${CLINIC.naverTalk}" target="_blank" rel="noopener" class="px-7 py-3.5 rounded-full bg-white border border-[#03c75a] text-[#03c75a] text-sm font-extrabold"><i class="fas fa-comment-dots mr-1.5"></i>톡톡 상담</a>'
      + '</div></div>';

    result.innerHTML = html;
    result.classList.remove('hidden');
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });

    ranked.forEach(function(slug){
      fetch('/api/cases-preview?category=' + encodeURIComponent(slug)).then(function(r){ return r.json(); }).then(function(d){
        if (!d.cases || d.cases.length === 0) return;
        var wrap = document.getElementById('sc-cases-' + slug);
        if (!wrap) return;
        wrap.querySelector('[data-cases]').innerHTML = d.cases.map(caseCard).join('');
        wrap.classList.remove('hidden');
      }).catch(function(){});
    });
  });
})();
</script>`
  return c.html(layout({ title: 'AI 증상체크 — 내 증상에 맞는 치과 진료 찾기', desc: '이가 시리거나 잇몸에서 피가 나시나요? 증상을 선택하면 검단퍼스트치과가 알맞은 진료 방향과 실제 치료사례를 안내해 드립니다.', path: '/symptom-check' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 사례 미리보기 API (증상체크 연동) ============
hub.get('/api/cases-preview', async (c) => {
  const cat = c.req.query('category') || ''
  if (!cat || !getTreatment(cat)) return c.json({ cases: [] })
  try {
    const rows = (await c.env.DB.prepare(
      'SELECT id, title, intra_after_key, pano_after_key, intra_before_key, pano_before_key FROM before_after WHERE published = 1 AND category = ? ORDER BY created_at DESC LIMIT 3'
    ).bind(cat).all<{ id: number; title: string; intra_after_key: string | null; pano_after_key: string | null; intra_before_key: string | null; pano_before_key: string | null }>()).results
    return c.json({
      cases: rows.map((r) => {
        const key = r.intra_after_key || r.pano_after_key || r.intra_before_key || r.pano_before_key
        return { id: r.id, title: r.title, thumb: key ? `/images/${key}` : null }
      }),
    })
  } catch {
    return c.json({ cases: [] })
  }
})

// ============ 치과아빠 TV (유튜브 최신 영상) ============
interface YtVideo { id: string; title: string; published?: string }

async function fetchYoutubeVideos(): Promise<YtVideo[]> {
  // 1차: RSS 피드
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; gdfirstdc-site/1.0)' },
      cf: { cacheTtl: 3600, cacheEverything: true },
    } as RequestInit)
    if (res.ok) {
      const xml = await res.text()
      const entries: YtVideo[] = []
      const re = /<entry>[\s\S]*?<yt:videoId>([^<]+)<\/yt:videoId>[\s\S]*?<title>([^<]*)<\/title>[\s\S]*?<published>([^<]+)<\/published>[\s\S]*?<\/entry>/g
      let m: RegExpExecArray | null
      while ((m = re.exec(xml)) && entries.length < 9) {
        entries.push({ id: m[1], title: m[2], published: m[3].slice(0, 10) })
      }
      if (entries.length > 0) return entries
    }
  } catch { /* fall through */ }

  // 2차: 채널 페이지 스크래핑 (videos + shorts)
  try {
    const ids: string[] = []
    for (const path of ['videos', 'shorts']) {
      const res = await fetch(`https://www.youtube.com/@gdfirstdc/${path}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        cf: { cacheTtl: 3600, cacheEverything: true },
      } as RequestInit)
      if (!res.ok) continue
      const html = await res.text()
      const re = /"videoId":"([A-Za-z0-9_-]{11})"/g
      let m: RegExpExecArray | null
      while ((m = re.exec(html))) {
        if (!ids.includes(m[1])) ids.push(m[1])
        if (ids.length >= 9) break
      }
      if (ids.length >= 9) break
    }
    if (ids.length > 0) {
      // oembed로 제목 확보 (최대 6개 병렬)
      const metas = await Promise.all(ids.slice(0, 6).map(async (id) => {
        try {
          const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, { cf: { cacheTtl: 86400, cacheEverything: true } } as RequestInit)
          if (r.ok) { const j = (await r.json()) as { title?: string }; return { id, title: j.title || '치과아빠 영상' } }
        } catch { /* skip */ }
        return { id, title: '치과아빠 영상' }
      }))
      return metas
    }
  } catch { /* fall through */ }

  return YT_FALLBACK
}

hub.get('/tv', async (c) => {
  const videos = await fetchYoutubeVideos()
  const body = `
${pageHero('Dad the Dentist', '유튜브<br><span class="font-disp text-shine">「치과아빠」</span>', '진솔하고 편안하게. 성모병원 전문의 김희수 원장이 전하는 치아 이야기.')}
<section id="tv-videos" class="max-w-6xl mx-auto px-5 py-12">
  <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
    <p class="text-[13.5px] text-ink/45 font-medium"><i class="fab fa-youtube text-[#ff0000] mr-1.5"></i>채널 최신 영상 기준으로 자동 업데이트됩니다.</p>
    <a href="${CLINIC.youtube}?sub_confirmation=1" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ff0000] text-white text-[13px] font-extrabold hover:bg-[#cc0000] transition"><i class="fab fa-youtube"></i>구독하기</a>
  </div>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-stagger>
    ${videos.map((v) => `
    <div class="bento yt-card group rounded-3xl bg-white border border-ink/8 overflow-hidden" data-vid="${esc(v.id)}">
      <button type="button" class="yt-thumb relative block w-full aspect-video bg-ink overflow-hidden" aria-label="${esc(v.title)} 재생">
        <img src="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg" alt="${esc(v.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async">
        <span class="absolute inset-0 flex items-center justify-center"><span class="w-14 h-14 rounded-full bg-ink/70 backdrop-blur text-white flex items-center justify-center text-lg group-hover:bg-[#ff0000] group-hover:scale-110 transition"><i class="fas fa-play ml-0.5"></i></span></span>
      </button>
      <div class="p-5">
        <h2 class="font-extrabold text-ink text-[14.5px] tracking-tight line-clamp-2 leading-snug">${esc(v.title)}</h2>
        ${v.published ? `<p class="mt-2 text-[11.5px] text-ink/35">${v.published.replace(/-/g, '.')}</p>` : ''}
      </div>
    </div>`).join('')}
  </div>
  <div class="mt-12 rounded-3xl bg-ink text-white p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
    <div class="absolute -bottom-14 -right-10 w-52 h-52 rounded-full bg-[#ff0000]/15 blur-[80px]" aria-hidden="true"></div>
    <div class="relative">
      <p class="text-lg sm:text-xl font-extrabold tracking-tight">영상으로 못다 한 이야기는, 진료실에서.</p>
      <p class="mt-1.5 text-[13.5px] text-white/45">궁금한 점은 편하게 상담으로 물어봐 주세요.</p>
    </div>
    <div class="relative flex gap-2.5 shrink-0">
      <a href="/reserve" class="btn-3d px-6 py-3.5 rounded-full bg-gold-500 text-ink text-sm font-extrabold hover:bg-gold-400 transition">예약·상담</a>
      <a href="${CLINIC.youtube}" target="_blank" rel="noopener" class="px-6 py-3.5 rounded-full border border-white/20 text-white text-sm font-extrabold hover:bg-white/10 transition">채널 방문</a>
    </div>
  </div>
</section>
<script>
document.querySelectorAll('.yt-card .yt-thumb').forEach(function(btn){
  btn.addEventListener('click', function(){
    var card = btn.closest('.yt-card');
    var vid = card.getAttribute('data-vid');
    var wrap = document.createElement('div');
    wrap.className = 'relative w-full aspect-video bg-ink';
    wrap.innerHTML = '<iframe class="absolute inset-0 w-full h-full" src="https://www.youtube-nocookie.com/embed/' + vid + '?autoplay=1&rel=0" title="치과아빠 영상" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
    btn.replaceWith(wrap);
  });
});
</script>`
  return c.html(layout({ title: '치과아빠 TV — 김희수 원장 유튜브', desc: '검단퍼스트치과 김희수 원장의 유튜브 채널 「치과아빠」 — 임플란트, 라미네이트, 아이 치아 관리까지 솔직한 치아 이야기를 영상으로 만나보세요.', path: '/tv' }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

// ============ 치과 백과사전 ============
hub.get('/encyclopedia', (c) => {
  const cat = c.req.query('category') || ''
  const released = getReleasedEncyclopedia()
  const tomorrow = encyTomorrowCount()
  const items = cat ? released.filter((e) => e.category === cat) : released
  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: '검단퍼스트치과 치과 백과사전',
    description: '치과 용어와 치료 상식을 쉽게 풀어낸 백과사전',
    hasDefinedTerm: released.slice(0, 30).map((e) => ({ '@type': 'DefinedTerm', name: e.term, description: e.def })),
  }]
  const body = `
${pageHero('Dental Encyclopedia', '치과 용어,<br><span class="font-disp text-shine">쉽게 풀었습니다.</span>', `진료실에서 들었던 그 단어, 여기서 확인하세요. 현재 ${released.length}개 용어가 공개되어 있습니다.`)}
<section id="ency-app" class="max-w-4xl mx-auto px-5 py-12">
  ${tomorrow > 0 ? `<div id="ency-daily-badge" class="mb-6 flex items-center justify-center gap-2 rounded-full bg-ink text-white/90 px-5 py-3 text-[12.5px] font-bold"><i class="fas fa-sparkles text-gold-500"></i>매일 자정, 새 용어 ${ENCY_PER_DAY}개가 자동으로 추가됩니다 — 내일 ${tomorrow}개 공개 예정</div>` : ''}
  <div class="relative mb-6">
    <i class="fas fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-ink/25"></i>
    <input id="ency-search" type="search" placeholder="용어 검색 — 예: 임플란트, 신경치료, 지르코니아" class="w-full rounded-full border border-ink/12 bg-white pl-12 pr-5 py-4 text-[14.5px] font-medium focus:outline-none focus:ring-2 focus:ring-ink/60" autocomplete="off">
  </div>
  <nav id="ency-filter" class="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 mb-6 scrollbar-none">
    <a href="/encyclopedia" class="shrink-0 px-5 py-2.5 rounded-full text-[13px] font-bold transition ${!cat ? 'bg-ink text-white' : 'bg-white border border-ink/10 text-ink/60 hover:border-ink'}">전체</a>
    ${ENCY_CATEGORIES.map((k) => `<a href="/encyclopedia?category=${encodeURIComponent(k)}" class="shrink-0 px-5 py-2.5 rounded-full text-[13px] font-bold transition ${cat === k ? 'bg-ink text-white' : 'bg-white border border-ink/10 text-ink/60 hover:border-ink'}">${k}</a>`).join('')}
  </nav>
  <div id="ency-list" class="space-y-3">
    ${items.map((e) => {
      const t = e.related ? getTreatment(e.related) : null
      return `
    <details class="ency-item group rounded-2xl bg-white border border-ink/8 overflow-hidden" data-term="${esc(e.term)}${e.reading ? ' ' + esc(e.reading) : ''}">
      <summary class="flex items-center gap-4 px-6 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span class="shrink-0 text-[10px] font-extrabold tracking-wide text-gold-600 bg-gold-500/10 rounded-full px-2.5 py-1">${e.category}</span>
        <span class="font-extrabold text-ink text-[15px] tracking-tight">${esc(e.term)}${e.reading ? ` <span class="text-ink/30 font-semibold text-[12px] ml-1">${esc(e.reading)}</span>` : ''}</span>
        <i class="fas fa-chevron-down ml-auto text-ink/25 text-xs group-open:rotate-180 transition-transform"></i>
      </summary>
      <div class="px-6 pb-6 -mt-1">
        <p class="text-[13.5px] text-ink/60 leading-relaxed">${(() => { const fs = e.def.split('. ')[0]; return fs.length < e.def.length ? esc(fs) + '.' : esc(e.def) })()}</p>
        <div class="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <a href="/encyclopedia/${encodeURIComponent(e.term)}" class="inline-flex items-center gap-1.5 text-[12.5px] font-extrabold text-ink hover:text-gold-600 transition"><i class="fas fa-book-open text-gold-500"></i>자세히 보기 <i class="fas fa-arrow-right text-[10px]"></i></a>
          ${t ? `<a href="/treatments/${t.slug}" class="inline-flex items-center gap-1.5 text-[12.5px] font-extrabold text-ink hover:text-gold-600 transition"><i class="fas ${t.icon} text-gold-500"></i>${t.name} 진료 안내 <i class="fas fa-arrow-right text-[10px]"></i></a>` : ''}
        </div>
      </div>
    </details>`
    }).join('')}
  </div>
  <p id="ency-empty" class="hidden text-center py-16 text-ink/40 font-medium">검색 결과가 없습니다.</p>
  <div class="mt-12 rounded-3xl bg-gold-500/10 border border-gold-500/25 p-7 text-center">
    <p class="text-ink font-extrabold tracking-tight">궁금한 용어가 없으신가요?</p>
    <p class="mt-1 text-[13px] text-ink/50">상담 시 편하게 물어봐 주세요. 쉽게 설명해 드립니다.</p>
    <a href="/reserve" class="mt-4 inline-flex px-6 py-3 rounded-full bg-ink text-white text-[13px] font-extrabold hover:bg-navy-800 transition">예약·상담 신청</a>
  </div>
</section>
<script>
(function(){
  var input = document.getElementById('ency-search');
  var items = document.querySelectorAll('.ency-item');
  var empty = document.getElementById('ency-empty');
  input.addEventListener('input', function(){
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    items.forEach(function(el){
      var hit = !q || el.getAttribute('data-term').toLowerCase().indexOf(q) !== -1 || el.textContent.toLowerCase().indexOf(q) !== -1;
      el.style.display = hit ? '' : 'none';
      if (hit) shown++;
    });
    empty.classList.toggle('hidden', shown > 0);
  });
})();
</script>`
  return c.html(layout({ title: '치과 백과사전 — 치과 용어 쉽게 알기', desc: `임플란트, 신경치료, 지르코니아, 턱관절 장애까지 — 검단퍼스트치과가 어려운 치과 용어 ${released.length}개를 환자 눈높이로 쉽게 풀었습니다. 매일 새 용어가 추가됩니다.`, path: '/encyclopedia', jsonLd }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})


// ============ 백과사전 용어 상세 페이지 (용어당 1 URL — SEO/AEO 색인 자산) ============
hub.get('/encyclopedia/:term', (c) => {
  const termParam = decodeURIComponent(c.req.param('term'))
  const found = getReleasedEncyTerm(termParam)
  if (!found) return c.notFound()
  const { item: e, index } = found
  const t = e.related ? getTreatment(e.related) : null
  const released = getReleasedEncyclopedia()
  // 같은 카테고리 관련 용어 (자기 자신 제외, 최대 6개)
  const siblings = released.filter((x) => x.category === e.category && x.term !== e.term).slice(0, 6)
  const releaseDate = encyReleaseDate(index)
  // 정의 첫 문장 = 직답 (AEO)
  const firstSentence = e.def.split('. ')[0] + (e.def.includes('. ') ? '.' : '')
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'DefinedTerm',
      '@id': `${CLINIC.siteUrl}/encyclopedia/${encodeURIComponent(e.term)}`,
      name: e.term,
      ...(e.reading ? { alternateName: e.reading } : {}),
      description: e.def,
      inDefinedTermSet: { '@type': 'DefinedTermSet', name: '검단퍼스트치과 치과 백과사전', url: `${CLINIC.siteUrl}/encyclopedia` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${e.term}${e.reading ? ` (${e.reading})` : ''} — 뜻과 치료 상식`,
      description: firstSentence,
      datePublished: releaseDate,
      dateModified: releaseDate,
      author: { '@type': 'Person', name: '김희수', jobTitle: '대표원장 · 보건복지부 인증 통합치의학 전문의', url: `${CLINIC.siteUrl}/about` },
      publisher: { '@id': `${CLINIC.siteUrl}/#clinic` },
      mainEntityOfPage: `${CLINIC.siteUrl}/encyclopedia/${encodeURIComponent(e.term)}`,
    },
  ]
  const body = `
${pageHero('Dental Encyclopedia', `${esc(e.term)}`, e.reading ? `${esc(e.reading)} — ${e.category}` : e.category)}
<article id="ency-term" class="max-w-3xl mx-auto px-5 py-12">
  <nav class="mb-8 flex items-center gap-2 text-[12.5px] text-ink/40 font-semibold" aria-label="breadcrumb">
    <a href="/encyclopedia" class="hover:text-ink transition">치과 백과사전</a>
    <i class="fas fa-chevron-right text-[9px]"></i>
    <a href="/encyclopedia?category=${encodeURIComponent(e.category)}" class="hover:text-ink transition">${e.category}</a>
    <i class="fas fa-chevron-right text-[9px]"></i>
    <span class="text-ink/70">${esc(e.term)}</span>
  </nav>

  <section id="ency-answer" class="rounded-3xl bg-ink text-white p-7 sm:p-8 mb-8">
    <p class="text-gold-400 text-[11px] font-bold tracking-[0.3em] uppercase mb-3"><i class="fas fa-bolt mr-1"></i>한 줄 정의</p>
    <p class="text-[15.5px] sm:text-[16.5px] leading-[1.85] font-semibold">${firstSentence}</p>
  </section>

  <section id="ency-detail" class="space-y-4">
    ${e.def.split('. ').reduce((acc: string[][], sent: string, i: number) => {
      const gi = Math.floor(i / 3)
      if (!acc[gi]) acc[gi] = []
      acc[gi].push(sent)
      return acc
    }, []).map((g: string[]) => `<p class="text-[14.5px] text-ink/65 leading-[1.95]">${g.join('. ')}${g[g.length - 1].endsWith('.') || g[g.length - 1].endsWith('다') === false ? '' : '.'}</p>`).join('')}
  </section>

  <p class="mt-8 text-[12px] text-ink/35">공개일 ${releaseDate} · 작성 검수: 김희수 대표원장 (보건복지부 인증 통합치의학 전문의)</p>

  ${t ? `
  <aside id="ency-treatment-link" class="mt-10 rounded-3xl border border-gold-500/30 bg-gold-500/8 p-7">
    <p class="text-gold-600 text-[11px] font-bold tracking-[0.25em] uppercase">Related Treatment</p>
    <h2 class="mt-2 text-lg font-extrabold text-ink tracking-tight">${t.name} — 검단퍼스트치과 진료 안내</h2>
    <p class="mt-2 text-[13.5px] text-ink/55 leading-relaxed">${esc(t.tagline)}</p>
    <a href="/treatments/${t.slug}" class="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink text-white text-[13px] font-extrabold hover:bg-navy-800 transition"><i class="fas ${t.icon}"></i>${t.name} 자세히 보기</a>
  </aside>` : ''}

  ${siblings.length ? `
  <section id="ency-related" class="mt-12">
    <h2 class="text-sm font-extrabold text-ink/70 tracking-tight mb-4"><i class="fas fa-link text-gold-500 mr-1.5"></i>함께 보면 좋은 ${e.category} 용어</h2>
    <div class="flex flex-wrap gap-2">
      ${siblings.map((x) => `<a href="/encyclopedia/${encodeURIComponent(x.term)}" class="px-4 py-2.5 rounded-full bg-white border border-ink/10 text-[13px] font-bold text-ink/65 hover:border-ink hover:text-ink transition">${esc(x.term)}</a>`).join('')}
    </div>
  </section>` : ''}

  <div class="mt-12 rounded-3xl bg-gold-500/10 border border-gold-500/25 p-7 text-center">
    <p class="text-ink font-extrabold tracking-tight">${esc(e.term)}에 대해 더 궁금한 점이 있으신가요?</p>
    <p class="mt-1 text-[13px] text-ink/50">원장이 직접 상담해 드립니다. 네이버 톡톡은 진료시간 내 30분 이내 답변드립니다.</p>
    <div class="mt-4 flex flex-wrap justify-center gap-2">
      <a href="/reserve" class="inline-flex px-6 py-3 rounded-full bg-ink text-white text-[13px] font-extrabold hover:bg-navy-800 transition">예약·상담 신청</a>
      <a href="/encyclopedia" class="inline-flex px-6 py-3 rounded-full bg-white border border-ink/12 text-ink text-[13px] font-extrabold hover:border-ink transition">전체 용어 보기</a>
    </div>
  </div>
</article>`
  return c.html(layout({ title: `${e.term} 뜻 — 치과 백과사전`, desc: firstSentence.slice(0, 155), path: `/encyclopedia/${encodeURIComponent(e.term)}`, jsonLd }, body, { user: c.get('user'), admin: c.get('isAdmin') }))
})

export default hub
