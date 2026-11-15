import { describe, it, expect } from 'vitest'
import { GradeSujeira } from './sujeira.js'

describe('GradeSujeira', () => {
  it('começa toda suja', () => {
    expect(new GradeSujeira(200, 400).fracaoLimpa()).toBe(0)
  })
  it('raio enorme limpa tudo', () => {
    const g = new GradeSujeira(200, 400)
    g.limpar(100, 200, 10000)
    expect(g.fracaoLimpa()).toBe(1)
  })
  it('limpar a metade esquerda dá cerca de metade', () => {
    const g = new GradeSujeira(200, 400)
    for (let y = 0; y <= 400; y += 10) g.limpar(50, y, 50)
    expect(g.fracaoLimpa()).toBeGreaterThan(0.4)
    expect(g.fracaoLimpa()).toBeLessThan(0.6)
  })
  it('limpar fora da grade não quebra', () => {
    const g = new GradeSujeira(200, 400)
    expect(() => g.limpar(-500, 9999, 30)).not.toThrow()
    expect(g.fracaoLimpa()).toBe(0)
  })
})
