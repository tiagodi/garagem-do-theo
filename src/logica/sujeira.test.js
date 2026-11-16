import { describe, it, expect } from 'vitest'
import { GradeSujeira } from './sujeira.js'

describe('GradeSujeira', () => {
  it('começa toda suja', () => {
    expect(new GradeSujeira(200, 400).fracaoLimpa()).toBe(0)
  })
  it('jato sem espuma não limpa e avisa que acertou lama', () => {
    const g = new GradeSujeira(200, 400)
    const r = g.enxaguar(100, 200, 60)
    expect(g.fracaoLimpa()).toBe(0)
    expect(r.limpou).toBe(0)
    expect(r.naLama).toBeGreaterThan(0)
  })
  it('ensaboar e enxaguar tudo limpa tudo', () => {
    const g = new GradeSujeira(200, 400)
    g.ensaboar(100, 200, 10000)
    expect(g.fracaoLimpa()).toBe(0)
    const r = g.enxaguar(100, 200, 10000)
    expect(g.fracaoLimpa()).toBe(1)
    expect(r.naLama).toBe(0)
    expect(r.limpou).toBeGreaterThan(0)
  })
  it('só a metade ensaboada fica limpa', () => {
    const g = new GradeSujeira(200, 400)
    for (let y = 0; y <= 400; y += 10) g.ensaboar(50, y, 50)
    g.enxaguar(100, 200, 10000)
    expect(g.fracaoLimpa()).toBeGreaterThan(0.4)
    expect(g.fracaoLimpa()).toBeLessThan(0.6)
  })
  it('enxaguar devolve as células limpas para apagar na tela', () => {
    const g = new GradeSujeira(200, 400)
    g.ensaboar(10, 10, 15)
    const r = g.enxaguar(10, 10, 15)
    expect(r.celulas.length).toBe(r.limpou)
    for (const c of r.celulas) expect(c).toEqual({ x: expect.any(Number), y: expect.any(Number) })
  })
  it('fora da grade não quebra', () => {
    const g = new GradeSujeira(200, 400)
    expect(() => { g.ensaboar(-500, 9999, 30); g.enxaguar(-500, 9999, 30) }).not.toThrow()
    expect(g.fracaoLimpa()).toBe(0)
  })
})
