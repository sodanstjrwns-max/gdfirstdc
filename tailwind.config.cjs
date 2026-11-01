// 기존 CDN 인라인 tailwind.config(src/lib/layout.ts)와 같은 테마를 빌드 단계에서 사용한다(2026-11-01 CDN → 빌드 CSS).
// Tailwind 3.4.17 = cdn.tailwindcss.com 과 같은 버전.
module.exports = {
  content: [
    './src/**/*.{ts,tsx,js,jsx,html}',
    './public/static/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0a1628', soft: '#0f1f38', mute: '#16294a' },
        navy: { 50: '#f2f6fb', 100: '#dfeaf5', 200: '#bcd3ea', 400: '#5b8ec2', 600: '#1d5486', 700: '#173f66', 800: '#12365a', 900: '#0d2843' },
        gold: { 300: '#eef1f6', 400: '#cdd5e0', 500: '#b7c1cf', 600: '#5c6b82' },
        royal: { DEFAULT: '#0a4fc2', 600: '#0040a0' },
        cream: '#faf7f0',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'system-ui', 'sans-serif'],
        disp: ['"Nanum Myeongjo"', 'Pretendard', 'serif'],
      },
      letterSpacing: { tightest: '-0.04em' },
    },
  },
}
