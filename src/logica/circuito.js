// Circuitos fechados: linha central suavizada (Catmull-Rom) que serve à pista, aos adversários, à assistência e às voltas.
export const LARGURA_PISTA = 360
const PASSO = 20 // px entre amostras

const elipse = (cx, cy, rx, ry, n, puxar = () => 0) => Array.from({ length: n }, (_, i) => {
  const t = Math.PI / 2 + (i / n) * Math.PI * 2 // começa embaixo, sentido horário na tela
  const k = 1 - puxar(i)
  return [Math.round(cx + Math.cos(t) * rx * k), Math.round(cy + Math.sin(t) * ry * k)]
})

const escalar = (k, pts) => pts.map(([x, y]) => [Math.round(2200 + (x - 2200) * k), Math.round(1650 + (y - 1650) * k)])

// Sentido horário (y para baixo): a esquerda do sentido de marcha é sempre o lado de fora.
export const CIRCUITOS = {
  oval: elipse(2200, 1650, 1700, 1150, 14),
  feijao: elipse(2200, 1650, 1850, 1250, 14, i => ({ 9: 0.25, 10: 0.42, 11: 0.25 })[i] ?? 0),
  serpente: escalar(0.84, [
    [2300, 2900], [1700, 2900], [1250, 2500], [700, 2700], [450, 2300], [450, 1300],
    [800, 600], [1700, 450], [2600, 450], [3500, 600], [3950, 1300], [3950, 2300],
    [3600, 2800], [3050, 2500]
  ])
}

function catmull (p0, p1, p2, p3, t) {
  const t2 = t * t
  const t3 = t2 * t
  const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]
}

export function criarCircuito (pontos) {
  const n = pontos.length
  // Linha densa; depois reamostrada a cada PASSO px.
  const densa = []
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [-1, 0, 1, 2].map(k => pontos[(i + k + n) % n])
    for (let s = 0; s < 40; s++) densa.push(catmull(p0, p1, p2, p3, s / 40))
  }
  densa.push(densa[0])
  const amostras = [{ x: densa[0][0], y: densa[0][1], d: 0 }]
  let d = 0
  let proxima = PASSO
  for (let i = 1; i < densa.length; i++) {
    const [ax, ay] = densa[i - 1]
    const [bx, by] = densa[i]
    const seg = Math.hypot(bx - ax, by - ay)
    while (proxima < d + seg) {
      const t = (proxima - d) / seg
      amostras.push({ x: ax + (bx - ax) * t, y: ay + (by - ay) * t, d: proxima })
      proxima += PASSO
    }
    d += seg
  }
  return { amostras, comprimento: d }
}

const modulo = (d, L) => ((d % L) + L) % L

export function pontoNa (c, d) {
  const { amostras: a, comprimento: L } = c
  const dm = modulo(d, L)
  const i = Math.min(Math.floor(dm / PASSO), a.length - 1)
  const p = a[i]
  const q = a[(i + 1) % a.length]
  const seg = (i + 1 < a.length ? q.d : L) - p.d
  const t = seg > 0 ? (dm - p.d) / seg : 0
  return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t, angulo: Math.atan2(q.y - p.y, q.x - p.x) }
}
