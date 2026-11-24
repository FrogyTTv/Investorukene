import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build also works on GitHub Pages (served from /<repo>/).
  base: './',
  plugins: [react(), tailwindcss()],
})
