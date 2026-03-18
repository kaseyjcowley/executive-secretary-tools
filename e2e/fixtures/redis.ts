import Redis from "ioredis";

const TEST_REDIS_PORT = process.env.TEST_REDIS_PORT || 6399;

export const redis = new Redis(`redis://localhost:${TEST_REDIS_PORT}`, {
  maxRetriesPerRequest: 3,
});

export async function flushRedis(): Promise<void> {
  await redis.flushdb();
}

export async function waitForRedis(): Promise<void> {
  for (let i = 0; i < 30; i++) {
    try {
      await redis.ping();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error("Redis not available");
}
