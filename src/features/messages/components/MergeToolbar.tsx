"use client";

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
          <button
            onClick={onMerge}
            disabled={!canMerge}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-2 ${
              canMerge
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow hover:-translate-y-0.5"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <IconUsers className="w-4 h-4" />
            Merge into Group
          </button>
          <button
            onClick={onMarkAsMessaged}
            disabled={selectedCount === 0}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-2 ${
              selectedCount > 0
                ? "bg-success-600 text-white hover:bg-success-700 shadow-sm hover:shadow hover:-translate-y-0.5"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <IconCheck className="w-4 h-4" />
            Mark as Messaged
          </button>
          <button
            onClick={onClearSelection}
            disabled={selectedCount === 0}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-2 ${
              selectedCount > 0
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:-translate-y-0.5"
                : "bg-gray-50 text-gray-300 cursor-not-allowed"
            }`}
          >
            <IconX className="w-4 h-4" />
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  );
};
