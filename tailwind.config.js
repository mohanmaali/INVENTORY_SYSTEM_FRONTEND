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
        primary: {
          DEFAULT: '#016B61',
          50: '#E6F3F2',
          100: '#CCE7E3',
          200: '#99CFC7',
          300: '#66B7AB',
          400: '#339F8F',
          500: '#016B61',
          600: '#015449',
          700: '#013D31',
          800: '#01261A',
          900: '#010F02',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
