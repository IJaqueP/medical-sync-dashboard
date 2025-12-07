import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/medical-sync-dashboard/', // Nombre de tu repositorio
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
