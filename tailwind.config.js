/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./screens/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#FFF7ED',
          100: '#FFE9D5',
          200: '#FED2A8',
          300: '#FCB576',
          400: '#FA9A44',
          500: '#F58426',
          600: '#DF6C11',
          700: '#B9520C',
          800: '#934010',
          900: '#773510',
          950: '#431904',
        },
      },
    },
  },
  plugins: [],
}