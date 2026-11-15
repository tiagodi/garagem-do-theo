import Phaser from 'phaser'
import { porId } from './logica/catalogo.js'
import { FONTE } from './ui.js'
import { MODELOS, medidas } from './logica/modelos.js'

const VIDRO = 0xBBDEFB
const ESCURO = 0x263238

export { medidas }

function valor (id, padrao) {
  return porId(id)?.valor ?? padrao
}

// Desenha o carro num Container. Expõe container.fogo (nitro), container.dims ({w, h}) e container.adesivos (textos).
export function criarCarro (cena, x, y, modelo, visual, escala = 1) {
  if (!MODELOS[modelo]) modelo = 'carrinho'
  const { w, h, raio, sprite } = medidas(modelo)
  const c = cena.add.container(x, y)
  const g = cena.add.graphics()
  c.add(g)

  // Fogo do escapamento: atrás de tudo, invisível até o nitro.
  const fogo = cena.add.graphics()
  const corFogo = valor(visual.escapamento, 0xFF6D00)
  fogo.fillStyle(corFogo, 0.9)
  fogo.fillTriangle(-w * 0.3, h / 2, -w * 0.1, h / 2, -w * 0.2, h / 2 + 70)
  fogo.fillTriangle(w * 0.1, h / 2, w * 0.3, h / 2, w * 0.2, h / 2 + 70)
  fogo.fillStyle(0xFFF59D, 1)
  fogo.fillTriangle(-w * 0.26, h / 2, -w * 0.14, h / 2, -w * 0.2, h / 2 + 35)
  fogo.fillTriangle(w * 0.14, h / 2, w * 0.26, h / 2, w * 0.2, h / 2 + 35)
  fogo.setVisible(false)
  c.addAt(fogo, 0)

  // Rodas, meio para fora da carroceria.
  const aro = valor(visual.rodas, 0x9E9E9E)
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const rx = sx * w / 2 - 15
      const ry = sy * h * 0.3 - 26
      g.fillStyle(0x111111, 1).fillRoundedRect(rx, ry, 30, 52, 10)
      g.fillStyle(aro, 1).fillRoundedRect(rx + 6, ry + 9, 18, 34, 6)
    }
  }

  // Carroceria: sprite do Kenney pintado com tint; sem a textura (ou ônibus), desenho em código.
  const comSprite = sprite && cena.textures.exists(`corpo_${sprite}`)
  if (comSprite) {
    c.add(cena.add.image(0, 0, `corpo_${sprite}`).setDisplaySize(w, h).setTint(visual.cor))
    c.add(cena.add.image(0, 0, `detalhe_${sprite}`).setDisplaySize(w, h))
  } else {
    desenharCorpo(g, modelo, visual.cor, w, h, raio)
  }

  // Peças por cima da carroceria.
  const pecas = cena.add.graphics()
  c.add(pecas)
  let teto = valor(visual.teto, 'nenhum')
  if (modelo === 'policia') {
    if (!comSprite) pecas.fillStyle(0xFFFFFF, 1).fillRect(-w / 2 + 4, -h * 0.06, w - 8, h * 0.14)
    if (teto === 'nenhum') teto = 'sirene' // viatura sempre tem sirene, salvo outra peça escolhida
  }

  desenharTeto(pecas, teto, w, h)
  desenharAerofolio(pecas, valor(visual.aerofolio, 'nenhum'), w, h)

  c.adesivos = visual.adesivos.map(a => {
    const t = cena.add.text(a.x * w / 2, a.y * h / 2, a.emoji, { fontSize: '40px', fontFamily: FONTE }).setOrigin(0.5)
    c.add(t)
    return t
  })

  c.fogo = fogo
  c.dims = { w, h }
  c.setSize(w + 30, h)
  c.setScale(escala)
  return c
}

// Carroceria desenhada em código: ônibus e reserva se o sprite não carregar.
function desenharCorpo (g, modelo, cor, w, h, raio) {
  // Ônibus imita o estilo do Kenney: contorno grosso escuro.
  g.fillStyle(cor, 1).lineStyle(modelo === 'onibus' ? 8 : 6, 0x000000, modelo === 'onibus' ? 0.45 : 0.25)
  if (modelo === 'esportivo') {
    const bico = [[-0.2, -0.5], [0.2, -0.5], [0.5, -0.15], [0.5, 0.42], [0.4, 0.5], [-0.4, 0.5], [-0.5, 0.42], [-0.5, -0.15]]
      .map(([x, y]) => new Phaser.Math.Vector2(x * w, y * h))
    g.fillPoints(bico, true).strokePoints(bico, true)
  } else {
    g.fillRoundedRect(-w / 2, -h / 2, w, h, raio).strokeRoundedRect(-w / 2, -h / 2, w, h, raio)
  }

  // Detalhes de cada modelo.
  if (modelo === 'onibus') {
    g.fillStyle(VIDRO, 1).fillRoundedRect(-w * 0.4, -h / 2 + 14, w * 0.8, 34, 10)
    g.fillStyle(VIDRO, 1).fillRoundedRect(-w / 2 + 8, -h / 2 + 64, 16, h - 90, 6)
    g.fillStyle(VIDRO, 1).fillRoundedRect(w / 2 - 24, -h / 2 + 64, 16, h - 90, 6)
    g.fillStyle(0xFFFFFF, 0.7).fillEllipse(-w * 0.3, -h / 2 + 8, 24, 8)
  } else if (modelo === 'caminhonete') {
    g.fillStyle(VIDRO, 1).fillRoundedRect(-w * 0.36, -h * 0.3, w * 0.72, h * 0.13, 12)
    // Caçamba aberta bem marcada, com tábuas.
    g.fillStyle(0x5D4037, 1).fillRoundedRect(-w * 0.38, h * 0.0, w * 0.76, h * 0.44, 8)
    g.lineStyle(4, 0x3E2723, 1)
    for (let i = 1; i < 4; i++) g.lineBetween(-w * 0.38, h * 0.11 * i, w * 0.38, h * 0.11 * i)
    g.lineStyle(6, 0x000000, 0.35).strokeRoundedRect(-w * 0.38, h * 0.0, w * 0.76, h * 0.44, 8)
  } else {
    const baixo = modelo === 'esportivo'
    g.fillStyle(VIDRO, 1).fillRoundedRect(-w * 0.36, -h * (baixo ? 0.22 : 0.27), w * 0.72, h * 0.15, 16)
    g.fillStyle(VIDRO, 1).fillRoundedRect(-w * 0.32, h * 0.2, w * 0.64, h * 0.1, 12)
  }
}

function desenharTeto (g, teto, w, h) {
  if (teto === 'sirene') {
    g.fillStyle(0xE53935, 1).fillRoundedRect(-w * 0.3, -14, w * 0.3, 28, 8)
    g.fillStyle(0x2979FF, 1).fillRoundedRect(0, -14, w * 0.3, 28, 8)
  } else if (teto === 'bagageiro') {
    g.lineStyle(6, 0x6D4C41, 1).strokeRect(-w * 0.3, -h * 0.1, w * 0.6, h * 0.24)
    for (let i = 1; i < 4; i++) g.lineBetween(-w * 0.3, -h * 0.1 + i * h * 0.06, w * 0.3, -h * 0.1 + i * h * 0.06)
  } else if (teto === 'faixa') {
    g.fillStyle(0xFFFFFF, 0.9).fillRect(-w * 0.16, -h / 2 + 6, w * 0.1, h - 12)
    g.fillStyle(0xFFFFFF, 0.9).fillRect(w * 0.06, -h / 2 + 6, w * 0.1, h - 12)
  }
}

function desenharAerofolio (g, aerofolio, w, h) {
  if (aerofolio === 'nenhum') return
  g.fillStyle(ESCURO, 1)
  if (aerofolio === 'baixo') {
    g.fillRoundedRect(-w * 0.5, h / 2 - 22, w, 16, 6)
  } else if (aerofolio === 'alto') {
    g.fillRect(-w * 0.3, h / 2 - 16, 8, 24).fillRect(w * 0.3 - 8, h / 2 - 16, 8, 24)
    g.fillRoundedRect(-w * 0.62, h / 2 + 4, w * 1.24, 20, 8)
  } else if (aerofolio === 'duplo') {
    g.fillRoundedRect(-w * 0.55, h / 2 - 22, w * 1.1, 14, 6)
    g.fillRoundedRect(-w * 0.6, h / 2 + 2, w * 1.2, 14, 6)
  }
}
