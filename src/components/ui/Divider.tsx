interface DividerProps {
  vertical?: boolean;
  className?: string;
}

export function Divider({ vertical = false, className = "" }: DividerProps) {
  return (
    <div
      role="separator"
      className={`divider ${vertical ? "divider-vertical" : "divider-horizontal"} ${className}`}
    />
  );
}
