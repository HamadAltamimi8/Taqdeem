
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Taqdeem/',
  define: {
    // هذا السطر يمنع خطأ "process is not defined" الذي يسبب الشاشة البيضاء
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
