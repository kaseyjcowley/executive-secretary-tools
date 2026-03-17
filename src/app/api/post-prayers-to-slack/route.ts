import { NextRequest, NextResponse } from "next/server";

import { SlackChannelId } from "@/constants";
import { app } from "@/utils/slack";

const slackApp = app;

interface PrayerAssignment {
  openingPrayer: string | null;
  closingPrayer: string | null;
}

export function extractPrayers(message: string): PrayerAssignment {
  const openingMatch = message.match(/opening prayer:?\s*\n\s*([^\n]+)/i);
  const closingMatch = message.match(/closing prayer:?\s*\n\s*([^\n]+)/i);

  return {
    openingPrayer: openingMatch ? openingMatch[1].trim() : null,
    closingPrayer: closingMatch ? closingMatch[1].trim() : null,
  };
}

async function getConductorFromTopic(
  channelId: string,
): Promise<string | null> {
  const response = await slackApp.client.conversations.info({
    channel: channelId,
  });

  const topic = response.channel?.topic?.value;

  console.log(`[Prayer Bot] Channel topic: "${topic}"`);

  if (!topic) return null;

  const conductorMatch = topic.match(/<@(U[A-Z0-9]+)>/);
  return conductorMatch ? conductorMatch[1] : null;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("x-webhook-secret");
  if (authHeader !== process.env.PRAYER_WEBHOOK_SECRET) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: { message?: string; dryRun?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { message, dryRun } = body;

  if (dryRun) {
    console.log(`[Prayer Bot] Dry run requested`);
  }

  if (!message) {
    return NextResponse.json(
      { success: false, error: 'Missing payload value: "message"' },
      { status: 400 },
    );
  }

  const { openingPrayer, closingPrayer } = extractPrayers(message);

  if (!openingPrayer || !closingPrayer) {
    return NextResponse.json(
      {
        success: false,
        error: `Could not parse prayer assignments. Parsed: opening="${openingPrayer}", closing="${closingPrayer}"`,
      },
      { status: 422 },
    );
  }

  const targetChannel = dryRun
    ? SlackChannelId.automationTesting
    : SlackChannelId.bishopric;

  console.log(
    `[Prayer Bot] Target channel: ${targetChannel} (dryRun: ${dryRun})`,
  );

  const conductorId = await getConductorFromTopic(targetChannel).catch(
    () => null,
  );

  if (conductorId) {
    console.log(`[Prayer Bot] Found conductor from topic: ${conductorId}`);
  } else {
    console.log(`[Prayer Bot] No conductor found in channel topic`);
  }

  let messageText = "";

  if (conductorId) {
    messageText += `🙏 <@${conductorId}> — here are this week's Sacrament meeting prayer assignments. 🙏\n\n`;
  } else {
    messageText += `🙏 Here are this week's Sacrament meeting prayer assignments. 🙏\n\n`;
  }

  messageText += `*Opening Prayer:* ${openingPrayer}\n*Closing Prayer:* ${closingPrayer}`;

  console.log(
    `[Prayer Bot] Posting message: ${messageText.replace(/\n/g, "\\n")}`,
  );

  await slackApp.client.chat.postMessage({
    channel: targetChannel,
    text: messageText,
  });

  return NextResponse.json({ success: true });
}
