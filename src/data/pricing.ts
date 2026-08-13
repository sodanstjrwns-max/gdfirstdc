// 검단퍼스트치과 치료비용 수가표 — 원장 제공 엑셀 기준 (의료법 제45조 비급여 진료비용 고지)
export interface PriceItem { name: string; price: number; note?: string }
export interface PriceCategory { key: string; label: string; icon: string; desc: string; insured?: boolean; items: PriceItem[] }

export const PRICING: PriceCategory[] = [
  {
    key: 'insured', label: '보험 항목', icon: 'fa-shield-halved',
    desc: '건강보험이 적용되는 항목입니다. 본인부담금은 보험 기준에 따라 산정됩니다.', insured: true,
    items: [
      { name: '임플란트(보험)', price: 0 },
      { name: '발치', price: 0 },
      { name: '치수절단', price: 0 },
      { name: '근관치료', price: 0 },
      { name: '치관확장술', price: 0 },
      { name: '치은박리소파술', price: 0 },
      { name: '치근활택술', price: 0 },
      { name: '치은판절제술', price: 0 },
      { name: '연1회 SC', price: 0 },
      { name: '치주 SC', price: 0 },
      { name: '치주 치료', price: 0 },
      { name: '치아 홈메우기', price: 0 },
      { name: '영구치 레진', price: 0 },
      { name: '금속상 완전틀니(보험)', price: 0 },
      { name: '부분틀니(보험)', price: 0 },
      { name: '즉일충전', price: 0 },
      { name: 'GI 충전', price: 0 },
      { name: '교합조정', price: 0 },
      { name: '잠간고정술', price: 0 },
      { name: '보철물재부착', price: 0 },
      { name: '브릿지 제거', price: 0 },
      { name: '지각과민처치', price: 0 },
      { name: '정기검진', price: 0 },
      { name: '턱관절치료', price: 0 },
      { name: '치경부마모', price: 0 },
      { name: '치은절제술', price: 0 },
      { name: '폴리싱', price: 0 },
      { name: 'I&D', price: 0 },
      { name: '치근절제술', price: 0 },
    ],
  },
  {
    key: 'implant', label: '임플란트 치료', icon: 'fa-tooth',
    desc: '국산 정품 픽스처(덴티스·오스템)만 사용합니다.',
    items: [
      { name: '임플 PDRN 2회(8M,4M)', price: 120000 },
      { name: '덴티스임플란트', price: 900000 },
      { name: '오스템임플란트', price: 1000000 },
      { name: '전치부 덴티스 임플란트', price: 1000000 },
      { name: '전치부 오스템 임플란트', price: 1100000 },
      { name: '가이드 임플란트', price: 100000 },
      { name: '기본 뼈이식', price: 300000 },
      { name: '복잡 뼈이식', price: 600000 },
      { name: '커스텀 어버트먼트', price: 100000 },
      { name: '상악동(Crestal)', price: 600000 },
      { name: '상악동(Lateral)', price: 1000000 },
      { name: '유리치은이식술(FGG)', price: 300000 },
      { name: '결합조직이식술(CTG)', price: 500000 },
      { name: '타치과 커스텀 어버트먼트', price: 100000 },
      { name: '상악동 (Crestal-2개치아이상)', price: 800000 },
      { name: 'CT촬영', price: 150000 },
    ],
  },
  {
    key: 'prosthetics', label: '보철 치료', icon: 'fa-crown',
    desc: '크라운·브릿지 등 보철 치료 비용입니다.',
    items: [
      { name: 'super 골드 크라운', price: 1000000, note: '변동가능' },
      { name: 'PT 골드 크라운', price: 1200000, note: '변동가능' },
      { name: '지르코니아 PFZ (전치부)', price: 600000 },
      { name: '지르코니아(구치부)', price: 500000 },
      { name: 'PFM 크라운(도자기)', price: 450000 },
      { name: 'prep후 임시치아 유지시(치아당)', price: 150000 },
      { name: 'MTA', price: 100000 },
      { name: '폰틱(zirconia)', price: 500000 },
      { name: '폰틱(PFZ)', price: 600000 },
    ],
  },
  {
    key: 'denture', label: '틀니 치료', icon: 'fa-teeth',
    desc: '부분·완전 틀니 및 임플란트 틀니(오버덴쳐) 비용입니다.',
    items: [
      { name: '부분 틀니', price: 1500000 },
      { name: '완전 틀니', price: 1700000 },
      { name: '오버덴쳐(임플란트 틀니)', price: 2000000 },
      { name: '로케이터,마그네틱', price: 350000 },
      { name: '오버덴쳐수리(단순의치상 및 교합조정)', price: 50000 },
      { name: '오버덴쳐수리(마그넷 재부착)', price: 100000 },
      { name: '오버덴쳐수리(마그넷교체)', price: 300000 },
      { name: '오버덴쳐수리(인공치수리)', price: 50000 },
      { name: '틀니 수리', price: 100000 },
      { name: '틀니 개상', price: 300000 },
      { name: '임시 틀니', price: 300000 },
      { name: 'Wire Tempo(치아당/3M추가)', price: 100000 },
    ],
  },
  {
    key: 'conserve', label: '보존 치료', icon: 'fa-fill-drip',
    desc: '레진·인레이 등 자연치아를 살리는 치료 비용입니다.',
    items: [
      { name: '레진(소구치)', price: 100000 },
      { name: '레진(구치부)', price: 100000 },
      { name: '동일부위레진', price: 80000 },
      { name: '인접면 레진', price: 130000 },
      { name: '레진 b.pit', price: 80000 },
      { name: '치경부레진(간단)', price: 70000 },
      { name: '치경부레진(복잡)', price: 100000 },
      { name: '절단면 레진', price: 150000 },
      { name: '레진 전치부(1면)', price: 130000 },
      { name: '레진 전치부(2면)', price: 260000 },
      { name: '아이콘레진', price: 170000 },
      { name: '다이아스테마', price: 200000 },
      { name: '인접면 충치+심미 (1면당)', price: 200000 },
      { name: '세라믹인레이(1면)', price: 300000 },
      { name: '세라믹인레이(2면)', price: 330000 },
      { name: '세라믹인레이(3면)', price: 360000 },
      { name: '세라믹온레이', price: 400000 },
      { name: '라미네이트', price: 550000 },
      { name: '레진 코어', price: 100000 },
      { name: '레진코어(Cr안할경우)', price: 150000 },
      { name: '포스트 레진 코어', price: 200000 },
      { name: '포스트+ 레진코어(Cr안할경우)', price: 320000 },
      { name: '임플란트 hole change', price: 50000 },
    ],
  },
  {
    key: 'kids', label: '소아 치료', icon: 'fa-child',
    desc: '소아 충치·예방 치료 비용입니다.',
    items: [
      { name: '소아 레진', price: 50000 },
      { name: 'SS Crown', price: 150000 },
      { name: 'Band & Loop', price: 250000 },
      { name: 'Crown & loop', price: 250000 },
      { name: '불소', price: 15000 },
      { name: '스케일링', price: 50000 },
      { name: 'Nance Holding Arch', price: 250000 },
    ],
  },
  {
    key: 'ortho', label: '교정 치료', icon: 'fa-align-center',
    desc: '유지장치·교합안정장치 등 교정 관련 비용입니다.',
    items: [
      { name: 'Retainer(4치이하)', price: 200000 },
      { name: 'Retainer(4치이상/치아당)', price: 50000 },
      { name: '교정 레진제거', price: 10000 },
      { name: '유지장치재부착(치아당)', price: 50000 },
      { name: '교정발치', price: 50000 },
      { name: '브라켓 제거', price: 10000 },
      { name: '교정유지장치', price: 350000 },
      { name: '이갈이 장치', price: 500000 },
      { name: '이갈이장치 월비 1만원', price: 10000 },
      { name: '교합안정장치', price: 500000 },
      { name: '교합안정장치 월비 1만원', price: 10000 },
      { name: '세퍼레이터', price: 30000 },
    ],
  },
  {
    key: 'etc', label: '기타 치료', icon: 'fa-notes-medical',
    desc: '턱관절 체외충격파·PDRN 등 기타 치료 비용입니다.',
    items: [
      { name: 'Wire Splint(치아당)', price: 40000 },
      { name: 'Flexible(치아당/3M추가)', price: 200000 },
      { name: '트리톤 연고', price: 20000 },
      { name: '큐탄', price: 30000 },
      { name: '큐어블럭', price: 30000 },
      { name: '착색제거', price: 20000 },
      { name: '타치과임플란트 hole', price: 50000 },
      { name: '타치과임플란트 나사조이기', price: 50000 },
      { name: '타치과 라미네이트 재부착', price: 70000 },
      { name: '프롤로주사(5회)', price: 350000 },
      { name: '치주 PDRN(1앰플)', price: 70000 },
      { name: '체외충격파1700(회당)', price: 70000 },
      { name: '체외충격파2200(회당)', price: 100000 },
      { name: 'CT(비급여)', price: 50000 },
      { name: '가이드 플러그', price: 50000 },
      { name: '필름제로테라피', price: 240000 },
    ],
  },
  {
    key: 'cosmetic', label: '미용 치료(과세)', icon: 'fa-face-smile',
    desc: '라미네이트·미백·보톡스 등 미용 치료 비용입니다. (부가세 포함 과세 항목)',
    items: [
      { name: '라미네이트', price: 550000 },
      { name: '보톡스(50유닛당)', price: 120000 },
      { name: '보톡스(100유닛)', price: 240000 },
      { name: '전문가미백1회', price: 140000 },
      { name: '전문가미백2회', price: 270000 },
      { name: '전문가미백3회', price: 380000 },
      { name: '실활치미백3회', price: 150000 },
      { name: '실활치미백2회', price: 100000 },
      { name: '자가미백 8회', price: 280000 },
      { name: '전문가미백(3회)+자가(4회)', price: 630000 },
      { name: '자가미백트레이', price: 150000 },
      { name: '치은미백(laser/악당/2회)', price: 250000 },
      { name: '치은성형술', price: 50000 },
    ],
  },
]

export const fmtPrice = (p: number): string => p === 0 ? '보험 적용' : p.toLocaleString('ko-KR') + '원'
export const PRICING_UPDATED = '2026-07'

// ===== D1 동적 수가 로더 (관리자 수정 반영 / 실패 시 정적 폴백) =====
export interface PriceItemRow extends PriceItem { id: number; category_key: string; sort: number }

export async function getPricing(db?: D1Database): Promise<{ pricing: PriceCategory[]; updated: string }> {
  if (db) {
    try {
      const [rows, upd] = await Promise.all([
        db.prepare('SELECT id, category_key, name, price, note, sort FROM price_items ORDER BY sort, id').all<PriceItemRow>(),
        db.prepare("SELECT value FROM settings WHERE key = 'pricing_updated'").first<{ value: string }>(),
      ])
      if (rows.results && rows.results.length > 0) {
        const pricing: PriceCategory[] = PRICING.map((cat) => ({
          ...cat,
          items: rows.results
            .filter((r) => r.category_key === cat.key)
            .map((r) => ({ name: r.name, price: r.price, note: r.note || undefined })),
        })).filter((cat) => cat.items.length > 0)
        return { pricing, updated: upd?.value || PRICING_UPDATED }
      }
    } catch { /* D1 미연결 → 정적 폴백 */ }
  }
  return { pricing: PRICING, updated: PRICING_UPDATED }
}
