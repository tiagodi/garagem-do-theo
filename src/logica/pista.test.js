import { describe, it, expect } from 'vitest'
import { gerarObjetos, gerarCenario } from './pista.js'
import { CIRCUITOS, LARGURA_PISTA, criarCircuito, maisProximo } from './circuito.js'

function lcg (semente) {
  let s = semente
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
}

const pistas = Array.from({ length: 50 }, (_, i) => gerarObjetos(lcg(i + 1), 9000))
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

describe('gerarObjetos na volta', () => {
  it('cabe na volta: último objeto antes de L - 300', () => {
    for (const p of pistas) expect(Math.max(...p.map(o => o.pos))).toBeLessThan(8700)
  })
})

describe.each(Object.entries(CIRCUITOS))('gerarCenario no circuito %s', (_n, pontos) => {
  const c = criarCircuito(pontos)
  const cenarios = [1, 2, 3].map(s => gerarCenario(lcg(s), c))
  it('nada em cima do asfalto (nem de outro trecho)', () => {
    for (const cen of cenarios) {
      expect(cen.length).toBeGreaterThan(10)
      for (const e of cen) expect(Math.abs(maisProximo(c, e.x, e.y).afastamento)).toBeGreaterThanOrEqual(LARGURA_PISTA / 2 + 80)
    }
  })
  it('1 ou 2 arquibancadas, só tipos conhecidos', () => {
    for (const cen of cenarios) {
      const arq = cen.filter(e => e.tipo === 'arquibancada').length
      expect(arq).toBeGreaterThanOrEqual(1)
      expect(arq).toBeLessThanOrEqual(2)
      for (const e of cen) expect(['arvore_g', 'arvore_p', 'pedra_1', 'pedra_2', 'pedra_3', 'tenda_v', 'tenda_a', 'arquibancada']).toContain(e.tipo)
    }
  })
})
