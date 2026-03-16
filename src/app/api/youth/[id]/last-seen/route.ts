import { NextRequest, NextResponse } from "next/server";
import { getYouthById } from "@/utils/youth-queue";
import { REDIS_KEYS } from "@/constants";
import redis from "@/utils/redis";

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const { lastSeenAt } = body;

    if (!lastSeenAt) {
      return NextResponse.json(
        { error: "lastSeenAt is required" },
        { status: 400 },
      );
    }

    const youth = await getYouthById(params.id);
    if (!youth) {
      return NextResponse.json({ error: "Youth not found" }, { status: 404 });
    }

    const timestamp = new Date(lastSeenAt).getTime();
    if (isNaN(timestamp)) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 },
      );
    }

    const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
    const score = timestamp + sixMonthsMs;

    await redis.hset(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${params.id}`, {
      lastSeenAt: timestamp.toString(),
    });
    await redis.zadd(REDIS_KEYS.YOUTH_QUEUE, score, params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating last seen:", error);
    return NextResponse.json(
      { error: "Failed to update last seen" },
      { status: 500 },
    );
  }
}
