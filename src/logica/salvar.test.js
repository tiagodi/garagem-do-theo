import { describe, it, expect } from 'vitest'
import { carregar, gravar, ESTADO_INICIAL, visualDe } from './salvar.js'
import { CATALOGO } from './catalogo.js'

function storageFalso (inicial = null) {
  const dados = { 'garagem-do-theo:v1': inicial }
  return {
    getItem: k => dados[k] ?? null,
    setItem: (k, v) => { dados[k] = v }
  }
}

const iniciais = CATALOGO.filter(i => i.inicial).map(i => i.id)

describe('carregar', () => {
  it('storage vazio → estado inicial', () => {
    expect(carregar(storageFalso())).toEqual(ESTADO_INICIAL())
  })

  it('JSON corrompido → estado inicial', () => {
    expect(carregar(storageFalso('{lixo'))).toEqual(ESTADO_INICIAL())
  })

  it('storage que lança → estado inicial', () => {
    const quebrado = { getItem: () => { throw new Error('bloqueado') } }
    expect(carregar(quebrado)).toEqual(ESTADO_INICIAL())
  })

  it('save antigo sem item inicial novo → item inicial incluído', () => {
    const antigo = JSON.stringify({ ...ESTADO_INICIAL(), ganhos: ['carro-carrinho', 'cor-roxo'] })
    const estado = carregar(storageFalso(antigo))
    for (const id of iniciais) expect(estado.ganhos).toContain(id)
    expect(estado.ganhos).toContain('cor-roxo')
  })

  it('carroAtual não ganho → carrinho', () => {
    const salvo = JSON.stringify({ ...ESTADO_INICIAL(), carroAtual: 'carro-onibus' })
    expect(carregar(storageFalso(salvo)).carroAtual).toBe('carro-carrinho')
  })

  it('ida e volta preserva o estado', () => {
    const s = storageFalso()
    const estado = ESTADO_INICIAL()
    estado.ganhos.push('carro-onibus')
    estado.carroAtual = 'carro-onibus'
    estado.estrelas = 7
    estado.porCarro['carro-onibus'] = { ...visualDe(estado, 'carro-onibus'), cor: 0x1E88E5 }
    gravar(estado, s)
    expect(carregar(s)).toEqual(estado)
  })
})

describe('gravar', () => {
  it('não lança quando setItem lança', () => {
    const cheio = { setItem: () => { throw new Error('cota') } }
    expect(() => gravar(ESTADO_INICIAL(), cheio)).not.toThrow()
  })
})

describe('visualDe', () => {
  it('carro sem visual salvo → padrão vermelho sem peças', () => {
    const v = visualDe(ESTADO_INICIAL(), 'carro-carrinho')
    expect(v).toEqual({ cor: 0xE53935, aerofolio: 'aerofolio-nenhum', teto: 'teto-nenhum', rodas: 'rodas-nenhum', escapamento: 'escapamento-laranja', adesivos: [] })
  })
})
