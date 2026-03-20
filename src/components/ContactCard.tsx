import { type ReactNode } from "react";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";

interface ContactCardProps {
  name: string;
  avatarSrc?: string;
  avatarInitials?: string;
  labels?: string[];
  type?: "calling" | "interview";
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export function ContactCard({
  name,
  avatarSrc,
  avatarInitials,
  labels = [],
  type,
  contactInfo,
  onClick,
  className = "",
  children,
}: ContactCardProps) {
  return (
    <div
      className={`bg-base-100 rounded-lg shadow-sm border border-base-300 border-t-4 ${
        type === "calling" ? "border-t-accent" : "border-t-primary"
      } p-4 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Avatar
          src={avatarSrc}
          initials={avatarInitials}
          alt={name}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base-content truncate">{name}</h3>
            {type && (
              <Badge
                variant={type === "calling" ? "accent" : "primary"}
                size="sm"
              >
                {type === "calling" ? "Calling" : "Interview"}
              </Badge>
            )}
          </div>

          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {labels.map((label) => (
                <Badge key={label} variant="ghost" size="xs">
                  {label}
                </Badge>
              ))}
            </div>
          )}

          {contactInfo && (
            <div className="mt-2 text-sm text-base-content/60 space-y-1">
              {contactInfo.phone && <div>{contactInfo.phone}</div>}
              {contactInfo.email && <div>{contactInfo.email}</div>}
              {contactInfo.address && (
                <div className="truncate">{contactInfo.address}</div>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
