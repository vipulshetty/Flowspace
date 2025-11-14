import * as PIXI from 'pixi.js'
import { Point, Coordinate, AnimationState, Direction, PlayerStatus } from '../types'
import { PlayApp } from '../PlayApp'
import { bfs } from '../pathfinding'
import { server } from '../../backend/server'
import { defaultSkin, getAnimationConfig, getAnimationSpeed, resolveSkinId } from './skins'
import signal from '@/utils/signal'
import { videoChat } from '@/utils/video-chat/video-chat'
function formatText(message: string, maxLength: number): string {
    message = message.trim()
    const words = message.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
        if (word.length > maxLength) {
            if (currentLine) {
                lines.push(currentLine.trim());
                currentLine = ''
            }
            for (let i = 0; i < word.length; i += maxLength) {
                lines.push(word.substring(i, i + maxLength))
            }
        } else if (currentLine.length + word.length + 1 > maxLength) {
            lines.push(currentLine.trim())
            currentLine = word + ' '
        } else {
            currentLine += word + ' '
        }
    }

    if (currentLine.trim()) {
        lines.push(currentLine.trim())
    }

    const text = lines.join('\n')

    return text
}


export class Player {
    private static readonly directions: Direction[] = ['down', 'left', 'right', 'up']
    private static readonly sheetCache: Record<string, PIXI.Spritesheet> = {}

    public skin: string = defaultSkin
    public username: string = ''
    public parent: PIXI.Container = new PIXI.Container()
    private textMessage: PIXI.Text = new PIXI.Text({})
    private textTimeout: NodeJS.Timeout | null = null
    private interactionPrompt: PIXI.Container | null = null
    private currentInteraction: { type: 'chair' | 'computer', direction: string, x: number, y: number } | null = null
    private isSitting: boolean = false
    private sittingPosition: { x: number, y: number } | null = null
    private status: PlayerStatus = 'available'
    private statusText: PIXI.Text | null = null
    private readonly statusLabels: Record<PlayerStatus, string> = {
        available: 'Available',
        busy: 'Busy',
        away: 'Away',
    }
    private readonly statusColors: Record<PlayerStatus, number> = {
        available: 0x4ade80,
        busy: 0xf97316,
        away: 0xfacc15,
    }

    private animationState: AnimationState = 'idle_down'
    private direction: Direction = 'down'
    private animationSpeed: number = 0.1
    private movementSpeed: number = 3.5
    public currentTilePosition: Point = { x: 0, y: 0 }
    private isLocal: boolean = false
    private playApp: PlayApp
    private targetPosition: { x: number, y: number } | null = null
    private path: Coordinate[] = []
    private pathIndex: number = 0
    private sheet: any = null
    private movementMode: 'keyboard' | 'mouse' = 'mouse'
    public frozen: boolean = false
    private initialized: boolean = false
    private strikes: number = 0
    private boundLocalSignals: boolean = false

    private currentChannel: string = 'local'

    constructor(skin: string, playApp: PlayApp, username: string, isLocal: boolean = false) {
        this.skin = resolveSkinId(skin)
        this.playApp = playApp
        this.username = username
        this.isLocal = isLocal
        this.animationSpeed = getAnimationSpeed(this.skin)
    }

    private async loadAnimations(forceDefault: boolean = false) {
        const targetSkin = forceDefault ? defaultSkin : resolveSkinId(this.skin)
        this.skin = targetSkin
        this.animationSpeed = getAnimationSpeed(targetSkin)

        const config = getAnimationConfig(targetSkin)

        if (Player.sheetCache[targetSkin]) {
            this.sheet = Player.sheetCache[targetSkin]
            this.refreshAnimatedSprite()
            return
        }

        let spritesheet: PIXI.Spritesheet
        try {
            const response = await fetch(config.atlasPath)
            if (!response.ok) {
                throw new Error(`Failed to fetch atlas: ${config.atlasPath}`)
            }

            const atlasRaw = await response.json()
            if (!atlasRaw?.frames) {
                throw new Error(`Atlas missing frame data: ${config.atlasPath}`)
            }

            const normalizedData: PIXI.SpritesheetData = {
                frames: {},
                animations: {},
                meta: {
                    ...(atlasRaw.meta ?? {}),
                },
            }

            if (!normalizedData.meta) {
                normalizedData.meta = {
                    scale: 1,
                    size: { w: 0, h: 0 },
                    image: '',
                }
            }

            if (normalizedData.meta.scale == null) {
                normalizedData.meta.scale = 1
            }

            const framesSource = Array.isArray(atlasRaw.frames)
                ? atlasRaw.frames
                : Object.entries(atlasRaw.frames).map(([filename, frameData]: [string, any]) => ({ filename, ...frameData }))

            for (const frame of framesSource) {
                if (!frame?.filename || !frame?.frame) continue
                const frameKey = frame.filename
                normalizedData.frames[frameKey] = {
                    frame: frame.frame,
                    rotated: frame.rotated ?? false,
                    trimmed: frame.trimmed ?? false,
                    spriteSourceSize: frame.spriteSourceSize ?? {
                        x: 0,
                        y: 0,
                        w: frame.frame.w,
                        h: frame.frame.h,
                    },
                    sourceSize: frame.sourceSize ?? {
                        w: frame.frame.w,
                        h: frame.frame.h,
                    },
                } as any
            }

            if (Object.keys(normalizedData.frames).length === 0) {
                throw new Error(`Atlas contained no usable frames: ${config.atlasPath}`)
            }

            const atlasImage = normalizedData.meta?.image as string | undefined
            const atlasDir = config.atlasPath.slice(0, config.atlasPath.lastIndexOf('/') + 1)
            const imagePath = atlasImage
                ? atlasImage.startsWith('/')
                    ? atlasImage
                    : `${atlasDir}${atlasImage}`
                : config.atlasPath.replace(/\.json$/i, '.png')

            const texture = await PIXI.Assets.load<PIXI.Texture>(imagePath)
            spritesheet = new PIXI.Spritesheet(texture.baseTexture, normalizedData)
            await spritesheet.parse()
        } catch (error) {
            if (!forceDefault) {
                console.warn(`Failed to load skin "${targetSkin}". Reverting to default.`, error)
                await this.loadAnimations(true)
                return
            }
            throw error
        }

        const configured = this.configureAtlasSheet(spritesheet, config)
        if (!configured) {
            if (!forceDefault) {
                console.warn(`Incomplete animation data for skin "${targetSkin}". Reverting to default.`)
                await this.loadAnimations(true)
                return
            }
            throw new Error(`Missing animation frames for skin "${targetSkin}"`)
        }

        Player.sheetCache[targetSkin] = spritesheet
        this.sheet = spritesheet

        this.refreshAnimatedSprite()
    }

    public changeSkin = async (skin: string) => {
        const normalizedSkin = resolveSkinId(skin)
        if (this.skin === normalizedSkin && this.sheet) return

        this.skin = normalizedSkin
        await this.loadAnimations()
        // refresh animations
        this.changeAnimationState(this.animationState, true)
    }

    private refreshAnimatedSprite() {
        if (!this.sheet) return

        const existingSprite = this.parent.children[0] as PIXI.AnimatedSprite | undefined
        if (!this.initialized || !existingSprite) {
            const fallbackTextures = this.sheet.animations['idle_down']
            if (!fallbackTextures) return
            const animatedSprite = new PIXI.AnimatedSprite(fallbackTextures)
            animatedSprite.animationSpeed = this.animationSpeed
            animatedSprite.anchor.set(0.5, 1)
            animatedSprite.play()
            this.parent.addChild(animatedSprite)
            return
        }

        existingSprite.animationSpeed = this.animationSpeed
        existingSprite.anchor.set(0.5, 1)
        const currentTextures = this.sheet.animations[this.animationState] ?? this.sheet.animations['idle_down']
        if (currentTextures) {
            existingSprite.textures = currentTextures
            existingSprite.play()
        }
    }

    private configureAtlasSheet(sheet: PIXI.Spritesheet, config: ReturnType<typeof getAnimationConfig>): boolean {
        let complete = true

        for (const direction of Player.directions) {
            const range = config.directionRanges[direction]
            if (!range) {
                complete = false
                continue
            }
            const idleTextures = this.buildAtlasTextures(sheet, config.prefix, config.idlePrefix, range)
            if (idleTextures.length === 0) {
                complete = false
            } else {
                sheet.animations[`idle_${direction}`] = idleTextures
            }

            const walkTextures = this.buildAtlasTextures(sheet, config.prefix, config.walkPrefix, range)
            if (walkTextures.length === 0) {
                complete = false
            } else {
                sheet.animations[`walk_${direction}`] = walkTextures
            }
        }

        return complete
    }

    private buildAtlasTextures(
        sheet: PIXI.Spritesheet,
        prefix: string,
        animation: string,
        range: [number, number],
    ): PIXI.Texture[] {
        const textures: PIXI.Texture[] = []
        for (let index = range[0]; index <= range[1]; index++) {
            const frameName = `${prefix}_${animation}_${index}.png`
            let texture = sheet.textures[frameName]
            if (!texture) {
                const withoutExtension = frameName.replace(/\.png$/i, '')
                texture = sheet.textures[withoutExtension]
            }
            if (!texture) {
                texture = sheet.textures[frameName.toLowerCase()]
                    ?? sheet.textures[frameName.toUpperCase()]
            }
            if (texture) {
                textures.push(texture)
            }
        }
        return textures
    }

    private addUsername() {
        const text = new PIXI.Text({
            text: this.username,
            style: {
                fontFamily: 'silkscreen',
                fontSize: 128,
                fill: 0xFFFFFF,
            }
        })
        text.anchor.set(0.5)
        text.scale.set(0.07)
        text.y = 8
        this.parent.addChild(text)

        const statusText = new PIXI.Text({
            text: '',
            style: {
                fontFamily: 'silkscreen',
                fontSize: 96,
                fill: this.statusColors[this.status],
            }
        })
        statusText.anchor.set(0.5)
        statusText.scale.set(0.06)
        statusText.y = text.y + text.height + 4
        this.parent.addChild(statusText)
        this.statusText = statusText
        this.updateStatusDisplay()
    }

    private updateStatusDisplay = () => {
        if (!this.statusText) return
        this.statusText.text = this.statusLabels[this.status]
        this.statusText.style.fill = this.statusColors[this.status]
    }

    public setStatus = (status: PlayerStatus) => {
        if (this.status === status) return
        this.status = status
        this.updateStatusDisplay()
    }

    public getStatus = () => this.status

    public setMessage(message: string) {
        if (this.textTimeout) {
            clearTimeout(this.textTimeout)
        }

        if (this.textMessage) {
            this.parent.removeChild(this.textMessage)
        }

        message = formatText(message, 40)

        const text = new PIXI.Text({
            text: message,
            style: {
                fontFamily: 'silkscreen',
                fontSize: 128,
                fill: 0xFFFFFF,
                align: 'center'
            }
        })
        text.anchor.x = 0.5
        text.anchor.y = 0
        text.scale.set(0.07)
        text.y = -text.height - 42
        this.parent.addChild(text)
        this.textMessage = text

        signal.emit('newMessage', {
            content: message,
            username: this.username
        })

        this.textTimeout = setTimeout(() => {
            if (this.textMessage) {
                this.parent.removeChild(this.textMessage)
            }
        }, 10000)
    }

    public async init() {
        if (this.initialized) return
        await this.loadAnimations()
        this.addUsername()
        if (this.isLocal && !this.boundLocalSignals) {
            signal.on('standUpRequest', this.handleStandUpRequest)
            this.boundLocalSignals = true
        }
        this.initialized = true
    }

    public setPosition(x: number, y: number) {
        const pos = this.convertTilePosToPlayerPos(x, y)
        this.parent.x = pos.x
        this.parent.y = pos.y
        this.currentTilePosition = { x, y }
    }

    private convertTilePosToPlayerPos = (x: number, y: number) => {
        return {
            x: (x * 32) + 16,
            y: (y * 32) + 24
        }
    }

    private convertPlayerPosToTilePos = (x: number, y: number) => {
        return {
            x: Math.floor(x / 32),
            y: Math.floor(y / 32)
        }
    }

    public moveToTile = (x: number, y: number) => {
        if (this.strikes > 25) return

        const start: Coordinate = [this.currentTilePosition.x, this.currentTilePosition.y]
        const end: Coordinate = [x, y]

        const path: Coordinate[] | null = bfs(start, end, this.playApp.blocked)
        if (!path || path.length === 0) {
            if (!path && !this.isLocal) {
                this.strikes++
            }
            return
        }

        PIXI.Ticker.shared.remove(this.move)

        this.path = path
        this.pathIndex = 0
        this.targetPosition = this.convertTilePosToPlayerPos(this.path[this.pathIndex][0], this.path[this.pathIndex][1])
        PIXI.Ticker.shared.add(this.move)

        if (this.isLocal) {
            server.socket.emit('movePlayer', { x, y })
        }
    }

    private move = ({ deltaTime }: { deltaTime: number }) => {
        if (!this.targetPosition) return

        const currentPos = this.convertPlayerPosToTilePos(this.parent.x, this.parent.y)
        this.checkIfShouldJoinChannel(currentPos)

        this.currentTilePosition = {
            x: this.path[this.pathIndex][0],
            y: this.path[this.pathIndex][1]
        }

        // Check for interactions at current position
        if (this.isLocal) {
            this.checkForInteractions()
        }

        if (this.isLocal && this.playApp.hasTeleport(this.currentTilePosition.x, this.currentTilePosition.y) && this.movementMode === 'keyboard') {
            this.setFrozen(true)
        }

        const speed = this.movementSpeed * deltaTime

        const dx = this.targetPosition.x - this.parent.x
        const dy = this.targetPosition.y - this.parent.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < speed) {
            this.parent.x = this.targetPosition.x
            this.parent.y = this.targetPosition.y

            this.pathIndex++
            if (this.pathIndex < this.path.length) {
                this.targetPosition = this.convertTilePosToPlayerPos(this.path[this.pathIndex][0], this.path[this.pathIndex][1])
            } else {
                const movementInput = this.getMovementInput()
                const newTilePosition = { x: this.currentTilePosition.x + movementInput.x, y: this.currentTilePosition.y + movementInput.y }

                // Teleport
                const teleported = this.teleportIfOnTeleporter('keyboard')
                if (teleported) {
                    this.stop()
                    return
                }

                if ((movementInput.x !== 0 || movementInput.y !== 0) && !this.playApp.blocked.has(`${newTilePosition.x}, ${newTilePosition.y}`)) {
                    this.moveToTile(newTilePosition.x, newTilePosition.y)
                } else {
                    this.stop()

                    // Teleport
                    const teleported = this.teleportIfOnTeleporter('mouse')
                    if (teleported) return
                }
            }
        } else {
            const angle = Math.atan2(dy, dx)
            this.parent.x += Math.cos(angle) * speed
            this.parent.y += Math.sin(angle) * speed

            // set direction
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) {
                    this.direction = 'right'
                } else {
                    this.direction = 'left'
                }
            } else {
                if (dy > 0) {
                    this.direction = 'down'
                } else {
                    this.direction = 'up'
                }
            }

            this.changeAnimationState(`walk_${this.direction}` as AnimationState)
        }

        this.playApp.sortObjectsByY()

        if (this.isLocal) {
            this.playApp.moveCameraToPlayer()
        }
    }

    public checkIfShouldJoinChannel = (newTilePosition: Point) => {
        if (!this.isLocal) return

        const tile = this.playApp.realmData.rooms[this.playApp.currentRoomIndex].tilemap[`${newTilePosition.x}, ${newTilePosition.y}`]
        if (tile && tile.privateAreaId) {
            if (tile.privateAreaId !== this.currentChannel) {
                this.currentChannel = tile.privateAreaId
                videoChat.joinChannel(tile.privateAreaId, this.playApp.uid + this.username, this.playApp.realmId)
                this.playApp.fadeInTiles(tile.privateAreaId)
            }
        } else {
            if (this.playApp.proximityId) {
                if (this.playApp.proximityId !== this.currentChannel) {
                    this.currentChannel = this.playApp.proximityId
                    videoChat.joinChannel(this.playApp.proximityId, this.playApp.uid + this.username, this.playApp.realmId)
                    this.playApp.fadeOutTiles()
                }
            } else if (this.currentChannel !== 'local') {
                this.currentChannel = 'local'
                videoChat.leaveChannel()
                this.playApp.fadeOutTiles()
            }
        }
    }

    private stop = () => {
        PIXI.Ticker.shared.remove(this.move)
        this.targetPosition = null

        if (this.isLocal) {
            this.changeAnimationState(`idle_${this.direction}` as AnimationState)
        } else {
            // if player doesnt move for x secs, do idle animation
            setTimeout(() => {
                if (!this.targetPosition) {
                    this.changeAnimationState(`idle_${this.direction}` as AnimationState)
                }
            }, 100)
        }
    }

    private teleportIfOnTeleporter = (movementMode: 'keyboard' | 'mouse') => {
        if (this.isLocal && this.movementMode === movementMode) {
            const teleported = this.playApp.teleportIfOnTeleportSquare(this.currentTilePosition.x, this.currentTilePosition.y)
            return teleported
        }
        return false
    }

    public changeAnimationState = (state: AnimationState, force: boolean = false) => {
        if (this.animationState === state && !force) return

        this.animationState = state
        if (!this.sheet) return

        const animatedSprite = this.parent.children[0] as PIXI.AnimatedSprite
        const textures = this.sheet.animations[state] ?? this.sheet.animations['idle_down']
        if (!textures) return
        animatedSprite.animationSpeed = this.animationSpeed
        animatedSprite.anchor.set(0.5, 1)
        animatedSprite.textures = textures
        animatedSprite.play()
    }

    public keydown = (event: KeyboardEvent) => {
        if (this.frozen) return

        // Handle E key for interactions
        if (event.key === 'e' || event.key === 'E') {
            if (this.isSitting) {
                // Stand up
                this.standUp()
            } else if (this.currentInteraction) {
                // Sit down or use computer
                if (this.currentInteraction.type === 'chair') {
                    this.sitDown(this.currentInteraction)
                } else if (this.currentInteraction.type === 'computer') {
                    // TODO: Add computer interaction (video call, screen share, etc.)
                    console.log('Using computer at', this.currentInteraction.x, this.currentInteraction.y)
                }
            }
            return
        }

        this.setMovementMode('keyboard')
        const movementInput = { x: 0, y: 0 }
        if (event.key === 'ArrowUp' || event.key === 'w') {
            movementInput.y -= 1
        } else if (event.key === 'ArrowDown' || event.key === 's') {
            movementInput.y += 1
        } else if (event.key === 'ArrowLeft' || event.key === 'a') {
            movementInput.x -= 1
        } else if (event.key === 'ArrowRight' || event.key === 'd') {
            movementInput.x += 1
        }

        this.moveToTile(this.currentTilePosition.x + movementInput.x, this.currentTilePosition.y + movementInput.y)
    }

    public setMovementMode = (mode: 'keyboard' | 'mouse') => {
        this.movementMode = mode
    }

    private getMovementInput = () => {
        const movementInput = { x: 0, y: 0 }
        const latestKey = this.playApp.keysDown[this.playApp.keysDown.length - 1]
        if (latestKey === 'ArrowUp' || latestKey === 'w') {
            movementInput.y -= 1
        } else if (latestKey === 'ArrowDown' || latestKey === 's') {
            movementInput.y += 1
        } else if (latestKey === 'ArrowLeft' || latestKey === 'a') {
            movementInput.x -= 1
        } else if (latestKey === 'ArrowRight' || latestKey === 'd') {
            movementInput.x += 1
        }

        return movementInput
    }

    public setFrozen = (frozen: boolean) => {
        this.frozen = frozen
    }

    public requestStandUp = () => {
        if (!this.isLocal) return
        if (this.isSitting) {
            this.standUp()
        }
    }

    private handleStandUpRequest = () => {
        this.requestStandUp()
    }

    public destroy() {
        PIXI.Ticker.shared.remove(this.move)
        if (this.isLocal && this.boundLocalSignals) {
            signal.off('standUpRequest', this.handleStandUpRequest)
            this.boundLocalSignals = false
        }
    }

    private sitDown = (interaction: { type: 'chair' | 'computer', direction: string, x: number, y: number }) => {
        this.isSitting = true
        this.sittingPosition = { x: this.currentTilePosition.x, y: this.currentTilePosition.y }
        this.setFrozen(true)
        
        // Adjust player position based on chair direction (visual offset)
        const offsets = {
            up: { x: 0, y: -4 },
            down: { x: 0, y: 4 },
            left: { x: -4, y: 0 },
            right: { x: 4, y: 0 },
        }
        const offset = offsets[interaction.direction as keyof typeof offsets] || { x: 0, y: 0 }
        this.parent.x += offset.x
        this.parent.y += offset.y
        
        // Change to idle animation facing the chair direction
        this.direction = interaction.direction as Direction
        this.changeAnimationState(`idle_${interaction.direction}` as AnimationState)

        this.hideInteractionPrompt()
        this.showInteractionPrompt('stand')

        if (this.isLocal) {
            signal.emit('localPlayerSitting', { sitting: true })
        }
    }

    private standUp = () => {
        this.isSitting = false
        this.setFrozen(false)
        this.hideInteractionPrompt()
        
        // Reset position
        if (this.sittingPosition) {
            this.setPosition(this.sittingPosition.x, this.sittingPosition.y)
            this.sittingPosition = null
        }

        if (this.isLocal) {
            signal.emit('localPlayerSitting', { sitting: false })
            this.checkForInteractions()
        }
    }

    private checkForInteractions = () => {
        if (!this.isLocal || this.isSitting) return

        const { x, y } = this.currentTilePosition
        const tile = this.playApp.realmData.rooms[this.playApp.currentRoomIndex].tilemap[`${x}, ${y}`]
        
        if (tile?.interaction) {
            this.currentInteraction = {
                type: tile.interaction.type,
                direction: tile.interaction.direction,
                x,
                y
            }
            this.showInteractionPrompt(tile.interaction.type)
        } else {
            this.currentInteraction = null
            this.hideInteractionPrompt()
        }
    }

    private showInteractionPrompt = (type: 'chair' | 'computer' | 'stand') => {
        if (this.interactionPrompt) {
            this.hideInteractionPrompt()
        }

        const textMap: Record<'chair' | 'computer' | 'stand', string> = {
            chair: 'Press E to sit',
            computer: 'Press E to use computer',
            stand: 'Press E to stand',
        }
        const text = textMap[type]
        
        const promptText = new PIXI.Text({
            text,
            style: {
                fontFamily: 'silkscreen',
                fontSize: 96,
                fill: 0xFFFFFF,
            }
        })
        promptText.anchor.set(0.5)
        promptText.scale.set(0.08)

        const bg = new PIXI.Graphics()
        bg.roundRect(-promptText.width / 2 - 8, -promptText.height / 2 - 4, promptText.width + 16, promptText.height + 8, 4)
        bg.fill(0x000000)
        bg.alpha = 0.7

        const container = new PIXI.Container()
        container.addChild(bg)
        container.addChild(promptText)
        container.y = -48
        
        this.parent.addChild(container)
        this.interactionPrompt = container
    }

    private hideInteractionPrompt = () => {
        if (this.interactionPrompt) {
            this.parent.removeChild(this.interactionPrompt)
            this.interactionPrompt.destroy()
            this.interactionPrompt = null
        }
    }
}

