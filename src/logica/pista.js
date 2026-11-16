
const OBSTACULOS = ['cone', 'oleo', 'pneus']
const DECORACAO = ['arvore', 'arvore', 'pinheiro', 'pinheiro', 'pedra', 'tenda']

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

// Enfeites dos lados da estrada: um a cada 150 px, alternando os lados; arquibancadas na largada, do lado de fora.
export function gerarEnfeites (rng, L) {
  const lista = [{ d: 150, x: -2, tipo: 'arquibancada' }, { d: L - 150, x: -2, tipo: 'arquibancada' }]
  let lado = 1
  for (let d = 450; d < L - 450; d += 150) {
    lista.push({ d, x: lado * (1.5 + rng() * 1.1), tipo: DECORACAO[Math.floor(rng() * DECORACAO.length)] })
    lado = -lado
  }
  return lista
}
