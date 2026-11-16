import Phaser from 'phaser'
import { FONTE } from '../ui.js'
import { tocar } from '../sons.js'
import { porId } from '../logica/catalogo.js'
import { carregar, visualDe } from '../logica/salvar.js'
import { criarAdversarios, atualizarAdversario, VELOCIDADE_BASE } from '../logica/adversarios.js'
import { gerarObjetos, gerarEnfeites } from '../logica/pista.js'
import { CIRCUITOS, criarCircuito, pontoNa } from '../logica/circuito.js'
import { curvaturas, moverLateral, naGrama, aFrente, colide, PX_POR_SEGMENTO, FATOR_GRAMA } from '../logica/estrada.js'
import { desenharCarroTras, adesivosTras } from '../carroTras.js'

const W = 720
const H = 1280
const HORIZONTE = H * 0.4
const SEG = 200 // unidades de mundo por segmento
const LARGURA = 1100 // meia largura da estrada, em unidades de mundo
const ALTURA_CAM = 900
const PROF = 0.84
const VISTA = 160 // segmentos desenhados à frente
const ATRAS = 2 // a câmera fica 2 segmentos atrás do carro do Theo
const VOLTAS = 2
const LATERAL = [-0.5, 0, 0.5] // faixa → posição lateral
const NITRO = { fator: 1.8, ms: 3000 }
const BATIDA = { fator: 0.5, ms: 1000 }
const MEDALHAS = ['🥇', '🥈', '🥉', '🏅']
const CORES_ADV = [0x1E88E5, 0x43A047, 0xFDD835]
const MINI = { x: 520, y: 150, lado: 180 }
const THEO = { x: 360, y: 1150, w: 300 }

const valor = (id, padrao) => porId(id)?.valor ?? padrao

function projetar (wx, dz) {
  const esc = PROF / dz
  return { x: W / 2 + esc * wx * W / 2, y: HORIZONTE + esc * ALTURA_CAM * H / 2 * 0.55, w: esc * LARGURA * W / 2 }
}

export default class Corrida extends Phaser.Scene {
  constructor () { super('Corrida') }

  create () {
    // Phaser reaproveita a cena: todo o estado é zerado aqui.
    this.percorrido = 0
    this.x = 0
    this.estrelas = 0
    this.nitroAte = 0
    this.batidaAte = 0
    this.terminou = false
    this.avisouUltima = false
    this.morros = 0

    const nomes = Object.keys(CIRCUITOS)
    this.c = criarCircuito(CIRCUITOS[nomes[Math.floor(Math.random() * nomes.length)]])
    this.L = this.c.comprimento
    this.total = VOLTAS * this.L
    this.curvas = curvaturas(this.c)
    this.objetos = gerarObjetos(Math.random, this.L).map(o => ({ ...o, x: LATERAL[o.faixa], voltaPega: -1, pego: false }))
    this.enfeites = gerarEnfeites(Math.random, this.L)
    this.adversarios = criarAdversarios()

    this.fundo = this.add.graphics()
    this.g = this.add.graphics()

    const estado = carregar()
    const v = visualDe(estado, estado.carroAtual)
    this.criarTheo(valor(estado.carroAtual, 'carrinho'), v)
    this.criarPainel(v.cor)
  }

  // Carro do Theo: desenhado uma vez, fixo embaixo da tela.
  criarTheo (modelo, v) {
    const c = this.add.container(THEO.x, THEO.y).setDepth(5)
    const fogo = this.add.graphics().fillStyle(valor(v.escapamento, 0xFF6D00), 0.9)
    for (const lado of [-1, 1]) fogo.fillTriangle(lado * 90 - 18, -20, lado * 90 + 18, -20, lado * 90, 70)
    fogo.fillStyle(0xFFF59D, 1)
    for (const lado of [-1, 1]) fogo.fillTriangle(lado * 90 - 8, -20, lado * 90 + 8, -20, lado * 90, 30)
    fogo.setVisible(false)
    const carro = this.add.graphics()
    desenharCarroTras(carro, 0, 0, THEO.w, {
      modelo, cor: v.cor, aerofolio: valor(v.aerofolio, 'nenhum'), teto: valor(v.teto, 'nenhum'), rodas: valor(v.rodas, 0x9E9E9E)
    })
    c.add([fogo, carro])
    const lugares = adesivosTras(THEO.w, modelo)
    v.adesivos.slice(0, 3).forEach((a, i) => c.add(this.add.text(lugares[i].x, lugares[i].y, a.emoji, { fontSize: '44px', fontFamily: FONTE }).setOrigin(0.5)))
    this.theo = c
    this.fogo = fogo
  }

  criarPainel (corTheo) {
    const fixo = o => o.setDepth(10)
    this.medalha = fixo(this.add.text(70, 70, '🥇', { fontSize: '100px', fontFamily: FONTE }).setOrigin(0.5))
    // Emoji com contorno some em alguns navegadores: ícone e número separados.
    fixo(this.add.text(520, 70, '⭐', { fontSize: '64px', fontFamily: FONTE }).setOrigin(0.5))
    const numero = { fontSize: '64px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#FFFFFF', stroke: '#000000', strokeThickness: 8 }
    this.textoEstrelas = fixo(this.add.text(600, 70, '0', numero).setOrigin(0.5))
    fixo(this.add.text(250, 70, '🏁', { fontSize: '56px', fontFamily: FONTE }).setOrigin(0.5))
    this.textoVolta = fixo(this.add.text(340, 70, `1/${VOLTAS}`, numero).setOrigin(0.5))

    // Minimapa no céu: forma do circuito e um pontinho por carro.
    const xs = this.c.amostras.map(a => a.x)
    const ys = this.c.amostras.map(a => a.y)
    const x0 = Math.min(...xs)
    const y0 = Math.min(...ys)
    const k = MINI.lado / Math.max(Math.max(...xs) - x0, Math.max(...ys) - y0)
    const tela = (x, y) => [MINI.x + (x - x0) * k, MINI.y + (y - y0) * k]
    this.mini = d => {
      const p = pontoNa(this.c, d)
      return tela(p.x, p.y)
    }
    const fundo = fixo(this.add.graphics())
    fundo.fillStyle(0xFFFFFF, 0.6).fillRoundedRect(MINI.x - 10, MINI.y - 10, MINI.lado + 20, (Math.max(...ys) - y0) * k + 20, 16)
    fundo.lineStyle(8, 0x424242, 1).strokePoints(this.c.amostras.filter((_, i) => i % 5 === 0).map(a => new Phaser.Math.Vector2(...tela(a.x, a.y))), true)
    this.pontos = fixo(this.add.graphics())
    this.corTheo = corTheo
  }

  update (_t, deltaMs) {
    if (this.terminou) return
    const dt = Math.min(deltaMs, 50) / 1000
    const agora = this.time.now
    const nitro = agora < this.nitroAte
    const batida = agora < this.batidaAte

    let pct = 1
    if (naGrama(this.x)) pct *= FATOR_GRAMA
    if (nitro) pct *= NITRO.fator
    if (batida) pct *= BATIDA.fator
    const d = this.percorrido % this.L
    const curva = this.curvas[Math.floor(d / PX_POR_SEGMENTO) % this.curvas.length]
    const p = this.input.activePointer
    const dedo = p.isDown ? (p.x < W / 2 ? -1 : 1) : 0
    this.x = moverLateral({ x: this.x, dedo, curva, pct, dt })
    this.passo = VELOCIDADE_BASE * pct * dt
    this.percorrido += this.passo
    this.morros += curva * pct * dt * 40

    this.fogo.setVisible(nitro)
    this.theo.x = THEO.x + dedo * 14
    this.theo.rotation = batida ? Math.sin(agora / 40) * 0.25 : dedo * 0.04

    for (const a of this.adversarios) atualizarAdversario(a, this.percorrido, dt, this.total)
    this.desenhar()
    this.pegarObjetos()

    const volta = this.volta()
    if (volta >= 1 && !this.avisouUltima) this.ultimaVolta()
    this.textoVolta.setText(`${Math.min(volta + 1, VOLTAS)}/${VOLTAS}`)
    const posicao = 1 + this.adversarios.filter(a => a.pos > this.percorrido).length
    this.medalha.setText(MEDALHAS[posicao - 1])
    this.atualizarMinimapa()

    if (this.percorrido >= this.total) this.chegar(posicao)
  }

  desenhar () {
    const { g, fundo, curvas, L } = this
    const n = curvas.length
    fundo.clear()
    fundo.fillGradientStyle(0x4FC3F7, 0x4FC3F7, 0xB3E5FC, 0xB3E5FC, 1).fillRect(0, 0, W, HORIZONTE)
    fundo.fillStyle(0x81C784, 1)
    const desloc = ((this.morros + this.x * 40) % 360 + 360) % 360
    for (let k = -1; k < 4; k++) fundo.fillEllipse(k * 360 - desloc + 180, HORIZONTE, 520, 180)
    fundo.fillStyle(0x4CAF50, 1).fillRect(0, HORIZONTE, W, H - HORIZONTE)

    // Estrada de perto para longe, com recorte vertical.
    g.clear()
    const camD = this.percorrido - ATRAS * PX_POR_SEGMENTO
    const camSeg = camD / PX_POR_SEGMENTO
    const base = Math.floor(camSeg)
    const frac = camSeg - base
    const camX = this.x * LARGURA
    let x = 0
    let dx = -curvas[((base % n) + n) % n] * frac
    let maxY = H
    this.telas = []
    for (let k = 0; k < VISTA; k++) {
      const i = (((base + k) % n) + n) % n
      const z1 = (k - frac) * SEG
      const p1 = z1 > 1 ? projetar(x - camX, z1) : null
      const p2 = projetar(x + dx - camX, z1 + SEG)
      this.telas.push(p1)
      x += dx
      dx += curvas[i]
      if (!p1 || p2.y >= maxY) continue
      const listra = Math.floor(i / 3) % 2
      g.fillStyle(listra ? 0x43A047 : 0x4CAF50, 1).fillRect(0, p2.y, W, p1.y - p2.y + 1)
      this.trapezio(p1, p2, -1.15, 1.15, listra ? 0xE53935 : 0xFFFFFF)
      this.trapezio(p1, p2, -1, 1, i < 3 ? (i % 2 ? 0x222222 : 0xEEEEEE) : (listra ? 0x5F5F5F : 0x666666))
      if (listra && i >= 3) for (const f of [-1 / 3, 1 / 3]) this.trapezio(p1, p2, f - 0.02, f + 0.02, 0xFFFFFF)
      maxY = p2.y
    }

    // Enfeites, objetos e adversários: de longe para perto.
    const itens = []
    const alcance = (VISTA - 1) * PX_POR_SEGMENTO
    const ponha = (dItem, desenho) => {
      const dist = aFrente(dItem, camD, L)
      if (dist < alcance) itens.push({ k: Math.floor(dist / PX_POR_SEGMENTO), desenho })
    }
    const volta = this.volta()
    for (const e of this.enfeites) ponha(e.d, p => this.enfeite(e, p))
    for (const o of this.objetos) if (!o.pego && !(o.tipo === 'nitro' && o.voltaPega === volta)) ponha(o.pos, p => this.objeto(o, p))
    this.adversarios.forEach((a, i) => ponha(a.pos % L, p => desenharCarroTras(g, p.x + p.w * LATERAL[a.faixa], p.y, p.w * 0.55, { modelo: 'carrinho', cor: CORES_ADV[i] })))
    itens.sort((a, b) => b.k - a.k)
    for (const it of itens) {
      const p = this.telas[it.k]
      if (p) it.desenho(p)
    }
  }

  // Faixa da estrada entre as posições laterais a e b (em meias larguras) dos dois cantos do segmento.
  trapezio (p1, p2, a, b, cor) {
    // +1 px embaixo: trechos vizinhos se sobrepõem, sem linha clara entre eles.
    this.g.fillStyle(cor, 1).fillPoints([
      { x: p1.x + p1.w * a, y: p1.y + 1 }, { x: p2.x + p2.w * a, y: p2.y },
      { x: p2.x + p2.w * b, y: p2.y }, { x: p1.x + p1.w * b, y: p1.y + 1 }
    ], true)
  }

  enfeite ({ x, tipo }, p) {
    const { g } = this
    const sx = p.x + p.w * x
    const s = p.w
    if (tipo === 'arvore') {
      g.fillStyle(0x6D4C41, 1).fillRect(sx - s * 0.06, p.y - s * 0.45, s * 0.12, s * 0.45)
      g.fillStyle(0x2E7D32, 1).fillCircle(sx, p.y - s * 0.7, s * 0.38)
      g.fillStyle(0x43A047, 1).fillCircle(sx - s * 0.1, p.y - s * 0.8, s * 0.24)
    } else if (tipo === 'pinheiro') {
      g.fillStyle(0x6D4C41, 1).fillRect(sx - s * 0.05, p.y - s * 0.3, s * 0.1, s * 0.3)
      g.fillStyle(0x1B5E20, 1).fillTriangle(sx - s * 0.32, p.y - s * 0.25, sx + s * 0.32, p.y - s * 0.25, sx, p.y - s * 1.1)
    } else if (tipo === 'pedra') {
      g.fillStyle(0x9E9E9E, 1).fillEllipse(sx, p.y - s * 0.1, s * 0.5, s * 0.3)
      g.fillStyle(0xBDBDBD, 1).fillEllipse(sx - s * 0.06, p.y - s * 0.15, s * 0.25, s * 0.12)
    } else if (tipo === 'tenda') {
      g.fillStyle(0xE53935, 1).fillTriangle(sx - s * 0.4, p.y, sx + s * 0.4, p.y, sx, p.y - s * 0.55)
      g.fillStyle(0xFFFFFF, 1).fillTriangle(sx - s * 0.12, p.y, sx + s * 0.12, p.y, sx, p.y - s * 0.55)
    } else if (tipo === 'arquibancada') {
      g.fillStyle(0x78909C, 1).fillRect(sx - s * 0.8, p.y - s * 0.7, s * 1.6, s * 0.7)
      g.fillStyle(0xE53935, 1).fillRect(sx - s * 0.85, p.y - s * 0.82, s * 1.7, s * 0.12)
      const cores = [0xFDD835, 0x1E88E5, 0xF06292, 0x43A047, 0xFFFFFF]
      for (let l = 0; l < 3; l++) {
        for (let c = 0; c < 8; c++) g.fillStyle(cores[(l * 3 + c) % cores.length], 1).fillCircle(sx - s * 0.7 + c * s * 0.2, p.y - s * 0.6 + l * s * 0.2, s * 0.06)
      }
    }
  }

  objeto ({ x, tipo }, p) {
    const { g } = this
    const sx = p.x + p.w * x
    const s = p.w
    if (tipo === 'estrela') {
      const pts = []
      for (let i = 0; i < 10; i++) {
        const r = (i % 2 ? 0.08 : 0.2) * s
        const a = -Math.PI / 2 + i * Math.PI / 5
        pts.push({ x: sx + Math.cos(a) * r, y: p.y - s * 0.25 + Math.sin(a) * r })
      }
      g.fillStyle(0xFFD600, 1).fillPoints(pts, true).lineStyle(Math.max(1, s * 0.015), 0xF57F17, 1).strokePoints(pts, true)
    } else if (tipo === 'nitro') {
      g.fillStyle(0xFFEB3B, 1)
      g.fillTriangle(sx - s * 0.2, p.y - s * 0.02, sx + s * 0.2, p.y - s * 0.02, sx, p.y - s * 0.14)
      g.fillRect(sx - s * 0.07, p.y - s * 0.02, s * 0.14, s * 0.04)
    } else if (tipo === 'cone') {
      g.fillStyle(0xFF6D00, 1).fillTriangle(sx - s * 0.1, p.y, sx + s * 0.1, p.y, sx, p.y - s * 0.3)
      g.fillStyle(0xFFFFFF, 1).fillRect(sx - s * 0.05, p.y - s * 0.16, s * 0.1, s * 0.04)
    } else if (tipo === 'oleo') {
      g.fillStyle(0x212121, 0.85).fillEllipse(sx, p.y - s * 0.02, s * 0.45, s * 0.08)
    } else if (tipo === 'pneus') {
      for (let i = 0; i < 3; i++) {
        g.fillStyle(0x212121, 1).fillEllipse(sx, p.y - s * (0.04 + i * 0.08), s * 0.3, s * 0.1)
        g.fillStyle(0xE53935, 1).fillEllipse(sx, p.y - s * (0.04 + i * 0.08), s * 0.12, s * 0.04)
      }
    }
  }

  volta () { return Math.floor(this.percorrido / this.L) }

  pegarObjetos () {
    const volta = this.volta()
    const antes = (this.percorrido - this.passo) % this.L // mede do ponto de antes do passo
    for (const o of this.objetos) {
      if (o.pego || o.voltaPega === volta || !colide(o.x, aFrente(o.pos, antes, this.L), this.x, this.passo)) continue
      o.voltaPega = volta
      if (o.tipo === 'estrela') {
        o.pego = true // estrela não volta na 2ª volta
        this.estrelas++
        this.textoEstrelas.setText(String(this.estrelas))
        tocar('estrela')
      } else if (o.tipo === 'nitro') {
        this.nitroAte = this.time.now + NITRO.ms
        tocar('nitro')
      } else if (this.time.now >= this.batidaAte) {
        this.batidaAte = this.time.now + BATIDA.ms
        tocar('batida')
      }
    }
  }

  atualizarMinimapa () {
    this.pontos.clear()
    this.adversarios.forEach((a, i) => this.pontos.fillStyle(CORES_ADV[i], 1).fillCircle(...this.mini(a.pos), 7))
    const [tx, ty] = this.mini(this.percorrido)
    this.pontos.fillStyle(this.corTheo, 1).lineStyle(3, 0x000000, 1).fillCircle(tx, ty, 11).strokeCircle(tx, ty, 11)
  }

  ultimaVolta () {
    this.avisouUltima = true
    tocar('volta')
    const aviso = this.add.text(360, 420, 'ÚLTIMA VOLTA!', { fontSize: '72px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#FFEB3B', stroke: '#000000', strokeThickness: 10 })
      .setOrigin(0.5).setDepth(20).setScale(0)
    this.tweens.add({ targets: aviso, scale: 1, duration: 300, ease: 'Back.out', hold: 1200, yoyo: true, onComplete: () => aviso.destroy() })
  }

  chegar (posicao) {
    this.terminou = true
    this.fogo.setVisible(false)
    tocar('vitoria')
    this.confete(posicao === 1 ? 60 : 30)
    const grande = (emoji, tamanho) => this.add.text(360, 560, emoji, { fontSize: `${tamanho}px`, fontFamily: FONTE }).setOrigin(0.5).setDepth(20)
    if (posicao === 1) {
      const trofeu = grande('🏆', 260).setScale(0)
      this.tweens.add({ targets: trofeu, scale: 1, duration: 500, ease: 'Back.out' })
    } else {
      this.tweens.add({ targets: grande(MEDALHAS[posicao - 1], 220), scale: 1.2, duration: 400, yoyo: true, repeat: 1 })
    }
    this.time.delayedCall(2000, () => this.scene.start('Presente', { posicao, estrelas: this.estrelas, corridaId: Date.now() }))
  }

  confete (quantos) {
    const cores = [0xE53935, 0xFDD835, 0x1E88E5, 0x43A047, 0xF06292, 0xFFFFFF]
    for (let i = 0; i < quantos; i++) {
      const p = this.add.rectangle(Phaser.Math.Between(0, 720), Phaser.Math.Between(-300, -20), 16, 26, Phaser.Utils.Array.GetRandom(cores)).setDepth(15)
      this.tweens.add({ targets: p, y: 1350, angle: Phaser.Math.Between(180, 720), x: p.x + Phaser.Math.Between(-120, 120), duration: Phaser.Math.Between(1200, 2000) })
    }
  }
}
