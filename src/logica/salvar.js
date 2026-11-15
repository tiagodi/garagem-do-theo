import { CATALOGO } from './catalogo.js'

const CHAVE = 'garagem-do-theo:v1'
const IDS_INICIAIS = CATALOGO.filter(i => i.inicial).map(i => i.id)

export function ESTADO_INICIAL () {
  return { ganhos: [...IDS_INICIAIS], vistos: [...IDS_INICIAIS], carroAtual: 'carro-carrinho', porCarro: {}, estrelas: 0, ultimaCorrida: 0 }
}

const VISUAL_PADRAO = {
  cor: 0xE53935,
  aerofolio: 'aerofolio-nenhum',
  teto: 'teto-nenhum',
  rodas: 'rodas-nenhum',
  escapamento: 'escapamento-laranja',
  adesivos: []
}

// Cada modelo nasce com a sua cor: carro novo não pode parecer igual ao anterior.
const COR_DO_MODELO = {
  'carro-carrinho': 0xE53935,
  'carro-esportivo': 0xFDD835,
  'carro-caminhonete': 0x43A047,
  'carro-onibus': 0xFFA000,
  'carro-policia': 0x263238
}

export function visualDe (estado, carroId) {
  const v = { ...VISUAL_PADRAO, cor: COR_DO_MODELO[carroId] ?? VISUAL_PADRAO.cor, ...estado.porCarro[carroId] }
  if (!Array.isArray(v.adesivos)) v.adesivos = []
  return v
}

// Ler globalThis.localStorage já lança quando o navegador bloqueia dados do site: fica dentro do try.
export function carregar (storage) {
  const inicial = ESTADO_INICIAL()
  let salvo
  try {
    salvo = JSON.parse((storage ?? globalThis.localStorage).getItem(CHAVE))
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

export function gravar (estado, storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(CHAVE, JSON.stringify(estado))
  } catch {
    // Sem espaço ou bloqueado: o jogo continua, só não lembra.
  }
}
