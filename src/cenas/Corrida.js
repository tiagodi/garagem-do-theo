import Phaser from 'phaser'
import { FONTE } from '../ui.js'
import { tocar } from '../sons.js'
import { criarCarro } from '../carro.js'
import { porId } from '../logica/catalogo.js'
import { carregar, visualDe } from '../logica/salvar.js'
import { criarAdversarios, atualizarAdversario, VELOCIDADE_BASE, COMPRIMENTO_PISTA } from '../logica/adversarios.js'
import { gerarObjetos, gerarCenario } from '../logica/pista.js'

const FAIXAS_X = [200, 360, 520]
const Y_THEO = 1000
const NITRO = { fator: 1.8, ms: 3000 }
const BATIDA = { fator: 0.5, ms: 1000 }
const MEDALHAS = ['🥇', '🥈', '🥉', '🏅']

export default class Corrida extends Phaser.Scene {
  constructor () { super('Corrida') }

  create () {
    this.posTheo = 0
    this.estrelas = 0
    this.faixa = 1
    this.nitroAte = 0
    this.batidaAte = 0
    this.terminou = false

    this.criarPista()
    this.cenario = gerarCenario(Math.random).map(c => ({ ...c, sprite: this.criarEnfeite(c) }))
    this.objetos = gerarObjetos(Math.random).map(o => ({ ...o, sprite: this.criarObjeto(o), pego: false }))
    this.chegada = this.add.tileSprite(360, 0, 480, 60, 'quadriculado')

    this.adversarios = criarAdversarios().map((a, i) => ({
      ...a,
      carro: this.textures.exists(`adv_${i + 1}`)
        ? this.add.image(FAIXAS_X[a.faixa], 0, `adv_${i + 1}`).setDisplaySize(96, 96 * 131 / 71)
        : criarCarro(this, FAIXAS_X[a.faixa], 0, 'carrinho', visualDe({ porCarro: {} }, ''), 0.8)
    }))

    const estado = carregar()
    this.theo = criarCarro(this, FAIXAS_X[this.faixa], Y_THEO, porId(estado.carroAtual)?.valor ?? 'carrinho', visualDe(estado, estado.carroAtual), 0.8)
    this.theo.setDepth(5)

    this.criarPainel()

    const mudarFaixa = p => {
      if (!p.isDown || this.terminou) return
      const faixa = p.x < 280 ? 0 : p.x < 440 ? 1 : 2
      if (faixa === this.faixa) return
      this.faixa = faixa
      this.tweens.add({ targets: this.theo, x: FAIXAS_X[faixa], duration: 150, ease: 'Sine.out' })
    }
    this.input.on('pointerdown', mudarFaixa)
    this.input.on('pointermove', mudarFaixa)
  }

  criarPista () {
    if (!this.textures.exists('pista')) {
      const g = this.make.graphics({ add: false })
      g.fillStyle(0x66BB6A).fillRect(0, 0, 720, 320)
      g.fillStyle(0x616161).fillRect(120, 0, 480, 320)
      for (let y = 0; y < 320; y += 80) {
        g.fillStyle(0xE53935).fillRect(108, y, 12, 40).fillRect(600, y, 12, 40)
        g.fillStyle(0xFFFFFF).fillRect(108, y + 40, 12, 40).fillRect(600, y + 40, 12, 40)
      }
      g.fillStyle(0xFFFFFF).fillRect(276, 40, 8, 100).fillRect(436, 40, 8, 100)
      g.fillRect(276, 200, 8, 100).fillRect(436, 200, 8, 100)
      g.generateTexture('pista', 720, 320)
      g.clear()
      for (let i = 0; i < 16; i++) g.fillStyle(i % 2 ? 0x000000 : 0xFFFFFF).fillRect(i * 30, 0, 30, 30)
      for (let i = 0; i < 16; i++) g.fillStyle(i % 2 ? 0xFFFFFF : 0x000000).fillRect(i * 30, 30, 30, 30)
      g.generateTexture('quadriculado', 480, 60)
      g.destroy()
    }
    this.pista = this.add.tileSprite(360, 640, 720, 1280, 'pista')
  }

  // Objetos da pista: sprites do Kenney; se a textura faltar, volta ao emoji.
  criarObjeto ({ faixa, tipo }) {
    const x = FAIXAS_X[faixa]
    const sprites = { cone: ['cone', 80], oleo: ['oleo', 120], pneus: ['pneus', 90], nitro: ['seta', 130] }
    let sprite
    if (sprites[tipo] && this.textures.exists(sprites[tipo][0])) {
      const [chave, largura] = sprites[tipo]
      sprite = this.add.image(x, 0, chave)
      sprite.setScale(largura / sprite.width)
    } else {
      sprite = this.add.text(x, 0, { estrela: '⭐', cone: '🚧', oleo: '🛢️', pneus: '🛞', nitro: '🔥' }[tipo], { fontSize: '80px', fontFamily: FONTE }).setOrigin(0.5)
    }
    if (tipo === 'nitro') this.tweens.add({ targets: sprite, scale: sprite.scale * 1.15, duration: 300, yoyo: true, repeat: -1 })
    return sprite
  }

  // Enfeites na grama (sem colisão); arquibancada deitada para caber na lateral.
  criarEnfeite ({ lado, tipo }) {
    if (!this.textures.exists(tipo)) return null
    const img = this.add.image(lado < 0 ? 60 : 660, 0, tipo)
    if (tipo === 'arquibancada') img.setAngle(lado < 0 ? 90 : -90).setScale(110 / img.height)
    else img.setScale(Math.min(110 / img.width, 1))
    return img
  }

  criarPainel () {
    this.medalha = this.add.text(70, 70, '🥇', { fontSize: '100px', fontFamily: FONTE }).setOrigin(0.5).setDepth(10)
    // Emoji com contorno some em alguns navegadores: ícone e número separados.
    this.add.text(520, 70, '⭐', { fontSize: '64px', fontFamily: FONTE }).setOrigin(0.5).setDepth(10)
    this.textoEstrelas = this.add.text(600, 70, '0', { fontSize: '64px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#FFFFFF', stroke: '#000000', strokeThickness: 8 }).setOrigin(0.5).setDepth(10)
    this.add.rectangle(700, 640, 12, 900, 0xFFFFFF, 0.6).setDepth(10)
    this.marcador = this.add.circle(700, 1090, 16, 0xFFC107).setStrokeStyle(4, 0x000000).setDepth(10)
    this.add.text(700, 170, '🏁', { fontSize: '44px', fontFamily: FONTE }).setOrigin(0.5).setDepth(10)
  }

  update (_t, deltaMs) {
    if (this.terminou) return
    const dt = Math.min(deltaMs, 50) / 1000
    const agora = this.time.now
    const nitro = agora < this.nitroAte
    let vel = VELOCIDADE_BASE
    if (nitro) vel *= NITRO.fator
    if (agora < this.batidaAte) vel *= BATIDA.fator
    this.theo.fogo.setVisible(nitro)

    this.posTheo += vel * dt
    this.pista.tilePositionY = -this.posTheo
    const naTela = pos => Y_THEO - (pos - this.posTheo)

    for (const c of this.cenario) c.sprite?.setY(naTela(c.pos))

    for (const a of this.adversarios) {
      atualizarAdversario(a, this.posTheo, dt)
      a.carro.y = naTela(a.pos)
    }

    for (const o of this.objetos) {
      o.sprite.y = naTela(o.pos)
      if (o.pego || Math.abs(o.sprite.y - Y_THEO) > 60 || Math.abs(o.sprite.x - this.theo.x) > 80) continue
      o.pego = true
      this.pegar(o)
    }

    this.chegada.y = naTela(COMPRIMENTO_PISTA)
    const posicao = 1 + this.adversarios.filter(a => a.pos > this.posTheo).length
    this.medalha.setText(MEDALHAS[posicao - 1])
    this.marcador.y = 1090 - 900 * Math.min(this.posTheo / COMPRIMENTO_PISTA, 1)

    if (this.posTheo >= COMPRIMENTO_PISTA) this.chegar(posicao)
  }

  pegar (o) {
    if (o.tipo === 'estrela') {
      this.estrelas++
      this.textoEstrelas.setText(String(this.estrelas))
      tocar('estrela')
      this.tweens.add({ targets: o.sprite, scale: 2, alpha: 0, duration: 250 })
    } else if (o.tipo === 'nitro') {
      this.nitroAte = this.time.now + NITRO.ms
      tocar('nitro')
      o.sprite.setVisible(false)
    } else if (this.time.now >= this.batidaAte) {
      this.batidaAte = this.time.now + BATIDA.ms
      tocar('batida')
      this.tweens.add({ targets: this.theo, angle: 360, duration: BATIDA.ms, onComplete: () => this.theo.setAngle(0) })
    }
  }

  chegar (posicao) {
    this.terminou = true
    this.theo.fogo.setVisible(false)
    tocar('vitoria')
    this.confete(posicao === 1 ? 60 : 30)
    if (posicao === 1) {
      const trofeu = this.add.text(360, 560, '🏆', { fontSize: '260px', fontFamily: FONTE }).setOrigin(0.5).setScale(0).setDepth(20)
      this.tweens.add({ targets: trofeu, scale: 1, duration: 500, ease: 'Back.out' })
    } else {
      const medalha = this.add.text(360, 560, MEDALHAS[posicao - 1], { fontSize: '220px', fontFamily: FONTE }).setOrigin(0.5).setDepth(20)
      this.tweens.add({ targets: medalha, scale: 1.2, duration: 400, yoyo: true, repeat: 1 })
    }
    this.time.delayedCall(2000, () => this.scene.start('LavaJato', { posicao, estrelas: this.estrelas, corridaId: Date.now() }))
  }

  confete (quantos) {
    const cores = [0xE53935, 0xFDD835, 0x1E88E5, 0x43A047, 0xF06292, 0xFFFFFF]
    for (let i = 0; i < quantos; i++) {
      const p = this.add.rectangle(Phaser.Math.Between(0, 720), Phaser.Math.Between(-300, -20), 16, 26, Phaser.Utils.Array.GetRandom(cores)).setDepth(15)
      this.tweens.add({ targets: p, y: 1350, angle: Phaser.Math.Between(180, 720), x: p.x + Phaser.Math.Between(-120, 120), duration: Phaser.Math.Between(1200, 2000) })
    }
  }
}
