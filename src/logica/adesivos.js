// Posições x/y relativas ao carro: -1..1 (borda a borda). Fora disso = fora do carro.
export const MAX_ADESIVOS = 8

const dentro = (x, y) => Math.abs(x) <= 1 && Math.abs(y) <= 1

export function colarAdesivo (visual, emoji, x, y) {
  if (visual.adesivos.length >= MAX_ADESIVOS || !dentro(x, y)) return visual
  return { ...visual, adesivos: [...visual.adesivos, { emoji, x, y }] }
}

export function moverAdesivo (visual, indice, x, y) {
  const adesivos = dentro(x, y)
    ? visual.adesivos.map((a, i) => (i === indice ? { ...a, x, y } : a))
    : visual.adesivos.filter((_, i) => i !== indice)
  return { ...visual, adesivos }
}
