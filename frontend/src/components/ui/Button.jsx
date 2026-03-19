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
    "inline-flex items-center justify-center rounded-full font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary:
      "bg-brand-primary text-black shadow-[var(--shadow-soft)] hover:bg-brand-primary-hover",
    secondary:
      "bg-app-surface-2 text-app-text hover:bg-app-surface",
    outline:
      "border border-app-border bg-app-card text-app-text hover:border-brand-primary hover:text-brand-primary",
    ghost: "bg-transparent text-app-text hover:bg-app-surface-2",
    danger:
      "bg-app-danger text-white hover:opacity-90",
    "danger-outline":
      "border border-app-danger/20 bg-app-card text-app-danger hover:bg-app-danger/8",
    success:
      "bg-app-success text-white hover:opacity-90",
  };

  const sizes = {
    sm: "px-4 py-2.5 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

export default Button;