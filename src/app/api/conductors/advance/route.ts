import { NextRequest, NextResponse } from "next/server";
import redis from "@/utils/redis";
import { app } from "@/utils/slack";
import { SlackChannelId, REDIS_KEYS } from "@/constants";
import { Conductor } from "@/types/conductors";
import {
  getConductorState,
  resolveCurrentConductor,
  resolveNextConductor,
  initializeRotationIfNeeded,
} from "@/utils/conductors";

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

  await initializeRotationIfNeeded();

  const state = await getConductorState();
  const currentConductor = resolveCurrentConductor(state);
  const nextConductor = resolveNextConductor(state);

  let conductor: Conductor;

  if (state.override) {
    conductor = state.override;
    if (!dryRun) {
      await redis.del(REDIS_KEYS.CONDUCTOR_OVERRIDE);
      console.log(`Cleared override after use: ${conductor.name}`);
    }
  } else {
    conductor = currentConductor;
    const newIndex = (state.currentIndex + 1) % state.rotation.length;
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

  return NextResponse.json({
    message: dryRun ? "Dry run - no changes made" : "Rotation advanced",
    conductor,
    nextConductor,
    dryRun,
  });
}
