import { describe, it, expect } from 'vitest'
import { CIRCUITOS, criarCircuito } from './circuito.js'
import { curvaturas, moverLateral, naGrama, aFrente, colide, LIMITE_LATERAL, PX_POR_SEGMENTO } from './estrada.js'
import { VELOCIDADE_BASE } from './adversarios.js'

const circuitos = Object.entries(CIRCUITOS).map(([n, p]) => [n, criarCircuito(p)])

// Simula 2 voltas só com a lateral; dedoFn(curva) devolve -1, 0 ou 1.
function simular (c, dedoFn) {
  const curvas = curvaturas(c)
  const dt = 1 / 30
  let x = 0
  let max = 0
  for (let d = 0; d < 2 * c.comprimento;) {
    const curva = curvas[Math.floor(d / PX_POR_SEGMENTO) % curvas.length]
    const pct = naGrama(x) ? 0.6 : 1
    x = moverLateral({ x, dedo: dedoFn(curva), curva, pct, dt })
    max = Math.max(max, Math.abs(x))
    d += VELOCIDADE_BASE * pct * dt
  }
  return max
}

describe.each(circuitos)('circuito %s', (_n, c) => {
  it('curvas visíveis e limitadas, no sentido horário', () => {
    const curvas = curvaturas(c)
    expect(curvas.length).toBe(Math.floor(c.comprimento / PX_POR_SEGMENTO))
    const max = Math.max(...curvas.map(Math.abs))
    expect(max).toBeGreaterThanOrEqual(2.5)
    expect(max).toBeLessThanOrEqual(4)
    expect(curvas.reduce((a, b) => a + b, 0)).toBeGreaterThan(0)
  })
  it('sem o dedo, nunca vai para a grama', () => {
    expect(simular(c, () => 0)).toBeLessThan(0.9)
  })
  it('dedo sempre para fora da curva: nunca passa do limite', () => {
    expect(simular(c, curva => (curva > 0 ? -1 : 1))).toBeLessThanOrEqual(LIMITE_LATERAL)
  })
})

describe('moverLateral', () => {
  it('dedo à direita por 1 s numa reta passa de 0.8', () => {
    let x = 0
    for (let i = 0; i < 30; i++) x = moverLateral({ x, dedo: 1, curva: 0, pct: 1, dt: 1 / 30 })
    expect(x).toBeGreaterThan(0.8)
  })
})

describe('objetos', () => {
  const L = 9000
  it('aFrente mede para frente, passando pela largada', () => {
    expect(aFrente(30, L - 20, L)).toBe(50)
    expect(aFrente(10, 20, L)).toBe(L - 10)
  })
  it('colide só perto, à frente e na mesma faixa', () => {
    expect(colide(0.2, 5, 0)).toBe(true)
    expect(colide(0.2, L - 5, 0)).toBe(false)
    expect(colide(0.5, 5, 0)).toBe(false)
  })
  it('passo grande (nitro em celular lento) não pula o objeto', () => {
    expect(colide(0, 28, 0, 30)).toBe(true)
    expect(colide(0, 28, 0)).toBe(false)
  })
})
