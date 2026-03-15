import { NextResponse } from "next/server";
import redis from "@/utils/redis";
import { REDIS_KEYS } from "@/constants";
import { CONDUCTORS } from "@/constants/conductors";
import { Conductor, ConductorOverride } from "@/types/conductors";

export async function GET() {
  try {
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

    const currentConductor = override ?? rotation[currentIndex];
    const nextIndex = (currentIndex + 1) % rotation.length;
    const nextConductor = rotation[nextIndex];

    return NextResponse.json({
      rotation,
      currentIndex,
      override,
      currentConductor,
      nextConductor,
    });
  } catch (error) {
    console.error("Error fetching conductor state:", error);
    return new NextResponse("Error fetching conductor state", { status: 500 });
  }
}
