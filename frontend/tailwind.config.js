/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#00BC83',   // EduHub green
          600: '#00a774',
          700: '#009e6f',
          50: '#e9fff7',
          100: '#d6ffef',
        },
        accent: '#FFD900',     // EduHub yellow
        cream: '#FFF4C2',      // Light cream hero background
        dark: '#0B0F0D',       // Dark section background
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          500: '#64748B',
          700: '#334155'
        },
        warm: '#FFEDD5'       // soft warm bg
      },
      borderRadius: {
        xl2: '1rem'
      },
      boxShadow: {
        soft: '0 6px 24px rgba(15,23,42,0.06)'
      }
    }
  },
  plugins: []
}

