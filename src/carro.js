import { porId } from './logica/catalogo.js'
import { FONTE } from './ui.js'

// Medidas de cada modelo visto de cima (frente para cima), em px na escala 1.
const MODELOS = {
  carrinho: { w: 120, h: 200, raio: 40 },
  esportivo: { w: 130, h: 190, raio: 55 },
  caminhonete: { w: 124, h: 220, raio: 30 },
  onibus: { w: 140, h: 260, raio: 22 },
  policia: { w: 120, h: 200, raio: 40 }
}

const VIDRO = 0xBBDEFB
const ESCURO = 0x263238

export const medidas = modelo => MODELOS[modelo] ?? MODELOS.carrinho

function valor (id, padrao) {
  return porId(id)?.valor ?? padrao
}

// Desenha o carro num Container. Expõe container.fogo (nitro) e container.dims ({w, h}).
export function criarCarro (cena, x, y, modelo, visual, escala = 1) {
  const { w, h, raio } = medidas(modelo)
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
      g.fillStyle(aro, 1).fillRoundedRect(rx + 9, ry + 14, 12, 24, 5)
    }
  }

  // Carroceria com contorno.
  g.fillStyle(visual.cor, 1).fillRoundedRect(-w / 2, -h / 2, w, h, raio)
  g.lineStyle(6, 0x000000, 0.25).strokeRoundedRect(-w / 2, -h / 2, w, h, raio)

  // Detalhes de cada modelo.
  if (modelo === 'onibus') {
    g.fillStyle(VIDRO, 1).fillRoundedRect(-w * 0.4, -h / 2 + 14, w * 0.8, 34, 10)
    g.fillStyle(VIDRO, 1).fillRoundedRect(-w / 2 + 8, -h / 2 + 64, 16, h - 90, 6)
    g.fillStyle(VIDRO, 1).fillRoundedRect(w / 2 - 24, -h / 2 + 64, 16, h - 90, 6)
  } else if (modelo === 'caminhonete') {
    g.fillStyle(VIDRO, 1).fillRoundedRect(-w * 0.36, -h * 0.3, w * 0.72, h * 0.13, 12)
    g.fillStyle(0x000000, 0.2).fillRoundedRect(-w * 0.38, h * 0.02, w * 0.76, h * 0.42, 10)
  } else {
    const baixo = modelo === 'esportivo'
    g.fillStyle(VIDRO, 1).fillRoundedRect(-w * 0.36, -h * (baixo ? 0.22 : 0.27), w * 0.72, h * 0.15, 16)
    g.fillStyle(VIDRO, 1).fillRoundedRect(-w * 0.32, h * 0.2, w * 0.64, h * 0.1, 12)
  }
  if (modelo === 'policia') {
    g.fillStyle(0xFFFFFF, 1).fillRect(-w / 2 + 4, -h * 0.06, w - 8, h * 0.14)
  }

  desenharTeto(g, valor(visual.teto, 'nenhum'), w, h)
  desenharAerofolio(g, valor(visual.aerofolio, 'nenhum'), w, h)

  for (const a of visual.adesivos) {
    c.add(cena.add.text(a.x * w / 2, a.y * h / 2, a.emoji, { fontSize: '40px', fontFamily: FONTE }).setOrigin(0.5))
  }

  c.fogo = fogo
  c.dims = { w, h }
  c.setSize(w + 30, h)
  c.setScale(escala)
  return c
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
