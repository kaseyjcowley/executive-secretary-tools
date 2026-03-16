import { NextRequest, NextResponse } from "next/server";
import {
  createYouth,
  getQueue,
  setVisitHistory,
  getVisitHistory,
  normalScore,
} from "@/utils/youth-queue";
import {
  fetchCompletedYouthCards,
  parseNameFromTitle,
  buildFuseIndex,
  matchCardToContact,
  extractVisitTypeFromCardName,
} from "@/utils/trello-youth";
import type { VisitHistoryItem } from "@/types/youth";
import redis from "@/utils/redis";
import { REDIS_KEYS } from "@/constants";

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
  allYouth: Awaited<ReturnType<typeof getQueue>>,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { names } = body;

    if (!names || !Array.isArray(names)) {
      return NextResponse.json(
        { error: "Names array is required" },
        { status: 400 },
      );
    }

    const validNames = names
      .map((n: unknown) => (typeof n === "string" ? n.trim() : ""))
      .filter((n: string) => n.length > 0);

    if (validNames.length === 0) {
      return NextResponse.json(
        { error: "At least one valid name is required" },
        { status: 400 },
      );
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

    return NextResponse.json({
      imported: validNames.length,
      failed: 0,
      names: validNames,
    });
  } catch (error) {
    console.error("Error importing youth:", error);
    return NextResponse.json(
      { error: "Failed to import youth" },
      { status: 500 },
    );
  }
}
