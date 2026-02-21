import Fuse from 'fuse.js';
import directory from '@/data/directory.json';

export interface DirectoryEntry {
  name: string;
  age: number;
  phone: string;
}

// Initialize Fuse instance with directory entries
const fuse = new Fuse(directory as DirectoryEntry[], {
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

  // Return phone if match score is below threshold
  if (bestMatch.score !== undefined && bestMatch.score < 0.4) {
    return bestMatch.item.phone;
  }

  return undefined;
}
