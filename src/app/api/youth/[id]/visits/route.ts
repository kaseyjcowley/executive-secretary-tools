import { NextRequest, NextResponse } from "next/server";
import { getYouthById, setVisitHistory } from "@/utils/youth-queue";
import { getYouthVisitHistory, syncVisitHistory } from "@/utils/trello-youth";
import type { VisitHistoryItem } from "@/types/youth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const youth = await getYouthById(id);
    if (!youth) {
      return NextResponse.json({ error: "Youth not found" }, { status: 404 });
    }

    const visits = await getYouthVisitHistory(youth.name, youth.id);
    return NextResponse.json({ visits });
  } catch (error) {
    console.error("Error fetching visit history:", error);
    return NextResponse.json(
      { error: "Failed to fetch visit history" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const youth = await getYouthById(id);
    if (!youth) {
      return NextResponse.json({ error: "Youth not found" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type");
    const url = new URL(request.url);
    const rebuild = url.searchParams.get("rebuild") === "true";

    if (contentType?.includes("application/json")) {
      const body = await request.json();
      const { visits } = body as { visits?: VisitHistoryItem[] };

      if (visits !== undefined) {
        await setVisitHistory(id, visits);
        return NextResponse.json({
          visits,
          message: "Visit history updated",
        });
      }
    }

    console.log("Force rebuilding visit history for:", youth.name);
    const syncedVisits = await syncVisitHistory(
      youth.name,
      youth.id,
      rebuild || true,
    );
    return NextResponse.json({
      visits: syncedVisits,
      message: "Visit history rebuilt from Trello",
    });
  } catch (error) {
    console.error("Error rebuilding visit history:", error);
    return NextResponse.json(
      { error: "Failed to rebuild visit history" },
      { status: 500 },
    );
  }
}
