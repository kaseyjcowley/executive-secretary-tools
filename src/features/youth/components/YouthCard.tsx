"use client";

import { formatDistanceToNow } from "date-fns";
import type { Youth } from "@/types/youth";

interface YouthCardProps {
  youth: Youth;
  onSchedule: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function YouthCard({
  youth,
  onSchedule,
  onEdit,
  onDelete,
}: YouthCardProps) {
  const daysOverdue = Math.floor(
    (Date.now() - 180 * 24 * 60 * 60 * 1000 - youth.lastSeenAt) /
      (24 * 60 * 60 * 1000),
  );

  return (
    <div className="bg-white rounded-lg p-4 shadow border-l-4 border-gray-200">
      <div className="flex justify-between items-start">
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
            <h3 className="font-semibold text-gray-900">
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

        <div className="flex flex-wrap gap-2 ml-4">
          {!youth.scheduled && (
            <button
              onClick={onSchedule}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Schedule
            </button>
          )}
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
