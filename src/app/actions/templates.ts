"use server";

import { revalidatePath } from "next/cache";
import {
  getAllTemplates,
  getTemplate,
  saveTemplate,
  deleteTemplate,
  extractVariables,
} from "@/utils/template-loader";
import { Template } from "@/types/messages";
import { Category } from "@/types/messages";

export async function getTemplates(): Promise<Template[]> {
  return getAllTemplates();
}

export async function getTemplateById(id: string): Promise<Template | null> {
  return getTemplate(id);
}

export async function createTemplate(
  data: Pick<Template, "name" | "content" | "category"> & { id?: string },
): Promise<
  { template: Template; error?: never } | { template?: never; error: string }
> {
  if (!data.name || !data.content) {
    return { error: "Name and content are required" };
  }

  const id = data.id || data.name.toLowerCase().replace(/\s+/g, "-");

  const template: Template = {
    id,
    name: data.name,
    category: data.category || Category.interview,
    content: data.content,
    variables: extractVariables(data.content),
  };

  await saveTemplate(template);
  revalidatePath("/templates");

  return { template };
}

export async function updateTemplate(
  id: string,
  data: Partial<Pick<Template, "name" | "content" | "category">>,
): Promise<
  { template: Template; error?: never } | { template?: never; error: string }
> {
  const existing = await getTemplate(id);
  if (!existing) {
    return { error: "Template not found" };
  }

  const template: Template = {
    id,
    name: data.name ?? existing.name,
    category: data.category ?? existing.category,
    content: data.content ?? existing.content,
    variables: data.content
      ? extractVariables(data.content)
      : existing.variables,
  };

  await saveTemplate(template);
  revalidatePath("/templates");

  return { template };
}

export async function removeTemplate(
  id: string,
): Promise<
  { success: boolean; error?: never } | { success?: never; error: string }
> {
  const existing = await getTemplate(id);
  if (!existing) {
    return { error: "Template not found" };
  }

  await deleteTemplate(id);
  revalidatePath("/templates");

  return { success: true };
}
