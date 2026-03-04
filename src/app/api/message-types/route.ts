import { NextResponse } from "next/server";
import { getAvailableMessageTypes, loadTemplateContent } from "@/utils/template-loader";

export async function GET() {
  const messageTypes = getAvailableMessageTypes();

  // Add template content to each message type
  const messageTypesWithContent = messageTypes.map((type) => ({
    ...type,
    content: loadTemplateContent(type.id),
  }));

  return NextResponse.json({ messageTypes: messageTypesWithContent });
}
