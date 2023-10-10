import { map, pipeAsync } from "rambdax";

import {
  buildCallingTrelloCard,
  buildInterviewTrelloCard,
  groupSortedCardsByMember,
  transformTrelloCards,
} from "@/utils/transformers";

import {
  ApiTrelloCard,
  CallingTrelloCard,
  InterviewTrelloCard,
  TrelloCard,
} from "./types";

const DEFAULT_CARD_FIELDS = ["id", "name", "due", "assigned", "idMembers"];

const fetchCards = async (
  listId: string,
  additionalFields: string[] = []
): Promise<ApiTrelloCard[]> => {
  const apiCards = await fetch(
    `https://api.trello.com/1/lists/${listId}/cards?key=${
      process.env.TRELLO_API_KEY
    }&token=${process.env.TRELLO_API_TOKEN}&fields=${DEFAULT_CARD_FIELDS.concat(
      additionalFields
    ).toString()}`,
    { cache: "no-store" }
  )
    .then((response) => response.json())
    .catch((err) => console.error(err));

  return apiCards;
};

const fetchInterviewCards = async (
  listId: string
): Promise<InterviewTrelloCard[]> => {
  const apiCards = await fetchCards(listId, ["labels"]);

  return await pipeAsync<InterviewTrelloCard[]>(
    // Filters cards by next sunday and does some minor transformations (hydrates members, etc)
    transformTrelloCards,
    // Does some interview-specific card transformations
    map(buildInterviewTrelloCard)
  )(apiCards);
};

const fetchCallingCards = async (listId: string): Promise<TrelloCard[]> => {
  const apiCards = await fetchCards(listId);

  return await pipeAsync<CallingTrelloCard[]>(
    transformTrelloCards,
    map(buildCallingTrelloCard)
  )(apiCards);
};

const INTERVIEW_BOARD_LIST_IDS = ["5f62e544085cf226223925e8"];
const CALLINGS_BOARD_LIST_IDS = [
  "5f62ba5c3d87c93ade73a3a1",
  "5f62ba76ea8a665c566846a2",
  "5f62bc2052e58c7dc5740b4f",
];

export const fetchAllCardsGroupedByMember = async () =>
  await Promise.all([
    ...INTERVIEW_BOARD_LIST_IDS.map(fetchInterviewCards),
    ...CALLINGS_BOARD_LIST_IDS.map(fetchCallingCards),
  ]).then((allCards) => groupSortedCardsByMember(allCards.flat()));
