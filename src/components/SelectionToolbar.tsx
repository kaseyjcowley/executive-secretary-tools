import { type ReactNode } from "react";
import { Button } from "./ui/Button";

interface SelectionToolbarProps {
  selectedCount: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    icon?: ReactNode;
  }>;
  className?: string;
}

export function SelectionToolbar({
  selectedCount,
  actions = [],
  className = "",
}: SelectionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={`flex flex-wrap sm:flex-nowrap items-center gap-3 ${className}`}
    >
      <span className="text-sm font-medium bg-base-200 px-3 py-1 rounded-full animate-pulse whitespace-nowrap">
        {selectedCount} contact{selectedCount !== 1 ? "s" : ""} selected
      </span>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "primary"}
          size="sm"
          onClick={action.onClick}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
