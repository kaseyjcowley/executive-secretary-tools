import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
  compact?: boolean;
  accentColor?:
    | "primary"
    | "secondary"
    | "accent"
    | "neutral"
    | "success"
    | "warning"
    | "error";
}

export function Card({
  children,
  className = "",
  bordered = true,
  compact = false,
  accentColor,
}: CardProps) {
  const accentClass = accentColor
    ? {
        primary: "border-t-4 border-t-primary",
        secondary: "border-t-4 border-t-secondary",
        accent: "border-t-4 border-t-accent",
        neutral: "border-t-4 border-t-neutral",
        success: "border-t-4 border-t-success",
        warning: "border-t-4 border-t-warning",
        error: "border-t-4 border-t-error",
      }[accentColor]
    : "";

  return (
    <div
      className={`bg-base-100 ${bordered ? "border border-base-300" : ""} ${
        compact ? "p-4" : "p-6"
      } rounded-lg shadow-sm ${accentClass} ${className}`}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
}

interface CardActionsProps {
  children: ReactNode;
  className?: string;
}

export function CardActions({ children, className = "" }: CardActionsProps) {
  return (
    <div className={`card-actions justify-end mt-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`card-body ${className}`}>{children}</div>;
}
