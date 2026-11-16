// Direção pelo dedo com assistência invisível: perto do centro manda o dedo, perto da borda manda a pista.
import { LARGURA_PISTA, pontoNa, maisProximo, avancar } from './circuito.js'
import { VELOCIDADE_BASE } from './adversarios.js'

export const GIRO_MAX = 3.5 // rad/s
export const FATOR_GRAMA = 0.6
export const OLHAR_A_FRENTE = 250
const DEDO_MINIMO = 40

// Diferença b - a em (-π, π].
const difAngulo = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a))
const limitar = (v, min, max) => Math.min(Math.max(v, min), max)

export function novoAngulo ({ angulo, x, y, dedo, alvoPista, tangente, afastamento, dt }) {
  const angPista = Math.atan2(alvoPista.y - y, alvoPista.x - x)
  const comDedo = dedo && Math.hypot(dedo.x - x, dedo.y - y) >= DEDO_MINIMO
  const angDedo = comDedo ? Math.atan2(dedo.y - y, dedo.x - x) : angPista
  const peso = comDedo ? limitar((Math.abs(afastamento) - 40) / 120, 0, 1) : 1
  let desejado = angDedo + peso * difAngulo(angDedo, angPista)
  // Nunca de ré: no máximo 90° para cada lado da pista.
  desejado = tangente + limitar(difAngulo(tangente, desejado), -Math.PI / 2, Math.PI / 2)
  const passo = GIRO_MAX * dt
  return angulo + limitar(difAngulo(angulo, desejado), -passo, passo)
}

export const naGrama = afastamento => Math.abs(afastamento) > LARGURA_PISTA / 2

// Simula o Theo sozinho (sem nitro nem batida). Usada nos testes e para calibrar.
export function simularVoltas (c, voltas, dedoFn, { dt = 1 / 30, maxSegundos = 200 } = {}) {
  const L = c.comprimento
  const inicio = pontoNa(c, 0)
  const e = { x: inicio.x, y: inicio.y, angulo: inicio.angulo, d: 0, percorrido: 0 }
  let segundos = 0
  let maxAfastamento = 0
  while (e.percorrido < voltas * L && segundos < maxSegundos) {
    const { d, afastamento } = maisProximo(c, e.x, e.y, e.d)
    e.percorrido = avancar(e.percorrido, e.d, d, L)
    e.d = d
    maxAfastamento = Math.max(maxAfastamento, Math.abs(afastamento))
    e.angulo = novoAngulo({
      ...e, dedo: dedoFn(e), alvoPista: pontoNa(c, d + OLHAR_A_FRENTE), tangente: pontoNa(c, d).angulo, afastamento, dt
    })
    const vel = VELOCIDADE_BASE * (naGrama(afastamento) ? FATOR_GRAMA : 1)
    e.x += Math.cos(e.angulo) * vel * dt
    e.y += Math.sin(e.angulo) * vel * dt
    segundos += dt
  }
  return { completou: e.percorrido >= voltas * L, segundos, maxAfastamento, percorrido: e.percorrido }
}
