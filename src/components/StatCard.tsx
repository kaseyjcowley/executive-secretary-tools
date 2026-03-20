import Link from "next/link";
import { type ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  href?: string;
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "error";
  className?: string;
}

const colorClasses = {
  primary: "border-primary bg-primary/5",
  secondary: "border-secondary bg-secondary/5",
  accent: "border-accent bg-accent/5",
  success: "border-success bg-success/5",
  warning: "border-warning bg-warning/5",
  error: "border-error bg-error/5",
};

const textColorClasses = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

export function StatCard({
  title,
  value,
  icon,
  href,
  color = "primary",
  className = "",
}: StatCardProps) {
  const content = (
    <div
      className={`block p-4 rounded-lg border ${colorClasses[color]} hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-2xl ${textColorClasses[color]}`}>{icon}</span>
        <span className={`font-medium ${textColorClasses[color]}`}>
          {title}
        </span>
      </div>
      <div className="text-3xl font-bold text-base-content">{value}</div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
