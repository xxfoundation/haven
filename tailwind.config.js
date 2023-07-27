/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    colors: {
      primary: 'var(--primary)',
      secondary: 'var(--secondary)',
      red: 'var(--red)',
      orange: 'var(--orange)',
      green: 'var(--green)',
      blue: 'var(--blue)',
      'charcoal-1': 'var(--charcoal-1)',
      'charcoal-2': 'var(--charcoal-2)',
      'charcoal-3': 'var(--charcoal-3)',
      'charcoal-4': 'var(--charcoal-4)',
      'near-black': 'var(--near-black)',
      'our-black': 'var(--our-black)',
      'white': 'var(--primary-white)',
      'charcoal-3-20': 'var(--charcoal-3-20)',
      'charcoal-4-40': 'var(--charcoal-4-40)',
      'charcoal-4-80': 'var(--charcoal-4-80)',
      'near-black-80': 'var(--near-black-80)',
      'green-10': 'var(--green-10)',
      'primary-15': 'var(--primary-15)'
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
