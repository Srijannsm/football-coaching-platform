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
          className={`mb-2 block text-sm font-semibold text-app-text ${labelClassName}`}
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`h-12 w-full rounded-2xl border bg-app-card px-4 text-sm text-app-text outline-none transition placeholder:text-app-text-muted focus:border-brand-primary ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-app-border"
        } ${className}`}
        {...props}
      />

      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default memo(Input);
