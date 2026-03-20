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
      <progress
        className={`progress progress-${color} progress-${size}`}
        value={value}
        max={max}
      />
      {showLabel && (
        <div className="label justify-end">
          <span className="label-text-alt">{percentage.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}
