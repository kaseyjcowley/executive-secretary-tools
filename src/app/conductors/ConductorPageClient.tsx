"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { CONDUCTORS } from "@/constants/conductors";
import type { Conductor, ConductorOverride } from "@/types/conductors";
import { setOverride, clearOverride, advanceRotation } from "./actions";

interface ConductorState {
  rotation: Conductor[];
  currentIndex: number;
  override: ConductorOverride | null;
  currentConductor: Conductor;
  nextConductor: Conductor;
}

interface Props extends ConductorState {}

export function ConductorPageClient({
  rotation,
  currentIndex,
  override,
  currentConductor,
  nextConductor,
}: Props) {
  const [state, setState] = useState<ConductorState>({
    rotation,
    currentIndex,
    override,
    currentConductor,
    nextConductor,
  });
  const [selectedConductor, setSelectedConductor] = useState<string>(
    override?.slackUserId ?? "",
  );
  const [reason, setReason] = useState(override?.reason ?? "");

  const handleSetOverride = async () => {
    if (!selectedConductor) {
      toast.error("Please select a conductor");
      return;
    }

    const conductor = CONDUCTORS.find(
      (c) => c.slackUserId === selectedConductor,
    );
    if (!conductor) return;

    try {
      await setOverride(conductor.slackUserId, conductor.name, reason);
      toast.success(`Override set! ${conductor.name} will conduct next month.`);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to set override");
      console.error(error);
    }
  };

  const handleClearOverride = async () => {
    try {
      await clearOverride();
      toast.success("Override cleared");
      setSelectedConductor("");
      setReason("");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to clear override");
      console.error(error);
    }
  };

  const handleAdvance = async () => {
    if (
      !confirm(
        `Advance rotation to ${state.nextConductor.name}? This will update Slack channel topic.`,
      )
    ) {
      return;
    }

    try {
      const result = await advanceRotation();
      toast.success(`Rotation advanced to ${result.conductor.name}`);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to advance rotation");
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Conductor Rotation
      </h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Current Status
        </h2>
        <div className="bg-white rounded-lg p-6 shadow border">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">👤</span>
            <div>
              <div className="text-sm text-gray-600">This Month</div>
              <div className="text-lg font-semibold text-gray-900">
                {state.currentConductor.name}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">➡️</span>
            <div>
              <div className="text-sm text-gray-600">Next</div>
              <div className="text-lg font-semibold text-gray-900">
                {state.nextConductor.name}
              </div>
            </div>
          </div>
          {state.override && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-amber-600 font-semibold">
                Active Override
              </div>
              <div className="text-sm text-gray-700">
                {state.override.name} - {state.override.reason}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Override (for next month)
        </h2>
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="space-y-3 mb-4">
            {CONDUCTORS.map((conductor) => (
              <label
                key={conductor.slackUserId}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="conductor"
                  value={conductor.slackUserId}
                  checked={selectedConductor === conductor.slackUserId}
                  onChange={(e) => setSelectedConductor(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-900">{conductor.name}</span>
              </label>
            ))}
          </div>
          <div className="mb-4">
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reason (optional)
            </label>
            <input
              type="text"
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Bishop out of town"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSetOverride}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Set Override
            </button>
            {state.override && (
              <button
                onClick={handleClearOverride}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Clear Override
              </button>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Manual Actions
        </h2>
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-sm text-gray-600 mb-4">
            Advance the rotation to the next person. This will also update the
            Slack bishopric channel topic.
          </p>
          <button
            onClick={handleAdvance}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Advance Rotation to Next Person
          </button>
        </div>
      </section>
    </div>
  );
}
