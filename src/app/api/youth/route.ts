import { NextRequest, NextResponse } from "next/server";
import { createYouth } from "@/utils/youth-queue";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const youth = await createYouth(name.trim());
    return NextResponse.json({ youth });
  } catch (error) {
    console.error("Error creating youth:", error);
    return NextResponse.json(
      { error: "Failed to create youth" },
      { status: 500 },
    );
  }
}
