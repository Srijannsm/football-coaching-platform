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
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-app-text">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`h-11 w-full rounded-2xl border bg-app-surface-2 px-3 text-sm text-app-text outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
          error
            ? "border-red-500 focus:border-red-500"
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

      <AdminFieldError message={error} />
    </div>
  );
}

export default AdminSelectField;