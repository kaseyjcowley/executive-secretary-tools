import { type ReactNode } from "react";
import { Button } from "./Button";

interface ErrorStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  icon,
  title = "Something went wrong",
  description = "An error occurred while loading. Please try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`bg-base-100 rounded-lg shadow-sm border border-error/30 p-8 ${className}`}
    >
      <div className="text-center">
        {icon && (
          <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4 text-error">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-base-content/60 mb-4">{description}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="primary" size="sm">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
