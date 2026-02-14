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
        // BRAND COLORS - Copper/Bronze Metallic
        brand: {
          50: '#fdf8f6',
          100: '#f6e8df',
          200: '#ead0c0',
          300: '#dab096',
          400: '#c58765',
          500: '#b45309', // Rich Copper/Bronze
          600: '#92400e', // Dark Copper
          700: '#78350f', // Deep Bronze
          800: '#451a03', // Coffee
          900: '#2a1002', // Dark Chocolate
        },
        // INDUSTRIAL COLORS - True Black & Charcoal
        industrial: {
          50: '#fafafa',   // Pure White-ish
          100: '#f4f4f5',  // Zinc 100
          200: '#e4e4e7',  // Zinc 200
          300: '#d4d4d8',  // Zinc 300
          400: '#a1a1aa',  // Zinc 400
          500: '#71717a',  // Zinc 500 (Text Secondary)
          600: '#52525b',  // Zinc 600
          700: '#3f3f46',  // Zinc 700 (Borders)
          800: '#27272a',  // Zinc 800 (Card Bg)
          900: '#18181b',  // Zinc 900 (Sidebar Bg)
          950: '#000000',  // Pure Black (Main Bg)
        },
      },
    },
  },
  plugins: [],
}
