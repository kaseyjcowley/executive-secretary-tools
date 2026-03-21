type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  status?: "online" | "offline" | "busy" | "away";
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
  "2xl": "w-20 h-20 text-xl",
};

const statusClasses: Record<string, string> = {
  online: "bg-success",
  offline: "bg-secondary",
  busy: "bg-error",
  away: "bg-warning",
};

const indicatorSizes: Record<AvatarSize, string> = {
  xs: "w-2 h-2",
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-3 h-3",
  xl: "w-4 h-4",
  "2xl": "w-4 h-4",
};

export function Avatar({
  src,
  alt = "Avatar",
  initials,
  status,
  size = "md",
  className = "",
}: AvatarProps) {
  return (
    <div className={`avatar placeholder ${className}`}>
      <div
        className={`${sizeClasses[size]} bg-neutral text-neutral-content rounded-full flex items-center justify-center`}
      >
        {src ? (
          <img src={src} alt={alt} />
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <span>?</span>
        )}
      </div>
      {status && (
        <div
          className={`absolute bottom-0 right-0 ${indicatorSizes[size]} ${statusClasses[status]} rounded-full ring-2 ring-base-100 ring-offset-base-100 ring-offset-2`}
        />
      )}
    </div>
  );
}
