/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        vault: {
          DEFAULT: '#0B1020',
          50: '#1E2744',
          100: '#141A30',
        },
        safety: {
          DEFAULT: '#10B981',
          hover: '#059669',
          glow: 'rgba(16,185,129,0.35)',
        },
        accent: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
        },
        danger: {
          DEFAULT: '#EF4444',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.4)' },
          '50%': { boxShadow: '0 0 20px 5px rgba(16,185,129,0.2)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
