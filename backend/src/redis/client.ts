import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

// Check if using TLS (rediss://)
const useTLS = redisUrl.startsWith("rediss://");

const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => Math.min(times * 200, 2000),
  tls: useTLS ? { rejectUnauthorized: false } : undefined,
});

let isReady = false;

redis.on("ready", () => {
  isReady = true;
  console.info("Redis connection established.");
});

redis.on("end", () => {
  isReady = false;
  console.warn("Redis connection closed. Features depending on Redis are paused.");
});

redis.on("error", (error) => {
  if (!isReady) {
    console.warn("Redis connection error. Optional realtime features may be disabled.", error);
  } else {
    console.error("Redis runtime error:", error);
  }
});

(async () => {
  try {
    await redis.connect();
  } catch (error) {
    console.warn(
      "Failed to establish Redis connection during startup. Optional realtime features are disabled until Redis becomes available.",
      error,
    );
  }
})();

export function getRedis() {
  return redis;
}

export function redisIsReady() {
  return isReady;
}
