import { CATALOGO } from './catalogo.js'

export const ESTRELAS_POR_BARRA = 20
const CHANCE_CARRO = 0.4

const escolher = (lista, rng) => lista[Math.floor(rng() * lista.length)]

export function sortearPresente (ganhos, rng) {
  const faltando = CATALOGO.filter(i => !ganhos.includes(i.id))
  if (faltando.length === 0) return null
  const carros = faltando.filter(i => i.tipo === 'carro')
  const outros = faltando.filter(i => i.tipo !== 'carro')
  if (carros.length && (rng() < CHANCE_CARRO || outros.length === 0)) return escolher(carros, rng)
  return escolher(outros, rng)
}

// Idempotente por corridaId: abrir duas vezes a mesma corrida não dá presente em dobro.
export function abrirPresente (estado, corridaId, estrelasDaCorrida, rng) {
  if (corridaId <= estado.ultimaCorrida) return { estado, itens: [] }

  const totalEstrelas = estado.estrelas + estrelasDaCorrida
  const quantos = 1 + Math.floor(totalEstrelas / ESTRELAS_POR_BARRA)
  const ganhos = [...estado.ganhos]
  const itens = []
  for (let i = 0; i < quantos; i++) {
    const item = sortearPresente(ganhos, rng)
    if (!item) break
    ganhos.push(item.id)
    itens.push(item)
  }
  return {
    estado: { ...estado, ganhos, estrelas: totalEstrelas % ESTRELAS_POR_BARRA, ultimaCorrida: corridaId },
    itens
  }
}
