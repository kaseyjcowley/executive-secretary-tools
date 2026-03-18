import { type ReactNode } from "react";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: "loading-xs",
  sm: "loading-sm",
  md: "",
  lg: "loading-lg",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <span
      className={`loading loading-spinner ${sizeClasses[size]} ${className}`}
    />
  );
}

interface LoadingProps {
  text?: string;
  size?: SpinnerSize;
  className?: string;
}

export function Loading({ text, size = "md", className = "" }: LoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
    >
      <Spinner size={size} />
      {text && <span className="text-base-content/60">{text}</span>}
    </div>
  );
}

interface LoadingPageProps {
  text?: string;
  children?: ReactNode;
}

export function LoadingPage({
  text = "Loading...",
  children,
}: LoadingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loading text={text} size="lg" />
      {children}
    </div>
  );
}
