/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'usna-navy': '#00205B',
        'usna-gold': '#C5B783',
        'usna-gold-light': '#D4C99E',
        'usna-deep': '#001233',
        'usna-card': '#0A1628',
        'usna-plot': '#0D1321',
        'usna-text': '#F0ECE3',
        'usna-muted': '#8B8C8E',
        'usna-grid': '#1A2332',
        'usna-zero': '#2A3442',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
