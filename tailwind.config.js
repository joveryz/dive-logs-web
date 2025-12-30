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
          'dark': '#151518',        // 最深背景
          'darker': '#0f0f12',      // 更深背景
          'accent': '#1e1e21',      // 强调背景
          'highlight': '#f59e0b',   // 高亮色
          'surface': '#1b1b1e',     // 表面背景 (原 zinc-900)
          'card': '#232326',        // 卡片背景 (原 zinc-800: #27272a)
          'hover': '#2c2c30',       // 悬停背景 (原 zinc-700: #3f3f46)
          'border': '#333338',      // 边框颜色 (原 zinc-700)
          // 文字颜色
          'text': '#e4e4e7',        // 主要文字 (原 zinc-200)
          'text-secondary': '#a1a1aa', // 次要文字 (原 zinc-400)
          'text-muted': '#71717a',  // 弱化文字 (原 zinc-500)
        }
      }
    },
  },
  plugins: [],
}
