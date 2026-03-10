import { NextResponse } from "next/server";
import { getQueue } from "@/utils/youth-queue";

export async function GET() {
  try {
    const queue = await getQueue();
    return NextResponse.json({ queue });
  } catch (error) {
    console.error("Error fetching queue:", error);
    return NextResponse.json(
      { error: "Failed to fetch queue" },
      { status: 500 },
    );
  }
}
