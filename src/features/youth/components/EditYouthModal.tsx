"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { VisitHistoryItem } from "@/types/youth";
import { YOUTH_VISIT_TYPES } from "@/constants/youth-visit-types";

interface EditYouthModalProps {
  youthId: string;
  youthName: string;
  youthPreferredName?: string;
  currentLastSeen: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function EditYouthModal({
  youthId,
  youthName,
  youthPreferredName,
  currentLastSeen,
  onSuccess,
  onClose,
}: EditYouthModalProps) {
  const [preferredName, setPreferredName] = useState(youthPreferredName || "");
  const [date, setDate] = useState(
    new Date(currentLastSeen).toISOString().split("T")[0],
  );
  const [visitHistory, setVisitHistory] = useState<VisitHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVisitHistory, setShowVisitHistory] = useState(false);
  const [newVisitDate, setNewVisitDate] = useState("");
  const [newVisitType, setNewVisitType] = useState("other");
  const [newVisitNote, setNewVisitNote] = useState("");

  useEffect(() => {
    async function fetchVisitHistory() {
      try {
        const response = await fetch(`/api/youth/${youthId}/visits`);
        const data = await response.json();
        setVisitHistory(data.visits || []);
      } catch (error) {
        console.error("Error fetching visit history:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVisitHistory();
  }, [youthId]);

  const handleUpdate = async () => {
    setIsSubmitting(true);

    try {
      if (preferredName !== (youthPreferredName || "")) {
        const prefResponse = await fetch(
          `/api/youth/${youthId}/preferred-name`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ preferredName }),
          },
        );
        if (!prefResponse.ok) {
          throw new Error("Failed to update preferred name");
        }
      }

      const response = await fetch(`/api/youth/${youthId}/last-seen`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastSeenAt: date }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      toast.success(`Updated for ${youthName}`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddVisit = async () => {
    if (!newVisitDate) {
      toast.error("Please select a date");
      return;
    }

    const timestamp = new Date(newVisitDate).getTime();
    const newVisit: VisitHistoryItem = {
      id: `manual-${Date.now()}`,
      visitedAt: timestamp,
      visitType: newVisitType,
      trelloUrl: "",
      note: newVisitNote || undefined,
    };

    const updatedHistory = [newVisit, ...visitHistory].sort(
      (a, b) => b.visitedAt - a.visitedAt,
    );

    try {
      const response = await fetch(`/api/youth/${youthId}/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visits: updatedHistory }),
      });

      if (!response.ok) {
        throw new Error("Failed to update visits");
      }

      setVisitHistory(updatedHistory);

      const mostRecent = updatedHistory[0];
      const newDate = new Date(mostRecent.visitedAt)
        .toISOString()
        .split("T")[0];
      setDate(newDate);

      const lastSeenResponse = await fetch(`/api/youth/${youthId}/last-seen`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastSeenAt: newDate }),
      });

      if (!lastSeenResponse.ok) {
        throw new Error("Failed to update last seen");
      }

      toast.success("Visit added");
      setNewVisitDate("");
      setNewVisitNote("");
      onSuccess();
    } catch (error) {
      toast.error("Failed to add visit");
      console.error(error);
    }
  };

  const handleDeleteVisit = async (visitId: string) => {
    const updatedHistory = visitHistory.filter((v) => v.id !== visitId);

    try {
      const response = await fetch(`/api/youth/${youthId}/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visits: updatedHistory }),
      });

      if (!response.ok) {
        throw new Error("Failed to update visits");
      }

      setVisitHistory(updatedHistory);

      if (updatedHistory.length > 0) {
        const mostRecent = updatedHistory[0];
        const newDate = new Date(mostRecent.visitedAt)
          .toISOString()
          .split("T")[0];
        setDate(newDate);
      }

      toast.success("Visit removed");
      onSuccess();
    } catch (error) {
      toast.error("Failed to remove visit");
      console.error(error);
    }
  };

  const getVisitTypeName = (visitType: string): string => {
    return YOUTH_VISIT_TYPES[visitType]?.name || "Other";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-x-hidden">
      <div className="bg-white rounded-lg p-6 max-w-lg w-[90vw] max-md:w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Edit Youth Details
        </h2>

        <div className="mb-4">
          <label
            htmlFor="preferredName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Preferred Name (nickname)
          </label>
          <input
            id="preferredName"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            placeholder="e.g., Alex"
          />
        </div>

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

        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowVisitHistory(!showVisitHistory)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showVisitHistory ? "Hide" : "Show"} Visit History (
            {visitHistory.length})
          </button>

          {showVisitHistory && (
            <div className="mt-3 border rounded-md p-3">
              {isLoading ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : visitHistory.length === 0 ? (
                <p className="text-gray-500 text-sm">No visit history</p>
              ) : (
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {visitHistory.map((visit) => (
                    <li
                      key={visit.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>
                        {new Date(visit.visitedAt).toLocaleDateString()} -{" "}
                        {getVisitTypeName(visit.visitType)}
                      </span>
                      <button
                        onClick={() => handleDeleteVisit(visit.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Add Manual Visit
                </p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="date"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    value={newVisitDate}
                    onChange={(e) => setNewVisitDate(e.target.value)}
                  />
                  <select
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    value={newVisitType}
                    onChange={(e) => setNewVisitType(e.target.value)}
                  >
                    {Object.values(YOUTH_VISIT_TYPES).map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    value={newVisitNote}
                    onChange={(e) => setNewVisitNote(e.target.value)}
                  />
                  <button
                    onClick={handleAddVisit}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
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
