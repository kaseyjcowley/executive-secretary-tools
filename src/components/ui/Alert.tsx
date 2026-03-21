import { type ReactNode } from "react";
import { Button } from "./Button";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantClasses: Record<AlertVariant, string> = {
  info: "bg-info text-info-content",
  success: "bg-success text-success-content",
  warning: "bg-warning text-warning-content",
  error: "bg-error text-error-content",
};

export function Alert({
  variant = "info",
  children,
  className = "",
  dismissible = false,
  onDismiss,
}: AlertProps) {
  return (
    <div
      role="alert"
      className={`alert ${variantClasses[variant]} ${className}`}
    >
      {children}
      {dismissible && onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="shrink-0"
        >
          <span className="text-xl leading-none">&times;</span>
        </Button>
      )}
    </div>
  );
}
