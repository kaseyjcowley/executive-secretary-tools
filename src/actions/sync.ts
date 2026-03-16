"use server";

import { syncWithTrello } from "@/utils/trello-youth";

export async function syncWithTrelloAction() {
  const result = await syncWithTrello();
  return { success: true, ...result };
}
