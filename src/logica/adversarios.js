// Adversários "elásticos": ficam perto do Theo e freiam na reta final, para ele quase sempre ganhar.
export const COMPRIMENTO_PISTA = 15000
export const VELOCIDADE_BASE = 330
const CHANCE_OUSADO = 0.15 // ousado não freia no fim: o Theo chega em 2º

export function criarAdversarios (rng = Math.random) {
  const lista = [0, 1, 2].map(i => ({ faixa: i, pos: i * 120, vel: VELOCIDADE_BASE, ousado: false }))
  if (rng() < CHANCE_OUSADO) lista[Math.floor(rng() * 3)].ousado = true
  return lista
}

export function velocidadeAlvo (adv, posTheo) {
  const gap = adv.pos - posTheo
  let v
  if (gap > 0) v = VELOCIDADE_BASE * (1 - 0.35 * Math.min(gap / 400, 1))
  else if (gap < -500) v = VELOCIDADE_BASE * 1.2
  else v = VELOCIDADE_BASE * 0.92
  if (posTheo / COMPRIMENTO_PISTA > 0.85 && !adv.ousado) v *= 0.75
  return v
}

// Aproxima a velocidade da alvo (10% a cada 1/30 s) e anda.
export function atualizarAdversario (adv, posTheo, dt) {
  const fator = 1 - Math.pow(0.9, dt * 30)
  adv.vel += (velocidadeAlvo(adv, posTheo) - adv.vel) * fator
  adv.pos += adv.vel * dt
}

// Posição final (1..4) com o Theo na velocidade base. Empate conta a favor do Theo.
export function simularCorrida (rng) {
  const advs = criarAdversarios(rng)
  const dt = 1 / 30
  let posTheo = 0
  while (posTheo < COMPRIMENTO_PISTA) {
    posTheo += VELOCIDADE_BASE * dt
    advs.forEach(a => atualizarAdversario(a, posTheo, dt))
  }
  return 1 + advs.filter(a => a.pos > posTheo).length
}
