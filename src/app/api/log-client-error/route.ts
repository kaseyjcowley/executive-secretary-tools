import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    // Log server-side so production logs capture the client error context
    console.error("Client error reported:", JSON.stringify(payload, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to log client error:", err);
    return new NextResponse("Failed to log", { status: 500 });
  }
}
