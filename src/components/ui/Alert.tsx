import { type ReactNode } from "react";

export type AlertVariant = "info" | "success" | "warning" | "error" | "neutral";

interface AlertProps {
  variant?: AlertVariant;
  className?: string;
  children: ReactNode;
  open?: boolean;
  onClose?: () => void;
}

const variantClasses: Record<AlertVariant, string> = {
  info: "alert-info",
  success: "alert-success",
  warning: "alert-warning",
  error: "alert-error",
  neutral: "alert-neutral",
};

export function Alert({
  variant = "info",
  className = "",
  children,
  open = true,
  onClose,
}: AlertProps) {
  if (!open) return null;

  return (
    <div
      className={`alert ${variantClasses[variant]} ${className}`}
      role="alert"
    >
      <span>{children}</span>
      {onClose && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
}
