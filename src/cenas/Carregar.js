import Phaser from 'phaser'

// Sprites do Kenney (public/assets/kenney): só os carros vistos de cima. Se algum falhar, o carro cai no desenho em código.
const SPRITES = ['corpo_2', 'corpo_3', 'corpo_4', 'corpo_5', 'detalhe_2', 'detalhe_3', 'detalhe_4', 'detalhe_5']

export default class Carregar extends Phaser.Scene {
  constructor () { super('Carregar') }

  preload () {
    for (const nome of SPRITES) this.load.image(nome, `assets/kenney/${nome}.png`)
  }

  create () { this.scene.start('Inicio') }
}
