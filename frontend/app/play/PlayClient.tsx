'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PixiApp from './PixiApp'
import { RealmData, type ActivityRecord, type PresencePlayer } from '@/utils/pixi/types'
import PlayNavbar from './PlayNavbar'
import { useModal } from '../hooks/useModal'
import signal from '@/utils/signal'
import IntroScreen from './IntroScreen'
import VideoBar from '@/components/VideoChat/VideoBar'
import { AgoraVideoChatProvider } from '../hooks/useVideoChat'
import type { PlayerStatus } from '@/utils/pixi/types'
import { resolveSkinId } from '@/utils/pixi/Player/skins'
import { request } from '@/utils/backend/requests'
import PresenceActivityPanel from './PresenceActivityPanel'

type PlayClientProps = {
    mapData: RealmData
    username: string
    access_token: string
    realmId: string
    uid: string
    shareId: string
    initialSkin: string
    name: string
}

const PlayClient:React.FC<PlayClientProps> = ({ mapData, username, access_token, realmId, uid, shareId, initialSkin, name }) => {

    const { setErrorModal, setDisconnectedMessage } = useModal()

    const [showIntroScreen, setShowIntroScreen] = useState(true)

    const [skin, setSkin] = useState(() => resolveSkinId(initialSkin))
    const [status, setStatus] = useState<PlayerStatus>('available')
    const [currentRoomIndex, setCurrentRoomIndex] = useState(mapData.spawnpoint.roomIndex)
    const [isSitting, setIsSitting] = useState(false)
    const [onlinePlayers, setOnlinePlayers] = useState<PresencePlayer[]>([])
    const [activityFeed, setActivityFeed] = useState<ActivityRecord[]>([])

    const roomNames = useMemo(() => mapData.rooms.map(room => room.name), [mapData.rooms])

    useEffect(() => {
        const onShowKickedModal = (message: string) => { 
            setErrorModal('Disconnected')
            setDisconnectedMessage(message)
        }

        const onShowDisconnectModal = () => {
            setErrorModal('Disconnected')
            setDisconnectedMessage('You have been disconnected from the server.')
        }

        const onSwitchSkin = (nextSkin: string) => {
            setSkin(resolveSkinId(nextSkin))
        }

        const onNewRoomChat = (data: { name: string, channelId: string }) => {
            // Update current room based on room name
            const roomIndex = mapData.rooms.findIndex(room => room.name === data.name)
            if (roomIndex !== -1) {
                setCurrentRoomIndex(roomIndex)
            }
        }

        signal.on('showKickedModal', onShowKickedModal)
        signal.on('showDisconnectModal', onShowDisconnectModal)
        signal.on('switchSkin', onSwitchSkin)
        signal.on('newRoomChat', onNewRoomChat)

        return () => {
            signal.off('showKickedModal', onShowDisconnectModal)
            signal.off('showDisconnectModal', onShowDisconnectModal)
            signal.off('switchSkin', onSwitchSkin)
            signal.off('newRoomChat', onNewRoomChat)
        }
    }, [])

    useEffect(() => {
        const onStatusUpdate = (nextStatus: PlayerStatus) => {
            setStatus(nextStatus)
        }

        signal.on('localStatusUpdate', onStatusUpdate)
        return () => {
            signal.off('localStatusUpdate', onStatusUpdate)
        }
    }, [])

    useEffect(() => {
        const handlePresenceUpdate = (players: PresencePlayer[]) => {
            setOnlinePlayers(players)
        }

        const handleActivityEvent = (event: ActivityRecord) => {
            setActivityFeed(prev => {
                const next = [event, ...prev]
                return next.slice(0, 50)
            })
        }

        signal.on('onlinePlayersUpdate', handlePresenceUpdate)
        signal.on('activityEvent', handleActivityEvent)

        return () => {
            signal.off('onlinePlayersUpdate', handlePresenceUpdate)
            signal.off('activityEvent', handleActivityEvent)
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        const loadRealtimeSnapshots = async () => {
            const presenceResponse = await request('/presence/online', { realmId }, access_token)
            if (!cancelled && presenceResponse.data?.players) {
                setOnlinePlayers(presenceResponse.data.players)
            }

            const activityResponse = await request('/activity/recent', { realmId, limit: '25' }, access_token)
            if (!cancelled && activityResponse.data?.events) {
                setActivityFeed(activityResponse.data.events)
            }
        }

        loadRealtimeSnapshots()

        return () => {
            cancelled = true
        }
    }, [realmId, access_token])

    useEffect(() => {
        const onSittingChange = (payload: { sitting: boolean }) => {
            setIsSitting(Boolean(payload?.sitting))
        }

        signal.on('localPlayerSitting', onSittingChange)
        return () => {
            signal.off('localPlayerSitting', onSittingChange)
        }
    }, [])

    const handleStatusChange = useCallback((nextStatus: PlayerStatus) => {
        setStatus(nextStatus)
        signal.emit('requestStatusChange', nextStatus)
    }, [])

    return (
        <AgoraVideoChatProvider uid={uid}>
            {!showIntroScreen && <div className='relative w-full h-screen flex flex-col-reverse sm:flex-col'>
                <PresenceActivityPanel presence={onlinePlayers} activity={activityFeed} roomNames={roomNames} />
                <VideoBar />
                <PixiApp 
                    mapData={mapData} 
                    className='w-full grow sm:h-full sm:flex-grow-0' 
                    username={username} 
                    access_token={access_token} 
                    realmId={realmId} 
                    uid={uid} 
                    shareId={shareId} 
                    initialSkin={skin} 
                />
                {isSitting && (
                    <div className='absolute right-4 bottom-28 sm:bottom-24 z-50 flex flex-col items-end gap-2'>
                        <button
                            type='button'
                            onClick={() => signal.emit('standUpRequest')}
                            className='bg-secondary hover:bg-light-secondary text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md transition-colors'
                        >
                            Stand up
                        </button>
                        <span className='text-xs text-white/70'>or press E</span>
                    </div>
                )}
                <PlayNavbar 
                    username={username} 
                    skin={skin}
                    rooms={roomNames}
                    currentRoomIndex={currentRoomIndex}
                    status={status}
                    onStatusChange={handleStatusChange}
                />
            </div>}
            {showIntroScreen && <IntroScreen realmName={name} skin={skin} username={username} setShowIntroScreen={setShowIntroScreen}/>}    
        </AgoraVideoChatProvider>
    )
}
export default PlayClient