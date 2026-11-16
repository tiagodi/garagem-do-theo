// Sons sintetizados: nenhum arquivo de áudio.
let ctx = null

function contexto () {
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext
  if (!AC) return null
  // Criado no primeiro toque: o navegador só libera áudio após interação.
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tom (c, { freq, freqFim = freq, dur, tipo = 'sine', vol = 0.25, atraso = 0 }) {
  const t0 = c.currentTime + atraso
  const osc = c.createOscillator()
  const ganho = c.createGain()
  osc.type = tipo
  osc.frequency.setValueAtTime(freq, t0)
  osc.frequency.exponentialRampToValueAtTime(freqFim, t0 + dur)
  ganho.gain.setValueAtTime(vol, t0)
  ganho.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
  osc.connect(ganho).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur)
}

function ruido (c, { dur, freqFiltro = 1000, vol = 0.2, subir = false }) {
  const amostras = Math.floor(c.sampleRate * dur)
  const buffer = c.createBuffer(1, amostras, c.sampleRate)
  const dados = buffer.getChannelData(0)
  for (let i = 0; i < amostras; i++) dados[i] = Math.random() * 2 - 1
  const fonte = c.createBufferSource()
  fonte.buffer = buffer
  const filtro = c.createBiquadFilter()
  filtro.type = 'bandpass'
  filtro.frequency.setValueAtTime(freqFiltro, c.currentTime)
  if (subir) filtro.frequency.exponentialRampToValueAtTime(freqFiltro * 4, c.currentTime + dur)
  const ganho = c.createGain()
  ganho.gain.setValueAtTime(vol, c.currentTime)
  ganho.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
  fonte.connect(filtro).connect(ganho).connect(c.destination)
  fonte.start()
}

const arpejo = (c, notas) => notas.forEach((freq, i) => tom(c, { freq, dur: 0.18, tipo: 'triangle', atraso: i * 0.12 }))

const SONS = {
  toque: c => tom(c, { freq: 660, dur: 0.06, tipo: 'triangle' }),
  estrela: c => tom(c, { freq: 880, freqFim: 1320, dur: 0.15, tipo: 'triangle' }),
  nitro: c => ruido(c, { dur: 1.5, freqFiltro: 300, vol: 0.3, subir: true }),
  batida: c => tom(c, { freq: 120, freqFim: 60, dur: 0.25, tipo: 'square', vol: 0.15 }),
  agua: c => ruido(c, { dur: 0.2, freqFiltro: 2500, vol: 0.12 }),
  vitoria: c => arpejo(c, [523, 659, 784, 1047]),
  presente: c => arpejo(c, [784, 988, 1175]),
  volta: c => arpejo(c, [659, 880, 1047]),
  espuma: c => ruido(c, { dur: 0.15, freqFiltro: 600, vol: 0.15 })
}

export function tocar (nome) {
  try {
    const c = contexto()
    if (c && SONS[nome]) SONS[nome](c)
  } catch {
    // Som nunca pode travar o jogo.
  }
}
