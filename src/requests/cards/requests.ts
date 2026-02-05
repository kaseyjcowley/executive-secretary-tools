import { map, pipeAsync, partial } from "rambdax";

import {
  buildCallingTrelloCard,
  buildInterviewTrelloCard,
  groupSortedCardsByMember,
  transformTrelloCards,
} from "@/utils/transformers";

import { ApiTrelloCard, CallingTrelloCard, InterviewTrelloCard } from "./types";

import { CallingStage } from "@/constants";

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
    { cache: "no-cache" }
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

const fetchCallingCards = async (
  stage: CallingStage,
  listId: string
): Promise<CallingTrelloCard[]> => {
  const apiCards = await fetchCards(listId);

  return await pipeAsync<CallingTrelloCard[]>(
    transformTrelloCards,
    // @ts-expect-error - these types don't match up to what the API says is possible
    map(partial(buildCallingTrelloCard, stage))
  )(apiCards);
};

const INTERVIEW_BOARD_LIST_IDS = ["698142f18c51336104b0ca18"];
const CALLINGS_BOARD_LIST_IDS = ["6981402b631c5d579084983f"];
const SETTING_APART_BOARD_LIST_IDS = [
  "6981403b91ce00795685a559",
  "6981404b5c5a06bfe7eeb917",
];

export const fetchAllCardsGroupedByMember = async () =>
  await Promise.all([
    ...INTERVIEW_BOARD_LIST_IDS.map(fetchInterviewCards),
    ...CALLINGS_BOARD_LIST_IDS.map(
      // @ts-expect-error - these types don't match up to what the API says is possible
      partial(fetchCallingCards, CallingStage.needsCallingExtended)
    ),
    ...SETTING_APART_BOARD_LIST_IDS.map(
      // @ts-expect-error - these types don't match up to what the API says is possible
      partial(fetchCallingCards, CallingStage.needsSettingApart)
    ),
  ]).then((allCards) => groupSortedCardsByMember(allCards.flat()));
