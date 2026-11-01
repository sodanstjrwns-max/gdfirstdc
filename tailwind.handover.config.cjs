// 납품 안내서(public/static/handover-gdfirst-2026.html) 전용 — 그 페이지에 있던 CDN 인라인 설정과 같은 테마.
module.exports = {
  content: ['./public/static/handover-gdfirst-2026.html'],
  theme: {
    extend: {
      colors: {
        ink: '#0a1628', 'ink-soft': '#16233a', 'ink-mute': '#5b6b82',
        navy: { 600: '#1d5486', 800: '#123a5e' },
        gold: { 400: '#d4af5f', 500: '#c49a3c', 600: '#a87f2a' },
        royal: '#0a4fc2', cream: '#faf7f0',
      },
      fontFamily: { sans: ['"Pretendard Variable"', 'Pretendard', 'sans-serif'] },
    },
  },
}
