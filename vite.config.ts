/// <reference types="vite/client" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { execSync } from 'child_process'

// 获取 Git commit id 和构建时间
function getGitCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

function getBuildDate(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_COMMIT_HASH__: JSON.stringify(getGitCommitHash()),
    __APP_BUILD_DATE__: JSON.stringify(getBuildDate()),
  },
  server: {
    host: true, // 监听所有网络接口，允许局域网访问
    port: 8000,
  },
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
        // 确保所有资源文件名都包含哈希
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
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
