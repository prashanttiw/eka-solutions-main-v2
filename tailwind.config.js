/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#07070E',
        foreground: '#F8FAFC',
        surface: {
          dark: '#0E0E1B',
          card: '#121224',
          border: 'rgba(255, 255, 255, 0.08)',
          glow: '#8B5CF6'
        },
        cyber: {
          yellow: '#E2F952',
          cyan: '#00F0FF',
          blue: '#38BDF8',
          purple: '#8B5CF6',
          violet: '#A855F7',
          pink: '#EC4899',
        },
        cream: '#F1F5F9',
        muted: '#94A3B8',
      },
      fontFamily: {
        sans: ['"Work Sans"', 'sans-serif'],
        display: ['"Syne"', '"Archivo Black"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 2s infinite',
        'spin-slow': 'spin 20s linear infinite',
        'marquee': 'marquee 35s linear infinite',
        'marquee-reverse': 'marquee-reverse 35s linear infinite',
        'mountain-pan': 'mountain-pan 14s ease-in-out infinite alternate',
      },
      keyframes: {
        'mountain-pan': {
          '0%': { transform: 'translate3d(-10%, 0, 0)' },
          '100%': { transform: 'translate3d(5%, 0, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(2deg)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
    },
  },
  plugins: [],
}
