import { describe, it, expect } from 'vitest'
import { criarAdversarios, velocidadeAlvo, simularCorrida, VELOCIDADE_BASE, COMPRIMENTO_PISTA } from './adversarios.js'

// Gerador pseudoaleatório com semente (LCG), para o teste ser repetível.
function lcg (semente) {
  let s = semente
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
}

const adv = (pos, ousado = false) => ({ faixa: 0, pos, vel: VELOCIDADE_BASE, ousado })

describe('criarAdversarios', () => {
  it('cria 3, sem ousado quando o sorteio é alto', () => {
    const lista = criarAdversarios(() => 0.99)
    expect(lista).toHaveLength(3)
    expect(lista.filter(a => a.ousado)).toHaveLength(0)
  })
  it('exatamente 1 ousado quando o sorteio é baixo', () => {
    expect(criarAdversarios(() => 0.01).filter(a => a.ousado)).toHaveLength(1)
  })
})

describe('velocidadeAlvo', () => {
  it('adversário na frente desacelera', () => {
    expect(velocidadeAlvo(adv(1300), 1000)).toBeLessThan(VELOCIDADE_BASE)
  })
  it('adversário muito atrás acelera', () => {
    expect(velocidadeAlvo(adv(400), 1000)).toBeGreaterThan(VELOCIDADE_BASE)
  })
  it('na reta final, o não ousado é mais lento que o ousado', () => {
    const final = COMPRIMENTO_PISTA * 0.9
    expect(velocidadeAlvo(adv(final + 50), final)).toBeLessThan(velocidadeAlvo(adv(final + 50, true), final))
  })
})

describe('simularCorrida', () => {
  it('Theo nunca fica em 3º ou 4º e ganha entre 75% e 95%', () => {
    const rng = lcg(42)
    const posicoes = Array.from({ length: 500 }, () => simularCorrida(rng))
    expect(Math.max(...posicoes)).toBeLessThanOrEqual(2)
    const vitorias = posicoes.filter(p => p === 1).length / 500
    expect(vitorias).toBeGreaterThanOrEqual(0.75)
    expect(vitorias).toBeLessThanOrEqual(0.95)
  })
})
