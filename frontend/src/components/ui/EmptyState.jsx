function EmptyState({ title, description, action, className = "" }) {
  return (
    <div
      className={`rounded-[1.5rem] border border-app-border bg-app-card p-10 text-center shadow-[var(--shadow-soft)] ${className}`}
    >
      <h2 className="text-2xl font-bold text-app-text">{title}</h2>

      {description && (
        <p className="mt-3 text-sm leading-7 text-app-text-soft">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

import { memo } from "react";
export default memo(EmptyState);