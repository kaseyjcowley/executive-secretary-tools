import { NextRequest, NextResponse } from "next/server";
import redis from "@/utils/redis";
import { REDIS_KEYS } from "@/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json({ messaged: [] });
    }

    const ids = idsParam.split(",").filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ messaged: [] });
    }

    const keys = ids.map((id) => `${REDIS_KEYS.MESSAGED_CONTACT_PREFIX}${id}`);
    const results = await redis.mget(...keys);

    const messaged = ids.filter((_, index) => results[index] !== null);

    return NextResponse.json({ messaged });
  } catch (error) {
    console.error("Error fetching messaged status:", error);
    return NextResponse.json({ messaged: [] });
  }
}
