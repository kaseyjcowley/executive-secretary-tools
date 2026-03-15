import { NextResponse } from "next/server";
import {
  getConductorState,
  resolveCurrentConductor,
  resolveNextConductor,
} from "@/utils/conductors";

export async function GET() {
  try {
    const state = await getConductorState();
    const currentConductor = resolveCurrentConductor(state);
    const nextConductor = resolveNextConductor(state);

    return NextResponse.json({
      rotation: state.rotation,
      currentIndex: state.currentIndex,
      override: state.override,
      currentConductor,
      nextConductor,
    });
  } catch (error) {
    console.error("Error fetching conductor state:", error);
    return new NextResponse("Error fetching conductor state", { status: 500 });
  }
}
