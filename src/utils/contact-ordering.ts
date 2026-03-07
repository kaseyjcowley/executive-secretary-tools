import { Contact } from "@/types/messages";

/**
 * Gets the priority for a contact based on its kind and labels.
 */
export function getContactLabelPriority(contact: Contact): number {
  // Calling contacts always have priority 1
  if (contact.kind === "calling") {
    return 1;
  }

  // For interview contacts, check label name for keywords
  if (contact.kind === "interview") {
    const labelName = contact.labels?.name?.toLowerCase() || "";

    if (labelName.includes("calling")) {
      return 1; // e.g., "calling interview"
    }

    if (labelName.includes("interview")) {
      return 2;
    }

    return 3; // Other interview types
  }

  // All other contacts (shouldn't happen with current types)
  return 3;
}

/**
 * Sorts contacts by label priority.
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
