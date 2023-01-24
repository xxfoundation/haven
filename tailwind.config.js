/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-select/dist/index.esm.js"
  ],
  theme: {
    colors: {
      ...colors,
      orange: {
        100: '#faecd1',
        200: '#f4d8a4',
        300: '#efc576',
        400: '#eab148',
        500: '#e49e1b',
        600: '#b77e15',
        700: '#a06e13',
        800: '#895f10',
        900: '#724f0d'
      }
    },
    fontFamily: {
      sans: ["Moderat"]
    },
    extend: {
      screens: {
        xs: "425px",
        smdtp: "960px",
        dtp: "1024px", // Desktop 1024px min-width alias
        lg: "1280px",
        xl: "1280px",
        "2xl": "1560px"
      }
    }
  },
  plugins: []
};
