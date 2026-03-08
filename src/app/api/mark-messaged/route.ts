import { NextRequest, NextResponse } from "next/server";
import redis from "@/utils/redis";
import { secondsUntilMondayMidnight } from "@/utils/messaged-ttl";
import { REDIS_KEYS } from "@/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactIds } = body;

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: "contactIds array required" },
        { status: 400 },
      );
    }

    const ttl = secondsUntilMondayMidnight();
    const pipeline = redis.pipeline();

    contactIds.forEach((id: string) => {
      pipeline.set(
        `${REDIS_KEYS.MESSAGED_CONTACT_PREFIX}${id}`,
        "1",
        "EX",
        ttl,
      );
    });

    await pipeline.exec();

    return NextResponse.json({ ok: true, expiresInSeconds: ttl });
  } catch (error) {
    console.error("Error marking contacts as messaged:", error);
    return NextResponse.json(
      { error: "Failed to mark contacts" },
      { status: 500 },
    );
  }
}
