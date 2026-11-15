import Phaser from 'phaser'
import { botao, FONTE } from '../ui.js'

export default class Inicio extends Phaser.Scene {
  constructor () { super('Inicio') }

  create () {
    this.saindo = false
    this.add.text(360, 260, 'Garagem\ndo Theo', {
      fontSize: '96px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#E53935',
      stroke: '#FFFFFF', strokeThickness: 14, align: 'center'
    }).setOrigin(0.5)
    const carro = this.add.text(360, 600, '🏎️', { fontSize: '200px', fontFamily: FONTE }).setOrigin(0.5)
    this.tweens.add({ targets: carro, y: 580, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' })
    // Discreto, para o adulto conferir se o celular já pegou a atualização.
    this.add.text(705, 1265, `v ${__VERSAO__}`, { fontSize: '26px', fontFamily: 'sans-serif', color: '#FFFFFF' }).setOrigin(1).setAlpha(0.8)
    botao(this, 360, 950, '▶️', () => {
      if (this.saindo) return
      this.saindo = true
      this.scene.start('Garagem')
    }, 200)
  }
}
