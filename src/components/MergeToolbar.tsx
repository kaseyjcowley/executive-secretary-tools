"use client";

interface MergeToolbarProps {
  selectedCount: number;
  onMerge: () => void;
  onClearSelection: () => void;
}

export const MergeToolbar = ({
  selectedCount,
  onMerge,
  onClearSelection,
}: MergeToolbarProps) => {
  const canMerge = selectedCount >= 2;

  return (
    <div className="sticky top-0 z-10 bg-white border border-slate-300 p-3 mb-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-700 font-medium">
          {selectedCount} contact{selectedCount !== 1 ? "s" : ""} selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onMerge}
          disabled={!canMerge}
          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
            canMerge
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-200 text-slate-500 cursor-not-allowed"
          }`}
        >
          Merge into Group
        </button>
        <button
          onClick={onClearSelection}
          disabled={selectedCount === 0}
          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
            selectedCount > 0
              ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
};
