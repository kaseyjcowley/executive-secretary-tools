import { NextRequest, NextResponse } from "next/server";
import { getYouthById, deleteYouth } from "@/utils/youth-queue";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const youth = await getYouthById(params.id);
    if (!youth) {
      return NextResponse.json({ error: "Youth not found" }, { status: 404 });
    }
    return NextResponse.json({ youth });
  } catch (error) {
    console.error("Error fetching youth:", error);
    return NextResponse.json(
      { error: "Failed to fetch youth" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await deleteYouth(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting youth:", error);
    return NextResponse.json(
      { error: "Failed to delete youth" },
      { status: 500 },
    );
  }
}
