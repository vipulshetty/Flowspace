import React, { useState, useEffect } from 'react'
import { BuildingOffice2Icon } from '@heroicons/react/24/outline'
import signal from '@/utils/signal'

type RoomSwitcherProps = {
    rooms: string[]
    currentRoomIndex: number
}

const RoomSwitcher: React.FC<RoomSwitcherProps> = ({ rooms, currentRoomIndex }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [localRoomIndex, setLocalRoomIndex] = useState(currentRoomIndex)

    useEffect(() => {
        setLocalRoomIndex(currentRoomIndex)
    }, [currentRoomIndex])

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Toggle room menu with M key
            if (e.key === 'm' || e.key === 'M') {
                const activeElement = document.activeElement as HTMLElement
                // Don't trigger if typing in an input
                if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
                    return
                }
                setIsOpen(!isOpen)
                signal.emit('disableInput', !isOpen)
            }
            // Close with Escape
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false)
                signal.emit('disableInput', false)
            }
        }

        document.addEventListener('keydown', handleKeyPress)
        return () => {
            document.removeEventListener('keydown', handleKeyPress)
        }
    }, [isOpen])

    const handleRoomClick = (roomIndex: number) => {
        if (roomIndex !== localRoomIndex) {
            // Use the teleport signal to the spawn point of the room
            signal.emit('teleport', {
                roomIndex: roomIndex,
                x: 7,
                y: 8,
            })
            setLocalRoomIndex(roomIndex)
        }
        setIsOpen(false)
        signal.emit('disableInput', false)
    }

    const toggleMenu = () => {
        setIsOpen(!isOpen)
        signal.emit('disableInput', !isOpen)
    }

    return (
        <>
            <button
                className='aspect-square grid place-items-center rounded-lg p-1 outline-none bg-secondary hover:bg-light-secondary animate-colors relative'
                onClick={toggleMenu}
                title="Switch Rooms (M)"
            >
                <BuildingOffice2Icon className='h-8 w-8' />
                {rooms.length > 1 && (
                    <span className='absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold'>
                        {rooms.length}
                    </span>
                )}
            </button>

            {/* Room Switcher Overlay */}
            {isOpen && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={() => {
                    setIsOpen(false)
                    signal.emit('disableInput', false)
                }}>
                    <div className='bg-primary p-6 rounded-lg shadow-xl max-w-md w-full mx-4' onClick={(e) => e.stopPropagation()}>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-2xl font-bold text-white'>Switch Room</h2>
                            <button
                                className='text-gray-400 hover:text-white text-2xl'
                                onClick={() => {
                                    setIsOpen(false)
                                    signal.emit('disableInput', false)
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <p className='text-gray-400 text-sm mb-4'>Select a room to teleport to</p>
                        <div className='flex flex-col gap-2 max-h-96 overflow-y-auto transparent-scrollbar'>
                            {rooms.map((roomName, index) => (
                                <button
                                    key={index}
                                    className={`p-3 rounded-lg text-left transition-colors ${
                                        index === localRoomIndex
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-secondary text-white hover:bg-light-secondary'
                                    }`}
                                    onClick={() => handleRoomClick(index)}
                                >
                                    <div className='flex items-center justify-between'>
                                        <span className='font-medium'>{roomName}</span>
                                        {index === localRoomIndex && (
                                            <span className='text-xs bg-blue-700 px-2 py-1 rounded'>Current</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className='mt-4 text-center text-xs text-gray-400'>
                            Press <kbd className='bg-secondary px-2 py-1 rounded'>M</kbd> or <kbd className='bg-secondary px-2 py-1 rounded'>ESC</kbd> to close
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default RoomSwitcher
