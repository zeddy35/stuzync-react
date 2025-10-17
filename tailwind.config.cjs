/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.js",
    "./src/**/*.{ts,tsx,js,jsx}" // if/when you move to Next
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#6D5EFC',
          600: '#5a4de6',
        },
      },
      boxShadow: {
        soft: '0 8px 24px -12px rgba(0,0,0,.25)',
      },
    },
  },
  plugins: [],
  safelist: [
    'dark',
    'max-w-[1280px]',
    'grid-cols-[1fr_minmax(0,620px)_1fr]'
  ],
};
