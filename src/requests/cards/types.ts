import { CallingStage } from "@/constants";
import { ApiMember } from "@/requests/members";

export interface Label {
  id: string;
  name: string;
}

export interface ApiTrelloCard {
  name: string;
  due: string;
  idMembers: string;
}

export interface TrelloCard extends ApiTrelloCard {
  assigned: ApiMember["fullName"] | undefined;
}

export interface InterviewTrelloCard extends TrelloCard {
  kind: "interview";
  labels?: Label;
}

export interface CallingTrelloCard extends TrelloCard {
  kind: "calling";
  calling: string;
  stage: CallingStage;
}
