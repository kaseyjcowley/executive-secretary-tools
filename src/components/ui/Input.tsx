import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="form-control w-full">
        {label && (
          <label className="label" htmlFor={inputId}>
            <span className="label-text">{label}</span>
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input input-bordered w-full ${error ? "input-error" : ""} ${className}`}
          {...props}
        />
        {(error || helperText) && (
          <label className="label">
            <span className={`label-text-alt ${error ? "text-error" : ""}`}>
              {error || helperText}
            </span>
          </label>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
