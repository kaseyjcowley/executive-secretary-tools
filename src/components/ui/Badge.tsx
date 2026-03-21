import { type ReactNode } from "react";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "ghost"
  | "outline";
type BadgeSize = "xs" | "sm" | "md" | "lg";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  outline?: boolean;
}

const variantColors: Record<BadgeVariant, string> = {
  primary: "bg-primary text-primary-content",
  secondary: "bg-secondary text-secondary-content",
  accent: "bg-accent text-accent-content",
  neutral: "bg-neutral text-neutral-content",
  success: "bg-success text-success-content",
  warning: "bg-warning text-warning-content",
  error: "bg-error text-error-content",
  ghost: "bg-base-200 text-base-content",
  outline: "bg-transparent border border-current text-base-content",
};

export function Badge({
  children,
  variant = "primary",
  size = "md",
  className = "",
  outline = false,
}: BadgeProps) {
  const sizeClass = {
    xs: "text-[10px] px-1 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  }[size];

  const colorClass = variantColors[variant];

  return (
    <span
      className={`badge rounded-full font-medium ${sizeClass} ${colorClass} ${className}`}
    >
      {children}
    </span>
  );
}
