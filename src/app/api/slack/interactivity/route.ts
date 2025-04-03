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
    const {
      actions: [action],
    } = parsedPayload;
    const channel_id = parsedPayload?.channel?.channel_id;

    const handler = HandlerFactory.create(action.action_id);
    await handler.handle(
      parsedPayload,
      channel_id === SlackChannelId.automationTesting || true
    );

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    return new NextResponse(
      "There was a problem parsing the form data for this request.",
      {
        status: 500,
      }
    );
  }
}
