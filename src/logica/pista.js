import { LARGURA_PISTA, pontoNa, maisProximo } from './circuito.js'

const OBSTACULOS = ['cone', 'oleo', 'pneus']
const DECORACAO = ['arvore_g', 'arvore_p', 'arvore_g', 'pedra_1', 'pedra_2', 'pedra_3', 'tenda_v', 'tenda_a']

// Um objeto a cada 600 px da volta: estrela 50%, obstáculo 30% (nunca antes de 800 px), nitro 20% (mín. 1500 px entre nitros).
export function gerarObjetos (rng, comprimentoVolta) {
  const lista = []
  let ultimoNitro = -Infinity
  for (let pos = 600; pos < comprimentoVolta - 300; pos += 600) {
    const faixa = Math.floor(rng() * 3)
    const r = rng()
    let tipo = 'estrela'
    if (r >= 0.5 && r < 0.8 && pos >= 800) tipo = OBSTACULOS[Math.floor(rng() * OBSTACULOS.length)]
    else if (r >= 0.8 && pos - ultimoNitro >= 1500) { tipo = 'nitro'; ultimoNitro = pos }
    lista.push({ pos, faixa, tipo })
  }
  return lista
}

// Enfeites na grama, alternando os lados a cada 250 px da linha; nada em cima do asfalto (nem de outro trecho).
// Arquibancadas do lado de fora (esquerda, no sentido horário), perto da largada.
export function gerarCenario (rng, c) {
  const L = c.comprimento
  const lista = []
  const longe = (x, y) => Math.abs(maisProximo(c, x, y).afastamento) >= LARGURA_PISTA / 2 + 80
  const colocar = (d, lado, dist, tipo) => {
    const p = pontoNa(c, d)
    const n = p.angulo + lado * Math.PI / 2 // lado 1 = direita, -1 = esquerda
    const x = p.x + Math.cos(n) * dist
    const y = p.y + Math.sin(n) * dist
    if (longe(x, y)) lista.push({ x, y, tipo, angulo: p.angulo })
  }
  colocar(300, -1, LARGURA_PISTA / 2 + 160, 'arquibancada')
  colocar(L - 300, -1, LARGURA_PISTA / 2 + 160, 'arquibancada')
  let lado = 1
  for (let d = 700; d < L - 700; d += 250) {
    colocar(d, lado, LARGURA_PISTA / 2 + 140 + rng() * 120, DECORACAO[Math.floor(rng() * DECORACAO.length)])
    lado = -lado
  }
  return lista
}
