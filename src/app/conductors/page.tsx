import {
  getConductorState,
  resolveCurrentConductor,
  resolveNextConductor,
} from "@/utils/conductors";
import { ConductorPageClient } from "./ConductorPageClient";

export const dynamic = "force-dynamic";

export default async function ConductorsPage() {
  const state = await getConductorState();
  const currentConductor = resolveCurrentConductor(state);
  const nextConductor = resolveNextConductor(state);

  return (
    <ConductorPageClient
      rotation={state.rotation}
      currentIndex={state.currentIndex}
      override={state.override}
      currentConductor={currentConductor}
      nextConductor={nextConductor}
    />
  );
}
