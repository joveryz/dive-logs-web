import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  //server:{
  //  host:'172.16.68.151',
  //  port:8000
  //},
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React 核心库
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          // 图表库 (较大)
          if (id.includes('node_modules/recharts')) {
            return 'vendor-recharts';
          }
          // 状态管理
          if (id.includes('node_modules/zustand')) {
            return 'vendor-zustand';
          }
          // 图标库
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // CSV 数据文件单独打包
          if (id.includes('.csv')) {
            return 'dive-data';
          }
        },
      },
    },
    // 压缩配置
    minify: 'esbuild',
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // CSV 数据较大，提高警告阈值
    chunkSizeWarningLimit: 500,
  },
})
