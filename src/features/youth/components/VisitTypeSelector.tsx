"use client";

import { Select } from "@/components/ui/Select";
import { VISIT_TYPE_OPTIONS } from "@/constants/youth-visit-types";

interface VisitTypeSelectorProps {
  selectedVisitType: string;
  onChange: (visitType: string) => void;
  className?: string;
}

export function VisitTypeSelector({
  selectedVisitType,
  onChange,
  className = "w-full",
}: VisitTypeSelectorProps) {
  return (
    <Select
      className={className}
      value={selectedVisitType}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        Select visit type
      </option>

      {VISIT_TYPE_OPTIONS.map((type) => (
        <option key={type.id} value={type.id} title={type.description}>
          {type.name}
          {type.automationCode && ` (${type.automationCode})`}
        </option>
      ))}
    </Select>
  );
}
