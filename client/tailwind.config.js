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
        // BRAND COLORS - Brown Metallic & Orange
        brand: {
          50: '#FFF7ED',   // Very light orange
          100: '#FFEDD5',  // Light orange
          200: '#FED7AA',  // Lighter orange
          300: '#FDBA74',  // Light orange
          400: '#FB923C',  // Medium orange
          500: '#FF6B35',  // Primary Orange (Industrial Orange)
          600: '#EA580C',  // Dark orange
          700: '#C2410C',  // Darker orange
          800: '#9A3412',  // Very dark orange
          900: '#7C2D12',  // Almost brown-orange
          brown: '#8B4513', // Metallic Brown
          'brown-dark': '#6B3410', // Dark Brown
          'brown-light': '#A0522D', // Light Brown
        },
        industrial: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#0a0a0b',
        },
      },
    },
  },
  plugins: [],
}
