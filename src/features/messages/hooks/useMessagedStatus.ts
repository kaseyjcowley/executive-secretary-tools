import { useState, useEffect, useCallback } from "react";

interface UseMessagedStatusOptions {
  contactIds: string[];
  initialSuppressedIds?: Set<string>;
}

interface UseMessagedStatusReturn {
  suppressedIds: Set<string>;
  markAsMessaged: (contactIds: string[]) => Promise<void>;
  unmarkContact: (contactId: string) => Promise<void>;
  isLoading: boolean;
}

export function useMessagedStatus({
  contactIds,
  initialSuppressedIds,
}: UseMessagedStatusOptions): UseMessagedStatusReturn {
  const [suppressedIds, setSuppressedIds] = useState<Set<string>>(
    initialSuppressedIds || new Set(),
  );
  const [isLoading, setIsLoading] = useState(!initialSuppressedIds);

  useEffect(() => {
    if (contactIds.length === 0) {
      setIsLoading(false);
      return;
    }

    if (initialSuppressedIds) {
      setIsLoading(false);
      return;
    }

    const fetchMessagedStatus = async () => {
      try {
        const response = await fetch(
          `/api/messaged-status?ids=${contactIds.join(",")}`,
        );
        const data = await response.json();
        setSuppressedIds(new Set(data.messaged));
      } catch (error) {
        console.error("Error fetching messaged status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessagedStatus();
  }, [contactIds, initialSuppressedIds]);

  const markAsMessaged = useCallback(async (ids: string[]) => {
    try {
      const response = await fetch("/api/mark-messaged", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: ids }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark contacts");
      }

      setSuppressedIds((prev) => new Set(Array.from(prev).concat(ids)));
    } catch (error) {
      console.error("Error marking contacts:", error);
      throw error;
    }
  }, []);

  const unmarkContact = useCallback(async (id: string) => {
    try {
      const response = await fetch("/api/unmark-messaged", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to unmark contact");
      }

      setSuppressedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error("Error unmarking contact:", error);
      throw error;
    }
  }, []);

  return { suppressedIds, markAsMessaged, unmarkContact, isLoading };
}
