import redis from "@/utils/redis";
import { nanoid } from "nanoid";
import type { Youth } from "@/types/youth";
import { REDIS_KEYS } from "@/constants";

const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

function normalScore(lastSeenAt: number): number {
  return lastSeenAt + SIX_MONTHS_MS;
}

function deserializeYouth(raw: Record<string, string>): Youth {
  return {
    id: raw.id,
    name: raw.name,
    lastSeenAt: Number(raw.lastSeenAt),
    scheduled: raw.scheduled === "true",
    scheduledAt: raw.scheduledAt ? Number(raw.scheduledAt) : undefined,
    trelloCardId: raw.trelloCardId || undefined,
    trelloCardUrl: raw.trelloCardUrl || undefined,
    visitType: raw.visitType || undefined,
    note: raw.note || undefined,
    createdAt: Number(raw.createdAt),
  };
}

export async function getQueue(): Promise<Youth[]> {
  const ids = await redis.zrange(REDIS_KEYS.YOUTH_QUEUE, 0, -1);
  if (!ids.length) return [];

  const pipeline = redis.pipeline();
  (ids as string[]).forEach((id) =>
    pipeline.hgetall(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`),
  );

  const results = await pipeline.exec();
  if (!results) return [];

  return (results as [Error | null, unknown][])
    .filter(([err]) => err === null)
    .map(([, result]) => result as Record<string, string>)
    .map(deserializeYouth);
}

export async function getYouthById(id: string): Promise<Youth | null> {
  const raw = await redis.hgetall(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`);
  if (!raw || Object.keys(raw).length === 0) return null;
  return deserializeYouth(raw);
}

export async function createYouth(name: string): Promise<Youth> {
  const id = nanoid();
  const now = Date.now();
  const youth: Youth = {
    id,
    name,
    lastSeenAt: now,
    scheduled: false,
    createdAt: now,
  };

  await redis.hset(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`, {
    ...youth,
    scheduled: "false",
  });
  await redis.zadd(REDIS_KEYS.YOUTH_QUEUE, normalScore(now), id);
  return youth;
}

export async function markVisited(id: string): Promise<void> {
  const now = Date.now();
  await redis.hset(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`, {
    lastSeenAt: now.toString(),
    scheduled: "false",
    scheduledAt: "",
    trelloCardId: "",
    trelloCardUrl: "",
    visitType: "",
    note: "",
  });
  await redis.zadd(REDIS_KEYS.YOUTH_QUEUE, normalScore(now), id);
}

export async function deleteYouth(id: string): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.del(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`);
  pipeline.zrem(REDIS_KEYS.YOUTH_QUEUE, id);
  await pipeline.exec();
}
