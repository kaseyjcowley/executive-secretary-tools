import { NextRequest, NextResponse } from "next/server";
import { createYouth } from "@/utils/youth-queue";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { names } = body;

    if (!names || !Array.isArray(names)) {
      return NextResponse.json(
        { error: "Names array is required" },
        { status: 400 },
      );
    }

    const validNames = names
      .map((n) => (typeof n === "string" ? n.trim() : ""))
      .filter((n) => n.length > 0);

    if (validNames.length === 0) {
      return NextResponse.json(
        { error: "At least one valid name is required" },
        { status: 400 },
      );
    }

    const results = await Promise.allSettled(
      validNames.map((name) => createYouth(name)),
    );

    const successful: string[] = [];
    const failed: string[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "fulfilled") {
        successful.push(result.value.name);
      } else {
        failed.push(validNames[i]);
      }
    }

    return NextResponse.json({
      imported: successful.length,
      failed: failed.length,
      names: successful,
    });
  } catch (error) {
    console.error("Error importing youth:", error);
    return NextResponse.json(
      { error: "Failed to import youth" },
      { status: 500 },
    );
  }
}
