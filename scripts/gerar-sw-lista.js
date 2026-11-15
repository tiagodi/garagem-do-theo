// Depois do build: lista os arquivos de dist/ no topo do dist/sw.js para o cache offline.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const DIST = 'dist'

function arquivos (dir) {
  return readdirSync(dir).flatMap(nome => {
    const caminho = join(dir, nome)
    return statSync(caminho).isDirectory() ? arquivos(caminho) : [caminho]
  })
}

const lista = arquivos(DIST)
  .map(f => './' + relative(DIST, f).split('\\').join('/'))
  .filter(f => f !== './sw.js')

const sw = join(DIST, 'sw.js')
const cabecalho = `self.LISTA=${JSON.stringify(lista)};self.VERSAO=${JSON.stringify(String(Date.now()))};\n`
writeFileSync(sw, cabecalho + readFileSync(sw, 'utf8'))
console.log(`sw.js: ${lista.length} arquivos no cache`)
