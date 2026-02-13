/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          50: '#f4f6f8',
          100: '#e4e7eb',
          200: '#c5ced6',
          300: '#a6b5c1',
          400: '#879cac',
          500: '#688397',
          600: '#536979',
          700: '#3e4f5b',
          800: '#2a343c',
          900: '#151a1e',
          950: '#0b0d0f',
        },
        alert: {
          success: '#10b981', // green-500
          warning: '#f59e0b', // amber-500
          critical: '#ef4444', // red-500
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
