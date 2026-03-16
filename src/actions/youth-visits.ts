"use server";

import {
  getYouthById,
  setVisitHistory,
  getVisitHistory,
  createYouth,
  getQueue,
  updatePreferredName,
  normalScore,
} from "@/utils/youth-queue";
import {
  getYouthVisitHistory,
  syncVisitHistory,
  scheduleVisit,
  fetchCompletedYouthCards,
  buildFuseIndex,
  matchCardToContact,
  parseNameFromTitle,
  extractVisitTypeFromCardName,
} from "@/utils/trello-youth";
import redis from "@/utils/redis";
import { REDIS_KEYS } from "@/constants";
import type { VisitHistoryItem, Youth } from "@/types/youth";

export async function getVisitHistoryAction(
  id: string,
): Promise<{ visits: VisitHistoryItem[] }> {
  const youth = await getYouthById(id);
  if (!youth) {
    throw new Error("Youth not found");
  }

  const visits = await getYouthVisitHistory(youth.name, youth.id);
  return { visits };
}

export async function rebuildVisitHistoryAction(
  id: string,
  rebuild = true,
): Promise<{ visits: VisitHistoryItem[]; message: string }> {
  const youth = await getYouthById(id);
  if (!youth) {
    throw new Error("Youth not found");
  }

  const visits = await syncVisitHistory(youth.name, youth.id, rebuild);
  return { visits, message: "Visit history rebuilt from Trello" };
}

export async function setVisitHistoryAction(
  id: string,
  visits: VisitHistoryItem[],
): Promise<{ visits: VisitHistoryItem[]; message: string }> {
  await setVisitHistory(id, visits);
  return { visits, message: "Visit history updated" };
}

export async function updateLastSeenAtAction(
  id: string,
  lastSeenAt: number,
): Promise<{ success: boolean }> {
  if (!lastSeenAt) {
    throw new Error("lastSeenAt is required");
  }

  const youth = await getYouthById(id);
  if (!youth) {
    throw new Error("Youth not found");
  }

  const timestamp = new Date(lastSeenAt).getTime();
  if (isNaN(timestamp)) {
    throw new Error("Invalid date format");
  }

  const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
  const score = timestamp + sixMonthsMs;

  await redis.hset(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${id}`, {
    lastSeenAt: timestamp.toString(),
  });
  await redis.zadd(REDIS_KEYS.YOUTH_QUEUE, score, id);

  return { success: true };
}

export async function updatePreferredNameAction(
  id: string,
  preferredName: string,
): Promise<{ success: boolean }> {
  const youth = await getYouthById(id);
  if (!youth) {
    throw new Error("Youth not found");
  }

  await updatePreferredName(id, preferredName || "");

  return { success: true };
}

export async function scheduleVisitAction(
  id: string,
  visitType: string,
  note?: string,
): Promise<{ success: boolean; trelloCardUrl: string }> {
  if (!visitType) {
    throw new Error("Visit type is required");
  }

  const result = await scheduleVisit(id, visitType, note);
  return { success: true, trelloCardUrl: result.trelloCardUrl };
}

const SEVEN_MONTHS_MS = 210 * 24 * 60 * 60 * 1000;

async function setLastSeenAt(
  youthId: string,
  timestamp: number,
): Promise<void> {
  await redis.hset(`${REDIS_KEYS.YOUTH_HASH_PREFIX}${youthId}`, {
    lastSeenAt: timestamp.toString(),
  });
  await redis.zadd(REDIS_KEYS.YOUTH_QUEUE, normalScore(timestamp), youthId);
}

async function findVisitsForYouth(
  youthName: string,
  youthId: string,
  allCards: Awaited<ReturnType<typeof fetchCompletedYouthCards>>,
  allYouth: Youth[],
): Promise<VisitHistoryItem[]> {
  const cachedVisits = await getVisitHistory(youthId);
  if (cachedVisits.length > 0) {
    return cachedVisits;
  }

  const fuse = buildFuseIndex(allYouth);

  const visitPromises = allCards.map(async (card) => {
    const parsedName = parseNameFromTitle(card.name);
    const match = matchCardToContact(parsedName, fuse);

    if (match.type === "commit" && match.contactId === youthId) {
      const visitType = await extractVisitTypeFromCardName(
        card.name,
        card.labels,
      );
      return {
        id: card.id,
        visitedAt: new Date(card.dateLastActivity).getTime(),
        visitType,
        trelloUrl: card.url,
        note: card.desc || undefined,
      };
    }
    return null;
  });

  const results = await Promise.all(visitPromises);
  const visitsData = results.filter(Boolean) as VisitHistoryItem[];

  visitsData.sort((a, b) => b.visitedAt - a.visitedAt);
  await setVisitHistory(youthId, visitsData);

  return visitsData;
}

export async function importYouthAction(
  names: string[],
): Promise<{ imported: number; failed: number; names: string[] }> {
  if (!names || !Array.isArray(names)) {
    throw new Error("Names array is required");
  }

  const validNames = names
    .map((n: unknown) => (typeof n === "string" ? n.trim() : ""))
    .filter((n: string) => n.length > 0);

  if (validNames.length === 0) {
    throw new Error("At least one valid name is required");
  }

  const createdYouth = await Promise.all(
    validNames.map((name: string) => createYouth(name)),
  );

  const allCards = await fetchCompletedYouthCards();
  const allYouth = await getQueue();

  for (const youth of createdYouth) {
    const visits = await findVisitsForYouth(
      youth.name,
      youth.id,
      allCards,
      allYouth,
    );

    if (visits.length > 0) {
      const mostRecentVisit = visits[0];
      await setLastSeenAt(youth.id, mostRecentVisit.visitedAt);
    } else {
      const sevenMonthsAgo = Date.now() - SEVEN_MONTHS_MS;
      await setLastSeenAt(youth.id, sevenMonthsAgo);
    }
  }

  return { imported: validNames.length, failed: 0, names: validNames };
}

export async function rebuildAllVisitHistoriesAction(): Promise<{
  success: boolean;
  totalYouth: number;
  results: { name: string; success: boolean; visitCount: number }[];
}> {
  const queue = await getQueue();
  const results: { name: string; success: boolean; visitCount: number }[] = [];

  const DELAY_MS = 500;

  for (const youth of queue) {
    const visits = await syncVisitHistory(youth.name, youth.id, true);
    results.push({
      name: youth.name,
      success: true,
      visitCount: visits.length,
    });

    if (DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  return { success: true, totalYouth: queue.length, results };
}
