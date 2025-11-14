import Phaser from 'phaser'
import { createCharacterAnims } from '../anims/CharacterAnims'
import Item from '../items/Item'
import Chair from '../items/Chair'
import Computer from '../items/Computer'
import Whiteboard from '../items/Whiteboard'
import VendingMachine from '../items/VendingMachine'
import '../characters/MyPlayer'
import MyPlayer from '../characters/MyPlayer'
import PlayerSelector from '../characters/PlayerSelector'
import { NavKeys } from '../types/KeyboardState'

export default class Game extends Phaser.Scene {
  private cursors!: NavKeys
  private keyE!: Phaser.Input.Keyboard.Key
  private keyR!: Phaser.Input.Keyboard.Key
  private map!: Phaser.Tilemaps.Tilemap
  myPlayer!: MyPlayer
  private playerSelector!: PlayerSelector
  computerMap = new Map<string, Computer>()
  private whiteboardMap = new Map<string, Whiteboard>()

  constructor() {
    super('game')
  }

  registerKeys() {
    this.cursors = {
      ...this.input.keyboard!.createCursorKeys(),
      W: this.input.keyboard!.addKey('W'),
      S: this.input.keyboard!.addKey('S'),
      A: this.input.keyboard!.addKey('A'),
      D: this.input.keyboard!.addKey('D'),
    }

    this.keyE = this.input.keyboard!.addKey('E')
    this.keyR = this.input.keyboard!.addKey('R')
    this.input.keyboard!.disableGlobalCapture()
  }

  create() {
    createCharacterAnims(this.anims)

    this.map = this.make.tilemap({ key: 'tilemap' })
    const FloorAndGround = this.map.addTilesetImage('FloorAndGround', 'tiles_wall')

    if (!FloorAndGround) {
      console.error('Failed to load FloorAndGround tileset')
      return
    }

    const groundLayer = this.map.createLayer('Ground', FloorAndGround)
    if (groundLayer) {
      groundLayer.setCollisionByProperty({ collides: true })
    }

    // Create player
    this.myPlayer = this.add.myPlayer(705, 500, 'adam', 'player1')
    this.myPlayer.setPlayerName('Player')
    this.playerSelector = new PlayerSelector(this, 0, 0, 16, 16)

    // Import chair objects from Tiled map
    const chairs = this.physics.add.staticGroup({ classType: Chair })
    const chairLayer = this.map.getObjectLayer('Chair')
    if (chairLayer) {
      chairLayer.objects.forEach((chairObj) => {
        const item = this.addObjectFromTiled(chairs, chairObj, 'chairs', 'chair') as Chair
        if (chairObj.properties && chairObj.properties[0]) {
          item.itemDirection = chairObj.properties[0].value
        }
      })
    }

    // Import computer objects from Tiled map
    const computers = this.physics.add.staticGroup({ classType: Computer })
    const computerLayer = this.map.getObjectLayer('Computer')
    if (computerLayer) {
      computerLayer.objects.forEach((obj, i) => {
        const item = this.addObjectFromTiled(computers, obj, 'computers', 'computer') as Computer
        item.setDepth(item.y + item.height * 0.27)
        const id = `${i}`
        item.id = id
        this.computerMap.set(id, item)
      })
    }

    // Import whiteboard objects from Tiled map
    const whiteboards = this.physics.add.staticGroup({ classType: Whiteboard })
    const whiteboardLayer = this.map.getObjectLayer('Whiteboard')
    if (whiteboardLayer) {
      whiteboardLayer.objects.forEach((obj, i) => {
        const item = this.addObjectFromTiled(
          whiteboards,
          obj,
          'whiteboards',
          'whiteboard'
        ) as Whiteboard
        const id = `${i}`
        item.id = id
        this.whiteboardMap.set(id, item)
      })
    }

    // Import vending machines
    const vendingMachines = this.physics.add.staticGroup({ classType: VendingMachine })
    const vendingMachineLayer = this.map.getObjectLayer('VendingMachine')
    if (vendingMachineLayer) {
      vendingMachineLayer.objects.forEach((obj) => {
        this.addObjectFromTiled(vendingMachines, obj, 'vendingmachines', 'vendingmachine')
      })
    }

    // Import other objects from Tiled map
    this.addGroupFromTiled('Wall', 'tiles_wall', 'FloorAndGround', false)
    this.addGroupFromTiled('Objects', 'office', 'Modern_Office_Black_Shadow', false)
    this.addGroupFromTiled('ObjectsOnCollide', 'office', 'Modern_Office_Black_Shadow', true)
    this.addGroupFromTiled('GenericObjects', 'generic', 'Generic', false)
    this.addGroupFromTiled('GenericObjectsOnCollide', 'generic', 'Generic', true)
    this.addGroupFromTiled('Basement', 'basement', 'Basement', true)

    // Set up camera
    this.cameras.main.zoom = 1.5
    this.cameras.main.startFollow(this.myPlayer, true)

    // Set up collision with items
    this.physics.add.overlap(
      this.playerSelector,
      [chairs, computers, whiteboards, vendingMachines],
      (obj1, obj2) => {
        const selector = obj1 as any as PlayerSelector
        const item = obj2 as any as Item
        if (selector.selectedItem === undefined) {
          item.onOverlapDialog()
          selector.selectedItem = item
        }
      },
      undefined,
      this
    )

    // Set up collisions with ground
    if (groundLayer) {
      this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], groundLayer)
    }

    this.registerKeys()
  }

  private addObjectFromTiled(
    group: Phaser.Physics.Arcade.StaticGroup,
    object: Phaser.Types.Tilemaps.TiledObject,
    key: string,
    tilesetName: string
  ) {
    const actualX = object.x! + object.width! * 0.5
    const actualY = object.y! - object.height! * 0.5
    const tileset = this.map.getTileset(tilesetName)
    if (!tileset) {
      console.error(`Tileset ${tilesetName} not found`)
      return
    }
    const obj = group
      .get(actualX, actualY, key, object.gid! - tileset.firstgid)
      .setDepth(actualY)
    return obj
  }

  private addGroupFromTiled(
    objectLayerName: string,
    key: string,
    tilesetName: string,
    collidable: boolean
  ) {
    const group = this.physics.add.staticGroup()
    const objectLayer = this.map.getObjectLayer(objectLayerName)
    if (!objectLayer) return

    const tileset = this.map.getTileset(tilesetName)
    if (!tileset) return

    objectLayer.objects.forEach((object) => {
      const actualX = object.x! + object.width! * 0.5
      const actualY = object.y! - object.height! * 0.5
      group
        .get(actualX, actualY, key, object.gid! - tileset.firstgid)
        .setDepth(actualY)
    })
    
    if (this.myPlayer && collidable) {
      this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], group)
    }
  }

  update() {
    if (this.myPlayer && this.playerSelector) {
      this.playerSelector.update(this.myPlayer)
      this.myPlayer.update(this.playerSelector, this.cursors, this.keyE, this.keyR)
    }

    // Clear selected item if player moves away
    if (this.playerSelector.selectedItem) {
      const distance = Phaser.Math.Distance.Between(
        this.myPlayer.x,
        this.myPlayer.y,
        this.playerSelector.selectedItem.x,
        this.playerSelector.selectedItem.y
      )
      
      if (distance > 50) {
        this.playerSelector.selectedItem.clearDialogBox()
        this.playerSelector.selectedItem = undefined
      }
    }
  }
}
