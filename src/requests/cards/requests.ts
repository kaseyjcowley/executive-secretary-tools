import { map, pipeAsync, partial } from "rambdax";

import {
  buildCallingTrelloCard,
  buildInterviewTrelloCard,
  groupSortedCardsByMember,
  transformTrelloCards,
  transformTrelloCardsForContacts,
} from "@/utils/transformers";

import { ApiTrelloCard, CallingTrelloCard, InterviewTrelloCard } from "./types";

import { CallingStage, TRELLO_LIST_IDS } from "@/constants";

const DEFAULT_CARD_FIELDS = ["id", "name", "due", "assigned", "idMembers"];

const TRELLO_BASE_URL = process.env.TRELLO_BASE_URL || "https://api.trello.com";

const fetchCards = async (
  listId: string,
  additionalFields: string[] = [],
): Promise<ApiTrelloCard[]> => {
  const apiCards = await fetch(
    `${TRELLO_BASE_URL}/1/lists/${listId}/cards?key=${
      process.env.TRELLO_API_KEY
    }&token=${process.env.TRELLO_API_TOKEN}&fields=${DEFAULT_CARD_FIELDS.concat(
      additionalFields,
    ).toString()}`,
    { cache: "no-cache" },
  )
    .then((response) => response.json() as Promise<ApiTrelloCard[]>)
    .catch((err) => {
      console.error("Failed to fetch Trello cards:", err);
      return [] as ApiTrelloCard[];
    });

  return apiCards;
};

// Pipeline builders - take a transformer function and return the full transformation pipeline
const buildInterviewCardsPipeline = (
  transformer: typeof transformTrelloCards,
): ((cards: ApiTrelloCard[]) => Promise<InterviewTrelloCard[]>) => {
  return pipeAsync<InterviewTrelloCard[]>(
    transformer,
    map(buildInterviewTrelloCard),
  );
};

const buildCallingCardsPipeline = (
  transformer: typeof transformTrelloCards,
  stage: CallingStage,
): ((cards: ApiTrelloCard[]) => Promise<CallingTrelloCard[]>) => {
  return pipeAsync<CallingTrelloCard[]>(
    transformer,
    // @ts-expect-error - partial application with stage parameter causes type mismatch with Rambdax map
    map(partial(buildCallingTrelloCard, stage)),
  );
};

export const fetchInterviewCards = async (
  listId: string,
): Promise<InterviewTrelloCard[]> => {
  const apiCards = await fetchCards(listId, ["labels"]);

  return await buildInterviewCardsPipeline(transformTrelloCards)(apiCards);
};

export const fetchCallingCards = async (
  stage: CallingStage,
  listId: string,
): Promise<CallingTrelloCard[]> => {
  const apiCards = await fetchCards(listId);

  return await buildCallingCardsPipeline(transformTrelloCards, stage)(apiCards);
};

// Fetch functions for contacts API - skip date filtering
export const fetchInterviewCardsForContacts = async (
  listId: string,
): Promise<InterviewTrelloCard[]> => {
  const apiCards = await fetchCards(listId, ["labels"]);

  return await buildInterviewCardsPipeline(transformTrelloCardsForContacts)(
    apiCards,
  );
};

export const fetchCallingCardsForContacts = async (
  stage: CallingStage,
  listId: string,
): Promise<CallingTrelloCard[]> => {
  const apiCards = await fetchCards(listId);

  return await buildCallingCardsPipeline(
    transformTrelloCardsForContacts,
    stage,
  )(apiCards);
};

// List IDs for appointment messaging system
// Configure these directly as arrays of Trello list IDs
export const fetchAllCardsGroupedByMember = async () =>
  await Promise.all([
    ...TRELLO_LIST_IDS.INTERVIEW_BOARD.map(fetchInterviewCards),
    ...TRELLO_LIST_IDS.CALLINGS_BOARD.map(
      // @ts-expect-error - partial application causes type inference issues with Promise.all
      partial(fetchCallingCards, CallingStage.needsCallingExtended),
    ),
    ...TRELLO_LIST_IDS.SETTING_APART_BOARD.map(
      // @ts-expect-error - partial application causes type inference issues with Promise.all
      partial(fetchCallingCards, CallingStage.needsSettingApart),
    ),
  ]).then((allCards) => groupSortedCardsByMember(allCards.flat()));
