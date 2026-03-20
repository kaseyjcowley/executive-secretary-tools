interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ className = "", variant = "text" }: SkeletonProps) {
  const variantClass = {
    text: "h-4 w-full rounded",
    circular: "rounded-full aspect-square",
    rectangular: "w-full h-32 rounded",
  }[variant];

  return <div className={`skeleton ${variantClass} ${className}`} />;
}

export function SkeletonText({ className = "" }: { className?: string }) {
  return <Skeleton variant="text" className={className} />;
}

export function SkeletonCircle({
  size = "w-12 h-12",
  className = "",
}: {
  size?: string;
  className?: string;
}) {
  return <Skeleton variant="circular" className={`${size} ${className}`} />;
}

export function SkeletonRect({ className = "" }: { className?: string }) {
  return <Skeleton variant="rectangular" className={className} />;
}
