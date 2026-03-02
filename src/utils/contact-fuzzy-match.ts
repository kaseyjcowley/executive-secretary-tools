import Fuse from 'fuse.js';
import members from '@/data/members.json';

export interface DirectoryEntry {
  name: string;
  age: number;
  gender: string; // 'm' or 'f'
  phone: string;
}

// Initialize Fuse instance with directory entries
const fuse = new Fuse(members as DirectoryEntry[], {
  keys: ['name'],
  threshold: 0.4,
  includeScore: true,
});

/**
 * Matches a contact name against the directory using fuzzy matching.
 *
 * @param name - The contact name to match
 * @returns The phone number of the best match if score < 0.4, otherwise undefined
 */
export function matchContact(name: string): string | undefined {
  const results = fuse.search(name);

  if (results.length === 0) {
    return undefined;
  }

  const bestMatch = results[0];

  // Return phone if match score is below threshold AND phone is not empty
  if (bestMatch.score !== undefined && bestMatch.score < 0.4 && bestMatch.item.phone) {
    return bestMatch.item.phone;
  }

  return undefined;
}
