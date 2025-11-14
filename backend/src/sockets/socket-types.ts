import { z } from 'zod'
import { Session } from '../session'

export const JoinRealm = z.object({
    realmId: z.string(),
    shareId: z.string(),
})

export const Disconnect = z.any()

export const MovePlayer = z.object({
    x: z.number(),
    y: z.number(),
})

export const Teleport = z.object({
    x: z.number(),
    y: z.number(),
    roomIndex: z.number(),
})

export const ChangedSkin = z.string()

export const NewMessage = z.string()

export const UpdateStatus = z.object({
    status: z.enum(['available', 'busy', 'away'])
})

export const Heartbeat = z.object({
    roomIndex: z.number().optional(),
})

export const ActivityEvent = z.object({
    action: z.enum(['entered', 'left', 'teleported', 'joined', 'departed']),
    roomIndex: z.number().optional(),
    roomName: z.string().optional(),
})

export const TrackPosition = z.object({
    roomIndex: z.number(),
    x: z.number(),
    y: z.number(),
})

export type OnEventCallback = (args: { session: Session, data?: any }) => void | Promise<void>