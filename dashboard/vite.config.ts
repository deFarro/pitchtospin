import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const apiTarget = process.env.API_URL || 'http://localhost:3000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    host: true,
    watch: { usePolling: true },
    proxy: {
      '/api': apiTarget,
    },
  },
})
