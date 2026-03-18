import { type ReactNode } from "react";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "ghost"
  | "info"
  | "success"
  | "warning"
  | "error";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "badge-primary",
  secondary: "badge-secondary",
  accent: "badge-accent",
  ghost: "badge-ghost",
  info: "badge-info",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
};

export function Badge({
  variant = "primary",
  className = "",
  children,
}: BadgeProps) {
  return (
    <span className={`badge ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
