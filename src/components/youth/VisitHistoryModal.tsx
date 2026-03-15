"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { YOUTH_VISIT_TYPES } from "@/constants/youth-visit-types";
import type { VisitHistoryItem } from "@/types/youth";

interface VisitHistoryModalProps {
  youthId: string;
  youthName: string;
  onClose: () => void;
}

export function VisitHistoryModal({
  youthId,
  youthName,
  onClose,
}: VisitHistoryModalProps) {
  const [visits, setVisits] = useState<VisitHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRebuilding, setIsRebuilding] = useState(false);

  useEffect(() => {
    fetchVisits();
  }, [youthId]);

  const fetchVisits = async () => {
    try {
      const response = await fetch(`/api/youth/${youthId}/visits`);
      const data = await response.json();
      if (data.visits) {
        setVisits(data.visits);
      }
    } catch (error) {
      console.error("Failed to fetch visits:", error);
      toast.error("Failed to load visit history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRebuild = async () => {
    setIsRebuilding(true);
    try {
      const response = await fetch(`/api/youth/${youthId}/visits`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.visits) {
        setVisits(data.visits);
        toast.success("Visit history rebuilt from Trello");
      }
    } catch (error) {
      console.error("Failed to rebuild visits:", error);
      toast.error("Failed to rebuild visit history");
    } finally {
      setIsRebuilding(false);
    }
  };

  const getVisitTypeName = (visitType: string): string => {
    return YOUTH_VISIT_TYPES[visitType]?.name || "Other";
  };

  const getVisitTypeIcon = (visitType: string): string => {
    const icons: Record<string, string> = {
      "bishop-youth-interview": "👤",
      "counselor-youth-interview": "👥",
      "ysa-interview": "🎂",
      "temple-recommend-interview": "⛪",
      other: "📝",
    };
    return icons[visitType] || "📝";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-x-hidden">
      <div className="bg-white rounded-lg p-6 max-w-lg w-[90vw] max-md:w-full mx-4 shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Visit History - {youthName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={handleRebuild}
            disabled={isRebuilding}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {isRebuilding ? "Rebuilding..." : "↻ Rebuild from Trello"}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : visits.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No visit history found
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {visits.map((visit, index) => (
                <div
                  key={visit.id}
                  className="flex gap-3 pb-4 border-b border-gray-100 last:border-0"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-2xl">
                      {getVisitTypeIcon(visit.visitType)}
                    </span>
                    {index < visits.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {getVisitTypeName(visit.visitType)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(visit.visitedAt), "MMMM d, yyyy")}
                    </div>
                    {visit.note && (
                      <div className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                        {visit.note}
                      </div>
                    )}
                    {visit.trelloUrl && (
                      <a
                        href={visit.trelloUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                      >
                        View Trello Card →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Total visits: <strong>{visits.length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
