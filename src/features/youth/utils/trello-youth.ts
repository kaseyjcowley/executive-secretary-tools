import redis from "@/utils/redis";
import type { SyncResult } from "@/types/youth";
import { YOUTH_VISIT_TYPES } from "@/constants/youth-visit-types";
import { REDIS_KEYS, TRELLO_LIST_IDS } from "@/constants";
import { getQueue, markVisited } from "./youth-queue";

const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_API_TOKEN = process.env.TRELLO_API_TOKEN;

interface TrelloCard {
  id: string;
  name: string;
  url: string;
  shortUrl: string;
  idList: string;
  dateLastActivity: string;
}

async function createTrelloCard(
  youthName: string,
  visitTypeId: string,
  note?: string,
): Promise<{ id: string; url: string }> {
  const visitType = YOUTH_VISIT_TYPES[visitTypeId];

  if (!visitType) {
    throw new Error(`Unknown visit type: ${visitTypeId}`);
  }

  let cardName = youthName;
  if (visitType.automationCode) {
    cardName += visitType.automationCode;
  }

  const response = await fetch(
    `https://api.trello.com/1/cards?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cardName,
        desc: note || "",
        idList: TRELLO_LIST_IDS.YOUTH_VISITS_TO_SCHEDULE,
        pos: "bottom",
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to create Trello card: ${response.statusText}`);
  }

  const card = await response.json();
  return { id: card.id, url: card.url };
}

async function fetchCompleteCards(): Promise<TrelloCard[]> {
  const response = await fetch(
    `https://api.trello.com/1/lists/${TRELLO_LIST_IDS.YOUTH_VISITS_COMPLETE}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}&fields=id,name,url,shortUrl,idList,dateLastActivity`,
    { cache: "no-cache" },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Trello cards: ${response.statusText}`);
  }

  return response.json();
}

export async function scheduleVisit(
  id: string,
  visitType: string,
  note?: string,
): Promise<{ trelloCardUrl: string }> {
  const youthData = await redis.hgetall(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`);
  if (!youthData || !youthData.name) {
    throw new Error("Youth not found");
  }

  const trelloCard = await createTrelloCard(
    youthData.name as string,
    visitType,
    note,
  );

  await redis.hset(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`, {
    scheduled: "true",
    scheduledAt: Date.now().toString(),
    trelloCardId: trelloCard.id,
    trelloCardUrl: trelloCard.url,
    visitType,
    note: note || "",
  });

  await redis.zadd(REDIS_KEYS.YOUTH_QUEUE, -Date.now(), id);

  return { trelloCardUrl: trelloCard.url };
}

export async function syncWithTrello(): Promise<SyncResult> {
  const completeCards = await fetchCompleteCards();
  const allYouth = await getQueue();

  const markedVisited: string[] = [];
  const errors: string[] = [];

  for (const youth of allYouth) {
    if (!youth.scheduled || !youth.trelloCardId) continue;

    const matchingCard = completeCards.find(
      (card) => card.id === youth.trelloCardId,
    );

    if (matchingCard) {
      try {
        await markVisited(youth.id);
        markedVisited.push(youth.name);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        errors.push(`Failed to mark ${youth.name} as visited: ${errorMsg}`);
      }
    }
  }

  return { markedVisited, errors };
}
