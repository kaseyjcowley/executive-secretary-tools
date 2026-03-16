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
        // 1. Check if the comma exists to avoid errors
        if (!obj.name.includes(",")) return obj.name;

        // 2. Split once at the comma
        // "Doe, John Quincy" -> ["Doe", "John Quincy"]
        const [last, rest] = obj.name.split(", ");

        // 3. Return "John Quincy Doe"
        // .trim() handles cases where the space after the comma might be missing
        return `${rest.trim()} ${last.trim()}`;
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
    return bestMatch.item.id;
  }

  return undefined;
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
