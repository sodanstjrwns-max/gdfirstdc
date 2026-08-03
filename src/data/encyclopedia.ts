// 치과 백과사전 — 용어·치료 상식 (SEO 콘텐츠)
export interface EncyItem {
  term: string
  reading?: string
  category: string
  def: string
  related?: string // 관련 치료 slug
}

export const ENCY_CATEGORIES = ['치료·시술', '구조·해부', '재료·장비', '증상·질환', '예방·관리'] as const

export const ENCYCLOPEDIA: EncyItem[] = [
  // 치료·시술
  { term: '임플란트', reading: 'Implant', category: '치료·시술', def: '상실된 치아 자리에 티타늄 인공치근을 심고 그 위에 크라운을 연결해 자연치아와 유사한 기능·심미를 회복하는 치료입니다. 골유착(osseointegration)이 완료되기까지 통상 2~6개월이 소요됩니다.', related: 'implant' },
  { term: '라미네이트', reading: 'Laminate Veneer', category: '치료·시술', def: '치아 표면에 얇은 세라믹 조각을 부착해 모양·색·크기를 개선하는 심미 치료입니다. 삭제량을 최소화한 무삭제·최소삭제 방식은 치아 손상을 크게 줄일 수 있습니다.', related: 'bloomnate' },
  { term: '신경치료', reading: 'Root Canal Treatment', category: '치료·시술', def: '치아 내부의 감염되거나 손상된 신경(치수)을 제거하고 빈 공간을 소독·충전해 치아를 살리는 치료입니다. 미세현미경을 사용하면 복잡한 근관도 정밀하게 치료할 수 있습니다.', related: 'endo' },
  { term: '크라운', reading: 'Crown', category: '치료·시술', def: '손상이 큰 치아를 전체적으로 감싸 보호하는 보철물입니다. 지르코니아, 세라믹 등 재료에 따라 강도와 심미성이 다릅니다.', related: 'prosthetics' },
  { term: '브릿지', reading: 'Bridge', category: '치료·시술', def: '상실된 치아의 양옆 치아를 지지대로 삼아 다리처럼 연결하는 보철 치료입니다. 임플란트가 어려운 경우의 대안이 될 수 있습니다.', related: 'prosthetics' },
  { term: '스케일링', reading: 'Scaling', category: '치료·시술', def: '치아에 붙은 치석과 플라크를 초음파 기구로 제거하는 잇몸 질환 예방 치료입니다. 만 19세 이상은 연 1회 건강보험이 적용됩니다.', related: 'gum' },
  { term: '레진', reading: 'Resin', category: '치료·시술', def: '충치를 제거한 자리를 치아 색과 유사한 복합 레진으로 메우는 치료입니다. 당일 치료가 가능하고 심미성이 우수합니다.', related: 'cavity' },
  { term: '인레이·온레이', reading: 'Inlay / Onlay', category: '치료·시술', def: '충치 범위가 커서 레진으로 어려울 때, 본을 떠서 맞춤 제작한 수복물을 치아에 부착하는 치료입니다. 세라믹·골드 등 재료를 선택할 수 있습니다.', related: 'cavity' },
  { term: '치아미백', reading: 'Whitening', category: '치료·시술', def: '전용 약제로 치아 내·외부의 착색을 분해해 밝은 치아색을 만드는 시술입니다. 전문가 미백과 자가 미백을 병행하면 효과가 오래 유지됩니다.', related: 'aesthetic' },
  { term: '잇몸이식술', reading: 'Gum Graft', category: '치료·시술', def: '잇몸 퇴축으로 치근이 노출된 부위에 결합조직 등을 이식해 잇몸을 회복시키는 수술입니다.', related: 'gum' },
  { term: '뼈이식', reading: 'Bone Graft', category: '치료·시술', def: '임플란트를 심기에 잇몸뼈가 부족할 때 골이식재로 뼈의 폭과 높이를 보강하는 술식입니다. 상악동거상술도 이에 포함됩니다.', related: 'implant' },
  { term: '보톡스(치과)', reading: 'Dental Botox', category: '치료·시술', def: '저작근(깨물근)에 보툴리눔 톡신을 주사해 이갈이·턱관절 부담을 줄이고 사각턱을 개선하는 시술입니다.', related: 'botox' },
  // 구조·해부
  { term: '치수', reading: 'Dental Pulp', category: '구조·해부', def: '치아 중심부의 신경과 혈관 조직입니다. 충치가 깊어져 치수까지 감염되면 심한 통증이 생기며 신경치료가 필요합니다.', related: 'endo' },
  { term: '법랑질', reading: 'Enamel', category: '구조·해부', def: '치아 가장 바깥의 단단한 보호층입니다. 인체에서 가장 단단한 조직이지만 산에 약해 충치로 손상되면 재생되지 않습니다.' },
  { term: '상아질', reading: 'Dentin', category: '구조·해부', def: '법랑질 아래층으로, 미세한 관을 통해 신경과 연결되어 있습니다. 상아질이 노출되면 시린 증상이 나타납니다.' },
  { term: '치조골', reading: 'Alveolar Bone', category: '구조·해부', def: '치아를 지지하는 잇몸뼈입니다. 치주염이 진행되면 치조골이 녹아 치아가 흔들리게 되며, 임플란트 식립의 토대가 됩니다.', related: 'implant' },
  { term: '치근', reading: 'Root', category: '구조·해부', def: '잇몸 속에 묻혀 치아를 지탱하는 뿌리 부분입니다. 어금니는 보통 2~3개의 치근을 가집니다.' },
  { term: '턱관절(악관절)', reading: 'TMJ', category: '구조·해부', def: '아래턱과 두개골을 연결하는 관절로, 말하기·씹기 등 턱 운동의 중심축입니다. 디스크 이상 시 소리·통증·개구장애가 생길 수 있습니다.', related: 'tmj' },
  { term: '사랑니(제3대구치)', reading: 'Wisdom Tooth', category: '구조·해부', def: '가장 늦게 나는 어금니로, 공간 부족으로 매복되거나 기울어져 나는 경우가 많아 염증·충치의 원인이 되면 발치를 고려합니다.', related: 'wisdom' },
  // 재료·장비
  { term: '지르코니아', reading: 'Zirconia', category: '재료·장비', def: '강도와 심미성을 겸비한 세라믹 계열 보철 재료입니다. 금속을 쓰지 않아 잇몸 변색이 없고 자연치아와 유사한 투명도를 냅니다.', related: 'prosthetics' },
  { term: '티타늄', reading: 'Titanium', category: '재료·장비', def: '임플란트 인공치근의 표준 재료입니다. 생체 친화성이 높아 뼈와 직접 결합(골유착)합니다.', related: 'implant' },
  { term: '미세현미경', reading: 'Dental Microscope', category: '재료·장비', def: '치료 부위를 수 배~수십 배 확대해 보는 장비입니다. 육안으로 보이지 않는 미세 근관·균열을 찾아내 신경치료의 성공률을 높입니다.', related: 'endo' },
  { term: 'CT(콘빔CT)', reading: 'CBCT', category: '재료·장비', def: '치아·턱뼈를 3차원으로 촬영하는 장비입니다. 신경관 위치, 뼈의 폭과 밀도를 정확히 파악해 임플란트·발치 계획에 활용됩니다.', related: 'implant' },
  { term: '구강스캐너', reading: 'Intraoral Scanner', category: '재료·장비', def: '인상재 없이 입안을 디지털로 스캔하는 장비입니다. 구역감이 없고 정밀한 보철물 제작이 가능합니다.' },
  { term: '디지털 가이드', reading: 'Surgical Guide', category: '재료·장비', def: 'CT와 구강스캔 데이터를 결합해 임플란트 식립 위치·깊이·각도를 미리 설계하고, 수술 시 그대로 유도하는 장치입니다.', related: 'implant' },
  // 증상·질환
  { term: '충치(치아우식증)', reading: 'Dental Caries', category: '증상·질환', def: '세균이 만든 산이 치아를 녹이는 질환입니다. 법랑질→상아질→치수 순으로 진행되며, 초기에는 통증이 없어 정기검진이 중요합니다.', related: 'cavity' },
  { term: '치주염', reading: 'Periodontitis', category: '증상·질환', def: '치석 속 세균이 잇몸과 치조골까지 파괴하는 질환입니다. 성인 치아 상실의 가장 큰 원인으로, 초기 치은염 단계에서 치료해야 합니다.', related: 'gum' },
  { term: '치은염', reading: 'Gingivitis', category: '증상·질환', def: '잇몸에 국한된 초기 염증입니다. 잇몸이 붓고 피가 나는 단계로, 스케일링과 관리로 회복이 가능합니다.', related: 'gum' },
  { term: '치아균열증후군', reading: 'Cracked Tooth', category: '증상·질환', def: '치아에 미세한 금이 가서 씹을 때 찌릿한 통증이 생기는 질환입니다. 방치하면 균열이 진행되어 발치까지 이를 수 있습니다.', related: 'endo' },
  { term: '턱관절 장애', reading: 'TMD', category: '증상·질환', def: '턱관절과 주변 근육의 기능 이상입니다. 관절음, 통증, 입이 잘 안 벌어지는 증상이 나타나며 스트레스·이갈이가 악화 요인입니다.', related: 'tmj' },
  { term: '이갈이(브럭시즘)', reading: 'Bruxism', category: '증상·질환', def: '수면 중 무의식적으로 이를 갈거나 꽉 무는 습관입니다. 치아 마모·균열, 턱관절 장애의 원인이 되며 장치·보톡스로 관리합니다.', related: 'botox' },
  { term: '지각과민증', reading: 'Hypersensitivity', category: '증상·질환', def: '찬물·단것에 이가 시린 증상입니다. 잇몸 퇴축, 치경부 마모, 균열 등 원인이 다양해 정확한 감별이 필요합니다.', related: 'gum' },
  { term: '구취(입냄새)', reading: 'Halitosis', category: '증상·질환', def: '대부분 입안 세균이 원인입니다. 설태, 치주염, 충치, 오래된 보철물 틈이 주요 원인이며 원인 치료가 우선입니다.', related: 'gum' },
  // 예방·관리
  { term: '치실·치간칫솔', reading: 'Floss', category: '예방·관리', def: '칫솔이 닿지 않는 치아 사이를 청소하는 도구입니다. 치아 사이 충치와 잇몸 질환 예방의 핵심으로, 하루 1회 이상 권장됩니다.' },
  { term: '불소도포', reading: 'Fluoride', category: '예방·관리', def: '치아 표면에 고농도 불소를 발라 법랑질을 강화하고 초기 충치의 재광화를 돕는 예방 처치입니다.' },
  { term: '정기검진', reading: 'Check-up', category: '예방·관리', def: '6개월~1년 간격의 검진으로 충치·잇몸 질환을 조기에 발견하면 치료 범위와 비용을 크게 줄일 수 있습니다.' },
  { term: '나이트가드', reading: 'Night Guard', category: '예방·관리', def: '수면 중 착용하는 맞춤 장치로, 이갈이로부터 치아와 턱관절을 보호합니다.', related: 'tmj' },
  { term: '임플란트 유지관리', reading: 'Implant Maintenance', category: '예방·관리', def: '임플란트 주위염 예방을 위한 정기 관리입니다. 임플란트는 충치가 없지만 잇몸 염증에는 취약해 자연치아보다 세심한 관리가 필요합니다.', related: 'implant' },
]
