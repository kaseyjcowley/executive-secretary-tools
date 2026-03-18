import { redis } from "../redis";
import { REDIS_KEYS } from "../constants";
import type { Template } from "../types/messages";

function extractVariables(content: string): string[] {
  const matches = content.match(/\{(\w+)\}/g) || [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
}

export interface TemplateInput {
  name: string;
  content: string;
  category: "calling" | "interview";
}

export const templates = {
  async single(input: TemplateInput): Promise<Template> {
    const id = input.name.toLowerCase().replace(/\s+/g, "-");
    const template: Template = {
      id,
      name: input.name,
      category: input.category as Template["category"],
      content: input.content,
      variables: extractVariables(input.content),
    };

    await redis.sadd(REDIS_KEYS.TEMPLATES, id);
    await redis.set(
      `${REDIS_KEYS.TEMPLATE_PREFIX}${id}`,
      JSON.stringify(template)
    );

    return template;
  },

  async list(inputs: TemplateInput[]): Promise<Template[]> {
    return Promise.all(inputs.map((input) => this.single(input)));
  },

  async category(category: "calling" | "interview", inputs: TemplateInput[]): Promise<Template[]> {
    const filtered = inputs.filter((i) => i.category === category);
    return this.list(filtered);
  },

  async getById(id: string): Promise<Template | null> {
    const data = await redis.get(`${REDIS_KEYS.TEMPLATE_PREFIX}${id}`);
    if (!data) return null;
    return JSON.parse(data);
  },

  async getAll(): Promise<Template[]> {
    const ids = await redis.smembers(REDIS_KEYS.TEMPLATES);
    if (!ids.length) return [];

    const pipeline = redis.pipeline();
    ids.forEach((id) => pipeline.get(`${REDIS_KEYS.TEMPLATE_PREFIX}${id}`));
    
    const results = await pipeline.exec();
    if (!results) return [];

    return (results as [Error | null, string | undefined][])
      .filter(([err, data]) => err === null && data)
      .map(([, data]) => JSON.parse(data as string));
  },
};
