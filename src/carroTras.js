// Carro visto por trás, desenhado num Graphics. (x, y) = chão, no centro; w = largura do carrinho.
const VIDRO = 0x90CAF9
const ESCURO = 0x263238

// larg/alt: proporções do modelo; cabine: largura da cabine em relação à carroceria.
const FORMAS = {
  carrinho: { larg: 1, alt: 1, cabine: 0.68 },
  esportivo: { larg: 1.1, alt: 0.8, cabine: 0.6 },
  caminhonete: { larg: 1.05, alt: 1.1, cabine: 0.72 },
  onibus: { larg: 1.05, alt: 1.9, cabine: 0.94 },
  policia: { larg: 1, alt: 1, cabine: 0.68 }
}

// Retângulo arredondado sem raio maior que o próprio retângulo (carros longe ficam minúsculos).
function rr (g, x, y, w, h, r) {
  g.fillRoundedRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)))
}

export function desenharCarroTras (g, x, y, w0, { modelo, cor, aerofolio = 'nenhum', teto = 'nenhum', rodas = 0x9E9E9E }) {
  const f = FORMAS[modelo] ?? FORMAS.carrinho
  const w = w0 * f.larg
  const h = w0 * 0.62 * f.alt
  const onibus = modelo === 'onibus'

  g.fillStyle(0x000000, 0.25).fillEllipse(x, y, w * 1.1, h * 0.16 / f.alt)
  // Rodas com aro colorido.
  for (const lado of [-1, 1]) {
    const rx = x + lado * w * 0.4
    g.fillStyle(0x111111, 1)
    rr(g, rx - w * 0.1, y - w * 0.2, w * 0.2, w * 0.2, w * 0.03)
    g.fillStyle(rodas, 1)
    rr(g, rx - w * 0.05, y - w * 0.15, w * 0.1, w * 0.1, w * 0.02)
  }
  // Carroceria e cabine.
  g.fillStyle(cor, 1)
  rr(g, x - w * 0.47, y - h * 0.75, w * 0.94, h * 0.6, w * 0.08)
  const cabH = onibus ? h * 0.7 : h * 0.4
  const cabY = y - h * 0.75 - cabH + h * 0.1
  rr(g, x - w * f.cabine / 2, cabY, w * f.cabine, cabH, w * 0.1)
  g.fillStyle(VIDRO, 1)
  rr(g, x - w * (f.cabine / 2 - 0.06), cabY + cabH * 0.12, w * (f.cabine - 0.12), cabH * (onibus ? 0.5 : 0.65), w * 0.05)
  if (modelo === 'caminhonete') {
    g.fillStyle(0x5D4037, 1)
    rr(g, x - w * 0.4, y - h * 0.7, w * 0.8, h * 0.28, w * 0.03)
  }
  // Lanternas, para-choque e placa.
  g.fillStyle(0xFF1744, 1)
  rr(g, x - w * 0.43, y - h * 0.6, w * 0.16, h * 0.12, w * 0.02)
  rr(g, x + w * 0.27, y - h * 0.6, w * 0.16, h * 0.12, w * 0.02)
  g.fillStyle(ESCURO, 1).fillRect(x - w * 0.45, y - h * 0.26, w * 0.9, h * 0.1)
  g.fillStyle(0xFFFFFF, 1).fillRect(x - w * 0.12, y - h * 0.44, w * 0.24, h * 0.09)

  // Teto: a viatura sem peça escolhida usa sirene.
  const t = teto === 'nenhum' && modelo === 'policia' ? 'sirene' : teto
  const topo = cabY
  if (t === 'sirene') {
    g.fillStyle(0xE53935, 1).fillRect(x - w * 0.2, topo - w * 0.08, w * 0.2, w * 0.08)
    g.fillStyle(0x2979FF, 1).fillRect(x, topo - w * 0.08, w * 0.2, w * 0.08)
  } else if (t === 'bagageiro') {
    g.fillStyle(0x6D4C41, 1).fillRect(x - w * 0.3, topo - w * 0.06, w * 0.6, w * 0.03)
    for (const px of [-0.28, 0, 0.25]) g.fillRect(x + w * px, topo - w * 0.06, w * 0.03, w * 0.06)
  } else if (t === 'faixa') {
    g.fillStyle(0xFFFFFF, 0.9)
    for (const px of [-0.16, 0.06]) g.fillRect(x + w * px, cabY, w * 0.1, y - h * 0.15 - cabY)
  }

  // Aerofólio por cima da traseira.
  g.fillStyle(ESCURO, 1)
  const base = y - h * 0.75
  if (aerofolio === 'baixo') rr(g, x - w * 0.5, base - w * 0.04, w, w * 0.06, w * 0.02)
  else if (aerofolio === 'alto') {
    g.fillRect(x - w * 0.3, base - w * 0.14, w * 0.04, w * 0.14).fillRect(x + w * 0.26, base - w * 0.14, w * 0.04, w * 0.14)
    rr(g, x - w * 0.56, base - w * 0.2, w * 1.12, w * 0.07, w * 0.02)
  } else if (aerofolio === 'duplo') {
    rr(g, x - w * 0.52, base - w * 0.06, w * 1.04, w * 0.05, w * 0.02)
    rr(g, x - w * 0.56, base - w * 0.15, w * 1.12, w * 0.05, w * 0.02)
  }
}

// Onde os adesivos ficam na traseira (até 3), em relação ao chão no centro.
export function adesivosTras (w0, modelo) {
  const f = FORMAS[modelo] ?? FORMAS.carrinho
  const w = w0 * f.larg
  const h = w0 * 0.62 * f.alt
  return [{ x: -w * 0.3, y: -h * 0.35 }, { x: w * 0.3, y: -h * 0.35 }, { x: 0, y: -h * 0.62 }]
}

// Altura da carroceria (para posicionar o fogo do nitro).
export const alturaTras = (w0, modelo) => w0 * 0.62 * (FORMAS[modelo] ?? FORMAS.carrinho).alt
