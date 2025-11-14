import { getRedis, redisIsReady } from "../redis/client";

const ACTIVITY_KEY = (realmId: string) => `realm:${realmId}:activity`;
const MAX_ACTIVITY_EVENTS = 200;
const ACTIVITY_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

type ActivityAction = "entered" | "left" | "teleported" | "joined" | "departed";

export type ActivityRecord = {
  realmId: string;
  uid: string;
  username: string;
  roomIndex: number;
  roomName: string;
  action: ActivityAction;
  timestamp: number;
};

function ensureRedis() {
  if (!redisIsReady()) {
    return null;
  }
  return getRedis();
}

export async function recordActivity(event: ActivityRecord): Promise<ActivityRecord | null> {
  const redis = ensureRedis();
  if (!redis) return null;

  const timestamp = event.timestamp ?? Date.now();
  const payload = JSON.stringify({ ...event, timestamp });

  const pipeline = redis.multi();
  pipeline.zadd(ACTIVITY_KEY(event.realmId), timestamp, payload);
  pipeline.expire(ACTIVITY_KEY(event.realmId), ACTIVITY_TTL_SECONDS);
  await pipeline.exec();

  const total = await redis.zcard(ACTIVITY_KEY(event.realmId));
  if (total > MAX_ACTIVITY_EVENTS) {
    await redis.zremrangebyrank(
      ACTIVITY_KEY(event.realmId),
      0,
      total - MAX_ACTIVITY_EVENTS - 1,
    );
  }

  return { ...event, timestamp };
}

export async function getRecentActivity(
  realmId: string,
  limit: number = 20,
): Promise<ActivityRecord[]> {
  const redis = ensureRedis();
  if (!redis) return [];

  const entries = await redis.zrevrange(ACTIVITY_KEY(realmId), 0, limit - 1);
  return entries
    .map((entry) => {
      try {
        return JSON.parse(entry) as ActivityRecord;
      } catch (error) {
        console.warn("Failed to parse activity entry", error);
        return null;
      }
    })
    .filter((entry): entry is ActivityRecord => Boolean(entry));
}
