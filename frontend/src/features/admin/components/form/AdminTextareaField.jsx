import AdminFieldError from "./AdminFieldError";

function AdminTextareaField({
  label,
  name,
  value,
  onChange,
  rows = 4,
  error,
  disabled = false,
  required = false,
  ...props
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-app-text">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        required={required}
        className={`w-full rounded-2xl border bg-app-surface-2 px-3 py-3 text-sm text-app-text outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-app-border focus:border-brand-primary"
        }`}
        {...props}
      />

      <AdminFieldError message={error} />
    </div>
  );
}

export default AdminTextareaField;