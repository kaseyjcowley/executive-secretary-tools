"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import type { PendingReview, MatchCandidate } from "@/types/youth";
import {
  getPendingReviewsAction,
  syncPendingReviewsAction,
  confirmPendingReviewAction,
  dismissPendingReviewAction,
} from "@/actions/youth-pending-reviews";

interface PendingReviewsModalProps {
  onClose: () => void;
}

export function PendingReviewsModal({ onClose }: PendingReviewsModalProps) {
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const { reviews: reviewsData } = await getPendingReviewsAction();
      if (reviewsData) {
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast.error("Failed to load pending reviews");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const data = await syncPendingReviewsAction();
      if (data.committed !== undefined) {
        toast.success(
          `Synced: ${data.committed} committed, ${data.pending} pending review, ${data.noMatch} no match`,
        );
        fetchReviews();
      }
    } catch (error) {
      console.error("Failed to sync:", error);
      toast.error("Failed to sync from Trello");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirm = async (trelloCardId: string, youthId: string) => {
    try {
      await confirmPendingReviewAction(trelloCardId, youthId);
      toast.success("Visit confirmed");
      fetchReviews();
    } catch (error) {
      console.error("Failed to confirm:", error);
      toast.error("Failed to confirm visit");
    }
  };

  const handleDismiss = async (trelloCardId: string) => {
    try {
      await dismissPendingReviewAction(trelloCardId);
      toast.success("Review dismissed");
      fetchReviews();
    } catch (error) {
      console.error("Failed to dismiss:", error);
      toast.error("Failed to dismiss review");
    }
  };

  const getConfidenceLabel = (score: number): string => {
    if (score <= 0.15) return "High";
    if (score <= 0.25) return "Medium";
    return "Low";
  };

  const getConfidenceColor = (score: number): string => {
    if (score <= 0.15) return "text-green-600";
    if (score <= 0.25) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-x-hidden">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-[90vw] max-md:w-full mx-4 shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Reviews
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isSyncing ? "Syncing..." : "↻ Sync from Trello"}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending reviews
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.trelloCardId}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-900">
                        {review.cardTitle}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(review.cardDate), "MMMM d, yyyy")}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDismiss(review.trelloCardId)}
                      className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                      Dismiss
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Did you mean:
                    </div>
                    <div className="space-y-2">
                      {review.topCandidates.map((candidate) => (
                        <CandidateRow
                          key={candidate.contactId}
                          candidate={candidate}
                          getConfidenceLabel={getConfidenceLabel}
                          getConfidenceColor={getConfidenceColor}
                          onConfirm={() =>
                            handleConfirm(
                              review.trelloCardId,
                              candidate.contactId,
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Pending reviews: <strong>{reviews.length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function CandidateRow({
  candidate,
  getConfidenceLabel,
  getConfidenceColor,
  onConfirm,
}: {
  candidate: MatchCandidate;
  getConfidenceLabel: (score: number) => string;
  getConfidenceColor: (score: number) => string;
  onConfirm: () => void;
}) {
  return (
    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
      <div>
        <span className="font-medium text-gray-900">{candidate.fullName}</span>
        <span className={`ml-2 text-xs ${getConfidenceColor(candidate.score)}`}>
          {getConfidenceLabel(candidate.score)} (
          {Math.round(candidate.score * 100)}% match)
        </span>
      </div>
      <button
        onClick={onConfirm}
        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Confirm
      </button>
    </div>
  );
}
