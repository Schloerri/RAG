import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.mp3', '**/*.wav', '**/*.ogg'],
  server: {
    host: true,
    port: 5173
  },
  build: {
    assetsDir: 'assets'
  }
}) 