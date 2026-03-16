"use server";

import {
  getQueue,
  getYouthById,
  createYouth,
  deleteYouth,
} from "@/utils/youth-queue";
import type { Youth } from "@/types/youth";

export async function getQueueAction(): Promise<Youth[]> {
  return getQueue();
}

export async function getYouthByIdAction(id: string): Promise<Youth | null> {
  return getYouthById(id);
}

export async function createYouthAction(name: string): Promise<Youth> {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Name is required");
  }
  return createYouth(name.trim());
}

export async function deleteYouthAction(id: string): Promise<void> {
  return deleteYouth(id);
}
