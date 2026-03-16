import redis from "@/utils/redis";
import type { SyncResult, VisitHistoryItem, Youth } from "@/types/youth";
import { YOUTH_VISIT_TYPES } from "@/constants/youth-visit-types";
import { REDIS_KEYS, TRELLO_LIST_IDS, TRELLO_SYNC_CONFIG } from "@/constants";
import {
  getQueue,
  markVisited,
  getVisitHistory,
  setVisitHistory,
  getSyncedCardIds,
  addSyncedCardId,
  addPendingReview,
  getPendingReviews,
  removePendingReview,
} from "./youth-queue";
import {
  parseNameFromTitle,
  buildFuseIndex,
  matchCardToContact,
  createPendingReview,
} from "./youth-name-match";

const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_API_TOKEN = process.env.TRELLO_API_TOKEN;

interface TrelloLabel {
  id: string;
  name: string;
}

interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  url: string;
  shortUrl: string;
  idList: string;
  dateLastActivity: string;
  labels: TrelloLabel[];
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

async function fetchCompletedYouthCards(): Promise<TrelloCard[]> {
  const response = await fetch(
    `https://api.trello.com/1/lists/${TRELLO_LIST_IDS.YOUTH_VISITS_COMPLETE}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}&fields=id,name,url,shortUrl,idList,dateLastActivity,desc&labels=all`,
    { cache: "no-cache" },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Trello cards: ${response.statusText}`);
  }

  const cards: TrelloCard[] = await response.json();

  return cards.filter((card) => {
    const labels = card.labels || [];
    const hasYouthLabel = labels.some(
      (label) => label.id === TRELLO_SYNC_CONFIG.YOUTH_LABEL_ID,
    );
    const hasYouthVisitLabel = labels.some((label) =>
      TRELLO_SYNC_CONFIG.YOUTH_VISIT_LABEL_IDS.includes(label.id),
    );
    return hasYouthLabel || hasYouthVisitLabel;
  });
}

function extractVisitTypeFromCardName(cardName: string): string {
  for (const [visitTypeId, visitType] of Object.entries(YOUTH_VISIT_TYPES)) {
    if (
      visitType.automationCode &&
      cardName.endsWith(visitType.automationCode)
    ) {
      return visitTypeId;
    }
  }
  return "other";
}

export async function syncVisitHistory(
  youthName: string,
  youthId: string,
): Promise<VisitHistoryItem[]> {
  const visits = await getVisitHistory(youthId);
  if (visits.length > 0) {
    return visits;
  }

  const allYouth = await getQueue();
  const matchingYouth = allYouth.find((y) => y.name === youthName);

  if (!matchingYouth) {
    return [];
  }

  const syncedCards = await getSyncedCardIds();
  const allCards = await fetchCompletedYouthCards();

  const youthCards = allCards.filter(
    (card) =>
      syncedCards.has(card.id) || card.id === matchingYouth.trelloCardId,
  );

  const visitsData: VisitHistoryItem[] = youthCards.map((card) => ({
    id: card.id,
    visitedAt: new Date(card.dateLastActivity).getTime(),
    visitType: extractVisitTypeFromCardName(card.name),
    trelloUrl: card.url,
    note: card.desc || undefined,
  }));

  visitsData.sort((a, b) => b.visitedAt - a.visitedAt);

  await setVisitHistory(youthId, visitsData);

  return visitsData;
}

export async function getYouthVisitHistory(
  youthName: string,
  youthId: string,
): Promise<VisitHistoryItem[]> {
  const cached = await getVisitHistory(youthId);
  if (cached.length > 0) {
    return cached;
  }

  return syncVisitHistory(youthName, youthId);
}

export interface SyncVisitResult {
  committed: number;
  pending: number;
  noMatch: number;
  errors: string[];
}

export async function syncYouthVisitsFromTrello(): Promise<SyncVisitResult> {
  const result: SyncVisitResult = {
    committed: 0,
    pending: 0,
    noMatch: 0,
    errors: [],
  };

  const allYouth = await getQueue();
  if (allYouth.length === 0) {
    return result;
  }

  const fuse = buildFuseIndex(allYouth);
  const syncedCards = await getSyncedCardIds();
  const pendingReviews = await getPendingReviews();
  const alreadyPending = new Set(pendingReviews.map((r) => r.trelloCardId));

  const cards = await fetchCompletedYouthCards();

  for (const card of cards) {
    if (syncedCards.has(card.id) || alreadyPending.has(card.id)) {
      continue;
    }

    const parsedName = parseNameFromTitle(card.name);
    const match = matchCardToContact(parsedName, fuse);

    if (match.type === "commit") {
      try {
        await markVisited(match.contactId);
        await addSyncedCardId(card.id);
        result.committed++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(
          `Failed to mark ${match.contactId} as visited: ${errorMsg}`,
        );
      }
    } else if (match.type === "review") {
      const review = createPendingReview(
        card.id,
        card.name,
        parsedName,
        card.dateLastActivity,
        match.candidates,
      );
      await addPendingReview(review);
      result.pending++;
    } else {
      result.noMatch++;
    }
  }

  return result;
}

export async function confirmPendingReview(
  trelloCardId: string,
  youthId: string,
): Promise<void> {
  await markVisited(youthId);
  await addSyncedCardId(trelloCardId);
  await removePendingReview(trelloCardId);
}

export async function dismissPendingReview(
  trelloCardId: string,
): Promise<void> {
  await addSyncedCardId(trelloCardId);
  await removePendingReview(trelloCardId);
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
  const completeCards = await fetchCompletedYouthCards();
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
