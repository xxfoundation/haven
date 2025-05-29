/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors: {
      primary: 'var(--primary)',
      secondary: 'var(--secondary)',
      'text-secondary': 'var(--text-secondary)',
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
      white: 'var(--primary-white)',
      'charcoal-3-20': 'var(--charcoal-3-20)',
      'charcoal-4-40': 'var(--charcoal-4-40)',
      'charcoal-4-80': 'var(--charcoal-4-80)',
      'near-black-80': 'var(--near-black-80)',
      'green-10': 'var(--green-10)',
      'primary-15': 'var(--primary-15)'
    },
    fontFamily: {
      sans: ['Moderat']
    },
    extend: {
      screens: {
        xs: '425px',
        smdtp: '960px',
        dtp: '1024px', // Desktop 1024px min-width alias
        lg: '1280px',
        xl: '1280px',
        '2xl': '1560px'
      },
      keyframes: {
        draw: {
          '0%, 66%, 100%': {
            fill: 'rgb(96, 165, 250)', // blue-400 lighter
            transform: 'translate(0, 0)'
          },
          '33%': {
            fill: 'rgb(59, 130, 246)', // blue-500 darker
            transform: 'translate(-1px, -1px)'
          }
        }
      }
    }
  },
  plugins: []
};
