// Cache-first: o jogo funciona sem internet depois da primeira visita.
// O build insere no topo: self.LISTA = [...] e self.VERSAO = '...'.
const CACHE = 'garagem-' + (self.VERSAO || 'dev')

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([...new Set(['./', './index.html', ...(self.LISTA || [])])])))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(chaves => Promise.all(chaves.filter(k => k !== CACHE).map(k => caches.delete(k)))))
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)))
})
