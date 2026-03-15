import redis from "@/utils/redis";
import { REDIS_KEYS } from "@/constants";
import { CONDUCTORS } from "@/constants/conductors";
import { Conductor, ConductorOverride } from "@/types/conductors";

export interface ConductorState {
  rotation: Conductor[];
  currentIndex: number;
  override: ConductorOverride | null;
}

export async function getConductorState(): Promise<ConductorState> {
  const rotationJson = await redis.get(REDIS_KEYS.CONDUCTOR_ROTATION);
  const currentIndexStr = await redis.get(REDIS_KEYS.CONDUCTOR_CURRENT_INDEX);
  const overrideJson = await redis.get(REDIS_KEYS.CONDUCTOR_OVERRIDE);

  const rotation: Conductor[] = rotationJson
    ? JSON.parse(rotationJson)
    : [...CONDUCTORS];
  const currentIndex = parseInt(currentIndexStr ?? "0", 10);
  const override: ConductorOverride | null = overrideJson
    ? JSON.parse(overrideJson)
    : null;

  return { rotation, currentIndex, override };
}

export function resolveCurrentConductor(state: ConductorState): Conductor {
  return state.override ?? state.rotation[state.currentIndex];
}

export function resolveNextConductor(state: ConductorState): Conductor {
  const nextIndex = (state.currentIndex + 1) % state.rotation.length;
  return state.rotation[nextIndex];
}

export async function initializeRotationIfNeeded(): Promise<void> {
  const rotationJson = await redis.get(REDIS_KEYS.CONDUCTOR_ROTATION);
  if (!rotationJson) {
    await redis.set(REDIS_KEYS.CONDUCTOR_ROTATION, JSON.stringify(CONDUCTORS));
    await redis.set(REDIS_KEYS.CONDUCTOR_CURRENT_INDEX, "0");
  }
}
