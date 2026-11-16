import Phaser from 'phaser'
import { botao, pulinho, FONTE } from '../ui.js'
import { tocar } from '../sons.js'
import { criarCarro } from '../carro.js'
import { CATALOGO, porId } from '../logica/catalogo.js'
import { carregar, gravar, visualDe } from '../logica/salvar.js'
import { colarAdesivo, moverAdesivo } from '../logica/adesivos.js'
import { ESTRELAS_POR_BARRA } from '../logica/presentes.js'

const CENTRO_CARRO = { x: 360, y: 420 }
const ESCALA_CARRO = 1.6
// Cada tipo de peça aparece como um carrinho mostrando uma peça daquele tipo (emoji não explicava).
const TIPOS_PECA = [['aerofolio', 'aerofolio-alto'], ['teto', 'teto-sirene'], ['rodas', 'rodas-amarelo'], ['escapamento', 'escapamento-azul']]
// Carro cinza neutro: só a peça de exemplo chama atenção.
const VISUAL_EXEMPLO = { cor: 0xB0BEC5, aerofolio: 'aerofolio-nenhum', teto: 'teto-nenhum', rodas: 'rodas-nenhum', escapamento: 'escapamento-laranja', adesivos: [] }
const TIPOS_DA_ABA = { carro: ['carro'], cor: ['cor'], peca: TIPOS_PECA.map(([t]) => t), adesivo: ['adesivo'] }

export default class Garagem extends Phaser.Scene {
  constructor () { super('Garagem') }

  create () {
    // A cena é reaproveitada pelo Phaser: zera o estado da visita anterior.
    this.saindo = false
    this.carro = null
    this.arrasto = null
    this.estado = carregar()
    this.aba = 'carro'
    this.tipoPeca = 'aerofolio'
    this.opcoes = []

    this.add.rectangle(360, 980, 720, 600, 0xFFFFFF, 0.35)
    this.desenharCarro()

    const abas = [['carro', '🚗'], ['cor', '🎨'], ['peca', '🔧'], ['adesivo', '⭐']]
    abas.forEach(([aba, emoji], i) => botao(this, 120 + i * 160, 1195, emoji, () => this.mostrarAba(aba), 100))
    // Bolinha pulsando na aba que tem item novo.
    this.pontos = Object.fromEntries(abas.map(([aba], i) => {
      const ponto = this.add.circle(170 + i * 160, 1140, 16, 0xE53935).setStrokeStyle(4, 0xFFFFFF).setDepth(5)
      this.tweens.add({ targets: ponto, scale: 1.3, duration: 400, yoyo: true, repeat: -1 })
      return [aba, ponto]
    }))

    // Barra de estrelas: cheia = presente extra.
    this.add.text(60, 90, '⭐', { fontSize: '64px', fontFamily: FONTE }).setOrigin(0.5)
    this.add.rectangle(110, 90, 400, 36, 0xFFFFFF, 0.8).setOrigin(0, 0.5).setStrokeStyle(4, 0x000000, 0.3)
    this.add.rectangle(112, 90, 396 * Math.min(this.estado.estrelas / ESTRELAS_POR_BARRA, 1), 32, 0xFFC107).setOrigin(0, 0.5)

    botao(this, 640, 90, '🏁', () => {
      if (this.saindo) return
      this.saindo = true
      this.scene.start('Corrida')
    }, 110)
    botao(this, 640, 420, '🚿', () => {
      if (this.saindo) return
      this.saindo = true
      this.scene.start('LavaJato')
    }, 110)

    this.input.on('pointermove', p => this.arrasto?.texto.setPosition(p.x, p.y))
    this.input.on('pointerup', p => this.soltarAdesivo(p))
    // Soltar na faixa fora do jogo (barras do Scale.FIT) chega como pointerupoutside.
    this.input.on('pointerupoutside', p => this.soltarAdesivo(p))

    this.mostrarAba('carro')
  }

  get visual () { return visualDe(this.estado, this.estado.carroAtual) }

  modeloDe (carroId) { return porId(carroId)?.valor ?? 'carrinho' }

  novos (aba) {
    return this.estado.ganhos.filter(id => !this.estado.vistos.includes(id) && TIPOS_DA_ABA[aba].includes(porId(id)?.tipo))
  }

  ganhos (tipo) { return CATALOGO.filter(i => i.tipo === tipo && this.estado.ganhos.includes(i.id)) }

  desenharCarro () {
    this.carro?.destroy()
    this.carro = criarCarro(this, CENTRO_CARRO.x, CENTRO_CARRO.y, this.modeloDe(this.estado.carroAtual), this.visual, ESCALA_CARRO)
    if (this.aba !== 'adesivo') return
    // Adesivo já colado: arrastar move; arrastar para fora do carro tira.
    this.carro.adesivos.forEach((t, i) => {
      t.setInteractive(new Phaser.Geom.Rectangle(-20, -20, t.width + 40, t.height + 40), Phaser.Geom.Rectangle.Contains)
      t.on('pointerdown', () => { t.setVisible(false); this.pegarAdesivo(t.text, i) })
    })
  }

  pegarAdesivo (emoji, indice) {
    if (this.arrasto) return // segundo dedo enquanto um adesivo já está na mão
    const p = this.input.activePointer
    tocar('toque')
    const texto = this.add.text(p.x, p.y, emoji, { fontSize: `${40 * ESCALA_CARRO}px`, fontFamily: FONTE }).setOrigin(0.5).setDepth(10)
    this.arrasto = { emoji, indice, texto }
  }

  soltarAdesivo (p) {
    if (!this.arrasto) return
    const { emoji, indice, texto } = this.arrasto
    this.arrasto = null
    texto.destroy()
    const { w, h } = this.carro.dims
    const x = (p.x - CENTRO_CARRO.x) / (ESCALA_CARRO * w / 2)
    const y = (p.y - CENTRO_CARRO.y) / (ESCALA_CARRO * h / 2)
    const novo = indice === null ? colarAdesivo(this.visual, emoji, x, y) : moverAdesivo(this.visual, indice, x, y)
    if (novo !== this.visual) tocar('estrela')
    this.estado.porCarro[this.estado.carroAtual] = novo
    this.salvarERedesenhar()
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
    const trocouAba = this.aba !== aba
    this.aba = aba
    if (trocouAba) this.desenharCarro()
    const novos = this.novos(aba)
    if (novos.length) {
      this.estado.vistos.push(...novos)
      gravar(this.estado)
    }
    for (const [a, ponto] of Object.entries(this.pontos)) ponto.setVisible(this.novos(a).length > 0)
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
      TIPOS_PECA.forEach(([tipo, exemplo], i) => this.opcao(i + 1, () => {
        const c = criarCarro(this, 0, tipo === 'escapamento' ? -10 : 0, 'carrinho', { ...VISUAL_EXEMPLO, [tipo]: exemplo }, 0.34)
        if (tipo === 'escapamento') c.fogo.setVisible(true)
        return c
      }, this.tipoPeca === tipo, () => { this.tipoPeca = tipo; this.mostrarAba('peca') }))
      this.ganhos(this.tipoPeca).forEach((item, i) => this.opcao(i + 6, () => {
        const c = criarCarro(this, 0, item.tipo === 'escapamento' ? -10 : 0, this.modeloDe(this.estado.carroAtual), { ...v, [item.tipo]: item.id }, 0.34)
        if (item.tipo === 'escapamento') c.fogo.setVisible(true)
        return c
      }, v[item.tipo] === item.id, () => this.mudarVisual({ [item.tipo]: item.id })))
    } else if (aba === 'adesivo') {
      this.ganhos('adesivo').forEach((item, i) => this.opcao(i, () =>
        this.add.text(0, 0, item.valor, { fontSize: '64px', fontFamily: FONTE }).setOrigin(0.5),
      false, () => this.pegarAdesivo(item.valor, null)))
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
