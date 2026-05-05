/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maximus: {
          primary: '#FFA500', // Yellow Orange
          hover: '#E69500', // Darker Yellow Orange for Light, not used in Dark directly
          accent: '#FF8C00', // Dark Orange
          light: '#FFB732', // Bright Yellow Orange
          dark: '#FFC966', // Lighter Yellow Orange
          background: {
            light: '#FDFBF7',
            dark: '#121212'
          },
          surface: {
            light: '#FFFFFF',
            dark: '#1E1E1E'
          },
          text: {
            light: '#1A1A1A',
            dark: '#F5F5F5'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
