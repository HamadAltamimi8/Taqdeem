import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // السلاش النقطي يجعل جميع المسارات نسبية، وهو الحل الأمثل لـ GitHub Pages
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // لضمان عدم حدوث أخطاء في الروابط عند رفعها
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // تمرير متغيرات البيئة بشكل صحيح
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env.NODE_ENV': JSON.stringify('production'),
  }
})