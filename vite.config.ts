import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署配置
  base: '/dive-logs/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
