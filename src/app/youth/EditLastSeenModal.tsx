"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface EditLastSeenModalProps {
  youthId: string;
  youthName: string;
  currentLastSeen: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function EditLastSeenModal({
  youthId,
  youthName,
  currentLastSeen,
  onSuccess,
  onClose,
}: EditLastSeenModalProps) {
  const [date, setDate] = useState(
    new Date(currentLastSeen).toISOString().split("T")[0],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/youth/${youthId}/last-seen`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastSeenAt: date }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      toast.success(`Updated last seen date for ${youthName}`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update date");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Edit Last Seen Date
        </h2>

        <p className="text-gray-600 mb-4">
          Update when {youthName} was last visited.
        </p>

        <div className="mb-6">
          <label
            htmlFor="lastSeen"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Last Visited
          </label>
          <input
            id="lastSeen"
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
