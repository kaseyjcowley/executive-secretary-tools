import { type ReactNode } from "react";

interface StatProps {
  children: ReactNode;
  className?: string;
}

export function Stat({ children, className = "" }: StatProps) {
  return (
    <div
      className={`stats stats-vertical lg:stats-horizontal shadow inline-flex w-auto ${className}`}
    >
      {children}
    </div>
  );
}

interface StatItemProps {
  children: ReactNode;
  className?: string;
}

export function StatItem({ children, className = "" }: StatItemProps) {
  return <div className={`stat ${className}`}>{children}</div>;
}

interface StatTitleProps {
  children: ReactNode;
  className?: string;
}

export function StatTitle({ children, className = "" }: StatTitleProps) {
  return <div className={`stat-title ${className}`}>{children}</div>;
}

interface StatValueProps {
  children: ReactNode;
  className?: string;
}

export function StatValue({ children, className = "" }: StatValueProps) {
  return <div className={`stat-value ${className}`}>{children}</div>;
}

interface StatDescProps {
  children: ReactNode;
  className?: string;
}

export function StatDesc({ children, className = "" }: StatDescProps) {
  return <div className={`stat-desc ${className}`}>{children}</div>;
}
