import { NextRequest, NextResponse } from "next/server";
import { syncWithTrello } from "@/utils/trello-youth";

export async function POST(request: NextRequest) {
  try {
    const result = await syncWithTrello();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error syncing with Trello:", error);
    return NextResponse.json(
      { error: "Failed to sync with Trello" },
      { status: 500 },
    );
  }
}
