"use client";

import { useState, useEffect, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { ScheduleVisitModal } from "@/features/youth/components/ScheduleVisitModal";
import { EditYouthModal } from "@/features/youth/components/EditYouthModal";
import { VisitHistoryModal } from "@/components/youth/VisitHistoryModal";
import { PendingReviewsModal } from "@/components/youth/PendingReviewsModal";
import { getQueueAction, deleteYouthAction } from "@/actions/youth";
import { syncWithTrelloAction } from "@/actions/sync";
import { rebuildAllVisitHistoriesAction } from "@/actions/youth-visits";
import type { Youth } from "@/types/youth";

export default function YouthQueuePage() {
  const [queue, setQueue] = useState<Youth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [scheduleModal, setScheduleModal] = useState<{
    isOpen: boolean;
    youthId: string;
    youthName: string;
  } | null>(null);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    youth: Youth;
  } | null>(null);
  const [historyModal, setHistoryModal] = useState<{
    isOpen: boolean;
    youthId: string;
    youthName: string;
  } | null>(null);
  const [pendingReviewsModal, setPendingReviewsModal] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const queue = await getQueueAction();
      setQueue(queue);
    } catch (error) {
      toast.error("Failed to load queue");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    const toastId = toast.loading("Syncing with Trello...");

    try {
      const data = await syncWithTrelloAction();

      toast.dismiss(toastId);

      if (data.markedVisited.length > 0) {
        toast.success(
          `Marked ${data.markedVisited.length} as visited: ${data.markedVisited.join(", ")}`,
        );
        fetchQueue();
      } else {
        toast.success("No visits completed since last sync");
      }

      if (data.errors.length > 0) {
        toast.error(`Errors: ${data.errors.join(", ")}`);
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to sync");
      console.error(error);
    }
  };

  const handleRebuildVisitHistory = async () => {
    if (
      !confirm(
        "Rebuild visit history for all youth? This will fetch fresh data from Trello.",
      )
    ) {
      return;
    }

    const toastId = toast.loading("Rebuilding visit history for all youth...");

    try {
      const data = await rebuildAllVisitHistoriesAction();

      toast.dismiss(toastId);

      if (data.success) {
        toast.success(`Rebuilt visit history for ${data.totalYouth} youth`);
      } else {
        toast.error("Failed to rebuild visit history");
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to rebuild visit history");
      console.error(error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the queue?`)) return;

    try {
      await deleteYouthAction(id);
      toast.success(`${name} removed from queue`);
      fetchQueue();
    } catch (error) {
      toast.error("Failed to delete");
      console.error(error);
    }
  };

  const getDaysOverdue = (youth: Youth): number => {
    const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
    return Math.floor(
      (sixMonthsAgo - youth.lastSeenAt) / (24 * 60 * 60 * 1000),
    );
  };

  const scheduledYouth = queue.filter((y) => y.scheduled);
  const overdueYouth = queue.filter(
    (y) => !y.scheduled && getDaysOverdue(y) > 0,
  );
  const recentlyVisited = queue.filter(
    (y) => !y.scheduled && getDaysOverdue(y) <= -150,
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading queue...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Youth Visitation Queue
        </h1>

        <div className="flex flex-wrap gap-2">
          <a
            href="/youth/new"
            className="px-4 py-2.5 md:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-base md:text-sm min-h-[44px] flex items-center justify-center"
          >
            Add Youth
          </a>
          <a
            href="/youth/import"
            className="px-4 py-2.5 md:py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-base md:text-sm min-h-[44px] flex items-center justify-center"
          >
            Import
          </a>
          <button
            onClick={handleSync}
            className="px-4 py-2.5 md:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-base md:text-sm min-h-[44px] flex items-center justify-center"
          >
            Sync
          </button>
          <button
            onClick={handleRebuildVisitHistory}
            disabled={isRebuilding}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {isRebuilding ? "Rebuilding..." : "Rebuild Visit History"}
          </button>
          <button
            onClick={() => setPendingReviewsModal(true)}
            className="px-4 py-2.5 md:py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-base md:text-sm min-h-[44px] flex items-center justify-center"
          >
            Reviews
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
        <div className="bg-white rounded-lg p-3 md:p-4 shadow">
          <div className="text-xl md:text-2xl font-bold text-gray-900">
            {queue.length}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Total Youth</div>
        </div>
        <div className="bg-white rounded-lg p-3 md:p-4 shadow">
          <div className="text-xl md:text-2xl font-bold text-red-600">
            {scheduledYouth.length}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Scheduled</div>
        </div>
        <div className="bg-white rounded-lg p-3 md:p-4 shadow">
          <div className="text-xl md:text-2xl font-bold text-yellow-600">
            {overdueYouth.length}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Overdue</div>
        </div>
      </div>

      {scheduledYouth.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Scheduled Visits ({scheduledYouth.length})
          </h2>
          <div className="space-y-3">
            {scheduledYouth.map((youth) => (
              <YouthCard
                key={youth.id}
                youth={youth}
                onSchedule={() =>
                  setScheduleModal({
                    isOpen: true,
                    youthId: youth.id,
                    youthName: youth.name,
                  })
                }
                onEdit={() => setEditModal({ isOpen: true, youth })}
                onDelete={() => handleDelete(youth.id, youth.name)}
                onHistory={() =>
                  setHistoryModal({
                    isOpen: true,
                    youthId: youth.id,
                    youthName: youth.name,
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {overdueYouth.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Due for Visit ({overdueYouth.length})
          </h2>
          <div className="space-y-3">
            {overdueYouth.map((youth) => (
              <YouthCard
                key={youth.id}
                youth={youth}
                onSchedule={() =>
                  setScheduleModal({
                    isOpen: true,
                    youthId: youth.id,
                    youthName: youth.name,
                  })
                }
                onEdit={() => setEditModal({ isOpen: true, youth })}
                onDelete={() => handleDelete(youth.id, youth.name)}
                onHistory={() =>
                  setHistoryModal({
                    isOpen: true,
                    youthId: youth.id,
                    youthName: youth.name,
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {recentlyVisited.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recently Visited ({recentlyVisited.length})
          </h2>
          <div className="space-y-3">
            {recentlyVisited.map((youth) => (
              <YouthCard
                key={youth.id}
                youth={youth}
                onSchedule={() =>
                  setScheduleModal({
                    isOpen: true,
                    youthId: youth.id,
                    youthName: youth.name,
                  })
                }
                onEdit={() => setEditModal({ isOpen: true, youth })}
                onDelete={() => handleDelete(youth.id, youth.name)}
                onHistory={() =>
                  setHistoryModal({
                    isOpen: true,
                    youthId: youth.id,
                    youthName: youth.name,
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {queue.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No youth in the queue yet.</p>
          <a
            href="/youth/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
          >
            Add Your First Youth
          </a>
        </div>
      )}

      {scheduleModal?.isOpen && (
        <ScheduleVisitModal
          youthId={scheduleModal.youthId}
          youthName={scheduleModal.youthName}
          onSuccess={fetchQueue}
          onClose={() => setScheduleModal(null)}
        />
      )}

      {editModal?.isOpen && (
        <EditYouthModal
          youthId={editModal.youth.id}
          youthName={editModal.youth.name}
          youthPreferredName={editModal.youth.preferredName}
          currentLastSeen={editModal.youth.lastSeenAt}
          onSuccess={fetchQueue}
          onClose={() => setEditModal(null)}
        />
      )}

      {historyModal?.isOpen && (
        <VisitHistoryModal
          youthId={historyModal.youthId}
          youthName={historyModal.youthName}
          onClose={() => setHistoryModal(null)}
        />
      )}

      {pendingReviewsModal && (
        <PendingReviewsModal onClose={() => setPendingReviewsModal(false)} />
      )}
    </div>
  );
}

function YouthCard({
  youth,
  onSchedule,
  onEdit,
  onDelete,
  onHistory,
}: {
  youth: Youth;
  onSchedule: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onHistory: () => void;
}) {
  const daysOverdue = Math.floor(
    (Date.now() - 180 * 24 * 60 * 60 * 1000 - youth.lastSeenAt) /
      (24 * 60 * 60 * 1000),
  );

  return (
    <div className="bg-white rounded-lg p-4 shadow border-l-4 border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {youth.scheduled && (
              <span className="text-red-500 text-lg" title="Scheduled">
                🔴
              </span>
            )}
            {daysOverdue > 0 && !youth.scheduled && (
              <span className="text-yellow-500 text-lg" title="Overdue">
                ⚠️
              </span>
            )}
            {daysOverdue <= -150 && !youth.scheduled && (
              <span className="text-green-500 text-lg" title="Recently visited">
                ✅
              </span>
            )}
            <h3 className="font-semibold text-gray-900 text-lg md:text-base">
              {youth.preferredName || youth.name}
            </h3>
            {youth.preferredName && (
              <span className="text-sm text-gray-500">({youth.name})</span>
            )}
          </div>

          <p className="text-sm text-gray-600">
            Last visited:{" "}
            {formatDistanceToNow(youth.lastSeenAt, { addSuffix: true })}
            {daysOverdue > 0 && (
              <span className="text-red-600 ml-2">
                ({daysOverdue} days overdue)
              </span>
            )}
          </p>

          {youth.note && (
            <p className="text-sm text-gray-700 mt-1">Note: {youth.note}</p>
          )}

          {youth.scheduled && youth.trelloCardUrl && (
            <a
              href={youth.trelloCardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
            >
              View Trello Card →
            </a>
          )}
        </div>

        <div className="flex flex-wrap gap-2 sm:flex-row sm:gap-2 sm:ml-4 w-full sm:w-auto">
          <button
            onClick={onHistory}
            className="px-3 py-2.5 md:py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors min-h-[44px]"
          >
            History
          </button>
          {!youth.scheduled && (
            <button
              onClick={onSchedule}
              className="px-3 py-2.5 md:py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors min-h-[44px]"
            >
              Schedule
            </button>
          )}
          <button
            onClick={onEdit}
            className="px-3 py-2.5 md:py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors min-h-[44px]"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2.5 md:py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors min-h-[44px]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
