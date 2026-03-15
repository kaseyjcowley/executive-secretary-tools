import { NextRequest, NextResponse } from "next/server";
import redis from "@/utils/redis";
import { REDIS_KEYS } from "@/constants";
import { SetOverrideRequest } from "@/types/conductors";

export async function POST(request: NextRequest) {
  const body: SetOverrideRequest = await request.json();

  if (!body.slackUserId || !body.name) {
    return NextResponse.json(
      { error: "slackUserId and name are required" },
      { status: 400 },
    );
  }

  const override = {
    slackUserId: body.slackUserId,
    name: body.name,
    reason: body.reason || "",
    expiresAfterDate: new Date().toISOString(),
  };

  await redis.set(REDIS_KEYS.CONDUCTOR_OVERRIDE, JSON.stringify(override));

  return NextResponse.json({
    message: `Override set! ${body.name} will conduct next month.`,
    override,
  });
}

export async function DELETE() {
  const existingOverride = await redis.get(REDIS_KEYS.CONDUCTOR_OVERRIDE);

  if (!existingOverride) {
    return NextResponse.json({ message: "No override to clear" });
  }

  await redis.del(REDIS_KEYS.CONDUCTOR_OVERRIDE);

  return NextResponse.json({ message: "Override cleared" });
}
