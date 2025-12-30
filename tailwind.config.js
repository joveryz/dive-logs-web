/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dive': {
          'dark': '#1a1a1e',
          'darker': '#141416',
          'accent': '#252528',
          'highlight': '#f59e0b',
          'surface': '#27272a',
        }
      }
    },
  },
  plugins: [],
}
