import { type ReactNode } from "react";

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  icon,
  title,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-3 mb-6 ${className}`}>
      <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && (
          <p className="text-base-content/60 text-sm mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
