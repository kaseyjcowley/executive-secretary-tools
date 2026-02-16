import fs from "fs";
import path from "path";
import { Contact } from "@/types/messages";

export interface MessageType {
  id: string;
  name: string;
  category: "calling" | "interview" | "temple" | "welfare" | "family" | "follow-up";
  templatePath: string;
}

/**
 * Reads all message template files and returns metadata for each.
 * Templates are sorted by category then name.
 */
export function getAvailableMessageTypes(): MessageType[] {
  const templatesDir = path.join(
    process.cwd(),
    "src/templates/messages/"
  );

  const files = fs.readdirSync(templatesDir)
    .filter((file) => file.endsWith(".txt"));

  const messageTypes: MessageType[] = files.map((file) => {
    const id = file.replace(".txt", "");
    const category = determineCategory(id);
    const name = formatName(id);
    const templatePath = `src/templates/messages/${file}`;

    return {
      id,
      name,
      category,
      templatePath,
    };
  });

  return messageTypes.sort((a, b) => {
    // Sort by category first
    const categoryOrder = [
      "calling",
      "interview",
      "temple",
      "welfare",
      "family",
      "follow-up",
    ];
    const categoryDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    if (categoryDiff !== 0) return categoryDiff;

    // Then sort by name
    return a.name.localeCompare(b.name);
  });
}

/**
 * Determines the category of a message type based on its ID.
 */
function determineCategory(id: string): MessageType["category"] {
  const lowerId = id.toLowerCase();

  if (lowerId.includes("calling")) return "calling";
  if (lowerId.includes("interview")) return "interview";
  if (lowerId.includes("temple")) return "temple";
  if (lowerId.includes("welfare")) return "welfare";
  if (lowerId.includes("family")) return "family";
  if (lowerId.includes("follow")) return "follow-up";

  // Default to interview for unknown types
  return "interview";
}

/**
 * Formats the template ID into a readable name.
 * Example: "interview-reminder" -> "Interview Reminder"
 */
function formatName(id: string): string {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Loads the content of a template by its ID.
 * Uses the existing loadTemplate function from src/utils/templates.ts.
 */
export function loadTemplateContent(id: string): string {
  // Import dynamically to avoid circular dependencies
  const { loadTemplate } = require("./templates");
  return loadTemplate(id);
}

/**
 * Explicit mapping from label names to template IDs.
 * Provides 1:1 mapping for common label patterns.
 */
const LABEL_TO_TEMPLATE_MAP: Record<string, string> = {
  'calling': 'calling-acceptance',
  'calling interview': 'calling-acceptance',
  'temple recommend interview': 'temple-visit',
  'temple recommend renewal': 'temple-visit',
  'welfare meeting': 'welfare-meeting',
  'family council': 'family-council',
  'bishop interview': 'bishop-interview',
  'first counselor interview': 'first-counselor-interview',
  'second counselor interview': 'second-counselor-interview',
  'interview': 'interview-reminder',
  'setting apart': 'setting-apart',
  'follow up': 'follow-up',
};

/**
 * Auto-selects a template based on contact's labels.
 * For calling contacts: returns 'calling-acceptance'
 * For interview contacts: looks up label name in LABEL_TO_TEMPLATE_MAP
 * Returns undefined if no match found.
 */
export function autoSelectTemplate(
  contact: Contact,
  messageTypes: MessageType[]
): string | undefined {
  // Calling contacts always use calling-acceptance
  if (contact.kind === 'calling') {
    return 'calling-acceptance';
  }

  // For interview contacts, look up label in map
  if (contact.kind === 'interview' && contact.labels?.name) {
    const labelName = contact.labels.name.toLowerCase();

    // Find matching template ID from map (case-insensitive)
    const matchingTemplateId = Object.entries(LABEL_TO_TEMPLATE_MAP).find(
      ([label]) => label.toLowerCase() === labelName
    )?.[1];

    if (matchingTemplateId) {
      return matchingTemplateId;
    }

    // Default to interview-reminder for unknown labels
    return 'interview-reminder';
  }

  // No match found
  return undefined;
}
