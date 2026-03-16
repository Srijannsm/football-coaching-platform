import { ui } from "../utils/ui";

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
      {label && <label className={`${ui.label} ${labelClassName}`}>{label}</label>}

      <input
        type={type}
        className={`${ui.input} ${
          error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""
        } ${className}`}
        {...props}
      />

      {error && <p className={ui.errorText}>{error}</p>}
    </div>
  );
}

export default Input;