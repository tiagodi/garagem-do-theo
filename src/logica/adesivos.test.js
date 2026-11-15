import { describe, it, expect } from 'vitest'
import { colarAdesivo, moverAdesivo, MAX_ADESIVOS } from './adesivos.js'

const visual = (n = 0) => ({ cor: 1, adesivos: Array.from({ length: n }, (_, i) => ({ emoji: '⭐', x: 0, y: i / 10 })) })

describe('colarAdesivo', () => {
  it('cola o primeiro', () => {
    expect(colarAdesivo(visual(), '🦖', 0.2, -0.3).adesivos).toEqual([{ emoji: '🦖', x: 0.2, y: -0.3 }])
  })
  it('não passa de 8', () => {
    expect(MAX_ADESIVOS).toBe(8)
    expect(colarAdesivo(visual(8), '🦖', 0, 0).adesivos).toHaveLength(8)
  })
  it('fora do carro não cola', () => {
    const v = visual()
    expect(colarAdesivo(v, '🦖', 1.5, 0)).toBe(v)
  })
  it('não altera o visual recebido', () => {
    const v = visual(1)
    colarAdesivo(v, '🦖', 0, 0)
    expect(v.adesivos).toHaveLength(1)
  })
})

describe('moverAdesivo', () => {
  it('arrastar para fora remove', () => {
    expect(moverAdesivo(visual(2), 0, 0, -1.2).adesivos).toEqual([{ emoji: '⭐', x: 0, y: 0.1 }])
  })
  it('arrastar para dentro atualiza a posição', () => {
    expect(moverAdesivo(visual(1), 0, 0.5, 0.5).adesivos[0]).toEqual({ emoji: '⭐', x: 0.5, y: 0.5 })
  })
  it('não altera o visual recebido', () => {
    const v = visual(1)
    moverAdesivo(v, 0, 0.5, 0.5)
    expect(v.adesivos[0].x).toBe(0)
  })
})
