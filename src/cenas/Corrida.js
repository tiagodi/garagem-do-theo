import Phaser from 'phaser'
import { botao } from '../ui.js'

// Stub até a Task 6.
export default class Corrida extends Phaser.Scene {
  constructor () { super('Corrida') }
  create () { botao(this, 360, 640, '🏆', () => this.scene.start('Garagem'), 200) }
}
