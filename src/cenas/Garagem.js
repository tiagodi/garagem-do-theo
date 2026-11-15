import Phaser from 'phaser'
import { botao, pulinho, FONTE } from '../ui.js'
import { tocar } from '../sons.js'
import { criarCarro } from '../carro.js'
import { CATALOGO, porId } from '../logica/catalogo.js'
import { carregar, gravar, visualDe } from '../logica/salvar.js'

const CENTRO_CARRO = { x: 360, y: 420 }
const ESCALA_CARRO = 1.6
const TIPOS_PECA = [['aerofolio', '✈️'], ['teto', '🚨'], ['rodas', '🛞'], ['escapamento', '🔥']]

export default class Garagem extends Phaser.Scene {
  constructor () { super('Garagem') }

  create () {
    this.saindo = false
    this.estado = carregar()
    this.aba = 'carro'
    this.tipoPeca = 'aerofolio'
    this.opcoes = []

    this.add.rectangle(360, 980, 720, 600, 0xFFFFFF, 0.35)
    this.desenharCarro()

    const abas = [['carro', '🚗'], ['cor', '🎨'], ['peca', '🔧'], ['adesivo', '⭐']]
    abas.forEach(([aba, emoji], i) => botao(this, 120 + i * 160, 1195, emoji, () => this.mostrarAba(aba), 100))

    botao(this, 640, 90, '🏁', () => {
      if (this.saindo) return
      this.saindo = true
      this.scene.start('Corrida')
    }, 110)

    this.mostrarAba('carro')
  }

  get visual () { return visualDe(this.estado, this.estado.carroAtual) }

  modeloDe (carroId) { return porId(carroId)?.valor ?? 'carrinho' }

  ganhos (tipo) { return CATALOGO.filter(i => i.tipo === tipo && this.estado.ganhos.includes(i.id)) }

  desenharCarro () {
    this.carro?.destroy()
    this.carro = criarCarro(this, CENTRO_CARRO.x, CENTRO_CARRO.y, this.modeloDe(this.estado.carroAtual), this.visual, ESCALA_CARRO)
  }

  mudarVisual (mudanca) {
    this.estado.porCarro[this.estado.carroAtual] = { ...this.visual, ...mudanca }
    this.salvarERedesenhar()
  }

  salvarERedesenhar () {
    gravar(this.estado)
    this.desenharCarro()
    pulinho(this, this.carro)
    this.mostrarAba(this.aba)
  }

  mostrarAba (aba) {
    this.aba = aba
    this.opcoes.forEach(o => o.destroy())
    this.opcoes = []
    const v = this.visual

    if (aba === 'carro') {
      this.ganhos('carro').forEach((item, i) => this.opcao(i, () =>
        criarCarro(this, 0, 0, item.valor, visualDe(this.estado, item.id), 0.38),
      this.estado.carroAtual === item.id, () => { this.estado.carroAtual = item.id; this.salvarERedesenhar() }))
    } else if (aba === 'cor') {
      this.ganhos('cor').forEach((item, i) => this.opcao(i, () =>
        this.add.circle(0, 0, 40, item.valor).setStrokeStyle(4, 0x000000, 0.25),
      v.cor === item.valor, () => this.mudarVisual({ cor: item.valor })))
    } else if (aba === 'peca') {
      TIPOS_PECA.forEach(([tipo, emoji], i) => this.opcao(i + 1, () =>
        this.add.text(0, 0, emoji, { fontSize: '64px', fontFamily: FONTE }).setOrigin(0.5),
      this.tipoPeca === tipo, () => { this.tipoPeca = tipo; this.mostrarAba('peca') }))
      this.ganhos(this.tipoPeca).forEach((item, i) => this.opcao(i + 6, () => {
        const c = criarCarro(this, 0, item.tipo === 'escapamento' ? -10 : 0, this.modeloDe(this.estado.carroAtual), { ...v, [item.tipo]: item.id }, 0.34)
        if (item.tipo === 'escapamento') c.fogo.setVisible(true)
        return c
      }, v[item.tipo] === item.id, () => this.mudarVisual({ [item.tipo]: item.id })))
    }
  }

  // Célula i de uma grade 6×3 abaixo do carro; desenho() cria o conteúdo centrado em (0, 0).
  opcao (i, desenho, selecionado, aoTocar) {
    const x = 72 + (i % 6) * 115
    const y = 790 + Math.floor(i / 6) * 120
    const fundo = this.add.rectangle(x, y, 104, 108, 0xFFFFFF, 0.8)
      .setStrokeStyle(selecionado ? 8 : 2, selecionado ? 0xFFC107 : 0x90A4AE)
    const conteudo = desenho()
    conteudo.setPosition(x, y + (conteudo.y || 0))
    fundo.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      tocar('toque')
      pulinho(this, conteudo)
      aoTocar()
    })
    this.opcoes.push(fundo, conteudo)
  }
}
