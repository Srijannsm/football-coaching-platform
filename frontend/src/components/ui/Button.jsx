import { memo } from "react";

function Spinner({ size }) {
  const dim = size === "sm" ? 14 : size === "lg" ? 18 : 16;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      className="animate-spin shrink-0"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  loadingText,
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-55";

  const variants = {
    primary:
      "bg-brand-primary text-white hover:bg-brand-primary-hover shadow-sm",
    secondary:
      "bg-app-surface-2 text-app-text border border-app-border hover:bg-app-border",
    outline:
      "border border-app-border bg-app-card text-app-text hover:bg-app-surface-2",
    ghost: "text-app-text hover:bg-app-surface-2",
    danger:
      "bg-app-danger-text text-white hover:opacity-90 shadow-sm",
    "danger-outline":
      "border border-app-danger-border text-app-danger-text hover:bg-app-danger-bg",
    success:
      "bg-app-success-text text-white hover:opacity-90 shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={size} />
          <span>{loadingText || children}</span>
        </>
      ) : children}
    </button>
  );
}

export default memo(Button);
