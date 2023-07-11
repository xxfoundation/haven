/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-select/dist/index.esm.js"
  ],
  theme: {
    colors: {
      primary: 'var(--primary)',
      secondary: 'var(--secondary)',
      red: 'var(--red)',
      orange: 'var(--orange)',
      green: 'var(--green)',
      blue: 'var(--blue)',
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
