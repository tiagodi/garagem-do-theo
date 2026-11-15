import { it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

// Cache.addAll rejeita requisições repetidas: a instalação inteira falharia.
it('service worker não pede o mesmo arquivo duas vezes ao cache', async () => {
  const codigo = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8')
  const ouvintes = {}
  let pedidos = null
  const self = {
    LISTA: ['./assets/index-x.js', './index.html', './manifest.webmanifest'],
    addEventListener: (tipo, fn) => { ouvintes[tipo] = fn },
    skipWaiting () {}
  }
  const caches = { open: async () => ({ addAll: async lista => { pedidos = lista } }) }
  new Function('self', 'caches', codigo)(self, caches)
  let espera
  ouvintes.install({ waitUntil: p => { espera = p } })
  await espera
  expect(pedidos).toContain('./index.html')
  expect(new Set(pedidos).size).toBe(pedidos.length)
})
