/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        warehouse: {
          bg: '#09090b',
          card: '#18181b',
          accent: '#f97316',
        },
      },
    },
  },
  plugins: [],
};