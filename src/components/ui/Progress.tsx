interface ProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?:
    | "primary"
    | "secondary"
    | "accent"
    | "neutral"
    | "success"
    | "warning"
    | "error";
  size?: "none" | "xs" | "sm" | "md" | "lg";
  className?: string;
}

const colorClasses: Record<string, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  accent: "bg-accent",
  neutral: "bg-neutral",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
};

const sizeClasses: Record<string, string> = {
  none: "",
  xs: "h-1",
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

export function Progress({
  value,
  max = 100,
  showLabel = false,
  color = "primary",
  size = "md",
  className = "",
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`form-control w-full ${className}`}>
      {showLabel && (
        <div className="label">
          <span className="label-text">{value}</span>
          <span className="label-text-alt">{max}</span>
        </div>
      )}
      <div className={`w-full bg-base-300 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full ${colorClasses[color]} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="label justify-end">
          <span className="label-text-alt">{percentage.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}
