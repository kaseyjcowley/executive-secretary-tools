"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Card, Button, Radio, Badge, Avatar } from "@/components/ui";
import { Modal, ModalActions } from "@/components/ui/Modal";
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

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`;
  }
  return parts[0]?.charAt(0) ?? "?";
};

type Props = ConductorState;

export function ConductorPageClient({
  rotation,
  currentIndex,
  override,
  currentConductor,
  nextConductor,
}: Props) {
  const [state] = useState<ConductorState>({
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
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);

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
    <div className="container mx-auto px-0 py-8 max-w-2xl">
      <div className="bg-base-100 border border-base-300 rounded-lg shadow-sm mx-0 -mx-4 md:mx-auto md:px-6 px-4 p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Conductor Rotation
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage the monthly conductor rotation and overrides
          </p>
        </div>

        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Status
          </h3>
          <Card accentColor="success" className="mb-4">
            <div className="flex items-center gap-3">
              <Avatar
                initials={getInitials(state.currentConductor.name)}
                size="md"
              />
              <div>
                <div className="text-sm text-gray-600">This Month</div>
                <div className="text-lg font-semibold text-gray-900">
                  {state.currentConductor.name}
                </div>
              </div>
            </div>
          </Card>
          <Card accentColor="warning" className="mb-4">
            <div className="flex items-center gap-3">
              <Avatar
                initials={getInitials(state.nextConductor.name)}
                size="md"
              />
              <div>
                <div className="text-sm text-gray-600">Next</div>
                <div className="text-lg font-semibold text-gray-900">
                  {state.nextConductor.name}
                </div>
              </div>
            </div>
          </Card>
          {state.override && (
            <Card className="border-t-4 border-t-warning">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="warning">Active Override</Badge>
                  </div>
                  <div className="text-sm text-gray-700">
                    {state.override.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {state.override.reason}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleClearOverride}>
                  Clear
                </Button>
              </div>
            </Card>
          )}
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Override (for next month)
          </h3>
          <Card>
            <div className="space-y-3 mb-4">
              {CONDUCTORS.map((conductor) => (
                <Radio
                  key={conductor.slackUserId}
                  name="conductor"
                  value={conductor.slackUserId}
                  checked={selectedConductor === conductor.slackUserId}
                  onChange={(e) => setSelectedConductor(e.target.value)}
                  label={conductor.name}
                />
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
                className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-base-100"
              />
            </div>
            <Button onClick={handleSetOverride} variant="primary">
              Set Override
            </Button>
          </Card>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Manual Actions
          </h3>
          <Card>
            <p className="text-sm text-gray-600 mb-4">
              Advance the rotation to the next person. This will also update the
              Slack bishopric channel topic.
            </p>
            <Button onClick={() => setShowAdvanceModal(true)} variant="success">
              Advance Rotation
            </Button>
          </Card>
        </section>
      </div>

      <Modal
        isOpen={showAdvanceModal}
        onClose={() => setShowAdvanceModal(false)}
        title="Confirm Rotation Advance"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Advance rotation to <strong>{state.nextConductor.name}</strong>? This
          will update the Slack channel topic.
        </p>
        <ModalActions>
          <Button
            variant="ghost"
            type="button"
            onClick={() => setShowAdvanceModal(false)}
          >
            Cancel
          </Button>
          <Button variant="success" onClick={handleAdvance}>
            Confirm
          </Button>
        </ModalActions>
      </Modal>
    </div>
  );
}
