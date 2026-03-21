import { type ReactNode } from "react";

interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  description?: string;
}

export function Label({ children, htmlFor, description }: LabelProps) {
  return (
    <label className="form-control w-full" htmlFor={htmlFor}>
      <div className="label">
        <span className="label-text">{children}</span>
      </div>
      {description && (
        <div className="label">
          <span className="label-text-alt">{description}</span>
        </div>
      )}
    </label>
  );
}
