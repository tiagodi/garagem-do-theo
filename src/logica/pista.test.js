import { describe, it, expect } from 'vitest'
import { gerarObjetos, gerarEnfeites } from './pista.js'

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

describe('gerarEnfeites', () => {
  const L = 9000
  const enfeites = gerarEnfeites(lcg(5), L)
  it('fora do asfalto, alternando os lados', () => {
    const comuns = enfeites.filter(e => e.tipo !== 'arquibancada')
    expect(comuns.length).toBeGreaterThan(40)
    for (const e of comuns) expect(Math.abs(e.x)).toBeGreaterThanOrEqual(1.5)
    for (let i = 1; i < comuns.length; i++) expect(Math.sign(comuns[i].x)).toBe(-Math.sign(comuns[i - 1].x))
  })
  it('duas arquibancadas perto da largada, do lado de fora', () => {
    const arq = enfeites.filter(e => e.tipo === 'arquibancada')
    expect(arq.map(a => a.d).sort((a, b) => a - b)).toEqual([150, L - 150])
    for (const a of arq) expect(a.x).toBe(-2)
  })
  it('só tipos conhecidos, dentro da volta', () => {
    for (const e of enfeites) {
      expect(['arvore', 'pinheiro', 'pedra', 'tenda', 'arquibancada']).toContain(e.tipo)
      expect(e.d).toBeGreaterThanOrEqual(0)
      expect(e.d).toBeLessThan(L)
    }
  })
})
