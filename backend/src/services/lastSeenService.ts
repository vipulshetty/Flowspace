import { getRedis, redisIsReady } from "../redis/client";

const LAST_SEEN_KEY = (uid: string) => `user:${uid}:lastSeen`;
const LAST_SEEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type LastSeenRecord = {
  uid: string;
  realmId: string;
  roomIndex: number;
  x: number;
  y: number;
  timestamp?: number;
};

function ensureRedis() {
  if (!redisIsReady()) {
    return null;
  }
  return getRedis();
}

export async function updateLastSeen(record: LastSeenRecord) {
  const redis = ensureRedis();
  if (!redis) return;

  const timestamp = record.timestamp ?? Date.now();
  const pipeline = redis.multi();
  pipeline.hset(LAST_SEEN_KEY(record.uid), {
    uid: record.uid,
    realmId: record.realmId,
    roomIndex: String(record.roomIndex),
    x: String(record.x),
    y: String(record.y),
    timestamp: String(timestamp),
  });
  pipeline.expire(LAST_SEEN_KEY(record.uid), LAST_SEEN_TTL_SECONDS);
  await pipeline.exec();
}

export async function getLastSeen(uid: string): Promise<LastSeenRecord | null> {
  const redis = ensureRedis();
  if (!redis) return null;

  const data = await redis.hgetall(LAST_SEEN_KEY(uid));
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return {
    uid,
    realmId: data.realmId ?? "",
    roomIndex: Number.parseInt(data.roomIndex ?? "0", 10),
    x: Number.parseInt(data.x ?? "0", 10),
    y: Number.parseInt(data.y ?? "0", 10),
    timestamp: Number.parseInt(data.timestamp ?? `${Date.now()}`, 10),
  };
}
