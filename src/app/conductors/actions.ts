"use server";

import { revalidatePath } from "next/cache";
import redis from "@/utils/redis";
import { app } from "@/utils/slack";
import { SlackChannelId, REDIS_KEYS } from "@/constants";
import { CONDUCTORS } from "@/constants/conductors";
import type { Conductor, ConductorOverride } from "@/types/conductors";

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

async function initializeRotationIfNeeded(): Promise<void> {
  const rotationJson = await redis.get(REDIS_KEYS.CONDUCTOR_ROTATION);
  if (!rotationJson) {
    await redis.set(REDIS_KEYS.CONDUCTOR_ROTATION, JSON.stringify(CONDUCTORS));
    await redis.set(REDIS_KEYS.CONDUCTOR_CURRENT_INDEX, "0");
  }
}

export async function setOverride(
  slackUserId: string,
  name: string,
  reason: string,
): Promise<ConductorOverride> {
  const override: ConductorOverride = {
    slackUserId,
    name,
    reason: reason || "",
    expiresAfterDate: new Date().toISOString(),
  };

  await redis.set(REDIS_KEYS.CONDUCTOR_OVERRIDE, JSON.stringify(override));
  revalidatePath("/conductors");

  return override;
}

export async function clearOverride(): Promise<void> {
  await redis.del(REDIS_KEYS.CONDUCTOR_OVERRIDE);
  revalidatePath("/conductors");
}

interface AdvanceResult {
  conductor: Conductor;
  nextConductor: Conductor;
  message: string;
}

export async function advanceRotation(dryRun = false): Promise<AdvanceResult> {
  await initializeRotationIfNeeded();

  const rotationJson = await redis.get(REDIS_KEYS.CONDUCTOR_ROTATION);
  const currentIndexStr = await redis.get(REDIS_KEYS.CONDUCTOR_CURRENT_INDEX);
  const overrideJson = await redis.get(REDIS_KEYS.CONDUCTOR_OVERRIDE);

  const rotation: Conductor[] = rotationJson
    ? JSON.parse(rotationJson)
    : [...CONDUCTORS];
  const currentIndex = parseInt(currentIndexStr ?? "0", 10);
  const override: ConductorOverride | null = overrideJson
    ? JSON.parse(overrideJson)
    : null;

  let conductor: Conductor;
  let newIndex: number;

  if (override) {
    conductor = override;
    newIndex = currentIndex;
    if (!dryRun) {
      await redis.del(REDIS_KEYS.CONDUCTOR_OVERRIDE);
      console.log(`Cleared override after use: ${conductor.name}`);
    }
  } else {
    conductor = rotation[currentIndex];
    newIndex = (currentIndex + 1) % rotation.length;
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

  revalidatePath("/conductors");

  return {
    conductor,
    nextConductor,
    message: dryRun ? "Dry run - no changes made" : "Rotation advanced",
  };
}
