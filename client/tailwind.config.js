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
          50: '#fcfaf7',
          100: '#f5edd9',
          200: '#ebdbb2',
          300: '#d9bb80',
          400: '#c49954',
          500: '#a87932', // Rich Bronze Metallic
          600: '#8c6428', // Dark Bronze
          700: '#705020', // Deep Bronze
          800: '#543c18', // Burned Bronze
          900: '#382810', // Deepest Bronze
          950: '#1c1408', // Obsidian Bronze
        },
        // INDUSTRIAL COLORS - True Black & Charcoal
        industrial: {
          50: '#fdfbf7',   // Bone Cream
          100: '#f2e9d9',  // Light Sand
          200: '#e6d5bc',  // Muted Parchment
          300: '#cfb997',  // Dust Bronze
          400: '#a89276',  // Aged Copper
          500: '#826f5a',  // Muted Industrial Brown
          600: '#635445',  // Darkened Mud
          700: '#473c31',  // Coffee Grounds (Borders)
          800: '#2b241d',  // Deep Earth (Card Bg)
          900: '#1c1915',  // Dark Obsidian Bronze (Sidebar Bg)
          950: '#110f0c',  // Deepest Carbon Bronze (Main Bg)
        },
      },
    },
  },
  plugins: [],
}
