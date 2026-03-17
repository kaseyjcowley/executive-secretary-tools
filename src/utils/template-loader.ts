export {
  getAvailableMessageTypes,
  loadTemplateContent,
} from "@/features/messages/utils/template-loader";
import { MessageType, Category, Template } from "@/types/messages";
import { REDIS_KEYS } from "@/constants";

const templateContext = (
  require as NodeRequire & { context: typeof requireContext }
).context("../templates/messages", false, /\.txt$/);

const TEMPLATE_REGISTRY: Record<string, string> = {};

templateContext.keys().forEach((key: string) => {
  const filename = key.split("/").pop() || key;
  const id = filename.replace(".txt", "");
  const content = templateContext(key) as unknown;
  TEMPLATE_REGISTRY[id] = typeof content === "string" ? content : (content as { default: string }).default;
});

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

export async function saveTemplate(template: Template): Promise<void> {
  const redis = (await import("./redis")).default;
  await redis.set(
    `${REDIS_KEYS.TEMPLATE_PREFIX}${template.id}`,
    JSON.stringify(template),
  );
  await redis.sadd(REDIS_KEYS.TEMPLATES, template.id);
}

export async function deleteTemplate(id: string): Promise<void> {
  const redis = (await import("./redis")).default;
  await redis.del(`${REDIS_KEYS.TEMPLATE_PREFIX}${id}`);
  await redis.srem(REDIS_KEYS.TEMPLATES, id);
}

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
