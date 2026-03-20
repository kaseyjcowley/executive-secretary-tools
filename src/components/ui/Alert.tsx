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

export function Alert({
  variant = "info",
  children,
  className = "",
  dismissible = false,
  onDismiss,
}: AlertProps) {
  const variantClass = `alert-${variant}`;

  return (
    <div role="alert" className={`alert ${variantClass} ${className}`}>
      <span>{children}</span>
      {dismissible && onDismiss && (
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          <span className="text-xl leading-none">&times;</span>
        </Button>
      )}
    </div>
  );
}
