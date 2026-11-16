import Phaser from 'phaser'
import { botao, FONTE } from '../ui.js'
import { tocar } from '../sons.js'
import { criarCarro } from '../carro.js'
import { porId } from '../logica/catalogo.js'
import { carregar, visualDe } from '../logica/salvar.js'
import { GradeSujeira } from '../logica/sujeira.js'

const CENTRO = { x: 360, y: 600 }
const ESCALA = 1.8
const RAIO = 45
const LIMPO = 0.9
const BARRA_Y = 1050 // abaixo disso ficam as ferramentas: tocar ali não lava
const FERRAMENTAS = { esponja: { x: 250, emoji: '🧽' }, pistola: { x: 470, emoji: '🔫' } }
const Y_FERRAMENTA = 1150

// Lava-jato opcional, aberto pela garagem: 🧽 ensaboa, 🔫 enxágua só onde tem espuma.
export default class LavaJato extends Phaser.Scene {
  constructor () { super('LavaJato') }

  create () {
    // A cena é reaproveitada pelo Phaser: zera o estado da visita anterior.
    this.saindo = false
    this.limpo = false
    this.ultimo = null
    this.ultimoSom = 0
    this.ultimaDica = 0
    const estado = carregar()
    const modelo = porId(estado.carroAtual)?.valor ?? 'carrinho'
    const carro = criarCarro(this, CENTRO.x, CENTRO.y, modelo, visualDe(estado, estado.carroAtual), ESCALA)

    const w = Math.ceil(carro.dims.w * ESCALA)
    const h = Math.ceil(carro.dims.h * ESCALA)
    this.origem = { x: CENTRO.x - w / 2, y: CENTRO.y - h / 2 }
    this.grade = new GradeSujeira(w, h)

    // Lama: poeira por toda a forma do carro + manchas.
    const lama = this.make.graphics({ add: false })
    lama.fillStyle(0x8D6E63, 0.75).fillRoundedRect(0, 0, w, h, 60)
    for (let i = 0; i < 40; i++) {
      lama.fillStyle(Phaser.Math.RND.pick([0x5D4037, 0x795548, 0x4E342E]), 0.9)
      lama.fillCircle(Phaser.Math.Between(20, w - 20), Phaser.Math.Between(20, h - 20), Phaser.Math.Between(12, 34))
    }
    this.lama = this.add.renderTexture(this.origem.x, this.origem.y, w, h).setOrigin(0).draw(lama)
    lama.destroy()
    this.espuma = this.add.renderTexture(this.origem.x, this.origem.y, w, h).setOrigin(0)

    // Pincéis: bolo de espuma, círculo do jato e quadrado de uma célula.
    this.bolo = this.make.graphics({ add: false }).fillStyle(0xFFFFFF, 0.95)
    for (const [dx, dy, r] of [[0, 0, 30], [-22, -10, 20], [20, -14, 22], [-14, 18, 18], [18, 16, 20]]) this.bolo.fillCircle(RAIO + dx, RAIO + dy, r)
    this.circulo = this.make.graphics({ add: false }).fillStyle(0xFFFFFF).fillCircle(RAIO, RAIO, RAIO)
    const c = this.grade.celula
    this.quadrado = this.make.graphics({ add: false }).fillStyle(0xFFFFFF).fillRect(0, 0, c, c)
    this.jato = this.add.graphics().setDepth(5)

    // Ferramentas.
    this.destaque = this.add.circle(0, Y_FERRAMENTA, 85, 0xFFEB3B, 0.9)
    this.botoes = {}
    for (const [nome, f] of Object.entries(FERRAMENTAS)) this.botoes[nome] = botao(this, f.x, Y_FERRAMENTA, f.emoji, () => this.escolher(nome), 130)
    this.escolher('esponja')
    botao(this, 640, 90, '↩️', () => this.terminar(), 90)

    this.input.on('pointerdown', p => { this.ultimo = { x: p.x, y: p.y }; this.lavar(p) })
    this.input.on('pointermove', p => { if (p.isDown) this.lavar(p) })
    this.input.on('pointerup', () => { this.ultimo = null })
  }

  escolher (nome) {
    this.ferramenta = nome
    this.destaque.x = FERRAMENTAS[nome].x
  }

  lavar (p) {
    if (this.limpo || p.y > BARRA_Y) return
    // Dedada rápida gera poucos eventos: passa pelo caminho todo desde o último ponto.
    const de = this.ultimo ?? p
    const passos = Math.max(1, Math.ceil(Phaser.Math.Distance.Between(de.x, de.y, p.x, p.y) / (RAIO / 2)))
    let naLama = 0
    for (let i = 1; i <= passos; i++) {
      const lx = de.x + (p.x - de.x) * i / passos - this.origem.x
      const ly = de.y + (p.y - de.y) * i / passos - this.origem.y
      if (this.ferramenta === 'esponja') {
        this.espuma.draw(this.bolo, lx - RAIO, ly - RAIO)
        this.grade.ensaboar(lx, ly, RAIO)
      } else {
        this.espuma.erase(this.circulo, lx - RAIO, ly - RAIO)
        const r = this.grade.enxaguar(lx, ly, RAIO)
        for (const c of r.celulas) this.lama.erase(this.quadrado, c.x, c.y)
        naLama += r.naLama
      }
    }
    this.ultimo = { x: p.x, y: p.y }
    if (this.ferramenta === 'esponja') this.bolhas(p)
    else if (naLama > 0) this.dica(p)

    if (this.time.now - this.ultimoSom > 150) {
      this.ultimoSom = this.time.now
      tocar(this.ferramenta === 'esponja' ? 'espuma' : 'agua')
    }
    if (this.grade.fracaoLimpa() >= LIMPO) this.brilhar()
  }

  bolhas (p) {
    const bolha = this.add.circle(p.x + Phaser.Math.Between(-30, 30), p.y, Phaser.Math.Between(8, 20), 0xFFFFFF, 0.8).setStrokeStyle(2, 0x90CAF9)
    this.tweens.add({ targets: bolha, y: p.y - 120, alpha: 0, duration: 700, onComplete: () => bolha.destroy() })
  }

  // Jato na lama sem espuma: a lama brilha molhada e a esponja pisca.
  dica (p) {
    const molhado = this.add.circle(p.x, p.y, RAIO, 0x4FC3F7, 0.35)
    this.tweens.add({ targets: molhado, alpha: 0, duration: 500, onComplete: () => molhado.destroy() })
    if (this.time.now - this.ultimaDica < 1200) return
    this.ultimaDica = this.time.now
    this.tweens.add({ targets: this.botoes.esponja, scale: 1.3, duration: 180, yoyo: true, repeat: 2 })
  }

  update () {
    this.jato.clear()
    const p = this.input.activePointer
    if (this.ferramenta !== 'pistola' || !p.isDown || p.y > BARRA_Y || this.limpo) return
    const de = { x: FERRAMENTAS.pistola.x - 30, y: Y_FERRAMENTA - 50 }
    this.jato.lineStyle(26, 0x29B6F6, 0.55).lineBetween(de.x, de.y, p.x, p.y)
    this.jato.lineStyle(10, 0xE1F5FE, 0.8).lineBetween(de.x, de.y, p.x, p.y)
    for (let i = 0; i < 6; i++) this.jato.fillStyle(0x81D4FA, 0.8).fillCircle(p.x + Phaser.Math.Between(-50, 50), p.y + Phaser.Math.Between(-50, 50), Phaser.Math.Between(4, 9))
    // Dedo parado também enxágua.
    this.ultimo = { x: p.x, y: p.y }
    this.lavar(p)
  }

  brilhar () {
    this.limpo = true
    this.jato.clear()
    this.tweens.add({ targets: [this.lama, this.espuma], alpha: 0, duration: 300 })
    tocar('estrela')
    for (let i = 0; i < 8; i++) {
      const brilho = this.add.text(CENTRO.x + Phaser.Math.Between(-150, 150), CENTRO.y + Phaser.Math.Between(-220, 220), '✨', { fontSize: '64px', fontFamily: FONTE }).setOrigin(0.5).setScale(0)
      this.tweens.add({ targets: brilho, scale: 1, duration: 300, delay: i * 80, yoyo: true, hold: 300 })
    }
    this.time.delayedCall(1200, () => this.terminar())
  }

  terminar () {
    if (this.saindo) return
    this.saindo = true
    this.scene.start('Garagem')
  }
}
