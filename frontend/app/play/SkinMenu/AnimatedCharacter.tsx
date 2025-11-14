import React from 'react'

type AnimatedCharacterProps = {
    src: string
    className?: string
    noAnimation?: boolean
    isSpriteSheet?: boolean
}

const AnimatedCharacter:React.FC<AnimatedCharacterProps> = ({ src, className = '', noAnimation = false, isSpriteSheet = true }) => {
    const innerClass = noAnimation
        ? isSpriteSheet
            ? 'static-character-container'
            : 'flex items-center justify-center w-full h-full'
        : 'character-container'

    const imageClass = noAnimation
        ? isSpriteSheet
            ? 'static-character'
            : 'w-full h-full'
        : 'character'

    const style: React.CSSProperties = {
        imageRendering: 'pixelated',
        objectFit: 'contain',
    }

    if (noAnimation && !isSpriteSheet) {
        style.transform = 'none'
    }

    return (
        <div className={`relative aspect-square w-20 overflow-hidden ${className}`}>
            <div className={innerClass}>
                <img src={src} style={style} className={imageClass}/>
            </div>
        </div>
    )
}

export default AnimatedCharacter