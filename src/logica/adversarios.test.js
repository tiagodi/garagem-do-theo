import { describe, it, expect } from 'vitest'
import { criarAdversarios, velocidadeAlvo, simularCorrida, VELOCIDADE_BASE, COMPRIMENTO_PADRAO } from './adversarios.js'

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
    expect(velocidadeAlvo(adv(1300), 1000, COMPRIMENTO_PADRAO)).toBeLessThan(VELOCIDADE_BASE)
  })
  it('adversário muito atrás acelera', () => {
    expect(velocidadeAlvo(adv(400), 1000, COMPRIMENTO_PADRAO)).toBeGreaterThan(VELOCIDADE_BASE)
  })
  it('na reta final, o não ousado é mais lento que o ousado', () => {
    const final = COMPRIMENTO_PADRAO * 0.9
    expect(velocidadeAlvo(adv(final + 50), final, COMPRIMENTO_PADRAO)).toBeLessThan(velocidadeAlvo(adv(final + 50, true), final, COMPRIMENTO_PADRAO))
  })
  it('a reta final depende do total da corrida', () => {
    expect(velocidadeAlvo(adv(9050), 9000, 10000)).toBeLessThan(velocidadeAlvo(adv(9050), 9000, 20000))
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

describe('ritmo da corrida', () => {
  it('2 voltas de circuito: corrida de 50 a 60 s', () => {
    expect(VELOCIDADE_BASE).toBe(330)
    const segundos = COMPRIMENTO_PADRAO / VELOCIDADE_BASE
    expect(segundos).toBeGreaterThanOrEqual(50)
    expect(segundos).toBeLessThanOrEqual(60)
  })
})
