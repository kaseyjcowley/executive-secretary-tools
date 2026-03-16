import redis from "@/utils/redis";
import { nanoid } from "nanoid";
import type { Youth, VisitHistoryItem, PendingReview } from "@/types/youth";
import { REDIS_KEYS } from "@/constants";

const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

function normalScore(lastSeenAt: number): number {
  return lastSeenAt + SIX_MONTHS_MS;
}

export { normalScore };

function scheduledScore(): number {
  return -Date.now();
}

function deserializeYouth(raw: Record<string, string>): Youth {
  return {
    id: raw.id,
    name: raw.name,
    preferredName: raw.preferredName || undefined,
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

export async function updatePreferredName(
  id: string,
  preferredName: string,
): Promise<void> {
  await redis.hset(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`, {
    preferredName: preferredName || "",
  });
}

export async function deleteYouth(id: string): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.del(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`);
  pipeline.zrem(REDIS_KEYS.YOUTH_QUEUE, id);
  pipeline.del(`${REDIS_KEYS.YOUTH_VISITS_PREFIX}${id}`);
  await pipeline.exec();
}

export async function getVisitHistory(id: string): Promise<VisitHistoryItem[]> {
  const cached = await redis.get(`${REDIS_KEYS.YOUTH_VISITS_PREFIX}${id}`);
  if (!cached) return [];
  try {
    return JSON.parse(cached) as VisitHistoryItem[];
  } catch {
    return [];
  }
}

export async function setVisitHistory(
  id: string,
  visits: VisitHistoryItem[],
): Promise<void> {
  await redis.set(
    `${REDIS_KEYS.YOUTH_VISITS_PREFIX}${id}`,
    JSON.stringify(visits),
  );
}

export async function getSyncedCardIds(): Promise<Set<string>> {
  const cards = await redis.smembers(REDIS_KEYS.YOUTH_SYNCED_CARDS);
  return new Set(cards);
}

export async function addSyncedCardId(cardId: string): Promise<void> {
  await redis.sadd(REDIS_KEYS.YOUTH_SYNCED_CARDS, cardId);
}

export async function getPendingReviews(): Promise<PendingReview[]> {
  const reviews = await redis.lrange(REDIS_KEYS.YOUTH_PENDING_REVIEWS, 0, -1);
  return reviews.map((r) => JSON.parse(r) as PendingReview);
}

export async function addPendingReview(review: PendingReview): Promise<void> {
  await redis.rpush(REDIS_KEYS.YOUTH_PENDING_REVIEWS, JSON.stringify(review));
}

export async function removePendingReview(trelloCardId: string): Promise<void> {
  const reviews = await redis.lrange(REDIS_KEYS.YOUTH_PENDING_REVIEWS, 0, -1);
  const toKeep: string[] = [];
  for (const r of reviews) {
    const review = JSON.parse(r) as PendingReview;
    if (review.trelloCardId !== trelloCardId) {
      toKeep.push(r);
    }
  }
  await redis.del(REDIS_KEYS.YOUTH_PENDING_REVIEWS);
  if (toKeep.length > 0) {
    await redis.rpush(REDIS_KEYS.YOUTH_PENDING_REVIEWS, ...toKeep);
  }
}
