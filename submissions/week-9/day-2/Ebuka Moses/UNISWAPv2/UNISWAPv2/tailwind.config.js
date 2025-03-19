/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-green': {
          900: '#1a2e1a',
          800: '#234123',
          700: '#2d542d',
        },
        'deep-yellow': {
          50: '#fff8e1',
          500: '#ffd54f',
          600: '#ffc107',
          300: '#ffe082',
        },
      },
    },
  },
  plugins: [],
}


