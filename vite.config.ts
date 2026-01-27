import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/xuya-BOCI/', // 如果部署到 GitHub Pages 子路径，请启用此行
  base: './',             // 使用相对路径，适配 Vercel 和大多数部署环境
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true,
  },
})
