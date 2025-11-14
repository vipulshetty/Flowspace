import Phaser from 'phaser'
import PlayerSelector from './PlayerSelector'
import { PlayerBehavior } from '../types/PlayerBehavior'
import { sittingShiftData } from './Player'
import Player from './Player'
import Chair from '../items/Chair'
import Computer from '../items/Computer'
import Whiteboard from '../items/Whiteboard'
import { ItemType } from '../types/Items'
import { NavKeys } from '../types/KeyboardState'

export default class MyPlayer extends Player {
  private playContainerBody: Phaser.Physics.Arcade.Body
  private chairOnSit?: Chair

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, id, frame)
    this.playContainerBody = this.playerContainer.body as Phaser.Physics.Arcade.Body
  }

  setPlayerName(name: string) {
    this.playerName.setText(name)
  }

  setPlayerTexture(texture: string) {
    this.playerTexture = texture
    this.anims.play(`${this.playerTexture}_idle_down`, true)
  }

  update(
    playerSelector: PlayerSelector,
    cursors: NavKeys,
    keyE: Phaser.Input.Keyboard.Key,
    keyR: Phaser.Input.Keyboard.Key
  ) {
    if (!cursors) return

    const item = playerSelector.selectedItem
    const speed = 200

    // Handle R key for computer/whiteboard
    if (Phaser.Input.Keyboard.JustDown(keyR)) {
      switch (item?.itemType) {
        case ItemType.COMPUTER:
          const computer = item as Computer
          computer.openDialog(this.playerId)
          break
        case ItemType.WHITEBOARD:
          const whiteboard = item as Whiteboard
          whiteboard.openDialog()
          break
        case ItemType.VENDINGMACHINE:
          // Can add custom logic here
          break
      }
    }

    switch (this.playerBehavior) {
      case PlayerBehavior.IDLE:
        // Handle E key for sitting
        if (Phaser.Input.Keyboard.JustDown(keyE) && item?.itemType === ItemType.CHAIR) {
          const chairItem = item as Chair
          this.scene.time.addEvent({
            delay: 10,
            callback: () => {
              // Stop movement
              this.setVelocity(0, 0)
              if (chairItem.itemDirection) {
                this.setPosition(
                  chairItem.x + sittingShiftData[chairItem.itemDirection][0],
                  chairItem.y + sittingShiftData[chairItem.itemDirection][1]
                ).setDepth(chairItem.depth + sittingShiftData[chairItem.itemDirection][2])

                // Play sitting animation
                this.play(`${this.playerTexture}_sit_${chairItem.itemDirection}`, true)
                this.playerContainer.setPosition(
                  this.x,
                  this.y - this.height
                )
              }
              // Update player behavior
              this.playerBehavior = PlayerBehavior.SITTING
              this.chairOnSit = chairItem
            },
            loop: false,
          })
        }

        // Handle movement with WASD and arrow keys
        if (cursors.left.isDown || cursors.A.isDown) {
          this.setVelocity(-speed, 0)
          this.play(`${this.playerTexture}_run_left`, true)
        } else if (cursors.right.isDown || cursors.D.isDown) {
          this.setVelocity(speed, 0)
          this.play(`${this.playerTexture}_run_right`, true)
        } else if (cursors.up.isDown || cursors.W.isDown) {
          this.setVelocity(0, -speed)
          this.play(`${this.playerTexture}_run_up`, true)
        } else if (cursors.down.isDown || cursors.S.isDown) {
          this.setVelocity(0, speed)
          this.play(`${this.playerTexture}_run_down`, true)
        } else {
          this.setVelocity(0, 0)
          const parts = this.anims.currentAnim?.key.split('_')
          if (parts && parts[1] === 'run') {
            this.play(`${this.playerTexture}_idle_${parts[2]}`, true)
          }
        }
        break

      case PlayerBehavior.SITTING:
        // Press E to stand up
        if (Phaser.Input.Keyboard.JustDown(keyE)) {
          const parts = this.anims.currentAnim?.key.split('_')
          if (parts && parts.length === 3) {
            this.playerContainer.setPosition(this.x, this.y - 30)
            this.play(`${this.playerTexture}_idle_${parts[2]}`, true)
            this.playerBehavior = PlayerBehavior.IDLE
            this.chairOnSit = undefined
          }
        }
        break
    }

    // Update player depth based on Y position
    this.setDepth(this.y)
    this.updatePlayerNamePosition()
  }
}

// Register with Phaser's GameObjectFactory
declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      myPlayer(
        x: number,
        y: number,
        texture: string,
        id: string,
        frame?: string | number
      ): MyPlayer
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'myPlayer',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    const sprite = new MyPlayer(this.scene, x, y, texture, id, frame)

    this.displayList.add(sprite)
    this.updateList.add(sprite)

    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

    const collisionScale = [0.5, 0.2]
    const body = sprite.body as Phaser.Physics.Arcade.Body
    body
      .setSize(sprite.width * collisionScale[0], sprite.height * collisionScale[1])
      .setOffset(sprite.width * 0.25, sprite.height * 0.67)

    return sprite
  }
)
