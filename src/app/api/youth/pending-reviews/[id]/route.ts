import { NextRequest, NextResponse } from "next/server";
import {
  confirmPendingReview,
  dismissPendingReview,
} from "@/utils/trello-youth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { action, youthId } = body;

    if (action === "confirm") {
      if (!youthId) {
        return NextResponse.json(
          { error: "youthId is required for confirm action" },
          { status: 400 },
        );
      }
      await confirmPendingReview(id, youthId);
      return NextResponse.json({ success: true, message: "Visit confirmed" });
    } else if (action === "dismiss") {
      await dismissPendingReview(id);
      return NextResponse.json({ success: true, message: "Review dismissed" });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'confirm' or 'dismiss'" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error processing pending review:", error);
    return NextResponse.json(
      { error: "Failed to process pending review" },
      { status: 500 },
    );
  }
}
