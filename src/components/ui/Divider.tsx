interface DividerProps {
  vertical?: boolean;
  className?: string;
}

export function Divider({ vertical = false, className = "" }: DividerProps) {
  if (vertical) {
    return (
      <div
        role="separator"
        className={`w-px h-full min-h-4 bg-base-300 ${className}`}
      />
    );
  }

  return (
    <div role="separator" className={`w-full h-px bg-base-300 ${className}`} />
  );
}
