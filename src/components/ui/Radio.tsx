import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className = "", id, ...props }, ref) => {
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
          type="radio"
          className={`radio radio-primary ${className}`}
          {...props}
        />
        {label && <span className="text-sm text-base-content">{label}</span>}
      </label>
    );
  },
);

Radio.displayName = "Radio";
