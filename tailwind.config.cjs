/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  content: [],
  daisyui: {
    themes: ["dark"],
  },
  theme: {
    screens: {
      'xs': '320px',
      'sm': '640px',
      'lg': '1024px',
      'xl': '1280px',
      'ancient': '420px',
    },
    extend: {
      colors: {
        'regal-blue': '#73d7ff',
      },
      fontFamily: {
        satoshi: ["Satoshi-Black", "bold"],
      }
    },
  },
  plugins: [require("daisyui")],
}
