/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          50:  'var(--color-industrial-50)',
          100: 'var(--color-industrial-100)',
          200: 'var(--color-industrial-200)',
          300: 'var(--color-industrial-300)',
          400: 'var(--color-industrial-400)',
          500: 'var(--color-industrial-500)',
          600: 'var(--color-industrial-600)',
          700: 'var(--color-industrial-700)',
          800: 'var(--color-industrial-800)',
          900: 'var(--color-industrial-900)',
          950: 'var(--color-industrial-950)',
        },
        alert: {
          success: 'var(--color-alert-success)',
          warning: 'var(--color-alert-warning)',
          critical: 'var(--color-alert-critical)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
