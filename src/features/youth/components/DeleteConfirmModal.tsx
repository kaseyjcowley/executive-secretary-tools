"use client";

import { Button } from "@/components/ui";

interface DeleteConfirmModalProps {
  youthName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  youthName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-sm w-[90vw] mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-semibold text-gray-900">Delete Youth</h2>
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-sm text-xl px-2"
          >
            ×
          </button>
        </div>
        <p className="text-gray-600 mb-6 mt-2">
          Are you sure you want to remove <strong>{youthName}</strong> from the
          queue? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
