import { NextRequest, NextResponse } from "next/server";
import redis from "@/utils/redis";
import { REDIS_KEYS } from "@/constants";
import { SetOverrideRequest } from "@/types/conductors";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

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
