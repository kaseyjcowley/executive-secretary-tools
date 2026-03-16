import { NextRequest, NextResponse } from "next/server";
import { getYouthById, updatePreferredName } from "@/utils/youth-queue";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { preferredName } = body;

    const youth = await getYouthById(id);
    if (!youth) {
      return NextResponse.json({ error: "Youth not found" }, { status: 404 });
    }

    await updatePreferredName(id, preferredName || "");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating preferred name:", error);
    return NextResponse.json(
      { error: "Failed to update preferred name" },
      { status: 500 },
    );
  }
}
