import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env, // Optional fallback
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',  // Flask backend
        changeOrigin: true,
      },
    },
  },
})
