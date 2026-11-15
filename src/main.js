import Phaser from 'phaser'
import Inicio from './cenas/Inicio.js'
import Garagem from './cenas/Garagem.js'

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'jogo',
  backgroundColor: '#87CEEB',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 720, height: 1280 },
  input: { activePointers: 2 },
  scene: [Inicio, Garagem]
})
