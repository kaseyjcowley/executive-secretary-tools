"use client";

import { useState } from "react";
import { VisitTypeSelector } from "@/features/youth/components/VisitTypeSelector";
import { YOUTH_VISIT_TYPES } from "@/constants/youth-visit-types";
import toast from "react-hot-toast";
import { scheduleVisitAction } from "@/actions/youth-visits";

interface ScheduleVisitModalProps {
  youthId: string;
  youthName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function ScheduleVisitModal({
  youthId,
  youthName,
  onSuccess,
  onClose,
}: ScheduleVisitModalProps) {
  const [visitType, setVisitType] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSchedule = async () => {
    if (!visitType) {
      toast.error("Please select a visit type");
      return;
    }

    setIsSubmitting(true);

    try {
      await scheduleVisitAction(youthId, visitType, note.trim() || undefined);

      toast.success(`Visit scheduled for ${youthName}`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to schedule visit");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewCardName = () => {
    let name = youthName;
    if (visitType && YOUTH_VISIT_TYPES[visitType]?.automationCode) {
      name += YOUTH_VISIT_TYPES[visitType].automationCode;
    }
    return name;
  };

  const previewDescription = () => {
    return note.trim() || "(no description)";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Schedule Visit for {youthName}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visit Type *
            </label>
            <VisitTypeSelector
              selectedVisitType={visitType}
              onChange={setVisitType}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (optional)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              placeholder="e.g., Family crisis, annual interview"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {visitType && (
            <div className="bg-gray-50 rounded-md p-3 text-sm">
              <p className="font-medium text-gray-700 mb-1">
                Trello card name:
              </p>
              <code className="text-gray-900 break-all block mb-2">
                {previewCardName()}
              </code>
              <p className="font-medium text-gray-700 mb-1">Description:</p>
              <code className="text-gray-600 break-all">
                {previewDescription()}
              </code>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting || !visitType}
          >
            {isSubmitting ? "Scheduling..." : "Schedule Visit"}
          </button>
        </div>
      </div>
    </div>
  );
}
