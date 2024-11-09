import { NextRequest } from "next/server";
import { SlackChannelId } from "@/constants";
import { app } from "@/utils/slack";
import blocks from "@/ward-council-reminder-blocks.json";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const dryRun =
    searchParams.has("dry-run") && searchParams.get("dry-run") === "1";

  const slackChannel = dryRun
    ? SlackChannelId.automationTesting
    : SlackChannelId.wardCouncil;

  await app.client.chat.postMessage({
    channel: slackChannel,
    blocks,
  });

  return Response.json({
    success: true,
  });
}
