function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-app-surface-2 text-app-text-soft",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

import { memo } from "react";
export default memo(Badge);