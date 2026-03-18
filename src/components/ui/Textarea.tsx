import {
  forwardRef,
  useId,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className="form-control w-full">
        {label && (
          <label className="label" htmlFor={textareaId}>
            <span className="label-text">{label}</span>
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`textarea textarea-bordered w-full ${error ? "textarea-error" : ""} ${className}`}
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

Textarea.displayName = "Textarea";
