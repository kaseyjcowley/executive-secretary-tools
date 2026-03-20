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

export function Badge({
  children,
  variant = "primary",
  size = "md",
  className = "",
  outline = false,
}: BadgeProps) {
  const variantClass = outline
    ? `badge-outline badge-${variant}`
    : `badge-${variant}`;

  const sizeClass = {
    xs: "badge-xs",
    sm: "badge-sm",
    md: "badge-md",
    lg: "badge-lg",
  }[size];

  return (
    <span className={`badge ${variantClass} ${sizeClass} ${className}`}>
      {children}
    </span>
  );
}
