import { useId } from "react";
import AdminFieldError from "./AdminFieldError";

function AdminSelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  placeholder = "Select an option",
  disabled = false,
  required = false,
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-app-text">
          {label}
          {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
        </label>
      )}

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`h-10 w-full rounded-lg border bg-app-card px-3 text-sm text-app-text outline-none transition focus:ring-2 focus:ring-brand-primary/15 disabled:cursor-not-allowed disabled:opacity-55 ${
          error
            ? "border-red-400 focus:border-red-400"
            : "border-app-border focus:border-brand-primary"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <AdminFieldError id={errorId} message={error} />
    </div>
  );
}

export default AdminSelectField;
