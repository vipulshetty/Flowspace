import type { PlayerStatus } from "../session";
import { getRedis, redisIsReady } from "../redis/client";

const PRESENCE_TTL_SECONDS = 60 * 5; // 5 minutes
const ONLINE_SET_KEY = (realmId: string) => `realm:${realmId}:online`;
const PLAYER_HASH_KEY = (realmId: string, uid: string) => `realm:${realmId}:player:${uid}`;

export type PresencePlayer = {
  uid: string;
  username: string;
  roomIndex: number;
  status: PlayerStatus;
  lastSeen: number;
  x?: number;
  y?: number;
};

type PresencePayload = {
  realmId: string;
  uid: string;
  username: string;
  roomIndex: number;
  status: PlayerStatus;
  x?: number;
  y?: number;
};

function ensureRedis() {
  if (!redisIsReady()) {
    return null;
  }
  return getRedis();
}

async function pruneExpired(realmId: string) {
  const redis = ensureRedis();
  if (!redis) return;

  const cutoff = Date.now() - PRESENCE_TTL_SECONDS * 1000;
  const staleIds = await redis.zrangebyscore(ONLINE_SET_KEY(realmId), 0, cutoff);
  if (staleIds.length === 0) return;

  const pipeline = redis.pipeline();
  for (const uid of staleIds) {
    pipeline.del(PLAYER_HASH_KEY(realmId, uid));
  }
  pipeline.zremrangebyscore(ONLINE_SET_KEY(realmId), 0, cutoff);
  await pipeline.exec();
}

export async function recordPresence(payload: PresencePayload) {
  const redis = ensureRedis();
  if (!redis) return;

  await pruneExpired(payload.realmId);

  const now = Date.now();
  const pipeline = redis.multi();
  pipeline.zadd(ONLINE_SET_KEY(payload.realmId), now, payload.uid);
  pipeline.hset(PLAYER_HASH_KEY(payload.realmId, payload.uid), {
    uid: payload.uid,
    username: payload.username,
    roomIndex: String(payload.roomIndex),
    status: payload.status,
    lastSeen: String(now),
    ...(payload.x !== undefined ? { x: String(payload.x) } : {}),
    ...(payload.y !== undefined ? { y: String(payload.y) } : {}),
  });
  pipeline.expire(PLAYER_HASH_KEY(payload.realmId, payload.uid), PRESENCE_TTL_SECONDS + 60);
  pipeline.expire(ONLINE_SET_KEY(payload.realmId), PRESENCE_TTL_SECONDS + 60);
  await pipeline.exec();
}

export async function markPlayerOffline(realmId: string, uid: string) {
  const redis = ensureRedis();
  if (!redis) return;

  const pipeline = redis.multi();
  pipeline.zrem(ONLINE_SET_KEY(realmId), uid);
  pipeline.del(PLAYER_HASH_KEY(realmId, uid));
  await pipeline.exec();
}

export async function updatePlayerStatus(
  realmId: string,
  uid: string,
  status: PlayerStatus,
) {
  const redis = ensureRedis();
  if (!redis) return;

  await redis.hset(PLAYER_HASH_KEY(realmId, uid), "status", status);
}

export async function getOnlinePlayers(realmId: string): Promise<PresencePlayer[]> {
  const redis = ensureRedis();
  if (!redis) return [];

  await pruneExpired(realmId);

  const uids = await redis.zrevrange(ONLINE_SET_KEY(realmId), 0, -1);
  if (uids.length === 0) {
    return [];
  }

  const pipeline = redis.pipeline();
  for (const uid of uids) {
    pipeline.hgetall(PLAYER_HASH_KEY(realmId, uid));
  }

  const responses = await pipeline.exec();
  if (!responses) return [];

  const players: PresencePlayer[] = [];
  for (let i = 0; i < uids.length; i++) {
    const uid = uids[i];
    const entry = responses[i];
    if (!entry) continue;
    const [, data] = entry as [any, Record<string, any> | null];
    if (!data || Object.keys(data).length === 0) continue;

    players.push({
      uid,
      username: (data.username as string) ?? "Unknown",
      roomIndex: Number.parseInt((data.roomIndex as string) ?? "0", 10),
      status: ((data.status as string) ?? "available") as PlayerStatus,
      lastSeen: Number.parseInt((data.lastSeen as string) ?? `${Date.now()}`, 10),
      x: data.x ? Number.parseInt(data.x as string, 10) : undefined,
      y: data.y ? Number.parseInt(data.y as string, 10) : undefined,
    });
  }

  return players;
}
