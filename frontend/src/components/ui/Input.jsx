import { memo, useId, useState } from "react";

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Input({
  label,
  error,
  className = "",
  labelClassName = "",
  type = "text",
  showToggle = false,
  ...props
}) {
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  const errorId = `${inputId}-error`;
  const [visible, setVisible] = useState(false);

  const isPassword = type === "password";
  const resolvedType = isPassword && showToggle ? (visible ? "text" : "password") : type;

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

      <div className="relative">
        <input
          id={inputId}
          type={resolvedType}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-10 w-full rounded-lg border bg-app-card px-3 text-sm text-app-text outline-none transition placeholder:text-app-text-muted focus:ring-2 focus:ring-brand-primary/20 ${
            isPassword && showToggle ? "pr-10" : ""
          } ${
            error
              ? "border-app-danger-text focus:border-app-danger-text"
              : "border-app-border focus:border-brand-primary"
          } ${className}`}
          {...props}
        />

        {isPassword && showToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-app-text-muted transition hover:text-app-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          >
            <EyeIcon open={visible} />
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-app-danger-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default memo(Input);
