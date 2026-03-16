import { NextRequest, NextResponse } from "next/server";
import { scheduleVisit } from "@/utils/trello-youth";

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const { visitType, note } = body;

    if (!visitType) {
      return NextResponse.json(
        { error: "Visit type is required" },
        { status: 400 },
      );
    }

    const result = await scheduleVisit(params.id, visitType, note);

    return NextResponse.json({
      success: true,
      trelloCardUrl: result.trelloCardUrl,
    });
  } catch (error) {
    console.error("Error scheduling visit:", error);
    return NextResponse.json(
      { error: "Failed to schedule visit" },
      { status: 500 },
    );
  }
}
