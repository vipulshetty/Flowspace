import { ItemType } from '../types/Items'
import Item from './Item'

export default class Whiteboard extends Item {
  id?: string
  currentUsers = new Set<string>()

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame)
    this.itemType = ItemType.WHITEBOARD
  }

  onOverlapDialog() {
    if (this.currentUsers.size === 0) {
      this.setDialogBox('Press R to use whiteboard')
    } else {
      this.setDialogBox('Press R to join')
    }
  }

  openDialog(network?: any) {
    // Simple implementation - can be extended for collaborative whiteboard
    this.clearDialogBox()
    this.setDialogBox('Whiteboard opened')
  }

  addUser(playerId: string) {
    this.currentUsers.add(playerId)
    this.clearStatusBox()
    this.setStatusBox(`${this.currentUsers.size} ${this.currentUsers.size === 1 ? 'user' : 'users'}`)
  }

  removeUser(playerId: string) {
    if (this.currentUsers.has(playerId)) {
      this.currentUsers.delete(playerId)
      this.clearStatusBox()
      if (this.currentUsers.size > 0) {
        this.setStatusBox(`${this.currentUsers.size} ${this.currentUsers.size === 1 ? 'user' : 'users'}`)
      }
    }
  }
}
