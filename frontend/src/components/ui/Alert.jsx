function Alert({ children, variant = "info", className = "" }) {
  const variants = {
    info: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    success:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    error: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
    warning:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  };

  return (
    <div
      className={`rounded-[1.25rem] border px-5 py-4 text-sm font-medium ${variants[variant]} ${className}`}
      role="alert"
    >
      {children}
    </div>
  );
}

import { memo } from "react";
export default memo(Alert);