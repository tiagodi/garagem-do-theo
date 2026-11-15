// Modelos de carro: sprite do Kenney Racing Pack (N do arquivo car_*_N) ou null = desenhado em código.
// w/h = medidas na escala 1; para sprites, tamanho do PNG × FATOR (mantém a proporção).
const FATOR = 0.55 // PNGs em alta resolução (~220 px de largura) → ~120 na escala 1

const sprite = (n, wPng, hPng) => ({ sprite: n, w: wPng * FATOR, h: hPng * FATOR, raio: 30 })

export const MODELOS = {
  carrinho: sprite(2, 222, 362),
  esportivo: sprite(3, 218, 407),
  caminhonete: sprite(4, 219, 407),
  policia: sprite(5, 216, 375),
  onibus: { sprite: null, w: 140, h: 260, raio: 22 }
}

export const medidas = modelo => MODELOS[modelo] ?? MODELOS.carrinho

// N do sprite só se as duas camadas carregaram; senão null (desenho em código). existe(chave) → boolean.
export function spriteDisponivel (modelo, existe) {
  const n = medidas(modelo).sprite
  return n && existe(`corpo_${n}`) && existe(`detalhe_${n}`) ? n : null
}
