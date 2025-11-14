import React, { useEffect } from 'react'
import { TShirt } from '@phosphor-icons/react'
import { useModal } from '../hooks/useModal'
import signal from '@/utils/signal'
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import MicAndCameraButtons from '@/components/VideoChat/MicAndCameraButtons'
import { useVideoChat } from '../hooks/useVideoChat'
import AnimatedCharacter from './SkinMenu/AnimatedCharacter'
import { videoChat } from '@/utils/video-chat/video-chat'
import RoomSwitcher from '@/components/RoomSwitcher'
import type { PlayerStatus } from '@/utils/pixi/types'
import { getSkinPreview, resolveSkinId } from '@/utils/pixi/Player/skins'

type PlayNavbarProps = {
    username: string
    skin: string
    rooms: string[]
    currentRoomIndex: number
    status: PlayerStatus
    onStatusChange: (status: PlayerStatus) => void
}

const PlayNavbar:React.FC<PlayNavbarProps> = ({ username, skin, rooms, currentRoomIndex, status, onStatusChange }) => {

    const { setModal } = useModal()
    const { isCameraMuted } = useVideoChat()
    function onClickSkinButton() {
        setModal('Skin')
        signal.emit('requestSkin')
    }

    const normalizedSkin = resolveSkinId(skin)
    const skinPreview = getSkinPreview(normalizedSkin)

    useEffect(() => {
        videoChat.playVideoTrackAtElementId('local-video')
    }, [])

    const statuses: PlayerStatus[] = ['available', 'busy', 'away']
    const statusStyles: Record<PlayerStatus, { label: string; color: string }> = {
        available: { label: 'Available', color: '#4ade80' },
        busy: { label: 'Busy', color: '#f97316' },
        away: { label: 'Away', color: '#facc15' },
    }
    const handleSelectStatus = (nextStatus: PlayerStatus) => {
        onStatusChange(nextStatus)
    }

    return (
        <div className='bg-primary w-full h-14 absolute bottom-0 flex flex-row items-center p-2 gap-4 select-none'>
            <Link href='/app' className='aspect-square grid place-items-center rounded-lg p-1 outline-none bg-secondary hover:bg-light-secondary animate-colors'>
                <ArrowLeftEndOnRectangleIcon className='h-8 w-8'/>
            </Link>
            <div className='h-full w-[200px] bg-secondary rounded-lg overflow-hidden flex flex-row'>
                <div className='w-[60px] h-full border-r-[1px] border-light-gray relative grid place-items-center'>
                    <AnimatedCharacter
                        src={skinPreview.src}
                        noAnimation={!skinPreview.animated}
                        isSpriteSheet={skinPreview.animated}
                        className='w-10 h-10 absolute bottom-1'
                    />
                        <div id='local-video' className={`w-full h-full absolute ${!isCameraMuted ? 'block' : 'hidden'}`}>

                        </div>
                </div>
                <div className='w-full flex flex-col p-1 pl-2 relative'>
                    <p className='text-white text-xs'>{username}</p>
                    <p className='text-[11px] text-[#BDBDBD] mt-1 flex items-center gap-2'>
                        <span className='inline-flex items-center gap-1'>
                            <span
                                className='inline-block w-2 h-2 rounded-full'
                                style={{ backgroundColor: statusStyles[status].color }}
                                aria-hidden
                            />
                            {statusStyles[status].label}
                        </span>
                    </p>
                </div>
            </div>
            <MicAndCameraButtons />
            <RoomSwitcher rooms={rooms} currentRoomIndex={currentRoomIndex} />
            <div className='ml-auto flex flex-wrap items-center gap-2' role='group' aria-label='Set your status'>
                <span className='sr-only' aria-live='polite'>Current status: {statusStyles[status].label}</span>
                {statuses.map(option => {
                    const isActive = option === status
                    return (
                        <button
                            key={option}
                            type='button'
                            onClick={() => handleSelectStatus(option)}
                            aria-pressed={isActive}
                            aria-label={`Set status to ${statusStyles[option].label}`}
                            data-active={isActive}
                            className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer ${isActive ? 'bg-white text-secondary border-white' : 'bg-transparent text-[#BDBDBD] border-[#3a3f61] hover:text-white hover:border-white'}`}
                        >
                            <span className='inline-flex items-center gap-1'>
                                <span
                                    className='inline-block w-2 h-2 rounded-full'
                                    style={{ backgroundColor: statusStyles[option].color }}
                                    aria-hidden
                                />
                                {statusStyles[option].label}
                            </span>
                        </button>
                    )
                })}
            </div>
            <button className='aspect-square grid place-items-center rounded-lg p-1 outline-none bg-secondary hover:bg-light-secondary animate-colors' onClick={onClickSkinButton}>
                <TShirt className='h-8 w-8'/>
            </button>
        </div>
    )
}

export default PlayNavbar