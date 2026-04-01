function Select({
  label,
  error,
  options = [],
  className = "",
  labelClassName = "",
  ...props
}) {
  return (
    <div>
      {label && (
        <label
          className={`mb-2 block text-sm font-semibold text-app-text ${labelClassName}`}
        >
          {label}
        </label>
      )}

      <select
        className={`h-12 w-full rounded-2xl border bg-app-card px-4 text-sm text-app-text outline-none transition focus:border-brand-primary ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-app-border"
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

import { memo } from "react";
export default memo(Select);