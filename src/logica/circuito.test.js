import { describe, it, expect } from 'vitest'
import { CIRCUITOS, LARGURA_PISTA, criarCircuito, pontoNa, maisProximo, avancar } from './circuito.js'

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

    it('maisProximo devolve d e afastamento com sinal (direita positiva)', () => {
      const p = pontoNa(c, 3000)
      // direita do sentido de marcha (y para baixo): ângulo + 90°
      const x = p.x + Math.cos(p.angulo + Math.PI / 2) * 100
      const y = p.y + Math.sin(p.angulo + Math.PI / 2) * 100
      for (const dica of [undefined, 2900]) {
        const r = maisProximo(c, x, y, dica)
        expect(Math.abs(r.d - 3000)).toBeLessThanOrEqual(30)
        expect(Math.abs(r.afastamento - 100)).toBeLessThanOrEqual(10)
      }
    })

    it('pontoNa aceita d negativo e maior que a volta', () => {
      const a = pontoNa(c, -100)
      const b = pontoNa(c, L - 100)
      const d = pontoNa(c, 2 * L - 100)
      expect(a.x).toBeCloseTo(b.x, 5)
      expect(a.y).toBeCloseTo(b.y, 5)
      expect(d.x).toBeCloseTo(b.x, 5)
    })

    it('avancar desdobra a passagem pela largada', () => {
      expect(avancar(9000, L - 50, 30, L)).toBeCloseTo(9080, 5)
      expect(avancar(100, 30, L - 20, L)).toBeCloseTo(50, 5)
    })
  })
}
