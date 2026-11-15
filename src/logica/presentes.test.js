import { describe, it, expect } from 'vitest'
import { sortearPresente, abrirPresente, ESTRELAS_POR_BARRA } from './presentes.js'
import { CATALOGO } from './catalogo.js'
import { ESTADO_INICIAL } from './salvar.js'

const todos = CATALOGO.map(i => i.id)
const semItens = (...faltando) => todos.filter(id => !faltando.includes(id))

describe('sortearPresente', () => {
  it('com tudo ganho → null', () => {
    expect(sortearPresente(todos, Math.random)).toBeNull()
  })
  it('sorteio baixo com carro faltando → carro', () => {
    expect(sortearPresente(semItens('carro-onibus', 'cor-roxo'), () => 0.1).id).toBe('carro-onibus')
  })
  it('sorteio alto → não-carro', () => {
    expect(sortearPresente(semItens('carro-onibus', 'cor-roxo'), () => 0.9).id).toBe('cor-roxo')
  })
  it('só carros faltando → carro mesmo com sorteio alto', () => {
    expect(sortearPresente(semItens('carro-onibus'), () => 0.9).id).toBe('carro-onibus')
  })
})

describe('abrirPresente', () => {
  it('sem estrelas → 1 presente garantido', () => {
    const { estado, itens } = abrirPresente(ESTADO_INICIAL(), 1000, 0, () => 0.5)
    expect(itens).toHaveLength(1)
    expect(estado.ganhos).toContain(itens[0].id)
    expect(estado.ultimaCorrida).toBe(1000)
  })
  it('barra de estrelas completa → presente extra e resto guardado', () => {
    expect(ESTRELAS_POR_BARRA).toBe(20)
    const inicial = { ...ESTADO_INICIAL(), estrelas: 15 }
    const { estado, itens } = abrirPresente(inicial, 1000, 7, () => 0.5)
    expect(itens).toHaveLength(2)
    expect(estado.estrelas).toBe(2)
  })
  it('mesma corrida duas vezes → nada novo', () => {
    const primeira = abrirPresente(ESTADO_INICIAL(), 1000, 0, () => 0.5)
    const segunda = abrirPresente(primeira.estado, 1000, 0, () => 0.5)
    expect(segunda.itens).toEqual([])
    expect(segunda.estado).toEqual(primeira.estado)
  })
  it('com tudo ganho → nenhum item, estrelas ainda contam', () => {
    const cheio = { ...ESTADO_INICIAL(), ganhos: [...todos] }
    const { estado, itens } = abrirPresente(cheio, 1000, 5, () => 0.5)
    expect(itens).toEqual([])
    expect(estado.estrelas).toBe(5)
  })
})
