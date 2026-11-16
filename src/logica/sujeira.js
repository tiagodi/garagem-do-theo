// Grade de células sobre o carro: suja → ensaboada (esponja) → limpa (jato de água).
export const SUJO = 0
export const ENSABOADO = 1
export const LIMPO = 2

export class GradeSujeira {
  constructor (largura, altura, celula = 20) {
    this.celula = celula
    this.cols = Math.ceil(largura / celula)
    this.linhas = Math.ceil(altura / celula)
    this.estado = new Uint8Array(this.cols * this.linhas)
    this.totalLimpas = 0
  }

  // Chama fn(i, col, linha) para cada célula cujo centro está no círculo.
  celulasNoCirculo (x, y, raio, fn) {
    const c = this.celula
    const c0 = Math.max(0, Math.floor((x - raio) / c))
    const c1 = Math.min(this.cols - 1, Math.floor((x + raio) / c))
    const l0 = Math.max(0, Math.floor((y - raio) / c))
    const l1 = Math.min(this.linhas - 1, Math.floor((y + raio) / c))
    for (let l = l0; l <= l1; l++) {
      for (let col = c0; col <= c1; col++) {
        const dx = (col + 0.5) * c - x
        const dy = (l + 0.5) * c - y
        if (dx * dx + dy * dy <= raio * raio) fn(l * this.cols + col, col, l)
      }
    }
  }

  ensaboar (x, y, raio) {
    this.celulasNoCirculo(x, y, raio, i => { if (this.estado[i] === SUJO) this.estado[i] = ENSABOADO })
  }

  // Limpa só o que tem espuma. `celulas` (canto em px) é o que a cena apaga; `naLama` conta células ainda sem sabão.
  enxaguar (x, y, raio) {
    const r = { limpou: 0, naLama: 0, celulas: [] }
    this.celulasNoCirculo(x, y, raio, (i, col, l) => {
      if (this.estado[i] === SUJO) r.naLama++
      else if (this.estado[i] === ENSABOADO) {
        this.estado[i] = LIMPO
        this.totalLimpas++
        r.limpou++
        r.celulas.push({ x: col * this.celula, y: l * this.celula })
      }
    })
    return r
  }

  fracaoLimpa () {
    return this.totalLimpas / this.estado.length
  }
}
