import Phaser from 'phaser'
import { botao } from '../ui.js'

// Stub até a Task 3.
export default class Garagem extends Phaser.Scene {
  constructor () { super('Garagem') }
  create () { botao(this, 360, 640, '🏁', () => this.scene.start('Inicio'), 200) }
}
