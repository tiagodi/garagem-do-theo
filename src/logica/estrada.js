// Estrada pseudo-3D: curvatura por segmento a partir do circuito, e o movimento lateral do carro.
import { pontoNa } from './circuito.js'

export const PX_POR_SEGMENTO = 12 // px de circuito por segmento: é o ajuste da sensação de velocidade
export const LIMITE_LATERAL = 1.6 // 0 = centro, ±1 = borda do asfalto
export const FATOR_GRAMA = 0.6
const K_CURVA = 165
const CURVA_MAX = 4
const JANELA = 60 // px: suaviza a curvatura (a linha é amostrada a cada 20 px)
const VIRAR = 2.2
const EMPURRAO = 0.3
const VOLTA = 1.5

const difAngulo = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a))
const limitar = (v, max) => Math.min(Math.max(v, -max), max)

export function curvaturas (c) {
  const n = Math.floor(c.comprimento / PX_POR_SEGMENTO)
  return Array.from({ length: n }, (_, i) => {
    const d = (i + 0.5) * PX_POR_SEGMENTO
    const giro = difAngulo(pontoNa(c, d - JANELA).angulo, pontoNa(c, d + JANELA).angulo)
    return limitar(giro * PX_POR_SEGMENTO / (2 * JANELA) * K_CURVA, CURVA_MAX)
  })
}

export function moverLateral ({ x, dedo, curva, pct, dt }) {
  x += dedo * VIRAR * pct * dt
  x -= curva * EMPURRAO * pct * dt
  if (dedo === 0) x -= x * Math.min(VOLTA * dt, 1)
  return limitar(x, LIMITE_LATERAL)
}

export const naGrama = x => Math.abs(x) > 1

export const aFrente = (dObjeto, dTheo, L) => ((dObjeto - dTheo) % L + L) % L

// passo = quanto o carro andou neste quadro: com nitro num celular lento, ele não pula o objeto.
export const colide = (objX, dist, x, passo = 0) => dist < PX_POR_SEGMENTO * 2 + passo && Math.abs(objX - x) < 0.35
