import { describe, it, expect } from 'vitest'
import { gerarObjetos, gerarCenario } from './pista.js'

function lcg (semente) {
  let s = semente
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
}

const pistas = Array.from({ length: 50 }, (_, i) => gerarObjetos(lcg(i + 1)))
const OBSTACULOS = ['cone', 'oleo', 'pneus']

describe('gerarObjetos', () => {
  it('nenhum obstáculo antes de 800 px', () => {
    for (const p of pistas) expect(p.filter(o => OBSTACULOS.includes(o.tipo) && o.pos < 800)).toEqual([])
  })
  it('nitros a pelo menos 1500 px um do outro', () => {
    for (const p of pistas) {
      const nitros = p.filter(o => o.tipo === 'nitro').map(o => o.pos)
      for (let i = 1; i < nitros.length; i++) expect(nitros[i] - nitros[i - 1]).toBeGreaterThanOrEqual(1500)
    }
  })
  it('no máximo 1 objeto por altura e só tipos conhecidos', () => {
    for (const p of pistas) {
      expect(new Set(p.map(o => o.pos)).size).toBe(p.length)
      for (const o of p) {
        expect(['estrela', 'nitro', ...OBSTACULOS]).toContain(o.tipo)
        expect([0, 1, 2]).toContain(o.faixa)
      }
    }
  })
  it('os três tipos de obstáculo aparecem', () => {
    const tipos = new Set(pistas.flat().map(o => o.tipo))
    for (const t of OBSTACULOS) expect(tipos).toContain(t)
  })
})

describe('gerarCenario', () => {
  const cenario = gerarCenario(lcg(7))
  it('alterna os lados', () => {
    for (let i = 1; i < cenario.length; i++) expect(cenario[i].lado).toBe(-cenario[i - 1].lado)
  })
  it('arquibancadas a pelo menos 2000 px uma da outra', () => {
    const arq = gerarCenario(lcg(3)).concat().filter(c => c.tipo === 'arquibancada').map(c => c.pos)
    for (let i = 1; i < arq.length; i++) expect(arq[i] - arq[i - 1]).toBeGreaterThanOrEqual(2000)
  })
})
