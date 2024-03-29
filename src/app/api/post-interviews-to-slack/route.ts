import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { App } from "@slack/bolt";
import { interpolate } from "rambdax";
import format from "date-fns/format";
import utcToZonedTime from "date-fns-tz/utcToZonedTime";

import {
  BishopricMemberId,
  BishopricSlackMemberIds,
  SlackChannelId,
  CallingStage,
} from "@/constants";
import { CallingTrelloCard, InterviewTrelloCard } from "@/requests/cards";
import { SITE_URL } from "@/utils/urls";

const app = new App({
  token: process.env.SLACK_USER_OAUTH_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const result = await fetch(`${SITE_URL}/api/interviews`).then((r) =>
    r.json()
  );

  const template = fs.readFileSync(
    path.join(process.cwd(), "src/interviews-slack-template.txt"),
    {
      encoding: "utf-8",
    }
  );

  const [
    bishopInterviews,
    firstCounselorInterviews,
    secondCounselorInterviews,
  ] = Object.values<string>(BishopricMemberId)
    .filter((memberId) => memberId !== BishopricMemberId.executiveSecretary)
    .map((memberId) =>
      (result[memberId] ?? []).map(formatInterview).join("\n")
    );

  await app.client.chat.postMessage({
    channel: searchParams.has("dry-run")
      ? SlackChannelId.automationTesting
      : SlackChannelId.bishopric,
    text: interpolate(template, {
      bishop: BishopricSlackMemberIds.bishop,
      bishopInterviews,
      firstCounselor: BishopricSlackMemberIds.firstCounselor,
      firstCounselorInterviews,
      secondCounselor: BishopricSlackMemberIds.secondCounselor,
      secondCounselorInterviews,
    }),
  });

  return Response.json({ success: true });
}

function formatInterview(interview: InterviewTrelloCard | CallingTrelloCard) {
  return `• ${format(
    utcToZonedTime(interview.due, "America/Denver"),
    "h:mmaaa"
  )} w/ ${interview.name} - ${
    interview.kind === "calling"
      ? `${prettyPrintStage(interview.stage)} as ${interview.calling}`
      : interview.labels?.name ?? "Interview"
  }`;
}

function prettyPrintStage(stage: CallingStage) {
  switch (stage) {
    case CallingStage.needsCallingExtended:
      return "Extend calling";
    case CallingStage.needsSettingApart:
      return "Set apart";
    default:
      throw new Error(`Calling stage ${stage} is not recognized`);
  }
}
