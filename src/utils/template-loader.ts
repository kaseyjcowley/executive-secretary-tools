import { MessageType, Category, Template } from "@/types/messages";
import { REDIS_KEYS } from "@/constants";

/**
 * 1. Automate Template Loading
 * require.context(directory, useSubdirectories, regExp)
 * Note: The path must be relative to THIS file.
 */
const templateContext = (require as any).context(
  "../templates/messages",
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
 * Extract variables from template content
 */
export function extractVariables(content: string): string[] {
  const singleVarRegex = /\{(\w+)\}/g;
  const doubleVarRegex = /\{\{(\w+)\}\}/g;

  const variables = new Set<string>();
  let match;

  while ((match = singleVarRegex.exec(content)) !== null) {
    variables.add(match[1]);
  }
  while ((match = doubleVarRegex.exec(content)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

/**
 * Get all templates (from Redis or file fallback)
 */
export async function getAllTemplates(): Promise<Template[]> {
  const redis = (await import("./redis")).default;
  const templateIds = await redis.smembers(REDIS_KEYS.TEMPLATES);

  if (templateIds.length > 0) {
    const templates: Template[] = [];
    for (const id of templateIds) {
      const data = await redis.get(`${REDIS_KEYS.TEMPLATE_PREFIX}${id}`);
      if (data) {
        templates.push(JSON.parse(data));
      }
    }
    return templates.sort((a, b) => {
      const categoryOrder = [Category.calling, Category.interview];
      const categoryDiff =
        categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      return categoryDiff !== 0 ? categoryDiff : a.name.localeCompare(b.name);
    });
  }

  return Object.keys(TEMPLATE_REGISTRY).map((id) => ({
    id,
    name: formatName(id),
    category: determineCategory(id),
    content: TEMPLATE_REGISTRY[id],
    variables: extractVariables(TEMPLATE_REGISTRY[id]),
  }));
}

/**
 * Get a single template by ID (Redis first, then file fallback)
 */
export async function getTemplate(id: string): Promise<Template | null> {
  const redis = (await import("./redis")).default;
  const data = await redis.get(`${REDIS_KEYS.TEMPLATE_PREFIX}${id}`);

  if (data) {
    return JSON.parse(data);
  }

  const content = TEMPLATE_REGISTRY[id];
  if (content) {
    return {
      id,
      name: formatName(id),
      category: determineCategory(id),
      content,
      variables: extractVariables(content),
    };
  }

  return null;
}

/**
 * Save template to Redis
 */
export async function saveTemplate(template: Template): Promise<void> {
  const redis = (await import("./redis")).default;
  await redis.set(
    `${REDIS_KEYS.TEMPLATE_PREFIX}${template.id}`,
    JSON.stringify(template),
  );
  await redis.sadd(REDIS_KEYS.TEMPLATES, template.id);
}

/**
 * Delete template from Redis
 */
export async function deleteTemplate(id: string): Promise<void> {
  const redis = (await import("./redis")).default;
  await redis.del(`${REDIS_KEYS.TEMPLATE_PREFIX}${id}`);
  await redis.srem(REDIS_KEYS.TEMPLATES, id);
}

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
