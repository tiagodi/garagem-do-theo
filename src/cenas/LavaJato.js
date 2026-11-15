import Phaser from 'phaser'
import { botao, FONTE } from '../ui.js'
import { tocar } from '../sons.js'
import { criarCarro } from '../carro.js'
import { porId } from '../logica/catalogo.js'
import { carregar, visualDe } from '../logica/salvar.js'
import { GradeSujeira } from '../logica/sujeira.js'

const CENTRO = { x: 360, y: 600 }
const ESCALA = 1.8
const RAIO_ESPONJA = 45
const LIMPO = 0.9

export default class LavaJato extends Phaser.Scene {
  constructor () { super('LavaJato') }

  init (dados) { this.dados = dados }

  create () {
    this.saindo = false
    this.ultimaAgua = 0
    const estado = carregar()
    const modelo = porId(estado.carroAtual)?.valor ?? 'carrinho'
    const carro = criarCarro(this, CENTRO.x, CENTRO.y, modelo, visualDe(estado, estado.carroAtual), ESCALA)

    const w = Math.ceil(carro.dims.w * ESCALA)
    const h = Math.ceil(carro.dims.h * ESCALA)
    this.origem = { x: CENTRO.x - w / 2, y: CENTRO.y - h / 2 }
    this.grade = new GradeSujeira(w, h)

    // Lama: forma do carro + manchas.
    const lama = this.make.graphics({ add: false })
    lama.fillStyle(0x795548, 0.9).fillRoundedRect(0, 0, w, h, 60)
    for (let i = 0; i < 40; i++) {
      lama.fillStyle(Phaser.Math.RND.pick([0x5D4037, 0x8D6E63, 0x4E342E]), 0.9)
      lama.fillCircle(Phaser.Math.Between(20, w - 20), Phaser.Math.Between(20, h - 20), Phaser.Math.Between(12, 34))
    }
    this.sujeira = this.add.renderTexture(this.origem.x, this.origem.y, w, h).setOrigin(0)
    this.sujeira.draw(lama)
    lama.destroy()
    this.esponja = this.make.graphics({ add: false }).fillStyle(0xFFFFFF).fillCircle(RAIO_ESPONJA, RAIO_ESPONJA, RAIO_ESPONJA)

    this.add.text(360, 140, '🧽', { fontSize: '120px', fontFamily: FONTE }).setOrigin(0.5)
    botao(this, 640, 90, '🏁', () => this.terminar(), 90)

    this.input.on('pointerdown', p => { this.ultimo = { x: p.x, y: p.y }; this.esfregar(p) })
    this.input.on('pointermove', p => { if (p.isDown) this.esfregar(p) })
  }

  esfregar (p) {
    if (this.limpo) return
    // Dedada rápida gera poucos eventos: limpa o caminho todo desde o último ponto.
    const de = this.ultimo ?? p
    const passos = Math.max(1, Math.ceil(Phaser.Math.Distance.Between(de.x, de.y, p.x, p.y) / (RAIO_ESPONJA / 2)))
    for (let i = 1; i <= passos; i++) {
      const lx = de.x + (p.x - de.x) * i / passos - this.origem.x
      const ly = de.y + (p.y - de.y) * i / passos - this.origem.y
      this.sujeira.erase(this.esponja, lx - RAIO_ESPONJA, ly - RAIO_ESPONJA)
      this.grade.limpar(lx, ly, RAIO_ESPONJA)
    }
    this.ultimo = { x: p.x, y: p.y }

    const bolha = this.add.circle(p.x + Phaser.Math.Between(-30, 30), p.y, Phaser.Math.Between(8, 20), 0xFFFFFF, 0.8)
    this.tweens.add({ targets: bolha, y: p.y - 120, alpha: 0, duration: 700, onComplete: () => bolha.destroy() })
    if (this.time.now - this.ultimaAgua > 150) {
      this.ultimaAgua = this.time.now
      tocar('agua')
    }

    if (this.grade.fracaoLimpa() >= LIMPO) this.brilhar()
  }

  brilhar () {
    this.limpo = true
    this.tweens.add({ targets: this.sujeira, alpha: 0, duration: 300 })
    tocar('estrela')
    for (let i = 0; i < 8; i++) {
      const brilho = this.add.text(CENTRO.x + Phaser.Math.Between(-150, 150), CENTRO.y + Phaser.Math.Between(-220, 220), '✨', { fontSize: '64px', fontFamily: FONTE }).setOrigin(0.5).setScale(0)
      this.tweens.add({ targets: brilho, scale: 1, duration: 300, delay: i * 80, yoyo: true, hold: 300 })
    }
    this.time.delayedCall(1000, () => this.terminar())
  }

  terminar () {
    if (this.saindo) return
    this.saindo = true
    this.scene.start('Presente', this.dados)
  }
}
