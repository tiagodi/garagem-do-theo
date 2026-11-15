import { describe, it, expect } from 'vitest'
import { tocar } from './sons.js'

describe('tocar', () => {
  it('não lança erro sem AudioContext', () => {
    expect(globalThis.AudioContext).toBeUndefined()
    expect(() => tocar('toque')).not.toThrow()
  })
})
