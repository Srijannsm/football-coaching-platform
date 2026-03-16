import { ui } from "../utils/ui";

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
      {label && <label className={`${ui.label} ${labelClassName}`}>{label}</label>}

      <select
        className={`${ui.input} ${
          error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className={ui.errorText}>{error}</p>}
    </div>
  );
}

export default Select;