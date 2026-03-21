"use client";

import { Button } from "@/components/ui";
import { IconUsers, IconCheck, IconX } from "@/components/ui/Icons";

interface MergeToolbarProps {
  selectedCount: number;
  onMerge: () => void;
  onClearSelection: () => void;
  onMarkAsMessaged: () => void;
}

export const MergeToolbar = ({
  selectedCount,
  onMerge,
  onClearSelection,
  onMarkAsMessaged,
}: MergeToolbarProps) => {
  const canMerge = selectedCount >= 2;

  return (
    <div className="sticky top-0 z-10 backdrop-blur-sm bg-white/95 border-b border-gray-200 px-6 py-4 mb-6 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full animate-pulse">
            {selectedCount} contact{selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onMerge}
            disabled={!canMerge}
            variant="primary"
            size="sm"
          >
            <IconUsers className="w-4 h-4" />
            Merge into Group
          </Button>
          <Button
            onClick={onMarkAsMessaged}
            disabled={selectedCount === 0}
            variant="secondary"
            size="sm"
          >
            <IconCheck className="w-4 h-4" />
            Mark as Messaged
          </Button>
          <Button
            onClick={onClearSelection}
            disabled={selectedCount === 0}
            variant="ghost"
            size="sm"
          >
            <IconX className="w-4 h-4" />
            Clear Selection
          </Button>
        </div>
      </div>
    </div>
  );
};
