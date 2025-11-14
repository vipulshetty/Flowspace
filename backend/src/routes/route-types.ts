import { z } from 'zod'

export const GetPlayersInRoom = z.object({
    roomIndex: z.string().transform((val) => parseInt(val, 10)),
})

export const IsOwnerOfServer = z.object({
    serverId: z.string(),
})

export const GetServerName = z.object({
    serverId: z.string(),
})

export const GetChannelName = z.object({
    serverId: z.string(),
    channelId: z.string(),
    userId: z.string(),
})

export const UserIsInGuild = z.object({
    guildId: z.string(),
})

export const GetPlayerCounts = z.object({
    realmIds: z.string().transform((s) => s.split(',')),
})

export const GetPresence = z.object({
    realmId: z.string(),
})

export const GetActivityFeed = z.object({
    realmId: z.string(),
    limit: z
        .string()
        .optional()
        .transform((value) => (value ? parseInt(value, 10) : undefined))
        .refine((value) => value === undefined || Number.isFinite(value), {
            message: 'limit must be a number',
        }),
})

export const GetHeatmapRequest = z.object({
    realmId: z.string(),
    roomIndex: z.string().transform((val) => parseInt(val, 10)),
})

export const GetLastSeenRequest = z.object({
    uid: z.string(),
})