import { getRedis, redisIsReady } from "../redis/client";

const HEATMAP_KEY = (realmId: string, roomIndex: number) =>
  `realm:${realmId}:heatmap:${roomIndex}`;
const HEATMAP_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function ensureRedis() {
  if (!redisIsReady()) {
    return null;
  }
  return getRedis();
}

export async function trackHeatmapSample(
  realmId: string,
  roomIndex: number,
  x: number,
  y: number,
) {
  const redis = ensureRedis();
  if (!redis) return;

  const key = HEATMAP_KEY(realmId, roomIndex);
  const field = `${x},${y}`;
  const pipeline = redis.multi();
  pipeline.zincrby(key, 1, field);
  pipeline.expire(key, HEATMAP_TTL_SECONDS);
  await pipeline.exec();
}

export async function getHeatmap(
  realmId: string,
  roomIndex: number,
): Promise<Record<string, number>> {
  const redis = ensureRedis();
  if (!redis) return {};

  const key = HEATMAP_KEY(realmId, roomIndex);
  const entries = await redis.zrevrange(key, 0, -1, "WITHSCORES");
  const heatmap: Record<string, number> = {};
  for (let index = 0; index < entries.length; index += 2) {
    const coordinate = entries[index];
    const score = entries[index + 1];
    heatmap[coordinate] = Number(score);
  }
  return heatmap;
}
