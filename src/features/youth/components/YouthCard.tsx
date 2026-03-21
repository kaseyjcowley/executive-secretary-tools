"use client";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import type { Youth } from "@/types/youth";
import { Card, Button, Badge } from "@/components/ui";

const DAYS_180_AGO_MS = 180 * 24 * 60 * 60 * 1000;

interface YouthCardProps {
  youth: Youth;
  referenceDate?: number;
  onSchedule: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onHistory: () => void;
}

export function YouthCard({
  youth,
  referenceDate = Date.now() - DAYS_180_AGO_MS,
  onSchedule,
  onEdit,
  onDelete,
  onHistory,
}: YouthCardProps) {
  const daysOverdue = useMemo(() => {
    return Math.floor(
      (referenceDate - youth.lastSeenAt) / (24 * 60 * 60 * 1000),
    );
  }, [referenceDate, youth.lastSeenAt]);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {youth.scheduled && (
              <Badge variant="error" size="sm">
                Scheduled
              </Badge>
            )}
            {daysOverdue > 0 && !youth.scheduled && (
              <Badge variant="warning" size="sm">
                Overdue
              </Badge>
            )}
            {daysOverdue <= -150 && !youth.scheduled && (
              <Badge variant="success" size="sm">
                Recently Visited
              </Badge>
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
              <span className="text-error ml-2">
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
              className="text-sm text-primary hover:underline mt-1 inline-block"
            >
              View Trello Card →
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
          {!youth.scheduled && (
            <Button variant="primary" size="sm" onClick={onSchedule}>
              Schedule
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="secondary" size="sm" onClick={onHistory}>
            History
          </Button>
          <Button variant="danger" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
