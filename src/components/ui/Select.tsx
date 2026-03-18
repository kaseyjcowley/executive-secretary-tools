import {
  forwardRef,
  useId,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      className = "",
      id,
      children,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="form-control w-full">
        {label && (
          <label className="label" htmlFor={selectId}>
            <span className="label-text">{label}</span>
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`select select-bordered w-full ${error ? "select-error" : ""} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>
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

Select.displayName = "Select";
