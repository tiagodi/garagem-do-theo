// Tudo que pode ser ganho. id = '<tipo>-<nome>'. inicial = já vem liberado.
const item = (tipo, nome, valor, inicial = false) => ({ id: `${tipo}-${nome}`, tipo, valor, inicial })

export const CATALOGO = [
  item('carro', 'carrinho', 'carrinho', true),
  item('carro', 'esportivo', 'esportivo'),
  item('carro', 'caminhonete', 'caminhonete'),
  item('carro', 'onibus', 'onibus'),
  item('carro', 'policia', 'policia'),

  item('cor', 'vermelho', 0xE53935, true),
  item('cor', 'azul', 0x1E88E5, true),
  item('cor', 'amarelo', 0xFDD835, true),
  item('cor', 'verde', 0x43A047, true),
  item('cor', 'laranja', 0xFB8C00),
  item('cor', 'roxo', 0x8E24AA),
  item('cor', 'rosa', 0xF06292),
  item('cor', 'preto', 0x263238),
  item('cor', 'branco', 0xF5F5F5),
  item('cor', 'dourado', 0xFFC107),

  item('aerofolio', 'nenhum', 'nenhum', true),
  item('aerofolio', 'baixo', 'baixo', true),
  item('aerofolio', 'alto', 'alto'),
  item('aerofolio', 'duplo', 'duplo'),

  item('teto', 'nenhum', 'nenhum', true),
  item('teto', 'sirene', 'sirene'),
  item('teto', 'bagageiro', 'bagageiro'),
  item('teto', 'faixa', 'faixa', true),

  item('rodas', 'nenhum', 0x9E9E9E, true),
  item('rodas', 'branco', 0xFFFFFF, true),
  item('rodas', 'amarelo', 0xFDD835),
  item('rodas', 'vermelho', 0xE53935),

  item('escapamento', 'laranja', 0xFF6D00, true),
  item('escapamento', 'azul', 0x2979FF, true),
  item('escapamento', 'verde', 0x00E676),
  item('escapamento', 'roxo', 0xD500F9),

  ...['⭐', '❤️', '🔥', '⚡'].map((e, i) => item('adesivo', `i${i}`, e, true)),
  ...['🦖', '🚀', '🐶', '🐱', '🌈', '⚽', '🦁', '🐸', '🍕', '👑', '🦈', '🐉'].map((e, i) => item('adesivo', `g${i}`, e))
]

export const porId = id => CATALOGO.find(i => i.id === id)
