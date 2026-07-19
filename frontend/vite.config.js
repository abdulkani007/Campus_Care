import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://campus-care-6wzf.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})