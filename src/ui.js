import { tocar } from './sons.js'

export const FONTE = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'

// Emoji tocável com pulinho e som. tamanho = altura da fonte em px lógicos (>= 80).
export function botao (cena, x, y, emoji, aoTocar, tamanho = 120) {
  const b = cena.add.text(x, y, emoji, { fontSize: `${tamanho}px`, fontFamily: FONTE, padding: { y: tamanho * 0.15 } })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
  b.on('pointerdown', () => {
    tocar('toque')
    pulinho(cena, b)
    aoTocar()
  })
  return b
}

export function pulinho (cena, alvo) {
  const sx = alvo.scaleX
  const sy = alvo.scaleY
  cena.tweens.add({ targets: alvo, scaleX: sx * 1.15, scaleY: sy * 1.15, duration: 60, yoyo: true })
}
