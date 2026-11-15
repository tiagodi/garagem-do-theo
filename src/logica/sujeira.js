// Grade de células sujas sobre o carro; cada esfregada limpa as células perto do dedo.
export class GradeSujeira {
  constructor (largura, altura, celula = 20) {
    this.celula = celula
    this.cols = Math.ceil(largura / celula)
    this.linhas = Math.ceil(altura / celula)
    this.limpas = new Uint8Array(this.cols * this.linhas)
    this.totalLimpas = 0
  }

  limpar (x, y, raio) {
    const c = this.celula
    const c0 = Math.max(0, Math.floor((x - raio) / c))
    const c1 = Math.min(this.cols - 1, Math.floor((x + raio) / c))
    const l0 = Math.max(0, Math.floor((y - raio) / c))
    const l1 = Math.min(this.linhas - 1, Math.floor((y + raio) / c))
    for (let l = l0; l <= l1; l++) {
      for (let col = c0; col <= c1; col++) {
        const i = l * this.cols + col
        if (this.limpas[i]) continue
        const dx = (col + 0.5) * c - x
        const dy = (l + 0.5) * c - y
        if (dx * dx + dy * dy <= raio * raio) {
          this.limpas[i] = 1
          this.totalLimpas++
        }
      }
    }
  }

  fracaoLimpa () {
    return this.totalLimpas / this.limpas.length
  }
}
