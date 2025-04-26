import { SlackChannelId } from "@/constants";
import { HandlerFactory } from "@/utils/slack";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.clone().formData();

  try {
    const payload = body.get("payload");
    if (payload === null) {
      throw new Error();
    }

    const parsedPayload = JSON.parse(payload.toString());
    const { type } = parsedPayload;
    let handlerIdentifier;

    switch (type) {
      case "view_submission":
        handlerIdentifier = parsedPayload.view.callback_id;
        break;
      case "block_actions":
        handlerIdentifier = parsedPayload.actions[0].action_id;
        break;
    }

    let privateMetadataDryRun;

    try {
      privateMetadataDryRun = JSON.parse(
        parsedPayload.view.private_metadata
      ).dryRun;
    } catch (e) {
      privateMetadataDryRun = false;
    }

    const channel_id = parsedPayload?.channel?.id;
    const dryRun =
      privateMetadataDryRun || channel_id === SlackChannelId.automationTesting;

    const handler = HandlerFactory.create(handlerIdentifier);
    const response = await handler.handle(parsedPayload, dryRun);

    return NextResponse.json(response ?? { message: "Success" }, {
      status: 200,
    });
  } catch (error) {
    return new NextResponse(
      "There was a problem parsing the form data for this request.",
      {
        status: 500,
      }
    );
  }
}
