import { NextRequest, NextResponse } from "next/server";
import { app } from "@/utils/slack";
import { SlackChannelId } from "@/constants";
import { getClosestSunday, isFirstSunday } from "@/utils/dates";

export async function GET(request: NextRequest) {
  // Confirm someone is allowed to do this
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  // Skip posting when the first sunday is upcoming, or general conference is upcoming
  const shouldSkip = isFirstSunday(getClosestSunday());

  if (shouldSkip) return NextResponse.json({ message: "Skipped" });

  // Grab the conductor for this month. It's found in the topic of the channel
  const channelInfo = await app.client.conversations.info({
    channel: SlackChannelId.bishopric,
  });
  const matches = channelInfo.channel?.topic?.value?.match(/\<\@([A-Z0-9]+)\>/);
  const userIdConductingThisMonth = matches?.[1];

  const slackChannel =
    Number(request.nextUrl.searchParams.get("dry-run")) === 1
      ? SlackChannelId.automationTesting
      : SlackChannelId.bishopric;

  // Post a message for the bishopric member who is conducting
  await app.client.chat.postMessage({
    channel: slackChannel,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${userIdConductingThisMonth}>, please add the Sacrament speakers for the week below. Thank you!`,
        },
      },
      {
        type: "divider",
      },
      {
        dispatch_action: true,
        type: "input",
        element: {
          type: "plain_text_input",
          multiline: true,
          action_id: "sacrament-speakers",
        },
        label: {
          type: "plain_text",
          text: "Sacrament speakers for the week",
          emoji: true,
        },
      },
    ],
  });

  return NextResponse.json({ message: "Success" });
}
