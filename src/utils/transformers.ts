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
  defaultTo,
} from "rambdax";

import {
  ApiTrelloCard,
  CallingTrelloCard,
  InterviewTrelloCard,
  TrelloCard,
} from "@/requests/cards";
import { ApiMember, hydrateMembers } from "@/requests/members";

import { isCardDueNextSunday } from "./dates";
import { CallingStage } from "@/constants";

export const groupSortedCardsByMember = (
  cards: TrelloCard[],
): Record<ApiMember["id"], Array<InterviewTrelloCard | CallingTrelloCard>> =>
  /* @ts-expect-error - Rambdax pipe types don't correctly infer the Record return type */
  pipe(sortByPath("due"), groupBy(prop("idMembers")))(cards);

export const transformTrelloCards = async (
  cards: ApiTrelloCard[],
): Promise<TrelloCard[]> => {
  return pipeAsync<TrelloCard[]>(
    // Only get the cards that are due the next coming Sunday
    filter(isCardDueNextSunday),
    // Get the only member in the list
    // @ts-expect-error - Rambdax modify types don't work well with pipe composition
    map(modify("idMembers", pipe(head, defaultTo("unassigned")))),
    // Using the plucked ID, hydrate the member information
    // @ts-expect-error - mapAsync generic inference issue with pipe
    mapAsync<ApiTrelloCard, Promise<TrelloCard>>(hydrateMembers),
  )(cards);
};

export const transformTrelloCardsForContacts = async (
  cards: ApiTrelloCard[],
): Promise<TrelloCard[]> => {
  return pipeAsync<TrelloCard[]>(
    // Get the only member in the list
    // @ts-expect-error - Rambdax modify types don't work well with pipe composition
    map(modify("idMembers", pipe(head, defaultTo("unassigned")))),
    // Using the plucked ID, hydrate the member information
    // @ts-expect-error - mapAsync generic inference issue with pipe
    mapAsync<ApiTrelloCard, Promise<TrelloCard>>(hydrateMembers),
  )(cards);
};

export const buildInterviewTrelloCard = pipe(
  // Pluck the one label and only get it's id and name
  over(lensProp("labels"), pipe(head, pick(["id", "name"]))),
  // Each card is uniquely an interview card
  assoc("kind", "interview" as const),
);

export const buildCallingTrelloCard = (stage: CallingStage, card: TrelloCard) =>
  pipe(
    set(lensProp("name"), head(match(/.+?(?=\sas)/, card.name))),
    assoc("calling", nth(1, match(/as ([^;]+)/, card.name))),
    assoc("kind", "calling" as const),
    assoc("stage", stage),
  )(card);
