import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署配置
  // 如果部署到 https://<username>.github.io/<repo>/ 需要设置 base
  // 如果部署到 https://<username>.github.io/ 则设为 '/'
  base: '/dive-logs/',
})
