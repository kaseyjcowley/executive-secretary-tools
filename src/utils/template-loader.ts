import fs from "fs";
import path from "path";

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
