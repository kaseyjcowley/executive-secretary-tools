import Fuse from "fuse.js";
import type { Youth, MatchCandidate, PendingReview } from "@/types/youth";
import { TRELLO_SYNC_CONFIG } from "@/constants";

export function parseNameFromTitle(title: string): string {
  return title
    .replace(/\[.*?\]/g, "")
    .replace(/[-|].*/g, "")
    .replace(/[^a-zA-Z\s]/g, "")
    .trim();
}

interface SearchableContact {
  contactId: string;
  fullName: string;
}

export function buildFuseIndex(contacts: Youth[]): Fuse<SearchableContact> {
  const searchable: SearchableContact[] = contacts.flatMap((contact) => {
    const entries: SearchableContact[] = [
      {
        contactId: contact.id,
        fullName: contact.name,
      },
      {
        contactId: contact.id,
        fullName: contact.name.split(" ").reverse().join(" "),
      },
    ];
    if (contact.preferredName) {
      entries.push({
        contactId: contact.id,
        fullName: contact.preferredName,
      });
      entries.push({
        contactId: contact.id,
        fullName: contact.preferredName.split(" ").reverse().join(" "),
      });
    }
    return entries;
  });

  return new Fuse(searchable, {
    keys: ["fullName"],
    threshold: TRELLO_SYNC_CONFIG.REVIEW_THRESHOLD,
    includeScore: true,
    ignoreLocation: true,
  });
}

export type MatchResult =
  | { type: "commit"; contactId: string; score: number }
  | { type: "review"; candidates: MatchCandidate[] }
  | { type: "no_match" };

export function matchCardToContact(
  parsedName: string,
  fuse: Fuse<SearchableContact>,
): MatchResult {
  if (!parsedName) return { type: "no_match" };

  const results = fuse.search(parsedName);

  if (results.length === 0) return { type: "no_match" };

  const best = results[0];
  const score = best.score ?? 1;

  if (score <= TRELLO_SYNC_CONFIG.AUTO_COMMIT_THRESHOLD) {
    return { type: "commit", contactId: best.item.contactId, score };
  }

  if (score <= TRELLO_SYNC_CONFIG.REVIEW_THRESHOLD) {
    return {
      type: "review",
      candidates: results.slice(0, 3).map((r) => ({
        contactId: r.item.contactId,
        fullName: r.item.fullName,
        score: r.score ?? 1,
      })),
    };
  }

  return { type: "no_match" };
}

export function createPendingReview(
  trelloCardId: string,
  cardTitle: string,
  parsedName: string,
  cardDate: string,
  candidates: MatchCandidate[],
): PendingReview {
  return {
    trelloCardId,
    cardTitle,
    parsedName,
    topCandidates: candidates,
    cardDate,
  };
}
