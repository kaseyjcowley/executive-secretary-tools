import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export type CheckboxVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "success"
  | "warning"
  | "info"
  | "error";

export type CheckboxSize = "xs" | "sm" | "md" | "lg" | "xl";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  variant?: CheckboxVariant;
  size?: CheckboxSize;
}

const variantClasses: Record<CheckboxVariant, string> = {
  primary: "checkbox-primary",
  secondary: "checkbox-secondary",
  accent: "checkbox-accent",
  neutral: "checkbox-neutral",
  success: "checkbox-success",
  warning: "checkbox-warning",
  info: "checkbox-info",
  error: "checkbox-error",
};

const sizeClasses: Record<CheckboxSize, string> = {
  xs: "checkbox-xs",
  sm: "checkbox-sm",
  md: "checkbox-md",
  lg: "checkbox-lg",
  xl: "checkbox-xl",
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, variant = "primary", size = "md", className = "", id, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <label
        htmlFor={inputId}
        className="flex items-center gap-2 cursor-pointer"
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={`checkbox ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
          {...props}
        />
        {label && <span className="text-sm text-base-content">{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
