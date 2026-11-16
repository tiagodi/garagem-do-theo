import { describe, it, expect } from 'vitest'
import { CIRCUITOS, LARGURA_PISTA, criarCircuito, pontoNa } from './circuito.js'
import { novoAngulo, simularVoltas, GIRO_MAX } from './direcao.js'

const circuitos = Object.entries(CIRCUITOS).map(([nome, p]) => [nome, criarCircuito(p)])

// Dedo a `dist` px do carro, na direção (ângulo da pista + giro).
const dedoA = (c, dist, giro) => e => {
  const p = pontoNa(c, e.d)
  return { x: e.x + Math.cos(p.angulo + giro) * dist, y: e.y + Math.sin(p.angulo + giro) * dist }
}

describe.each(circuitos)('circuito %s', (_nome, c) => {
  it('sem dedo, completa 2 voltas no centro, em 50 a 60 s', () => {
    const r = simularVoltas(c, 2, () => null)
    expect(r.completou).toBe(true)
    expect(r.maxAfastamento).toBeLessThan(120)
    expect(r.segundos).toBeGreaterThanOrEqual(50)
    expect(r.segundos).toBeLessThanOrEqual(60)
  })

  it('dedo puxando para fora o tempo todo: volta sempre e termina', () => {
    for (const lado of [-1, 1]) {
      const r = simularVoltas(c, 2, dedoA(c, 300, lado * Math.PI / 2))
      expect(r.completou).toBe(true)
      expect(r.maxAfastamento).toBeLessThan(LARGURA_PISTA / 2 + 200)
      expect(r.segundos).toBeLessThan(80)
    }
  })

  it('dedo atrás do carro: nunca anda de ré', () => {
    const r = simularVoltas(c, 2, dedoA(c, 300, Math.PI), { maxSegundos: 2 })
    expect(r.percorrido).toBeGreaterThan(300)
  })
})

describe('novoAngulo', () => {
  const base = { angulo: 0, x: 0, y: 0, alvoPista: { x: 250, y: 50 }, tangente: 0, afastamento: 0, dt: 1 / 30 }

  it('dedo a menos de 40 px é ignorado', () => {
    expect(novoAngulo({ ...base, dedo: { x: 0, y: 20 } })).toBe(novoAngulo({ ...base, dedo: null }))
  })

  it('giro limitado por GIRO_MAX', () => {
    const novo = novoAngulo({ ...base, dedo: { x: 0, y: 300 }, dt: 0.1 })
    expect(Math.abs(novo - base.angulo)).toBeLessThanOrEqual(GIRO_MAX * 0.1 + 1e-9)
  })

  it('perto do centro, quem manda é o dedo', () => {
    const novo = novoAngulo({ ...base, dedo: { x: 300, y: -300 }, dt: 10 })
    expect(novo).toBeCloseTo(-Math.PI / 4, 5)
  })
})
