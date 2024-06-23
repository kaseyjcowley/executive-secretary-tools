import { NextRequest, NextResponse } from "next/server";
import { App } from "@slack/bolt";

import { SlackChannelId } from "@/constants";

const app = new App({
  token: process.env.SLACK_USER_OAUTH_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

function getPrayersFromMessage(message: string) {
  const openingPrayerMatch = message.match(
    /opening prayer:?\s([a-zA-Z]+\s[a-zA-Z]+)/i
  );
  const closingPrayerMatch = message.match(
    /closing prayer:?\s([a-zA-Z]+\s[a-zA-Z]+)/i
  );

  if (!openingPrayerMatch || !closingPrayerMatch) {
    throw new Error(
      `something went wrong parsing the opening and closing prayers: opening: ${openingPrayerMatch}, closing: ${closingPrayerMatch}`
    );
  }

  return {
    invocation: openingPrayerMatch[1].trim(),
    benediction: closingPrayerMatch[1].trim(),
  };
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    throw new Error("no request body found");
  }

  const { message, dryRun } = body;

  if (!message) {
    throw new Error('missing payload value: "message"');
  }

  const { invocation, benediction } = getPrayersFromMessage(message);

  await app.client.chat.postMessage({
    channel: dryRun
      ? SlackChannelId.automationTesting
      : SlackChannelId.bishopric,
    text: `Sacrament meeting prayers:

Opening prayer: ${invocation}
Closing prayer: ${benediction}`,
  });

  return NextResponse.json({ success: true });
}
