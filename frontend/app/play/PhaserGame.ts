import Phaser from 'phaser'
import Bootstrap from './scenes/Bootstrap'
import Game from './scenes/Game'

export const phaserGameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-container',
  backgroundColor: '#93cbee',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  autoFocus: true,
  scene: [Bootstrap, Game],
}

let phaserGame: Phaser.Game | null = null

export const initializePhaserGame = (parent: string = 'phaser-container'): Phaser.Game => {
  if (phaserGame) {
    phaserGame.destroy(true)
  }
  
  const config = {
    ...phaserGameConfig,
    parent,
  }
  
  phaserGame = new Phaser.Game(config)
  return phaserGame
}

export const destroyPhaserGame = () => {
  if (phaserGame) {
    phaserGame.destroy(true)
    phaserGame = null
  }
}

export const getPhaserGame = () => phaserGame

export default phaserGame
