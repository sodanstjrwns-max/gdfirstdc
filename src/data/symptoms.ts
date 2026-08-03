// AI 증상체크 데이터 — 규칙 기반 매칭 (진단이 아닌 안내 목적)
// 각 증상은 치료과목 slug에 가중치를 부여, 합산 상위 과목을 추천

export interface SymptomItem {
  id: string
  label: string
  icon: string
  weights: Record<string, number>
}

export interface SymptomGroup {
  title: string
  items: SymptomItem[]
}

export const SYMPTOM_GROUPS: SymptomGroup[] = [
  {
    title: '치아 통증·불편',
    items: [
      { id: 'chew-pain', label: '씹을 때 이가 아파요', icon: 'fa-bolt', weights: { endo: 2, cavity: 2, prosthetics: 1 } },
      { id: 'cold-sensitive', label: '차갑거나 뜨거운 것에 이가 시려요', icon: 'fa-snowflake', weights: { cavity: 2, gum: 1, endo: 1 } },
      { id: 'night-pain', label: '가만히 있어도 욱신거리고 밤에 더 아파요', icon: 'fa-moon', weights: { endo: 3 } },
      { id: 'crack', label: '이가 깨졌거나 금이 간 것 같아요', icon: 'fa-burst', weights: { prosthetics: 2, endo: 2 } },
      { id: 'black-hole', label: '이가 검게 변했거나 구멍이 보여요', icon: 'fa-circle-half-stroke', weights: { cavity: 3, endo: 1 } },
    ],
  },
  {
    title: '잇몸·치아 상실',
    items: [
      { id: 'gum-bleed', label: '잇몸이 붓고 양치할 때 피가 나요', icon: 'fa-droplet', weights: { gum: 3 } },
      { id: 'loose-tooth', label: '이가 흔들리거나 빠졌어요', icon: 'fa-tooth', weights: { implant: 3, gum: 2 } },
      { id: 'gum-recede', label: '잇몸이 내려앉아 이가 길어 보여요', icon: 'fa-arrow-down', weights: { gum: 3, implant: 1 } },
      { id: 'food-stuck', label: '음식물이 자주 끼고 냄새가 나요', icon: 'fa-utensils', weights: { cavity: 2, prosthetics: 2, gum: 1 } },
      { id: 'old-crown', label: '오래된 크라운·브릿지가 불편해요', icon: 'fa-crown', weights: { prosthetics: 3 } },
    ],
  },
  {
    title: '심미·앞니 고민',
    items: [
      { id: 'front-shape', label: '앞니 모양·크기가 마음에 안 들어요', icon: 'fa-wand-magic-sparkles', weights: { bloomnate: 3, aesthetic: 2 } },
      { id: 'gap-teeth', label: '이 사이가 벌어져 있어요', icon: 'fa-arrows-left-right', weights: { bloomnate: 2, aesthetic: 2 } },
      { id: 'discolor', label: '치아가 누렇거나 변색됐어요', icon: 'fa-palette', weights: { aesthetic: 3, bloomnate: 1 } },
      { id: 'smile-confidence', label: '웃을 때 치아가 신경 쓰여 입을 가려요', icon: 'fa-face-smile', weights: { bloomnate: 2, aesthetic: 2 } },
    ],
  },
  {
    title: '턱·습관·기타',
    items: [
      { id: 'jaw-click', label: '입을 벌릴 때 턱에서 소리가 나거나 아파요', icon: 'fa-volume-high', weights: { tmj: 3 } },
      { id: 'morning-jaw', label: '아침에 턱이 뻐근하고 두통이 있어요', icon: 'fa-head-side-virus', weights: { tmj: 2, botox: 2 } },
      { id: 'grinding', label: '이를 갈거나 꽉 무는 습관이 있어요', icon: 'fa-teeth', weights: { botox: 2, tmj: 2 } },
      { id: 'wisdom-pain', label: '사랑니 주변이 붓고 아파요', icon: 'fa-triangle-exclamation', weights: { wisdom: 3 } },
      { id: 'square-jaw', label: '사각턱·저작근 비대가 고민이에요', icon: 'fa-face-meh', weights: { botox: 3 } },
    ],
  },
]
