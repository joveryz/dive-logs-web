import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // divelogs.me 部署配置
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心库
          'vendor-react': ['react', 'react-dom'],
          // 图表库 (较大)
          'vendor-recharts': ['recharts'],
          // 状态管理
          'vendor-zustand': ['zustand'],
          // 图标库
          'vendor-icons': ['lucide-react'],
        },
      },
    },
    // 压缩配置
    minify: 'esbuild',
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 设置较大的 chunk 警告阈值（因为 recharts 本身就较大）
    chunkSizeWarningLimit: 300,
  },
})
