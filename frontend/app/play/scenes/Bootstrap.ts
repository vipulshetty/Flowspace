import Phaser from 'phaser'

export default class Bootstrap extends Phaser.Scene {
  private preloadComplete = false

  constructor() {
    super('bootstrap')
  }

  preload() {
    // Load tilemap
    this.load.tilemapTiledJSON('tilemap', '/assets/map/map.json')
    
    // Load tilesets
    this.load.spritesheet('tiles_wall', '/assets/map/FloorAndGround.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    
    // Load item spritesheets
    this.load.spritesheet('chairs', '/assets/items/chair.png', {
      frameWidth: 32,
      frameHeight: 64,
    })
    this.load.spritesheet('computers', '/assets/items/computer.png', {
      frameWidth: 96,
      frameHeight: 64,
    })
    this.load.spritesheet('whiteboards', '/assets/items/whiteboard.png', {
      frameWidth: 64,
      frameHeight: 64,
    })
    this.load.spritesheet('vendingmachines', '/assets/items/vendingmachine.png', {
      frameWidth: 48,
      frameHeight: 72,
    })
    
    // Load office tilesets
    this.load.spritesheet('office', '/assets/tileset/Modern_Office_Black_Shadow.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('basement', '/assets/tileset/Basement.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('generic', '/assets/tileset/Generic.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    
    // Load character spritesheets with atlases
    this.load.atlas('adam', '/assets/character/adam.png', '/assets/character/adam.json')
    this.load.atlas('ash', '/assets/character/ash.png', '/assets/character/ash.json')
    this.load.atlas('lucy', '/assets/character/lucy.png', '/assets/character/lucy.json')
    this.load.atlas('nancy', '/assets/character/nancy.png', '/assets/character/nancy.json')

    this.load.on('complete', () => {
      this.preloadComplete = true
    })
  }

  create() {
    if (this.preloadComplete) {
      this.scene.start('game')
    }
  }
}
