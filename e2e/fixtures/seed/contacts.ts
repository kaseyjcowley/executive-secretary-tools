import { redis } from "../redis";
import { REDIS_KEYS } from "../constants";

const ONE_WEEK_TTL = 7 * 24 * 60 * 60;

export const contacts = {
  async messaged(contactIds: string[]): Promise<void> {
    const pipeline = redis.pipeline();
    const now = Date.now();
    
    for (const id of contactIds) {
      const ttl = ONE_WEEK_TTL - Math.floor((now % (ONE_WEEK_TTL * 1000)) / 1000);
      pipeline.set(`${REDIS_KEYS.MESSAGED_CONTACT_PREFIX}${id}`, now.toString(), "EX", ttl);
    }
    
    await pipeline.exec();
  },

  async unmark(contactIds: string[]): Promise<void> {
    const pipeline = redis.pipeline();
    
    for (const id of contactIds) {
      pipeline.del(`${REDIS_KEYS.MESSAGED_CONTACT_PREFIX}${id}`);
    }
    
    await pipeline.exec();
  },

  async isMessaged(contactId: string): Promise<boolean> {
    const exists = await redis.exists(`${REDIS_KEYS.MESSAGED_CONTACT_PREFIX}${contactId}`);
    return exists === 1;
  },

  async getMessaged(): Promise<string[]> {
    const keys = await redis.keys(`${REDIS_KEYS.MESSAGED_CONTACT_PREFIX}*`);
    return keys.map((k) => k.replace(REDIS_KEYS.MESSAGED_CONTACT_PREFIX, ""));
  },
};
