export interface Conductor {
  slackUserId: string;
  name: string;
}

export interface ConductorOverride extends Conductor {
  reason: string;
  expiresAfterDate: string;
}

export interface ConductorState {
  rotation: Conductor[];
  currentIndex: number;
  override: ConductorOverride | null;
}

export interface SetOverrideRequest {
  slackUserId: string;
  name: string;
  reason: string;
}
