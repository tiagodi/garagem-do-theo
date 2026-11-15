import { COMPRIMENTO_PISTA } from './adversarios.js'

const OBSTACULOS = ['cone', 'oleo', 'pneus']
const DECORACAO = ['arvore_g', 'arvore_p', 'arvore_g', 'pedra_1', 'pedra_2', 'pedra_3', 'tenda_v', 'tenda_a']

// Um objeto a cada 600 px: estrela 50%, obstáculo 30% (nunca antes de 800 px), nitro 20% (mín. 1500 px entre nitros).
export function gerarObjetos (rng) {
  const lista = []
  let ultimoNitro = -Infinity
  for (let pos = 600; pos < COMPRIMENTO_PISTA - 300; pos += 600) {
    const faixa = Math.floor(rng() * 3)
    const r = rng()
    let tipo = 'estrela'
    if (r >= 0.5 && r < 0.8 && pos >= 800) tipo = OBSTACULOS[Math.floor(rng() * OBSTACULOS.length)]
    else if (r >= 0.8 && pos - ultimoNitro >= 1500) { tipo = 'nitro'; ultimoNitro = pos }
    lista.push({ pos, faixa, tipo })
  }
  return lista
}

// Enfeites na grama, alternando os lados a cada 250 px; arquibancada no máximo a cada 2000 px.
export function gerarCenario (rng) {
  const lista = []
  let ultimaArquibancada = -Infinity
  let lado = -1
  for (let pos = 0; pos < COMPRIMENTO_PISTA + 1500; pos += 250) {
    let tipo = DECORACAO[Math.floor(rng() * DECORACAO.length)]
    if (rng() < 0.15 && pos - ultimaArquibancada >= 2000) { tipo = 'arquibancada'; ultimaArquibancada = pos }
    lista.push({ pos, lado, tipo })
    lado = -lado
  }
  return lista
}
