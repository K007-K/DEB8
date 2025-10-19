import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://deb8.onrender.com',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'https://deb8.onrender.com',
        ws: true
      }
    }
  }
})
