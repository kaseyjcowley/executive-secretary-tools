"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button, Stat, StatItem, StatValue, StatTitle } from "@/components/ui";
import { YouthCard } from "@/features/youth/components/YouthCard";
import { ScheduleVisitModal } from "@/features/youth/components/ScheduleVisitModal";
import { EditYouthModal } from "@/features/youth/components/EditYouthModal";
import { DeleteConfirmModal } from "@/features/youth/components/DeleteConfirmModal";
import { VisitHistoryModal } from "@/components/youth/VisitHistoryModal";
import { PendingReviewsModal } from "@/components/youth/PendingReviewsModal";
import { getQueueAction, deleteYouthAction } from "@/actions/youth";
import { syncWithTrelloAction } from "@/actions/sync";
import { rebuildAllVisitHistoriesAction } from "@/actions/youth-visits";
import type { Youth } from "@/types/youth";

const DAYS_180_AGO_MS = 180 * 24 * 60 * 60 * 1000;

export default function YouthQueuePage() {
  const [queue, setQueue] = useState<Youth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
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
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    youthId: string;
    youthName: string;
  } | null>(null);
  const referenceDate = Date.now() - DAYS_180_AGO_MS;

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
    setIsSyncing(true);
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
    } finally {
      setIsSyncing(false);
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

    setIsRebuilding(true);
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
    } finally {
      setIsRebuilding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;

    try {
      await deleteYouthAction(deleteModal.youthId);
      toast.success(`${deleteModal.youthName} removed from queue`);
      fetchQueue();
      setDeleteModal(null);
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
      <div className="container mx-auto px-0 py-8 max-w-4xl">
        <div className="bg-base-100 border border-base-300 rounded-lg shadow-sm mx-0 -mx-4 md:mx-auto md:px-6 px-4 p-4 md:p-6">
          <div className="text-center text-gray-500">Loading queue...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-0 py-8 max-w-4xl">
      <div className="bg-base-100 border border-base-300 rounded-lg shadow-sm mx-0 -mx-4 md:mx-auto md:px-6 px-4 p-4 md:p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Youth Visitation Queue
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Track and manage youth home teaching visits
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSync}
            loading={isSyncing}
            className="col-span-1"
          >
            Sync
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRebuildVisitHistory}
            disabled={isRebuilding}
            className="col-span-1"
          >
            {isRebuilding ? "Rebuilding..." : "Rebuild"}
          </Button>
          <Link href="/youth/new">
            <Button variant="secondary" size="sm" className="w-full">
              Add Youth
            </Button>
          </Link>
          <Link href="/youth/import">
            <Button variant="secondary" size="sm" className="w-full">
              Import
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPendingReviewsModal(true)}
            className="col-span-2 md:col-span-1"
          >
            Reviews
          </Button>
        </div>

        <Stat className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
          <StatItem>
            <StatValue>{queue.length}</StatValue>
            <StatTitle>Total Youth</StatTitle>
          </StatItem>
          <StatItem>
            <StatValue className="text-error">
              {scheduledYouth.length}
            </StatValue>
            <StatTitle>Scheduled</StatTitle>
          </StatItem>
          <StatItem>
            <StatValue className="text-warning">
              {overdueYouth.length}
            </StatValue>
            <StatTitle>Overdue</StatTitle>
          </StatItem>
        </Stat>

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
                  referenceDate={referenceDate}
                  onSchedule={() =>
                    setScheduleModal({
                      isOpen: true,
                      youthId: youth.id,
                      youthName: youth.name,
                    })
                  }
                  onEdit={() => setEditModal({ isOpen: true, youth })}
                  onDelete={() =>
                    setDeleteModal({
                      isOpen: true,
                      youthId: youth.id,
                      youthName: youth.name,
                    })
                  }
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
                  referenceDate={referenceDate}
                  onSchedule={() =>
                    setScheduleModal({
                      isOpen: true,
                      youthId: youth.id,
                      youthName: youth.name,
                    })
                  }
                  onEdit={() => setEditModal({ isOpen: true, youth })}
                  onDelete={() =>
                    setDeleteModal({
                      isOpen: true,
                      youthId: youth.id,
                      youthName: youth.name,
                    })
                  }
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
                  referenceDate={referenceDate}
                  onSchedule={() =>
                    setScheduleModal({
                      isOpen: true,
                      youthId: youth.id,
                      youthName: youth.name,
                    })
                  }
                  onEdit={() => setEditModal({ isOpen: true, youth })}
                  onDelete={() =>
                    setDeleteModal({
                      isOpen: true,
                      youthId: youth.id,
                      youthName: youth.name,
                    })
                  }
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
            <Link href="/youth/new">
              <Button variant="primary">Add Your First Youth</Button>
            </Link>
          </div>
        )}
      </div>

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

      {deleteModal?.isOpen && (
        <DeleteConfirmModal
          youthName={deleteModal.youthName}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
}
