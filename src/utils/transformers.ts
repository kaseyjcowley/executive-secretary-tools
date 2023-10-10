import {
  pipe,
  pipeAsync,
  filter,
  map,
  mapAsync,
  head,
  nth,
  modify,
  set,
  pick,
  assoc,
  over,
  lensProp,
  match,
  prop,
  sortByPath,
  groupBy,
  complement,
  isEmpty,
} from "rambdax";

import {
  ApiTrelloCard,
  CallingTrelloCard,
  InterviewTrelloCard,
  TrelloCard,
} from "@/requests/cards";
import { ApiMember, hydrateMembers } from "@/requests/members";

import { isCardDueNextSunday } from "./dates";

const hasAssignee = pipe(prop("idMembers"), complement(isEmpty));

export const groupSortedCardsByMember = (
  cards: TrelloCard[]
): Record<ApiMember["id"], Array<InterviewTrelloCard | CallingTrelloCard>> =>
  /* @ts-expect-error - can't get types right*/
  pipe(sortByPath("due"), groupBy(prop("idMembers")))(cards);

export const transformTrelloCards = async (
  cards: ApiTrelloCard[]
): Promise<TrelloCard[]> => {
  return pipeAsync<TrelloCard[]>(
    // Only use cards that have an assignee
    filter(hasAssignee),
    // Only get the cards that are due the next coming Sunday
    filter(isCardDueNextSunday),
    // Get the only member in the list
    map(modify("idMembers", head)),
    // Using the plucked ID, hydrate the member information
    mapAsync<ApiTrelloCard, Promise<TrelloCard>>(hydrateMembers)
  )(cards);
};

export const buildInterviewTrelloCard = pipe(
  // Pluck the one label and only get it's id and name
  over(lensProp("labels"), pipe(head, pick(["id", "name"]))),
  // Each card is uniquely an interview card
  assoc("kind", "interview" as const)
);

export const buildCallingTrelloCard = (card: TrelloCard) =>
  pipe(
    set(lensProp("name"), head(match(/.+?(?=\sas)/, card.name))),
    assoc("calling", nth(1, match(/as ([^;]+)$/, card.name))),
    assoc("kind", "calling" as const)
  )(card);
