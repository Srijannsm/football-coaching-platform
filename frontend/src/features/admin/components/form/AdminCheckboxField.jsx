import AdminFieldError from "./AdminFieldError";

function AdminCheckboxField({ label, name, checked, onChange, error, disabled = false }) {
  return (
    <div>
      <label className="flex items-center gap-3 text-sm text-green-800">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        {label}
      </label>
      <AdminFieldError message={error} />
    </div>
  );
}

export default AdminCheckboxField;
