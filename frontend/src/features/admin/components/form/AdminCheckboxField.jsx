import { useId } from "react";
import AdminFieldError from "./AdminFieldError";

function AdminCheckboxField({ label, name, checked, onChange, error, disabled = false }) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-sm text-app-text">
        <input
          id={id}
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-4 w-4 rounded border-app-border accent-brand-primary disabled:cursor-not-allowed"
        />
        <span>{label}</span>
      </label>
      <AdminFieldError id={errorId} message={error} />
    </div>
  );
}

export default AdminCheckboxField;
