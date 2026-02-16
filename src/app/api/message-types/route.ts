import { NextResponse } from "next/server";
import { getAvailableMessageTypes } from "@/utils/template-loader";
import { loadTemplate } from "@/utils/templates";

export async function GET() {
  const messageTypes = getAvailableMessageTypes();

  // Add template content to each message type
  const messageTypesWithContent = messageTypes.map((type) => ({
    ...type,
    content: loadTemplate(type.id),
  }));

  return NextResponse.json({ messageTypes: messageTypesWithContent });
}
