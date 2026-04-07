import { memo, useId } from "react";

function Input({
  label,
  error,
  className = "",
  labelClassName = "",
  type = "text",
  ...props
}) {
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className={`mb-1.5 block text-sm font-medium text-app-text ${labelClassName}`}
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`h-10 w-full rounded-lg border bg-app-card px-3 text-sm text-app-text outline-none transition placeholder:text-app-text-muted focus:ring-2 focus:ring-brand-primary/20 ${
          error
            ? "border-app-danger-text focus:border-app-danger-text"
            : "border-app-border focus:border-brand-primary"
        } ${className}`}
        {...props}
      />

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-app-danger-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default memo(Input);
