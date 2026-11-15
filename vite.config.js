import { defineConfig } from 'vite'

// base relativa: o GitHub Pages serve o jogo num subcaminho.
// Phaser sozinho passa de 1 MB; o aviso de chunk grande não ajuda aqui.
export default defineConfig({ base: './', build: { chunkSizeWarningLimit: 2000 } })
