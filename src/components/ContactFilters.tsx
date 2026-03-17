"use client";

import { useMemo, useCallback } from "react";
import { Contact } from "@/types/messages";
import { CallingStage } from "@/constants";

export type ContactTypeFilter = "all" | "interview" | "calling";
export type ContactStatusFilter = "all" | "unmessaged" | "messaged";
export type StageFilter =
  | "all"
  | CallingStage.needsCallingExtended
  | CallingStage.needsSettingApart;

export interface FilterState {
  type: ContactTypeFilter;
  status: ContactStatusFilter;
  label: string;
  stage: StageFilter;
  assigned: string;
}

interface Props {
  contacts: Contact[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function ContactFilters({ contacts, filters, onFiltersChange }: Props) {
  const availableLabels = useMemo(() => {
    const labels = new Set<string>();
    contacts.forEach((c) => {
      if (c.kind === "interview" && c.labels) {
        labels.add(c.labels.name);
      }
    });
    return Array.from(labels).sort();
  }, [contacts]);

  const availableAssigned = useMemo(() => {
    const assigned = new Set<string>();
    contacts.forEach((c) => {
      if (c.assigned) {
        assigned.add(c.assigned);
      }
    });
    return Array.from(assigned).sort();
  }, [contacts]);

  const handleTypeChange = useCallback(
    (type: ContactTypeFilter) => {
      onFiltersChange({ ...filters, type });
    },
    [filters, onFiltersChange],
  );

  const handleStatusChange = useCallback(
    (status: ContactStatusFilter) => {
      onFiltersChange({ ...filters, status });
    },
    [filters, onFiltersChange],
  );

  const handleLabelChange = useCallback(
    (label: string) => {
      onFiltersChange({ ...filters, label });
    },
    [filters, onFiltersChange],
  );

  const handleStageChange = useCallback(
    (stage: StageFilter) => {
      onFiltersChange({ ...filters, stage });
    },
    [filters, onFiltersChange],
  );

  const handleAssignedChange = useCallback(
    (assigned: string) => {
      onFiltersChange({ ...filters, assigned });
    },
    [filters, onFiltersChange],
  );

  const handleClearAll = useCallback(() => {
    onFiltersChange({
      type: "all",
      status: "all",
      label: "",
      stage: "all",
      assigned: "",
    });
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.label !== "" ||
    filters.stage !== "all" ||
    filters.assigned !== "";

  const visibleCount = useMemo(() => {
    return contacts.filter((c) => {
      if (filters.type !== "all" && c.kind !== filters.type) return false;
      if (filters.label && c.kind !== "interview") return false;
      if (
        filters.label &&
        c.kind === "interview" &&
        c.labels?.name !== filters.label
      )
        return false;
      if (filters.stage !== "all" && c.kind !== "calling") return false;
      if (
        filters.stage !== "all" &&
        c.kind === "calling" &&
        c.stage !== filters.stage
      )
        return false;
      if (filters.assigned && c.assigned !== filters.assigned) return false;
      return true;
    }).length;
  }, [contacts, filters]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-3 gap-y-2">
        <div className="flex items-center gap-2 w-full">
          <label className="text-sm font-medium text-gray-700 shrink-0">
            Type:
          </label>
          <select
            value={filters.type}
            onChange={(e) =>
              handleTypeChange(e.target.value as ContactTypeFilter)
            }
            className="block w-full min-w-0 pl-3 pr-8 py-1.5 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
          >
            <option value="all">All</option>
            <option value="interview">Interviews</option>
            <option value="calling">Callings</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full">
          <label className="text-sm font-medium text-gray-700 shrink-0">
            Status:
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              handleStatusChange(e.target.value as ContactStatusFilter)
            }
            className="block w-full min-w-0 pl-3 pr-8 py-1.5 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
          >
            <option value="all">All</option>
            <option value="unmessaged">Unmessaged</option>
            <option value="messaged">Messaged</option>
          </select>
        </div>

        {filters.type !== "calling" && (
          <div className="flex items-center gap-2 w-full">
            <label className="text-sm font-medium text-gray-700 shrink-0">
              Label:
            </label>
            <select
              value={filters.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="block w-full min-w-0 pl-3 pr-8 py-1.5 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              <option value="">All</option>
              {availableLabels.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        {filters.type !== "interview" && (
          <div className="flex items-center gap-2 w-full">
            <label className="text-sm font-medium text-gray-700 shrink-0">
              Stage:
            </label>
            <select
              value={filters.stage}
              onChange={(e) => handleStageChange(e.target.value as StageFilter)}
              className="block w-full min-w-0 pl-3 pr-8 py-1.5 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All</option>
              <option value={CallingStage.needsCallingExtended}>
                Needs Extended
              </option>
              <option value={CallingStage.needsSettingApart}>
                Needs Setting Apart
              </option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-2 w-full">
          <label className="text-sm font-medium text-gray-700 shrink-0">
            Assigned:
          </label>
          <select
            value={filters.assigned}
            onChange={(e) => handleAssignedChange(e.target.value)}
            className="block w-full min-w-0 pl-3 pr-8 py-1.5 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
          >
            <option value="">All</option>
            {availableAssigned.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="text-sm text-gray-600">
        Showing {visibleCount} of {contacts.length} contacts
      </div>
    </div>
  );
}

export function filterContacts(
  contacts: Contact[],
  filters: FilterState,
): Contact[] {
  return contacts.filter((c) => {
    if (filters.type !== "all" && c.kind !== filters.type) return false;
    if (filters.label && c.kind !== "interview") return false;
    if (
      filters.label &&
      c.kind === "interview" &&
      c.labels?.name !== filters.label
    )
      return false;
    if (filters.stage !== "all" && c.kind !== "calling") return false;
    if (
      filters.stage !== "all" &&
      c.kind === "calling" &&
      c.stage !== filters.stage
    )
      return false;
    if (filters.assigned && c.assigned !== filters.assigned) return false;
    return true;
  });
}
