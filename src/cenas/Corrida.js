import Phaser from 'phaser'
import { FONTE } from '../ui.js'
import { tocar } from '../sons.js'
import { criarCarro } from '../carro.js'
import { porId } from '../logica/catalogo.js'
import { carregar, visualDe } from '../logica/salvar.js'
import { criarAdversarios, atualizarAdversario, VELOCIDADE_BASE } from '../logica/adversarios.js'
import { gerarObjetos, gerarCenario } from '../logica/pista.js'
import { CIRCUITOS, LARGURA_PISTA, criarCircuito, pontoNa, maisProximo, avancar } from '../logica/circuito.js'
import { novoAngulo, naGrama, FATOR_GRAMA, OLHAR_A_FRENTE } from '../logica/direcao.js'

const VOLTAS = 2
const LATERAL = [-110, 0, 110] // faixa → deslocamento do centro da pista
const NITRO = { fator: 1.8, ms: 3000 }
const BATIDA = { fator: 0.5, ms: 1000 }
const MEDALHAS = ['🥇', '🥈', '🥉', '🏅']
const CORES_ADV = [0x1E88E5, 0x43A047, 0xFDD835]
const BLOCO = 1024 // px do mundo por RenderTexture da pista
const MINI = { x: 520, y: 1080, lado: 180 }

// Posição a `lateral` px à direita da linha central, na distância d.
function naLinha (c, d, lateral = 0) {
  const p = pontoNa(c, d)
  const n = p.angulo + Math.PI / 2
  return { x: p.x + Math.cos(n) * lateral, y: p.y + Math.sin(n) * lateral, angulo: p.angulo }
}

export default class Corrida extends Phaser.Scene {
  constructor () { super('Corrida') }

  create () {
    // Phaser reaproveita a cena: todo o estado é zerado aqui.
    this.percorrido = 0
    this.estrelas = 0
    this.nitroAte = 0
    this.batidaAte = 0
    this.terminou = false
    this.avisouUltima = false

    const nomes = Object.keys(CIRCUITOS)
    this.c = criarCircuito(CIRCUITOS[nomes[Math.floor(Math.random() * nomes.length)]])
    this.L = this.c.comprimento
    this.total = VOLTAS * this.L

    this.criarMundo()
    this.cenario = gerarCenario(Math.random, this.c).map(e => this.criarEnfeite(e))
    this.objetos = gerarObjetos(Math.random, this.L).map(o => ({ ...o, sprite: this.criarObjeto(o), voltaPega: -1, pego: false }))

    this.adversarios = criarAdversarios().map((a, i) => ({
      ...a,
      carro: (this.textures.exists(`adv_${i + 1}`)
        ? this.add.image(0, 0, `adv_${i + 1}`).setScale(96 / 71) // largura dos PNGs: ~71 px
        : criarCarro(this, 0, 0, 'carrinho', { ...visualDe({ porCarro: {} }, ''), cor: CORES_ADV[i] }, 0.8)).setDepth(4)
    }))

    const estado = carregar()
    const visual = visualDe(estado, estado.carroAtual)
    const largada = naLinha(this.c, 0, 110)
    this.d = 0
    this.angulo = largada.angulo
    this.theo = criarCarro(this, largada.x, largada.y, porId(estado.carroAtual)?.valor ?? 'carrinho', visual, 0.8).setDepth(5)
    this.theo.rotation = this.angulo + Math.PI / 2

    const cam = this.cameras.main
    cam.setBounds(this.mundo.x, this.mundo.y, this.mundo.w, this.mundo.h)
    cam.startFollow(this.theo, true, 0.12, 0.12)

    this.criarPainel(visual.cor)
    this.posicionar()
  }

  // Grama, pista pintada uma vez em blocos de meia resolução, e linha de chegada.
  criarMundo () {
    const { amostras } = this.c
    const xs = amostras.map(a => a.x)
    const ys = amostras.map(a => a.y)
    const x = Math.min(...xs) - 600
    const y = Math.min(...ys) - 600
    this.mundo = { x, y, w: Math.max(...xs) + 600 - x, h: Math.max(...ys) + 600 - y }
    const { w, h } = this.mundo

    if (this.textures.exists('grama')) this.add.tileSprite(x, y, w, h, 'grama').setOrigin(0)
    else this.add.rectangle(x, y, w, h, 0x66BB6A).setOrigin(0)

    const g = this.make.graphics({ x: 0, y: 0, add: false })
    const r = LARGURA_PISTA / 2
    amostras.forEach((a, i) => g.fillStyle(Math.floor(i / 3) % 2 ? 0xFFFFFF : 0xE53935).fillCircle(a.x, a.y, r + 16))
    g.fillStyle(0x616161)
    for (const a of amostras) g.fillCircle(a.x, a.y, r)
    g.setScale(0.5)
    for (let bx = x; bx < x + w; bx += BLOCO) {
      for (let by = y; by < y + h; by += BLOCO) {
        const temPista = amostras.some(a => a.x > bx - r - 20 && a.x < bx + BLOCO + r + 20 && a.y > by - r - 20 && a.y < by + BLOCO + r + 20)
        if (!temPista) continue
        // +2: os blocos se sobrepõem um pouco, para não aparecer emenda.
        this.add.renderTexture(bx, by, BLOCO / 2 + 2, BLOCO / 2 + 2).setOrigin(0).setScale(2).draw(g, -bx / 2, -by / 2)
      }
    }
    g.destroy()

    if (!this.textures.exists('quadriculado_circuito')) {
      const q = this.make.graphics({ add: false })
      for (let i = 0; i < 12; i++) {
        q.fillStyle(i % 2 ? 0x000000 : 0xFFFFFF).fillRect(i * 30, 0, 30, 30)
        q.fillStyle(i % 2 ? 0xFFFFFF : 0x000000).fillRect(i * 30, 30, 30, 30)
      }
      q.generateTexture('quadriculado_circuito', 360, 60)
      q.destroy()
    }
    const chegada = naLinha(this.c, 0)
    this.add.image(chegada.x, chegada.y, 'quadriculado_circuito').setRotation(chegada.angulo + Math.PI / 2).setDepth(1)
  }

  // Objetos da pista: sprites do Kenney; se a textura faltar, volta ao emoji.
  criarObjeto ({ pos, faixa, tipo }) {
    const p = naLinha(this.c, pos, LATERAL[faixa])
    const sprites = { cone: ['cone', 80], oleo: ['oleo', 120], pneus: ['pneus', 90], nitro: ['seta', 130] }
    let sprite
    if (sprites[tipo] && this.textures.exists(sprites[tipo][0])) {
      const [chave, largura] = sprites[tipo]
      sprite = this.add.image(p.x, p.y, chave)
      sprite.setScale(largura / sprite.width)
      if (tipo === 'nitro') sprite.setRotation(p.angulo + Math.PI / 2) // a seta aponta para onde a pista vai
    } else {
      sprite = this.add.text(p.x, p.y, { estrela: '⭐', cone: '🚧', oleo: '🛢️', pneus: '🛞', nitro: '🔥' }[tipo], { fontSize: '80px', fontFamily: FONTE }).setOrigin(0.5)
    }
    sprite.setDepth(2)
    if (tipo === 'nitro') this.tweens.add({ targets: sprite, scale: sprite.scale * 1.15, duration: 300, yoyo: true, repeat: -1 })
    return sprite
  }

  // Enfeites na grama (sem colisão); arquibancada alinhada com a pista.
  criarEnfeite ({ x, y, tipo, angulo }) {
    if (!this.textures.exists(tipo)) return null
    const img = this.add.image(x, y, tipo).setDepth(3)
    if (tipo === 'arquibancada') img.setRotation(angulo).setScale(110 / img.height)
    else img.setScale(Math.min(110 / img.width, 1))
    return img
  }

  criarPainel (corTheo) {
    const fixo = o => o.setScrollFactor(0).setDepth(10)
    this.medalha = fixo(this.add.text(70, 70, '🥇', { fontSize: '100px', fontFamily: FONTE }).setOrigin(0.5))
    // Emoji com contorno some em alguns navegadores: ícone e número separados.
    fixo(this.add.text(520, 70, '⭐', { fontSize: '64px', fontFamily: FONTE }).setOrigin(0.5))
    const numero = { fontSize: '64px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#FFFFFF', stroke: '#000000', strokeThickness: 8 }
    this.textoEstrelas = fixo(this.add.text(600, 70, '0', numero).setOrigin(0.5))
    fixo(this.add.text(250, 70, '🏁', { fontSize: '56px', fontFamily: FONTE }).setOrigin(0.5))
    this.textoVolta = fixo(this.add.text(340, 70, `1/${VOLTAS}`, numero).setOrigin(0.5))

    // Minimapa: forma do circuito e um pontinho por carro.
    const k = MINI.lado / Math.max(this.mundo.w, this.mundo.h)
    this.mini = (x, y) => [MINI.x + (x - this.mundo.x) * k, MINI.y + (y - this.mundo.y) * k]
    const fundo = fixo(this.add.graphics())
    fundo.fillStyle(0xFFFFFF, 0.6).fillRoundedRect(MINI.x - 10, MINI.y - 10, MINI.lado + 20, MINI.lado + 20, 16)
    fundo.lineStyle(8, 0x424242, 1).strokePoints(this.c.amostras.filter((_, i) => i % 5 === 0).map(a => {
      const [mx, my] = this.mini(a.x, a.y)
      return new Phaser.Math.Vector2(mx, my)
    }), true)
    this.pontos = fixo(this.add.graphics())
    this.corTheo = corTheo
  }

  update (_t, deltaMs) {
    if (this.terminou) return
    const dt = Math.min(deltaMs, 50) / 1000
    const agora = this.time.now
    const { c, theo } = this

    const { d, afastamento } = maisProximo(c, theo.x, theo.y, this.d)
    this.percorrido = avancar(this.percorrido, this.d, d, this.L)
    this.d = d

    const p = this.input.activePointer
    const dedo = p.isDown ? this.cameras.main.getWorldPoint(p.x, p.y) : null
    this.angulo = novoAngulo({
      angulo: this.angulo, x: theo.x, y: theo.y, dedo, alvoPista: pontoNa(c, d + OLHAR_A_FRENTE), tangente: pontoNa(c, d).angulo, afastamento, dt
    })

    const nitro = agora < this.nitroAte
    const batida = agora < this.batidaAte
    let vel = VELOCIDADE_BASE
    if (naGrama(afastamento)) vel *= FATOR_GRAMA
    if (nitro) vel *= NITRO.fator
    if (batida) vel *= BATIDA.fator
    theo.fogo.setVisible(nitro)
    theo.x += Math.cos(this.angulo) * vel * dt
    theo.y += Math.sin(this.angulo) * vel * dt
    // Batida: uma volta completa no próprio eixo, sem mudar a direção de marcha.
    const giro = batida ? Math.PI * 2 * (1 - (this.batidaAte - agora) / BATIDA.ms) : 0
    theo.rotation = this.angulo + Math.PI / 2 + giro

    for (const a of this.adversarios) atualizarAdversario(a, this.percorrido, dt, this.total)

    const volta = Math.floor(Math.max(this.percorrido, 0) / this.L)
    for (const o of this.objetos) {
      if (o.tipo === 'nitro') o.sprite.setVisible(o.voltaPega !== volta)
      if (o.pego || o.voltaPega === volta || Phaser.Math.Distance.Between(o.sprite.x, o.sprite.y, theo.x, theo.y) > 70) continue
      o.voltaPega = volta
      this.pegar(o)
    }

    if (volta >= 1 && !this.avisouUltima) this.ultimaVolta()
    this.textoVolta.setText(`${Math.min(volta + 1, VOLTAS)}/${VOLTAS}`)
    const posicao = 1 + this.adversarios.filter(a => a.pos > this.percorrido).length
    this.medalha.setText(MEDALHAS[posicao - 1])
    this.posicionar()

    if (this.percorrido >= this.total) this.chegar(posicao)
  }

  // Adversários na linha e pontinhos do minimapa.
  posicionar () {
    this.pontos.clear()
    this.adversarios.forEach((a, i) => {
      const p = naLinha(this.c, a.pos, LATERAL[a.faixa])
      a.carro.setPosition(p.x, p.y).setRotation(p.angulo + Math.PI / 2)
      this.pontos.fillStyle(CORES_ADV[i], 1).fillCircle(...this.mini(p.x, p.y), 7)
    })
    this.pontos.fillStyle(this.corTheo, 1).lineStyle(3, 0x000000, 1)
    this.pontos.fillCircle(...this.mini(this.theo.x, this.theo.y), 11).strokeCircle(...this.mini(this.theo.x, this.theo.y), 11)
  }

  ultimaVolta () {
    this.avisouUltima = true
    tocar('volta')
    const aviso = this.add.text(360, 400, 'ÚLTIMA VOLTA!', { fontSize: '72px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#FFEB3B', stroke: '#000000', strokeThickness: 10 })
      .setOrigin(0.5).setScrollFactor(0).setDepth(20).setScale(0)
    this.tweens.add({ targets: aviso, scale: 1, duration: 300, ease: 'Back.out', hold: 1200, yoyo: true, onComplete: () => aviso.destroy() })
  }

  pegar (o) {
    if (o.tipo === 'estrela') {
      o.pego = true // estrela não volta na 2ª volta
      this.estrelas++
      this.textoEstrelas.setText(String(this.estrelas))
      tocar('estrela')
      this.tweens.add({ targets: o.sprite, scale: 2, alpha: 0, duration: 250 })
    } else if (o.tipo === 'nitro') {
      this.nitroAte = this.time.now + NITRO.ms
      tocar('nitro')
    } else if (this.time.now >= this.batidaAte) {
      this.batidaAte = this.time.now + BATIDA.ms
      tocar('batida')
    }
  }

  chegar (posicao) {
    this.terminou = true
    this.theo.fogo.setVisible(false)
    tocar('vitoria')
    this.confete(posicao === 1 ? 60 : 30)
    const grande = (emoji, tamanho) => this.add.text(360, 560, emoji, { fontSize: `${tamanho}px`, fontFamily: FONTE }).setOrigin(0.5).setScrollFactor(0).setDepth(20)
    if (posicao === 1) {
      const trofeu = grande('🏆', 260).setScale(0)
      this.tweens.add({ targets: trofeu, scale: 1, duration: 500, ease: 'Back.out' })
    } else {
      this.tweens.add({ targets: grande(MEDALHAS[posicao - 1], 220), scale: 1.2, duration: 400, yoyo: true, repeat: 1 })
    }
    this.time.delayedCall(2000, () => this.scene.start('LavaJato', { posicao, estrelas: this.estrelas, corridaId: Date.now() }))
  }

  confete (quantos) {
    const cores = [0xE53935, 0xFDD835, 0x1E88E5, 0x43A047, 0xF06292, 0xFFFFFF]
    for (let i = 0; i < quantos; i++) {
      const p = this.add.rectangle(Phaser.Math.Between(0, 720), Phaser.Math.Between(-300, -20), 16, 26, Phaser.Utils.Array.GetRandom(cores)).setScrollFactor(0).setDepth(15)
      this.tweens.add({ targets: p, y: 1350, angle: Phaser.Math.Between(180, 720), x: p.x + Phaser.Math.Between(-120, 120), duration: Phaser.Math.Between(1200, 2000) })
    }
  }
}
