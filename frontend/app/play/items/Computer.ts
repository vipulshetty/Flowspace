import { ItemType } from '../types/Items'
import Item from './Item'

export default class Computer extends Item {
  id?: string
  currentUsers = new Set<string>()

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame)
    this.itemType = ItemType.COMPUTER
  }

  onOverlapDialog() {
    if (this.currentUsers.size === 0) {
      this.setDialogBox('Press R to use computer')
    } else {
      this.setDialogBox('Press R to join')
    }
  }

  openDialog(playerId: string, network?: any) {
    // Simple implementation - can be extended for screen sharing
    if (!this.currentUsers.has(playerId)) {
      this.currentUsers.add(playerId)
      this.clearDialogBox()
      this.setStatusBox(`${this.currentUsers.size} ${this.currentUsers.size === 1 ? 'user' : 'users'}`)
    }
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
