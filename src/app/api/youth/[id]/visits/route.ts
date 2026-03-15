import { NextRequest, NextResponse } from "next/server";
import { getYouthById } from "@/utils/youth-queue";
import { getYouthVisitHistory, syncVisitHistory } from "@/utils/trello-youth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const youth = await getYouthById(params.id);
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
  { params }: { params: { id: string } },
) {
  try {
    const youth = await getYouthById(params.id);
    if (!youth) {
      return NextResponse.json({ error: "Youth not found" }, { status: 404 });
    }

    const visits = await syncVisitHistory(youth.name, youth.id);
    return NextResponse.json({
      visits,
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
