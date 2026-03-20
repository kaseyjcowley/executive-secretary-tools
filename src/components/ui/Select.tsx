import { type SelectHTMLAttributes, forwardRef, type ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, leftIcon, children, className = "", ...props },
    ref,
  ) => {
    return (
      <div className="form-control w-full">
        {label && (
          <label className="label">
            <span className="label-text">{label}</span>
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            className={`select select-bordered w-full ${leftIcon ? "pl-10" : ""} ${
              error ? "select-error" : ""
            } ${className}`}
            {...props}
          >
            {children}
          </select>
        </div>
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
        {hint && !error && (
          <label className="label">
            <span className="label-text-alt">{hint}</span>
          </label>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
