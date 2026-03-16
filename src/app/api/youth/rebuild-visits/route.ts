import { NextRequest, NextResponse } from "next/server";
import { getQueue } from "@/utils/youth-queue";
import { syncVisitHistory } from "@/utils/trello-youth";

const DELAY_MS = 500;

export async function POST(request: NextRequest) {
  try {
    const queue = await getQueue();

    const results: { name: string; success: boolean; visitCount: number }[] =
      [];

    for (const youth of queue) {
      const visits = await syncVisitHistory(youth.name, youth.id, true);
      results.push({
        name: youth.name,
        success: true,
        visitCount: visits.length,
      });

      if (DELAY_MS > 0) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    return NextResponse.json({
      success: true,
      totalYouth: queue.length,
      results,
    });
  } catch (error) {
    console.error("Error rebuilding all visit histories:", error);
    return NextResponse.json(
      { error: "Failed to rebuild visit histories" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/youth/rebuild-visits",
    method: "POST",
    description:
      "Rebuilds visit history for all youth with 500ms delay between requests",
  });
}
