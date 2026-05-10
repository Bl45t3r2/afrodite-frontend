/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fbeaf0',
          100: '#f4c0d1',
          200: '#ed93b1',
          300: '#e066a0',
          400: '#D4537E',
          500: '#bf3f6a',
          600: '#993556',
          800: '#72243E',
          900: '#4B1528',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};