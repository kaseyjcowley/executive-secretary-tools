import { redis } from "../redis";
import { REDIS_KEYS } from "../constants";

export interface Conductor {
  slackUserId: string;
  name: string;
}

export interface ConductorOverride extends Conductor {
  reason: string;
  expiresAfterDate: string;
}

export const conductors = {
  async rotation(conductorsList: Conductor[]): Promise<void> {
    await redis.set(
      REDIS_KEYS.CONDUCTOR_ROTATION,
      JSON.stringify(conductorsList)
    );
    await redis.set(REDIS_KEYS.CONDUCTOR_CURRENT_INDEX, "0");
  },

  async index(index: number): Promise<void> {
    await redis.set(REDIS_KEYS.CONDUCTOR_CURRENT_INDEX, index.toString());
  },

  async override(conductor: Conductor, reason: string): Promise<ConductorOverride> {
    const override: ConductorOverride = {
      ...conductor,
      reason,
      expiresAfterDate: new Date().toISOString(),
    };

    await redis.set(
      REDIS_KEYS.CONDUCTOR_OVERRIDE,
      JSON.stringify(override)
    );

    return override;
  },

  async clearOverride(): Promise<void> {
    await redis.del(REDIS_KEYS.CONDUCTOR_OVERRIDE);
  },

  async getCurrentIndex(): Promise<number> {
    const index = await redis.get(REDIS_KEYS.CONDUCTOR_CURRENT_INDEX);
    return parseInt(index || "0", 10);
  },

  async getRotation(): Promise<Conductor[]> {
    const data = await redis.get(REDIS_KEYS.CONDUCTOR_ROTATION);
    if (!data) return [];
    return JSON.parse(data);
  },

  async getOverride(): Promise<ConductorOverride | null> {
    const data = await redis.get(REDIS_KEYS.CONDUCTOR_OVERRIDE);
    if (!data) return null;
    return JSON.parse(data);
  },
};
