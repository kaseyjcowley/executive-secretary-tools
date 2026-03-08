import { NextRequest, NextResponse } from "next/server";
import redis from "@/utils/redis";
import { REDIS_KEYS } from "@/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactId } = body;

    if (!contactId) {
      return NextResponse.json(
        { error: "contactId required" },
        { status: 400 },
      );
    }

    await redis.del(`${REDIS_KEYS.MESSAGED_CONTACT_PREFIX}${contactId}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error unmarking contact:", error);
    return NextResponse.json(
      { error: "Failed to unmark contact" },
      { status: 500 },
    );
  }
}
