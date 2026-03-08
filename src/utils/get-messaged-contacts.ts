import redis from "@/utils/redis";
import { REDIS_KEYS } from "@/constants";

export async function getMessagedContactIds(
  contactNames: string[],
): Promise<Set<string>> {
  if (contactNames.length === 0) {
    return new Set();
  }

  try {
    const keys = contactNames.map(
      (name) => `${REDIS_KEYS.MESSAGED_CONTACT_PREFIX}${name}`,
    );
    const results = await redis.mget(...keys);
    const messaged = contactNames.filter((_, index) => results[index] !== null);
    return new Set(messaged);
  } catch (error) {
    console.error("Error fetching messaged status:", error);
    return new Set();
  }
}
