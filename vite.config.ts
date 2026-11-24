import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build also works on GitHub Pages (served from /<repo>/).
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // Two separate pages: the device emulator (index.html) and the Saldo app itself (app.html).
      input: { emulator: 'index.html', app: 'app.html' },
    },
  },
})
