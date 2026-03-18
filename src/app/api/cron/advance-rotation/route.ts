import { NextRequest, NextResponse } from "next/server";
import redis from "@/utils/redis";
import { app } from "@/utils/slack";
import { SlackChannelId, REDIS_KEYS } from "@/constants";
import { getLastSundayOfMonth } from "@/lib/utils/dates";
import { Conductor } from "@/types/conductors";

function isLastSundayOfMonth(date: Date): boolean {
  const lastSunday = getLastSundayOfMonth(date);
  return date.getDate() === lastSunday.getDate();
}

async function updateSlackChannelTopic(conductor: Conductor): Promise<void> {
  if (!app) {
    console.log(`[TEST MODE] Would update channel topic to: Conducting this month: ${conductor.name}`);
    return;
  }
  
  const mention = `<@${conductor.slackUserId}>`;
  const newTopic = `Conducting this month: ${mention}`;

  await app.client.conversations.setTopic({
    channel: SlackChannelId.bishopric,
    topic: newTopic,
  });

  console.log(`Updated channel topic to: ${newTopic}`);
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const dryRun = Number(request.nextUrl.searchParams.get("dry-run")) === 1;

  const today = new Date();

  if (!isLastSundayOfMonth(today)) {
    return NextResponse.json({
      message: "Skipped - not the last Sunday of the month",
    });
  }

  const overrideJson = await redis.get(REDIS_KEYS.CONDUCTOR_OVERRIDE);

  let conductor: Conductor;

  if (overrideJson) {
    conductor = JSON.parse(overrideJson);
    await redis.del(REDIS_KEYS.CONDUCTOR_OVERRIDE);
    console.log(`Using override: ${conductor.name}`);
  } else {
    const rotationJson = await redis.get(REDIS_KEYS.CONDUCTOR_ROTATION);
    const currentIndexStr = await redis.get(REDIS_KEYS.CONDUCTOR_CURRENT_INDEX);

    if (!rotationJson) {
      return NextResponse.json(
        { error: "No rotation configured" },
        { status: 400 },
      );
    }

    const rotation: Conductor[] = JSON.parse(rotationJson);
    const currentIndex = parseInt(currentIndexStr ?? "0", 10);
    conductor = rotation[currentIndex];

    const newIndex = (currentIndex + 1) % rotation.length;
    await redis.set(REDIS_KEYS.CONDUCTOR_CURRENT_INDEX, newIndex.toString());
    console.log(`Advanced rotation to index ${newIndex}: ${conductor.name}`);
  }

  if (!dryRun) {
    await updateSlackChannelTopic(conductor);
  } else {
    console.log(
      `[DRY RUN] Would update topic to: ${conductor.name} (${conductor.slackUserId})`,
    );
  }

  return NextResponse.json({
    message: "Success",
    conductor,
    dryRun,
  });
}
