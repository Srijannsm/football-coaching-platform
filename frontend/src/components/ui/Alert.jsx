function Alert({ children, variant = "info", className = "" }) {
  const variants = {
    info: "border-blue-200 bg-blue-50 text-blue-700",
    success: "border-green-200 bg-green-50 text-green-700",
    error: "border-red-200 bg-red-50 text-red-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <div
      className={`rounded-[1.25rem] border px-5 py-4 text-sm font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}

export default Alert;