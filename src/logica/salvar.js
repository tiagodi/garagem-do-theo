import { CATALOGO } from './catalogo.js'

const CHAVE = 'garagem-do-theo:v1'
const IDS_INICIAIS = CATALOGO.filter(i => i.inicial).map(i => i.id)

export function ESTADO_INICIAL () {
  return { ganhos: [...IDS_INICIAIS], vistos: [...IDS_INICIAIS], carroAtual: 'carro-carrinho', porCarro: {}, estrelas: 0, ultimaCorrida: 0 }
}

export function visualDe (estado, carroId) {
  return estado.porCarro[carroId] ?? {
    cor: 0xE53935,
    aerofolio: 'aerofolio-nenhum',
    teto: 'teto-nenhum',
    rodas: 'rodas-nenhum',
    escapamento: 'escapamento-laranja',
    adesivos: []
  }
}

export function carregar (storage = globalThis.localStorage) {
  const inicial = ESTADO_INICIAL()
  let salvo
  try {
    salvo = JSON.parse(storage.getItem(CHAVE))
  } catch {
    return inicial
  }
  if (!salvo || typeof salvo !== 'object' || Array.isArray(salvo)) return inicial

  const estado = { ...inicial, ...salvo }
  const lista = v => (Array.isArray(v) ? v : [])
  estado.ganhos = [...new Set([...IDS_INICIAIS, ...lista(salvo.ganhos)])]
  estado.vistos = [...new Set([...IDS_INICIAIS, ...lista(salvo.vistos)])]
  if (!estado.porCarro || typeof estado.porCarro !== 'object') estado.porCarro = {}
  if (!Number.isFinite(estado.estrelas)) estado.estrelas = 0
  if (!Number.isFinite(estado.ultimaCorrida)) estado.ultimaCorrida = 0
  if (!estado.ganhos.includes(estado.carroAtual)) estado.carroAtual = 'carro-carrinho'
  return estado
}

export function gravar (estado, storage = globalThis.localStorage) {
  try {
    storage.setItem(CHAVE, JSON.stringify(estado))
  } catch {
    // Sem espaço ou bloqueado: o jogo continua, só não lembra.
  }
}
