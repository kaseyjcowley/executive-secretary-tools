import { type InputHTMLAttributes, forwardRef, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, leftIcon, rightIcon, className = "", ...props },
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
          <input
            ref={ref}
            className={`input input-bordered w-full ${leftIcon ? "pl-10" : ""} ${
              rightIcon ? "pr-10" : ""
            } ${error ? "input-error" : ""} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10">
              {rightIcon}
            </div>
          )}
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

Input.displayName = "Input";
