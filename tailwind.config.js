/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
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
