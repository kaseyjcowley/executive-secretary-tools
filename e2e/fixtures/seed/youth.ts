import { redis } from "../redis";
import { REDIS_KEYS } from "../constants";
import type { Youth, VisitHistoryItem } from "../types/youth";

const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function normalScore(lastSeenAt: number): number {
  return lastSeenAt + SIX_MONTHS_MS;
}

export interface YouthOptions {
  preferredName?: string;
  lastSeenAt?: Date;
  scheduled?: boolean;
  scheduledAt?: Date;
  trelloCardId?: string;
  trelloCardUrl?: string;
  visitType?: string;
  note?: string;
}

export interface VisitOptions {
  visitedAt: Date;
  visitType: string;
  trelloUrl?: string;
  note?: string;
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

export const youth = {
  async single(name: string, options?: YouthOptions): Promise<Youth> {
    const id = generateId();
    const now = Date.now();
    const lastSeen = options?.lastSeenAt?.getTime() || now;
    
    const youthData: Youth = {
      id,
      name,
      preferredName: options?.preferredName,
      lastSeenAt: lastSeen,
      scheduled: options?.scheduled || false,
      scheduledAt: options?.scheduledAt?.getTime(),
      trelloCardId: options?.trelloCardId,
      trelloCardUrl: options?.trelloCardUrl,
      visitType: options?.visitType,
      note: options?.note,
      createdAt: now,
    };

    const hashData: Record<string, string> = {
      id: youthData.id,
      name: youthData.name,
      lastSeenAt: youthData.lastSeenAt.toString(),
      scheduled: youthData.scheduled ? "true" : "false",
      createdAt: youthData.createdAt.toString(),
    };

    if (youthData.preferredName) hashData.preferredName = youthData.preferredName;
    if (youthData.scheduledAt) hashData.scheduledAt = youthData.scheduledAt.toString();
    if (youthData.trelloCardId) hashData.trelloCardId = youthData.trelloCardId;
    if (youthData.trelloCardUrl) hashData.trelloCardUrl = youthData.trelloCardUrl;
    if (youthData.visitType) hashData.visitType = youthData.visitType;
    if (youthData.note) hashData.note = youthData.note;

    await redis.hset(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`, hashData);
    await redis.zadd(REDIS_KEYS.YOUTH_QUEUE, normalScore(lastSeen), id);
    
    return youthData;
  },

  async queue(
    items: Array<{ name: string; options?: YouthOptions }>
  ): Promise<Youth[]> {
    return Promise.all(items.map((item) => this.single(item.name, item.options)));
  },

  async withVisits(name: string, visits: VisitOptions[]): Promise<Youth> {
    const youthData = await this.single(name);
    
    const visitItems: VisitHistoryItem[] = visits.map((v, i) => ({
      id: `visit-${generateId()}`,
      visitedAt: v.visitedAt.getTime(),
      visitType: v.visitType,
      trelloUrl: v.trelloUrl || `https://trello.com/c/visit-${i}`,
      note: v.note,
    }));

    await redis.set(
      `${REDIS_KEYS.YOUTH_VISITS_PREFIX}${youthData.id}`,
      JSON.stringify(visitItems)
    );

    return youthData;
  },

  async getById(id: string): Promise<Youth | null> {
    const raw = await redis.hgetall(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`);
    if (!raw || Object.keys(raw).length === 0) return null;
    return deserializeYouth(raw);
  },

  async getQueue(): Promise<Youth[]> {
    const ids = await redis.zrange(REDIS_KEYS.YOUTH_QUEUE, 0, -1);
    if (!ids.length) return [];

    const pipeline = redis.pipeline();
    (ids as string[]).forEach((id) =>
      pipeline.hgetall(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`)
    );

    const results = await pipeline.exec();
    if (!results) return [];

    return (results as [Error | null, unknown][])
      .filter(([err]) => err === null)
      .map(([, result]) => result as Record<string, string>)
      .map(deserializeYouth);
  },
};
