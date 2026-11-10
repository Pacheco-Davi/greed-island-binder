import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // No GitHub Pages o site fica numa subpasta: pacheco-davi.github.io/greed-island-binder/.
  // O Vite usa este caminho para montar os endereços de JS, CSS, imagens e favicon.
  base: '/greed-island-binder/',
})
