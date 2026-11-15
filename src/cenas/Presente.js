import Phaser from 'phaser'
import { botao, FONTE } from '../ui.js'
import { tocar } from '../sons.js'
import { criarCarro } from '../carro.js'
import { porId } from '../logica/catalogo.js'
import { carregar, gravar, visualDe } from '../logica/salvar.js'
import { abrirPresente } from '../logica/presentes.js'

const PECAS = ['aerofolio', 'teto', 'rodas', 'escapamento']

export default class Presente extends Phaser.Scene {
  constructor () { super('Presente') }

  init (dados) { this.dados = dados ?? {} }

  create () {
    // A cena é reaproveitada pelo Phaser: zera o estado da visita anterior.
    this.saindo = false
    this.itens = null
    this.exibidos = []
    this.caixa = botao(this, 360, 600, '🎁', () => this.abrir(), 260)
    this.tweens.add({ targets: this.caixa, angle: { from: -8, to: 8 }, duration: 350, yoyo: true, repeat: -1 })
  }

  abrir () {
    if (this.itens) return // toque duplo na caixa
    const { estado, itens } = abrirPresente(carregar(), this.dados.corridaId ?? 0, this.dados.estrelas ?? 0, Math.random)
    gravar(estado)
    this.estado = estado
    this.itens = [...itens]
    this.caixa.destroy()
    this.proximo()
  }

  proximo () {
    this.exibidos.forEach(o => o.destroy())
    this.exibidos = []
    tocar('presente')
    this.confete()
    const item = this.itens.shift()
    if (item) {
      const desenho = this.desenhar(item)
      desenho.setScale(0)
      this.tweens.add({ targets: desenho, scale: desenho.escalaFinal ?? 1, duration: 500, ease: 'Back.out' })
      this.exibidos.push(desenho)
    } else {
      this.exibidos.push(this.add.text(360, 600, '🎉', { fontSize: '260px', fontFamily: FONTE }).setOrigin(0.5))
    }
    const seguir = this.itens.length
      ? botao(this, 360, 1080, '🎁', () => this.proximo(), 160)
      : botao(this, 360, 1080, '✅', () => this.sair(), 160)
    this.exibidos.push(seguir)
  }

  desenhar (item) {
    const atual = this.estado.carroAtual
    const modeloAtual = porId(atual)?.valor ?? 'carrinho'
    let d
    if (item.tipo === 'carro') {
      d = criarCarro(this, 360, 600, item.valor, visualDe(this.estado, item.id), 1)
      d.escalaFinal = 1.6
    } else if (item.tipo === 'cor') {
      d = this.add.circle(360, 600, 140, item.valor).setStrokeStyle(10, 0x000000, 0.25)
    } else if (PECAS.includes(item.tipo)) {
      d = criarCarro(this, 360, 560, modeloAtual, { ...visualDe(this.estado, atual), [item.tipo]: item.id }, 1)
      if (item.tipo === 'escapamento') d.fogo.setVisible(true)
      d.escalaFinal = 1.6
    } else {
      d = this.add.text(360, 600, item.valor, { fontSize: '260px', fontFamily: FONTE }).setOrigin(0.5)
    }
    return d
  }

  confete () {
    const cores = [0xE53935, 0xFDD835, 0x1E88E5, 0x43A047, 0xF06292, 0xFFFFFF]
    for (let i = 0; i < 40; i++) {
      const p = this.add.rectangle(360, 600, 16, 26, Phaser.Utils.Array.GetRandom(cores))
      this.tweens.add({
        targets: p,
        x: 360 + Phaser.Math.Between(-340, 340),
        y: 600 + Phaser.Math.Between(-560, 600),
        angle: Phaser.Math.Between(180, 720),
        alpha: 0,
        duration: Phaser.Math.Between(900, 1500),
        onComplete: () => p.destroy()
      })
    }
  }

  sair () {
    if (this.saindo) return
    this.saindo = true
    this.scene.start('Garagem')
  }
}
