import { type ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`bg-base-100 rounded-lg shadow-sm border border-base-300 p-12 ${className}`}
    >
      <div className="text-center">
        {icon && (
          <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-base-content/60 max-w-sm mx-auto mb-4">
            {description}
          </p>
        )}
        {action && (
          <Button onClick={action.onClick} size="sm">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
