function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-black/20 disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary: "bg-black text-white hover:bg-gray-900",
    secondary: "bg-gray-400 text-gray-900 hover:bg-gray-100",
    outline: "border border-gray-300 text-gray-900 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    login: "bg-emrald-800 text-white hover:bg-lime-600",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

export default Button;