/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#030305',
          red: '#FF003C',
          crimson: '#D00027',
          blue: '#006BFF',
          cyan: '#00CFFF',
          white: '#F5F5F5',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(6%,8%,0) scale(1.12)' },
        },
        sheen: {
          "0%": { transform: "translateX(-160%) skewX(-22deg)" },
          "55%, 100%": { transform: "translateX(520%) skewX(-22deg)" },
        },
        speed: {
          '0%': { transform: 'translateX(130vw)' },
          '100%': { transform: 'translateX(-160vw)' },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-2.5deg)" },
          "50%": { transform: "rotate(2.5deg)" },
        },
        streak: {
          '0%': { transform: 'translateX(-140%) rotate(-16deg)', opacity: '0' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { transform: 'translateX(140%) rotate(-16deg)', opacity: '0' },
        },
        scroll: {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'top' },
          '50%': { transform: 'scaleY(1)', transformOrigin: 'top' },
          '51%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
        },
      },
      animation: {
        drift: 'drift 16s ease-in-out infinite',
        'drift-slow': 'drift 22s ease-in-out infinite reverse',
        'scroll-cue': 'scroll 2.4s ease-in-out infinite',
        streak: 'streak 10s linear infinite',
        speed: 'speed 1.2s linear infinite',
        sheen: 'sheen 7s ease-in-out infinite',
        sway: 'sway 11s ease-in-out infinite',
        'sway-rev': 'sway 13s ease-in-out infinite reverse',
      },
    },
  },
  plugins: [],
};
