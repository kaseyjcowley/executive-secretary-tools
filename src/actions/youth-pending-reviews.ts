"use server";

import { getPendingReviews } from "@/utils/youth-queue";
import {
  confirmPendingReview,
  dismissPendingReview,
  syncYouthVisitsFromTrello,
} from "@/utils/trello-youth";

export async function getPendingReviewsAction() {
  const reviews = await getPendingReviews();
  return { reviews };
}

export async function syncPendingReviewsAction() {
  const result = await syncYouthVisitsFromTrello();
  return result;
}

export async function confirmPendingReviewAction(
  trelloCardId: string,
  youthId: string,
): Promise<{ success: boolean; message: string }> {
  if (!youthId) {
    throw new Error("youthId is required for confirm action");
  }

  await confirmPendingReview(trelloCardId, youthId);
  return { success: true, message: "Visit confirmed" };
}

export async function dismissPendingReviewAction(
  trelloCardId: string,
): Promise<{ success: boolean; message: string }> {
  await dismissPendingReview(trelloCardId);
  return { success: true, message: "Review dismissed" };
}
