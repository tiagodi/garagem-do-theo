import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { MODELOS, medidas } from './modelos.js'
import { CATALOGO } from './catalogo.js'

const pasta = new URL('../../public/assets/kenney/', import.meta.url)
// Largura e altura ficam nos bytes 16–23 do cabeçalho PNG.
function tamanhoPng (arquivo) {
  const b = readFileSync(new URL(arquivo, pasta))
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }
}

describe('MODELOS', () => {
  it('todo carro do catálogo tem modelo', () => {
    for (const carro of CATALOGO.filter(i => i.tipo === 'carro')) expect(MODELOS[carro.valor]).toBeDefined()
  })

  it('todo sprite tem as duas camadas no projeto', () => {
    for (const m of Object.values(MODELOS).filter(m => m.sprite)) {
      expect(existsSync(new URL(`corpo_${m.sprite}.png`, pasta))).toBe(true)
      expect(existsSync(new URL(`detalhe_${m.sprite}.png`, pasta))).toBe(true)
    }
  })

  it('medidas seguem a proporção do sprite com largura entre 100 e 140', () => {
    for (const m of Object.values(MODELOS).filter(m => m.sprite)) {
      const png = tamanhoPng(`corpo_${m.sprite}.png`)
      expect(m.w).toBeGreaterThanOrEqual(100)
      expect(m.w).toBeLessThanOrEqual(140)
      expect(m.h / m.w).toBeCloseTo(png.h / png.w, 2)
    }
  })

  it('modelo desconhecido cai no carrinho', () => {
    expect(medidas('foguete')).toEqual(medidas('carrinho'))
  })
})

describe('spriteDisponivel', () => {
  it('só usa o sprite com as duas camadas carregadas', async () => {
    const { spriteDisponivel } = await import('./modelos.js')
    const tudo = () => true
    expect(spriteDisponivel('carrinho', tudo)).toBe(2)
    expect(spriteDisponivel('carrinho', chave => chave !== 'detalhe_2')).toBeNull()
    expect(spriteDisponivel('carrinho', chave => chave !== 'corpo_2')).toBeNull()
    expect(spriteDisponivel('onibus', tudo)).toBeNull()
  })
})
