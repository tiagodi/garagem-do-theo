import Phaser from 'phaser'
import Carregar from './cenas/Carregar.js'
import Inicio from './cenas/Inicio.js'
import Garagem from './cenas/Garagem.js'
import Corrida from './cenas/Corrida.js'
import LavaJato from './cenas/LavaJato.js'
import Presente from './cenas/Presente.js'

const jogo = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'jogo',
  backgroundColor: '#87CEEB',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 720, height: 1280 },
  input: { activePointers: 2 },
  scene: [Carregar, Inicio, Garagem, Corrida, LavaJato, Presente]
})

// Só em desenvolvimento: deixa o jogo acessível para testar pelo console.
if (import.meta.env.DEV) window.jogo = jogo

// Só no build publicado (HTTPS): em dev o cache-first serviria arquivos velhos.
if (import.meta.env.PROD && location.protocol === 'https:' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
}
