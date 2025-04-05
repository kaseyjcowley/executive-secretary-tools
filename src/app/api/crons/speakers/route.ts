import { NextRequest, NextResponse } from "next/server";
import { app } from "@/utils/slack";
import { SlackChannelId } from "@/constants";
import { anyPass } from "rambdax";
import {
  getClosestSunday,
  isFirstSunday,
  isGeneralConference,
} from "@/utils/dates";

export async function GET(request: NextRequest) {
  // Confirm someone is allowed to do this
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  // Skip posting when the first sunday is upcoming, or general conference is upcoming
  const shouldSkip = anyPass([isFirstSunday, isGeneralConference])(
    getClosestSunday()
  );

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
          text: `<@${userIdConductingThisMonth}>, please click the button below to add Sacrament speakers for the week. Thank you!`,
        },
      },
      {
        type: "divider",
      },
      {
        type: "actions",
        block_id: "speakers_actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Submit Sacrament Speakers",
              emoji: true,
            },
            style: "primary",
            action_id: "open_speakers_modal",
          },
        ],
      },
    ],
  });

  return NextResponse.json({ message: "Success" });
}
