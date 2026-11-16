import Phaser from 'phaser'

// Sprites do Kenney (public/assets/kenney). Se algum falhar, o carro cai no desenho em código.
const SPRITES = [
  'corpo_2', 'corpo_3', 'corpo_4', 'corpo_5', 'detalhe_2', 'detalhe_3', 'detalhe_4', 'detalhe_5',
  'adv_1', 'adv_2', 'adv_3', 'cone', 'oleo', 'pneus', 'seta', 'arvore_g', 'arvore_p',
  'pedra_1', 'pedra_2', 'pedra_3', 'tenda_v', 'tenda_a', 'arquibancada', 'grama'
]

export default class Carregar extends Phaser.Scene {
  constructor () { super('Carregar') }

  preload () {
    for (const nome of SPRITES) this.load.image(nome, `assets/kenney/${nome}.png`)
  }

  create () { this.scene.start('Inicio') }
}
