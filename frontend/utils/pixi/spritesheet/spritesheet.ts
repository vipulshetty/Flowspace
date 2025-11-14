import * as PIXI from 'pixi.js'
import { citySpriteSheetData } from './city'
import { groundSpriteSheetData } from './ground'
import { grasslandsSpriteSheetData } from './grasslands'
import { villageSpriteSheetData } from './village'
import { modernSpriteSheetData } from './modern'
import { Layer } from '../types'
import { SpriteSheetData } from './SpriteSheetData'
import {
    basementSpriteSheetData,
    chairSpriteSheetData,
    computerSpriteSheetData,
    floorAndGroundSpriteSheetData,
    genericSpriteSheetData,
    modernOfficeSpriteSheetData,
    vendingMachineSpriteSheetData,
    whiteboardSpriteSheetData,
} from './skyofficeTilesets'

export type Collider = {
    x: number,
    y: number,
}

export interface SpriteSheetTile {
    name: string,
    x: number
    y: number
    width: number
    height: number
    layer?: Layer
    colliders?: Collider[]
}

type Sheets = {
    [key in SheetName]?: PIXI.Spritesheet
}

export type SheetName =
    | 'ground'
    | 'grasslands'
    | 'village'
    | 'city'
    | 'modern'
    | 'floorandground'
    | 'modern_office'
    | 'generic_office'
    | 'basement'
    | 'sky_chair'
    | 'sky_computer'
    | 'sky_whiteboard'
    | 'sky_vending'

class Sprites {
    public spriteSheetDataSet: { [key in SheetName]: SpriteSheetData } = {
        ground: groundSpriteSheetData,
        city: citySpriteSheetData,
        grasslands: grasslandsSpriteSheetData,
        village: villageSpriteSheetData,
        modern: modernSpriteSheetData,
        floorandground: floorAndGroundSpriteSheetData,
        modern_office: modernOfficeSpriteSheetData,
        generic_office: genericSpriteSheetData,
        basement: basementSpriteSheetData,
        sky_chair: chairSpriteSheetData,
        sky_computer: computerSpriteSheetData,
        sky_whiteboard: whiteboardSpriteSheetData,
        sky_vending: vendingMachineSpriteSheetData,
    }
    public sheets: Sheets = {}
    private aliases: Record<string, { sheet: SheetName; sprite: string }> = {
        'village:tree_green': { sheet: 'grasslands', sprite: 'light_basic_tree' },
        'village:tree_yellow': { sheet: 'grasslands', sprite: 'light_basic_tree' },
        'village:bench_horizontal': { sheet: 'village', sprite: 'bench_left' },
    }

    public async load(sheetName: SheetName) {
        if (!this.spriteSheetDataSet[sheetName]) {
            throw new Error(`Sheet ${sheetName} not found`)
        }

        if (this.sheets[sheetName]) {
            return
        }

        await PIXI.Assets.load(this.spriteSheetDataSet[sheetName].url)
        this.sheets[sheetName] = new PIXI.Spritesheet(PIXI.Texture.from(this.spriteSheetDataSet[sheetName].url), this.getSpriteSheetData(this.spriteSheetDataSet[sheetName]))
        await this.sheets[sheetName]!.parse()
    }

    public async getSpriteForTileJSON(tilename: string) {
        // Support both colon and dash separators (e.g., "city:light_concrete" or "city-light_concrete")
        const separator = tilename.includes(':') ? ':' : '-'
        const [sheetNameRaw, spriteNameRaw] = tilename.split(separator)
        const sheetName = sheetNameRaw as SheetName
        const { sheet, sprite } = this.resolveAlias(sheetName, spriteNameRaw)
        await this.load(sheet)
        return {
            sprite: this.getSprite(sheet, sprite),
            data: this.getSpriteData(sheet, sprite),
        }
    }

    public getSprite(sheetName: SheetName, spriteName: string) {
        const { sheet, sprite } = this.resolveAlias(sheetName, spriteName)

        if (!this.sheets[sheet]) {
            throw new Error(`Sheet ${sheet} not found`)
        }

        if (!this.sheets[sheet]!.textures[sprite]) {
            throw new Error(`Sprite ${sprite} not found in sheet ${sheet}`)
        }

        const spriteTexture = new PIXI.Sprite(this.sheets[sheet]!.textures[sprite])
        return spriteTexture
    }

    public getSpriteLayer(sheetName: SheetName, spriteName: string) {
        const { sheet, sprite } = this.resolveAlias(sheetName, spriteName)

        if (!this.spriteSheetDataSet[sheet]) {
            throw new Error(`Sheet ${sheet} not found`)
        }

        if (!this.spriteSheetDataSet[sheet].sprites[sprite]) {
            throw new Error(`Sprite ${sprite} not found in sheet ${sheet}`)
        }

        return this.spriteSheetDataSet[sheet].sprites[sprite].layer || 'floor'
    }

    public getSpriteData(sheetName: SheetName, spriteName: string) {
        const { sheet, sprite } = this.resolveAlias(sheetName, spriteName)

        if (!this.spriteSheetDataSet[sheet]) {
            throw new Error(`Sheet ${sheet} not found`)
        }

        if (!this.spriteSheetDataSet[sheet].sprites[sprite]) {
            throw new Error(`Sprite ${sprite} not found in sheet ${sheet}`)
        }

        return this.spriteSheetDataSet[sheet].sprites[sprite]
    }

    private resolveAlias(sheetName: SheetName, spriteName: string): { sheet: SheetName; sprite: string } {
        const key = `${sheetName}:${spriteName}`
        if (this.aliases[key]) {
            return this.aliases[key]
        }

        const sheetData = this.spriteSheetDataSet[sheetName]
        if (sheetData && sheetData.sprites[spriteName]) {
            return { sheet: sheetName, sprite: spriteName }
        }

        if (sheetName === 'village') {
            if (spriteName.startsWith('tree')) {
                return { sheet: 'grasslands', sprite: 'light_basic_tree' }
            }

            if (spriteName.includes('bench')) {
                return { sheet: 'village', sprite: 'bench_left' }
            }
        }

        // Final fallback to a basic ground tile so we do not crash the app
        return { sheet: 'ground', sprite: 'light_solid_grass' }
    }

    private getSpriteSheetData(data: SpriteSheetData) {
        const spriteSheetData = {
            frames: {} as any,
            meta: {
                image: data.url,
                size: {
                    w: data.width,
                    h: data.height
                },
                format: 'RGBA8888',
                scale: 1
            },
            animations: {}
        }

        for (const spriteData of data.spritesList) {
            if (spriteData.name === 'empty') {
                continue
            }

            spriteSheetData.frames[spriteData.name] = {
                frame: {
                    x: spriteData.x,
                    y: spriteData.y,
                    w: spriteData.width,
                    h: spriteData.height,
                },
                spriteSourceSize: {
                    x: 0,
                    y: 0,
                    w: spriteData.width,
                    h: spriteData.height,
                },
                sourceSize: {
                    w: spriteData.width,
                    h: spriteData.height,
                },
                anchor: {
                    x: 0,
                    y: 1 - (32 / spriteData.height),
                }
            }
        }

        return spriteSheetData
    }   
}

const sprites = new Sprites()

export { sprites }