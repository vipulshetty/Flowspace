import Phaser from 'phaser'
import Item from '../items/Item'

export default class PlayerSelector extends Phaser.GameObjects.Zone {
  selectedItem?: Item

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y, width, height)
    scene.physics.world.enable(this)
  }

  update(player: Phaser.Physics.Arcade.Sprite) {
    // Update selector position to match player
    this.setPosition(player.x, player.y)
  }
}
