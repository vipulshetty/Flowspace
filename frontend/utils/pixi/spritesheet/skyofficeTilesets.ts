import { SpriteSheetTile } from './spritesheet'
import { SpriteSheetData } from './SpriteSheetData'

type Layer = 'floor' | 'above_floor' | 'object'

const generateTiles = (
  tileCount: number,
  columns: number,
  tileWidth: number,
  tileHeight: number,
  defaultLayer: Layer,
): SpriteSheetTile[] => {
  const sprites: SpriteSheetTile[] = []
  for (let index = 0; index < tileCount; index += 1) {
    const x = (index % columns) * tileWidth
    const y = Math.floor(index / columns) * tileHeight
    sprites.push({
      name: `tile_${index}`,
      x,
      y,
      width: tileWidth,
      height: tileHeight,
      layer: defaultLayer,
    })
  }
  return sprites
}

const floorAndGroundSpriteSheetData = new SpriteSheetData(
  2048,
  1280,
  '/assets/map/FloorAndGround.png',
  generateTiles(2560, 64, 32, 32, 'floor'),
)

const modernOfficeSpriteSheetData = new SpriteSheetData(
  512,
  1696,
  '/assets/tileset/Modern_Office_Black_Shadow.png',
  generateTiles(848, 16, 32, 32, 'object'),
)

const genericSpriteSheetData = new SpriteSheetData(
  512,
  2496,
  '/assets/tileset/Generic.png',
  generateTiles(1248, 16, 32, 32, 'object'),
)

const basementSpriteSheetData = new SpriteSheetData(
  512,
  1600,
  '/assets/tileset/Basement.png',
  generateTiles(800, 16, 32, 32, 'object'),
)

const chairSpriteSheetData = new SpriteSheetData(
  32,
  1472,
  '/assets/items/chair.png',
  generateTiles(23, 1, 32, 64, 'above_floor'),
)

const computerSpriteSheetData = new SpriteSheetData(
  480,
  64,
  '/assets/items/computer.png',
  generateTiles(5, 5, 96, 64, 'object'),
)

const whiteboardSpriteSheetData = new SpriteSheetData(
  64,
  192,
  '/assets/items/whiteboard.png',
  generateTiles(3, 1, 64, 64, 'object'),
)

const vendingMachineSpriteSheetData = new SpriteSheetData(
  48,
  72,
  '/assets/items/vendingmachine.png',
  generateTiles(1, 1, 48, 72, 'object'),
)

export {
  floorAndGroundSpriteSheetData,
  modernOfficeSpriteSheetData,
  genericSpriteSheetData,
  basementSpriteSheetData,
  chairSpriteSheetData,
  computerSpriteSheetData,
  whiteboardSpriteSheetData,
  vendingMachineSpriteSheetData,
}
