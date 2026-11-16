import { describe, it, expect } from 'vitest'
import { CIRCUITOS, LARGURA_PISTA, criarCircuito, pontoNa } from './circuito.js'

for (const [nome, pontos] of Object.entries(CIRCUITOS)) {
  describe(`circuito ${nome}`, () => {
    const c = criarCircuito(pontos)
    const L = c.comprimento

    it('volta entre 8500 e 9500 px', () => {
      expect(L).toBeGreaterThanOrEqual(8500)
      expect(L).toBeLessThanOrEqual(9500)
    })

    it('laço fechado', () => {
      const a = c.amostras[0]
      const z = c.amostras[c.amostras.length - 1]
      expect(Math.hypot(a.x - z.x, a.y - z.y)).toBeLessThanOrEqual(25)
    })

    it('trechos distantes na linha não se encostam', () => {
      const s = c.amostras.filter((_, i) => i % 3 === 0)
      let menor = Infinity
      for (let i = 0; i < s.length; i++) {
        for (let j = i + 1; j < s.length; j++) {
          const ao = Math.abs(s[i].d - s[j].d)
          if (Math.min(ao, L - ao) <= 1000) continue
          menor = Math.min(menor, Math.hypot(s[i].x - s[j].x, s[i].y - s[j].y))
        }
      }
      expect(menor).toBeGreaterThanOrEqual(LARGURA_PISTA + 200)
    })

    it('pontoNa aceita d negativo e maior que a volta', () => {
      const a = pontoNa(c, -100)
      const b = pontoNa(c, L - 100)
      const d = pontoNa(c, 2 * L - 100)
      expect(a.x).toBeCloseTo(b.x, 5)
      expect(a.y).toBeCloseTo(b.y, 5)
      expect(d.x).toBeCloseTo(b.x, 5)
    })

  })
}
