import { NextRequest, NextResponse } from "next/server";
import redis from "@/utils/redis";
import { REDIS_KEYS } from "@/constants";
import { ConductorState } from "@/types/conductors";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const internalToken = request.nextUrl.searchParams.get("internal_token");

  const isAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    internalToken === process.env.INTERNAL_TOOL_TOKEN;

  if (!isAuthorized) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const [rotationJson, currentIndexStr, overrideJson] = await Promise.all([
    redis.get(REDIS_KEYS.CONDUCTOR_ROTATION),
    redis.get(REDIS_KEYS.CONDUCTOR_CURRENT_INDEX),
    redis.get(REDIS_KEYS.CONDUCTOR_OVERRIDE),
  ]);

  const state: ConductorState = {
    rotation: rotationJson ? JSON.parse(rotationJson) : [],
    currentIndex: currentIndexStr ? parseInt(currentIndexStr, 10) : 0,
    override: overrideJson ? JSON.parse(overrideJson) : null,
  };

  return NextResponse.json(state);
}
