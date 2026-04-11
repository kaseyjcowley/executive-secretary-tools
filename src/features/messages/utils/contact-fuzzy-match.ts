import Fuse from "fuse.js";
import members from "@/data/members.json";

export interface DirectoryEntry {
  id: number;
  name: string;
  age: number;
  gender: "M" | "F";
  phone: string;
}

// Create a Map for ID -> phone lookup
export const idToPhoneMap = new Map<number, string>();
(members as DirectoryEntry[]).forEach((member: DirectoryEntry) => {
  if (member.phone) {
    idToPhoneMap.set(member.id, member.phone);
  }
});

// Initialize Fuse instance with directory entries
const fuse = new Fuse(members as DirectoryEntry[], {
  keys: [
    {
      name: "name",
      getFn: (obj) => {
        // Robustly handle names in either "Last, First" or "Last,First" or
        // already "First Last" formats. Avoid calling string methods on
        // undefined by normalizing and trimming parts.
        const name = (obj && (obj as any).name) || "";
        if (!name.includes(",")) return name;

        // Split on comma (with or without space) and trim each part.
        const parts = name
          .split(",")
          .map((p: string) => p.trim())
          .filter(Boolean);
        if (parts.length < 2) return name;

        const last = parts[0];
        const rest = parts.slice(1).join(" ");
        return `${rest} ${last}`.trim();
      },
    },
  ],
  threshold: 0.4,
  includeScore: true,
});

/**
 * Matches a contact name against the directory using fuzzy matching.
 *
 * @param name - The contact name to match
 * @returns The ID of the best match if score < 0.4, otherwise undefined
 */
export function matchContact(name: string): number | undefined {
  if (!fuse || !name || typeof name !== "string") {
    return undefined;
  }

  try {
    // Debugging: log the name being matched so we can identify problematic inputs
    // in environments where the maximum update depth occurs.
    // Use console.debug to avoid noisy logs in normal runs.
    // eslint-disable-next-line no-console
    console.debug("matchContact called for:", name);

    const results = fuse.search(name);

    if (results.length === 0) {
      return undefined;
    }

    const bestMatch = results[0];

    // Return ID if match score is below threshold AND phone is not empty
    if (
      bestMatch.score !== undefined &&
      bestMatch.score < 0.4 &&
      bestMatch.item.phone
    ) {
      // eslint-disable-next-line no-console
      console.debug("matchContact bestMatch:", {
        name,
        id: bestMatch.item.id,
        score: bestMatch.score,
      });
      return bestMatch.item.id;
    }

    // Fallback: accept a match when the input and candidate share the same
    // last name (case-insensitive) and the candidate has a phone number.
    try {
      const normalize = (s: string) => s.trim().toLowerCase();
      const inputLast = normalize(
        name.includes(",")
          ? name.split(",")[0]
          : name.split(" ").slice(-1)[0] || name,
      );
      const candidateName = bestMatch.item.name as string;
      const candidateLast = normalize(
        candidateName.includes(",")
          ? candidateName.split(",")[0]
          : candidateName.split(" ").slice(-1)[0] || candidateName,
      );
      if (
        inputLast &&
        candidateLast &&
        inputLast === candidateLast &&
        bestMatch.item.phone
      ) {
        // eslint-disable-next-line no-console
        console.debug("matchContact fallback last-name match:", {
          name,
          id: bestMatch.item.id,
          score: bestMatch.score,
        });
        return bestMatch.item.id;
      }
    } catch (err) {
      // swallow and continue to undefined
      // eslint-disable-next-line no-console
      console.debug("matchContact fallback failed for:", name, err);
    }

    return undefined;
  } catch (err) {
    // If Fuse throws unexpectedly for a particular input, log it and return undefined
    // eslint-disable-next-line no-console
    console.error("Error in matchContact for name:", name, err);
    return undefined;
  }
}

/**
 * Gets phone number by member ID
 *
 * @param id - The member ID
 * @returns The phone number if exists, otherwise undefined
 */
export function getPhoneById(id: number): string | undefined {
  return idToPhoneMap.get(id);
}
