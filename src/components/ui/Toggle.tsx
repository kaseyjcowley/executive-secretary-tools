import { type InputHTMLAttributes, forwardRef } from "react";

interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  color?: "primary" | "secondary";
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, color = "primary", className = "", ...props }, ref) => {
    return (
      <label className="cursor-pointer label justify-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          className={`toggle toggle-${color} ${className}`}
          {...props}
        />
        {label && <span className="label-text">{label}</span>}
      </label>
    );
  },
);

Toggle.displayName = "Toggle";
