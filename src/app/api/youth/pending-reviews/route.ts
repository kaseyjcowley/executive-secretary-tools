import { NextRequest, NextResponse } from "next/server";
import { getPendingReviews, getYouthById } from "@/utils/youth-queue";
import {
  confirmPendingReview,
  dismissPendingReview,
  syncYouthVisitsFromTrello,
} from "@/utils/trello-youth";

export async function GET() {
  try {
    const reviews = await getPendingReviews();
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending reviews" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const result = await syncYouthVisitsFromTrello();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error syncing visits from Trello:", error);
    return NextResponse.json(
      { error: "Failed to sync visits from Trello" },
      { status: 500 },
    );
  }
}
