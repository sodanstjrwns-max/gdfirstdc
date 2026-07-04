// 지역 데이터 — 비포애프터 지역 자동완성 & 지역 SEO 페이지
// full: 전체 표기, keywords: 검색 매칭용

export interface Region { full: string; keywords: string[] }

// 검단퍼스트치과 핵심 상권 (동 단위)
const LOCAL: Region[] = [
  { full: '인천시 서구 원당동', keywords: ['원당', '원당동'] },
  { full: '인천시 서구 당하동', keywords: ['당하', '당하동'] },
  { full: '인천시 서구 마전동', keywords: ['마전', '마전동'] },
  { full: '인천시 서구 불로동', keywords: ['불로', '불로동'] },
  { full: '인천시 서구 대곡동', keywords: ['대곡', '대곡동'] },
  { full: '인천시 서구 금곡동', keywords: ['금곡', '금곡동'] },
  { full: '인천시 서구 오류동', keywords: ['오류', '오류동'] },
  { full: '인천시 서구 왕길동', keywords: ['왕길', '왕길동'] },
  { full: '인천시 서구 검단동', keywords: ['검단', '검단동', '검단신도시'] },
  { full: '인천시 서구 아라동', keywords: ['아라', '아라동'] },
  { full: '인천시 서구 청라동', keywords: ['청라', '청라동', '청라국제도시'] },
  { full: '인천시 서구 가정동', keywords: ['가정', '가정동', '루원시티'] },
  { full: '인천시 서구 석남동', keywords: ['석남', '석남동'] },
  { full: '인천시 서구 신현동', keywords: ['신현', '신현동'] },
  { full: '인천시 서구 가좌동', keywords: ['가좌', '가좌동'] },
  { full: '인천시 서구 심곡동', keywords: ['심곡', '심곡동'] },
  { full: '인천시 서구 연희동', keywords: ['연희', '연희동'] },
  { full: '인천시 서구 검암동', keywords: ['검암', '검암동'] },
  { full: '인천시 서구 경서동', keywords: ['경서', '경서동'] },
  { full: '인천시 계양구 계산동', keywords: ['계산', '계산동'] },
  { full: '인천시 계양구 작전동', keywords: ['작전', '작전동'] },
  { full: '인천시 계양구 박촌동', keywords: ['박촌', '박촌동'] },
  { full: '인천시 계양구 귤현동', keywords: ['귤현', '귤현동'] },
  { full: '인천시 부평구 부평동', keywords: ['부평', '부평동'] },
  { full: '인천시 부평구 산곡동', keywords: ['산곡', '산곡동'] },
  { full: '인천시 부평구 갈산동', keywords: ['갈산', '갈산동'] },
  { full: '경기도 김포시 풍무동', keywords: ['풍무', '풍무동'] },
  { full: '경기도 김포시 사우동', keywords: ['사우', '사우동'] },
  { full: '경기도 김포시 장기동', keywords: ['장기', '장기동', '한강신도시'] },
  { full: '경기도 김포시 구래동', keywords: ['구래', '구래동'] },
  { full: '경기도 김포시 마산동', keywords: ['김포 마산', '마산동'] },
  { full: '경기도 김포시 운양동', keywords: ['운양', '운양동'] },
  { full: '경기도 김포시 통진읍', keywords: ['통진', '통진읍'] },
  { full: '경기도 부천시 원미구', keywords: ['원미', '원미구'] },
  { full: '경기도 부천시 소사구', keywords: ['소사', '소사구'] },
  { full: '경기도 부천시 오정구', keywords: ['오정', '오정구'] },
]

// 시/군/구 단위 (전국 주요)
const CITIES: Region[] = [
  { full: '인천시', keywords: ['인천'] },
  { full: '인천시 서구', keywords: ['인천 서구'] },
  { full: '인천시 계양구', keywords: ['계양', '계양구'] },
  { full: '인천시 부평구', keywords: ['부평구'] },
  { full: '인천시 남동구', keywords: ['남동구'] },
  { full: '인천시 연수구', keywords: ['연수', '연수구', '송도'] },
  { full: '인천시 미추홀구', keywords: ['미추홀', '미추홀구'] },
  { full: '인천시 중구', keywords: ['인천 중구', '영종도'] },
  { full: '인천시 동구', keywords: ['인천 동구'] },
  { full: '인천시 강화군', keywords: ['강화', '강화군'] },
  { full: '경기도 김포시', keywords: ['김포', '김포시'] },
  { full: '경기도 부천시', keywords: ['부천', '부천시'] },
  { full: '경기도 고양시', keywords: ['고양', '고양시', '일산'] },
  { full: '경기도 파주시', keywords: ['파주', '파주시'] },
  { full: '경기도 시흥시', keywords: ['시흥', '시흥시'] },
  { full: '경기도 안산시', keywords: ['안산', '안산시'] },
  { full: '경기도 안산시 상록구 초지동', keywords: ['초지', '초지동'] },
  { full: '경기도 광명시', keywords: ['광명', '광명시'] },
  { full: '경기도 성남시', keywords: ['성남', '성남시', '분당', '판교'] },
  { full: '경기도 수원시', keywords: ['수원', '수원시'] },
  { full: '경기도 용인시', keywords: ['용인', '용인시'] },
  { full: '경기도 화성시', keywords: ['화성', '화성시', '동탄'] },
  { full: '경기도 평택시', keywords: ['평택', '평택시'] },
  { full: '경기도 오산시', keywords: ['오산', '오산시'] },
  { full: '경기도 안양시', keywords: ['안양', '안양시'] },
  { full: '경기도 군포시', keywords: ['군포', '군포시'] },
  { full: '경기도 의왕시', keywords: ['의왕', '의왕시'] },
  { full: '경기도 과천시', keywords: ['과천', '과천시'] },
  { full: '경기도 의정부시', keywords: ['의정부', '의정부시'] },
  { full: '경기도 남양주시', keywords: ['남양주', '남양주시'] },
  { full: '경기도 구리시', keywords: ['구리', '구리시'] },
  { full: '경기도 하남시', keywords: ['하남', '하남시', '미사'] },
  { full: '경기도 양주시', keywords: ['양주', '양주시'] },
  { full: '경기도 포천시', keywords: ['포천', '포천시'] },
  { full: '경기도 동두천시', keywords: ['동두천'] },
  { full: '경기도 이천시', keywords: ['이천', '이천시'] },
  { full: '경기도 여주시', keywords: ['여주', '여주시'] },
  { full: '경기도 광주시', keywords: ['경기 광주', '경기광주'] },
  { full: '서울시', keywords: ['서울'] },
  { full: '서울시 강서구', keywords: ['강서', '강서구', '마곡'] },
  { full: '서울시 양천구', keywords: ['양천', '양천구', '목동'] },
  { full: '서울시 영등포구', keywords: ['영등포', '영등포구', '여의도'] },
  { full: '서울시 구로구', keywords: ['구로', '구로구'] },
  { full: '서울시 금천구', keywords: ['금천', '금천구'] },
  { full: '서울시 마포구', keywords: ['마포', '마포구', '홍대'] },
  { full: '서울시 은평구', keywords: ['은평', '은평구'] },
  { full: '서울시 서대문구', keywords: ['서대문', '서대문구'] },
  { full: '서울시 종로구', keywords: ['종로', '종로구'] },
  { full: '서울시 중구', keywords: ['서울 중구'] },
  { full: '서울시 용산구', keywords: ['용산', '용산구'] },
  { full: '서울시 강남구', keywords: ['강남', '강남구'] },
  { full: '서울시 서초구', keywords: ['서초', '서초구'] },
  { full: '서울시 송파구', keywords: ['송파', '송파구', '잠실'] },
  { full: '서울시 강동구', keywords: ['강동', '강동구'] },
  { full: '서울시 성동구', keywords: ['성동', '성동구'] },
  { full: '서울시 광진구', keywords: ['광진', '광진구'] },
  { full: '서울시 동대문구', keywords: ['동대문', '동대문구'] },
  { full: '서울시 중랑구', keywords: ['중랑', '중랑구'] },
  { full: '서울시 성북구', keywords: ['성북', '성북구'] },
  { full: '서울시 강북구', keywords: ['강북', '강북구'] },
  { full: '서울시 도봉구', keywords: ['도봉', '도봉구'] },
  { full: '서울시 노원구', keywords: ['노원', '노원구'] },
  { full: '서울시 관악구', keywords: ['관악', '관악구'] },
  { full: '서울시 동작구', keywords: ['동작', '동작구'] },
  { full: '부산시', keywords: ['부산'] },
  { full: '대구시', keywords: ['대구'] },
  { full: '대전시', keywords: ['대전'] },
  { full: '광주시', keywords: ['광주광역시'] },
  { full: '울산시', keywords: ['울산'] },
  { full: '세종시', keywords: ['세종'] },
  { full: '강원도 춘천시', keywords: ['춘천'] },
  { full: '강원도 원주시', keywords: ['원주'] },
  { full: '강원도 강릉시', keywords: ['강릉'] },
  { full: '충청북도 청주시', keywords: ['청주'] },
  { full: '충청남도 천안시', keywords: ['천안'] },
  { full: '충청남도 아산시', keywords: ['아산'] },
  { full: '전라북도 전주시', keywords: ['전주'] },
  { full: '전라남도 여수시', keywords: ['여수'] },
  { full: '경상북도 포항시', keywords: ['포항'] },
  { full: '경상남도 창원시', keywords: ['창원'] },
  { full: '제주도 제주시', keywords: ['제주'] },
]

export const REGIONS: Region[] = [...LOCAL, ...CITIES]

export function searchRegions(q: string): string[] {
  const query = q.trim().toLowerCase()
  if (!query) return []
  const results: string[] = []
  for (const r of REGIONS) {
    if (r.full.toLowerCase().includes(query) || r.keywords.some((k) => k.toLowerCase().includes(query) || query.includes(k.toLowerCase()))) {
      results.push(r.full)
    }
    if (results.length >= 10) break
  }
  return results
}

// 지역 SEO 페이지 대상 (검단퍼스트치과 상권)
export const SEO_REGIONS = [
  { slug: 'geomdan', name: '검단신도시', desc: '검단신도시에서 가장 오래된 치과, 검단퍼스트치과가 검단 주민들의 구강건강을 책임집니다.', distance: '도보 5분 생활권' },
  { slug: 'wondang', name: '원당동', desc: '검단퍼스트프라자 3층, 원당동 주민들의 평생 주치의 치과입니다.', distance: '병원 소재지' },
  { slug: 'dangha', name: '당하동', desc: '당하동에서 차량 5분, 완문검단·검단사거리 방면에서 편하게 오실 수 있습니다.', distance: '차량 5분' },
  { slug: 'majeon', name: '마전동', keywords: ['마전동 치과'], desc: '마전동·완정역 인근에서 가까운 정직한 치과를 찾으신다면 검단퍼스트치과입니다.', distance: '차량 5분' },
  { slug: 'bullo', name: '불로동', desc: '불로대곡동 주민들이 믿고 찾는 과잉진료 없는 치과입니다.', distance: '차량 7분' },
  { slug: 'ara', name: '아라동', desc: '아라동·검단신도시 신규 입주민을 위한 정직한 치과, 첫 검진부터 함께합니다.', distance: '차량 5분' },
  { slug: 'gimpo-pungmu', name: '김포 풍무동', desc: '김포 풍무동에서 검단으로 — 턱관절·라미네이트는 멀리서도 찾아오는 검단퍼스트치과입니다.', distance: '차량 10분' },
  { slug: 'gimpo', name: '김포시', desc: '김포 한강신도시·사우동·장기동에서도 많이 찾아주시는 검단의 턱관절·임플란트 치과입니다.', distance: '차량 15분' },
  { slug: 'cheongna', name: '청라국제도시', desc: '청라에서 검단까지, 제대로 된 진단을 위해 찾아올 가치가 있는 치과입니다.', distance: '차량 15분' },
  { slug: 'geomam', name: '검암동', desc: '검암역·검바위역 인근 주민들이 공항철도로도 편하게 방문하십니다.', distance: '차량 10분' },
]
