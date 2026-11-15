import { defineConfig } from 'vite'
import { execSync } from 'node:child_process'

// Versão exibida na tela inicial: data/hora do build (horário de Brasília) + commit.
function versao () {
  let sha = process.env.GITHUB_SHA?.slice(0, 7)
  if (!sha) {
    try { sha = execSync('git rev-parse --short HEAD').toString().trim() } catch { sha = 'local' }
  }
  const data = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  }).format(new Date()).replace(',', '')
  return `${data} · ${sha}`
}

// base relativa: o GitHub Pages serve o jogo num subcaminho.
// Phaser sozinho passa de 1 MB; o aviso de chunk grande não ajuda aqui.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 2000 },
  define: { __VERSAO__: JSON.stringify(versao()) }
})
