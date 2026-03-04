import { NextRequest, NextResponse } from "next/server";
import redis from "@/utils/redis";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.INTERNAL_TOOL_TOKEN}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const keys = await redis.keys("*");

  const pipeline = redis.pipeline();
  keys.forEach((key) => pipeline.get(key));
  const results = await pipeline.exec();

  const data: Record<string, unknown> = {};

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = results?.[i]?.[1];

    if (value === null) {
      data[key] = null;
    } else if (typeof value === "string") {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    } else {
      data[key] = value;
    }
  }

  return NextResponse.json({
    keys: keys.sort(),
    data,
  });
}
