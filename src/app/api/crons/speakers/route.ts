import { NextRequest, NextResponse } from "next/server";
import { app } from "@/utils/slack";
import { BlockKit } from "@/utils/block-kit-builder"; // Import the builder
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

  // Build the message payload using the fluent interface
  const messagePayload = BlockKit.message()
    .channel(slackChannel)
    .text(
      `<@${userIdConductingThisMonth}>, please click the button below to add Sacrament speakers for the week.` // Fallback text
    )
    .addBlock(
      BlockKit.section().text(
        BlockKit.markdownText(
          `<@${userIdConductingThisMonth}>, please click the button below to add Sacrament speakers for the week. Thank you!`
        )
      )
    )
    .addBlock(BlockKit.divider())
    .addBlock(
      BlockKit.actions()
        .blockId("speakers_actions")
        .addElement(
          BlockKit.button(
            BlockKit.plainText("Submit Sacrament Speakers", { emoji: true })
          )
            .style("primary")
            .actionId("open_speakers_modal")
        )
    )
    .build();

  // Post the message using the built payload
  await app.client.chat.postMessage(messagePayload);

  return NextResponse.json({ message: "Success" });
}
