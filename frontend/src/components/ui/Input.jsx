function Input({
  label,
  error,
  className = "",
  labelClassName = "",
  type = "text",
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

      <input
        type={type}
        className={`h-12 w-full rounded-2xl border bg-app-card px-4 text-sm text-app-text outline-none transition placeholder:text-app-text-muted focus:border-brand-primary ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-app-border"
        } ${className}`}
        {...props}
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default Input;