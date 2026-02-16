import { Contact } from "@/types/messages";

/**
 * Defines label priority for contact ordering.
 * Lower numbers appear first in the list.
 */
const LABEL_PRIORITY: Record<string, number> = {
  'calling': 1,
  'interview': 2,
};

/**
 * Gets the priority for a contact based on its kind and labels.
 * Returns 1 for calling, 2 for interview, 3 for other contacts.
 *
 * For interview contacts, checks label name for keywords:
 * - 'calling' (case-insensitive) → priority 1
 * - 'interview' (case-insensitive) → priority 2
 * - otherwise → priority 3
 */
export function getContactLabelPriority(contact: Contact): number {
  // Calling contacts always have priority 1
  if (contact.kind === 'calling') {
    return 1;
  }

  // For interview contacts, check label name for keywords
  if (contact.kind === 'interview') {
    const labelName = contact.labels?.name?.toLowerCase() || '';

    if (labelName.includes('calling')) {
      return 1; // e.g., "calling interview"
    }

    if (labelName.includes('interview')) {
      return 2;
    }

    return 3; // Other interview types
  }

  // All other contacts (shouldn't happen with current types)
  return 3;
}

/**
 * Sorts contacts by label priority.
 * Returns a new array with contacts ordered:
 * 1. Priority 1 (calling)
 * 2. Priority 2 (interview)
 * 3. Priority 3 (other)
 *
 * Within the same priority, maintains original order (stable sort).
 */
export function sortContactsByLabel(contacts: Contact[]): Contact[] {
  return [...contacts].sort((a, b) => {
    const priorityA = getContactLabelPriority(a);
    const priorityB = getContactLabelPriority(b);

    // If priorities are different, sort by priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Same priority: maintain original order by index
    return contacts.indexOf(a) - contacts.indexOf(b);
  });
}
