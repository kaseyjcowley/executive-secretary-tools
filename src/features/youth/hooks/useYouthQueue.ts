import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import type { Youth } from "@/types/youth";
import { getQueueAction, deleteYouthAction } from "@/actions/youth";
import { syncWithTrelloAction } from "@/actions/sync";

interface UseYouthQueueReturn {
  queue: Youth[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  sync: () => Promise<void>;
  removeYouth: (id: string, name: string) => Promise<void>;
}

export function useYouthQueue(): UseYouthQueueReturn {
  const [queue, setQueue] = useState<Youth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queueData = await getQueueAction();
      setQueue(queueData);
    } catch (err) {
      console.error("Failed to load queue:", err);
      setError(err instanceof Error ? err : new Error("Failed to load queue"));
      toast.error("Failed to load queue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const sync = useCallback(async () => {
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
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to sync");
      console.error(err);
    }
  }, [fetchQueue]);

  const removeYouth = useCallback(
    async (id: string, name: string) => {
      if (!confirm(`Remove ${name} from the queue?`)) return;

      try {
        await deleteYouthAction(id);
        toast.success(`${name} removed from queue`);
        fetchQueue();
      } catch (err) {
        toast.error("Failed to delete");
        console.error(err);
      }
    },
    [fetchQueue],
  );

  return {
    queue,
    isLoading,
    error,
    refetch: fetchQueue,
    sync,
    removeYouth,
  };
}
