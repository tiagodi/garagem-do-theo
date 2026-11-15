import Phaser from 'phaser'
import { botao } from '../ui.js'

// Stub até a Task 7.
export default class Presente extends Phaser.Scene {
  constructor () { super('Presente') }
  create () { botao(this, 360, 640, '🎁', () => this.scene.start('Garagem'), 200) }
}
