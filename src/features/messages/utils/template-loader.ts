import { MessageType, Category } from "@/types/messages";

/**
 * 1. Automate Template Loading
 * require.context(directory, useSubdirectories, regExp)
 * Note: The path must be relative to THIS file.
 */
const templateContext = (require as any).context(
  "../../../templates/messages",
  false,
  /\.txt$/,
);

// This creates a map where key is "./filename.txt" and value is the file content
const TEMPLATE_REGISTRY: Record<string, string> = {};

templateContext.keys().forEach((key: string) => {
  // Extract just the filename, handling various path formats:
  // "./calling-acceptance.txt" -> "calling-acceptance"
  // "src/templates/messages/calling-acceptance.txt" -> "calling-acceptance"
  const filename = key.split("/").pop() || key;
  const id = filename.replace(".txt", "");
  TEMPLATE_REGISTRY[id] = templateContext(key);
});

/**
 * Returns metadata for all discovered templates.
 */
export function getAvailableMessageTypes(): MessageType[] {
  return Object.keys(TEMPLATE_REGISTRY)
    .map((id) => ({
      id,
      name: formatName(id),
      category: determineCategory(id),
      templatePath: id,
      content: TEMPLATE_REGISTRY[id],
    }))
    .sort((a, b) => {
      const categoryOrder = [Category.calling, Category.interview];
      const categoryDiff =
        categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      return categoryDiff !== 0 ? categoryDiff : a.name.localeCompare(b.name);
    });
}

/**
 * Loads the content directly from the bundled registry.
 */
export function loadTemplateContent(id: string): string {
  return TEMPLATE_REGISTRY[id] || "";
}

// --- Helper Functions (Same as before) ---

function determineCategory(id: string): MessageType["category"] {
  const lowerId = id.toLowerCase();
  if (["setting-apart", "extend-calling"].includes(lowerId))
    return Category.calling;

  return Category.interview;
}

function formatName(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
