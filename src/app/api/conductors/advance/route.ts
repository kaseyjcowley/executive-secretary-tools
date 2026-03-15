import { NextRequest, NextResponse } from "next/server";
import redis from "@/utils/redis";
import { app } from "@/utils/slack";
import { SlackChannelId, REDIS_KEYS } from "@/constants";
import { CONDUCTORS } from "@/constants/conductors";
import { Conductor } from "@/types/conductors";

async function updateSlackChannelTopic(conductor: Conductor): Promise<void> {
  const mention = `<@${conductor.slackUserId}>`;
  const newTopic = `Conducting this month: ${mention}`;

  await app.client.conversations.setTopic({
    channel: SlackChannelId.bishopric,
    topic: newTopic,
  });

  console.log(`Updated channel topic to: ${newTopic}`);
}

export async function POST(request: NextRequest) {
  const dryRun = Number(request.nextUrl.searchParams.get("dry-run")) === 1;

  const rotationJson = await redis.get(REDIS_KEYS.CONDUCTOR_ROTATION);
  const currentIndexStr = await redis.get(REDIS_KEYS.CONDUCTOR_CURRENT_INDEX);
  const overrideJson = await redis.get(REDIS_KEYS.CONDUCTOR_OVERRIDE);

  if (!rotationJson) {
    await redis.set(REDIS_KEYS.CONDUCTOR_ROTATION, JSON.stringify(CONDUCTORS));
    await redis.set(REDIS_KEYS.CONDUCTOR_CURRENT_INDEX, "0");
  }

  const rotation: Conductor[] = rotationJson
    ? JSON.parse(rotationJson)
    : [...CONDUCTORS];
  const currentIndex = parseInt(currentIndexStr ?? "0", 10);
  const override = overrideJson ? JSON.parse(overrideJson) : null;

  let conductor: Conductor;

  if (override) {
    conductor = override;
    if (!dryRun) {
      await redis.del(REDIS_KEYS.CONDUCTOR_OVERRIDE);
      console.log(`Cleared override after use: ${conductor.name}`);
    }
  } else {
    conductor = rotation[currentIndex];
    const newIndex = (currentIndex + 1) % rotation.length;
    if (!dryRun) {
      await redis.set(REDIS_KEYS.CONDUCTOR_CURRENT_INDEX, newIndex.toString());
      console.log(`Advanced rotation to index ${newIndex}: ${conductor.name}`);
    }
  }

  if (!dryRun) {
    await updateSlackChannelTopic(conductor);
  } else {
    console.log(
      `[DRY RUN] Would update topic to: ${conductor.name} (${conductor.slackUserId})`,
    );
  }

  const nextIndex = (currentIndex + 1) % rotation.length;
  const nextConductor = rotation[nextIndex];

  return NextResponse.json({
    message: dryRun ? "Dry run - no changes made" : "Rotation advanced",
    conductor,
    nextConductor,
    dryRun,
  });
}
