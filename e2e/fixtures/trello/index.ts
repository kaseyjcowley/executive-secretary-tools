import { setupServer } from "msw/node";
import { handlers } from "./handlers";
import {
  mockMembers,
  mockLabels,
  mockInterviewCards,
  mockCallingCards,
  mockYouthCards,
} from "./mockData";

export const server = setupServer(...handlers);
export { handlers } from "./handlers";

export const mockData = {
  members: mockMembers,
  labels: mockLabels,
  interviewCards: mockInterviewCards,
  callingCards: mockCallingCards,
  youthCards: mockYouthCards,
};
