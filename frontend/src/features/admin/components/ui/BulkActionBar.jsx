import { useState } from "react";

function BulkActionBar({
  selectedCount,
  statusOptions,
  onApplyStatus,
  onDelete,
  onClear,
  isLoading = false,
}) {
  const [bulkStatus, setBulkStatus] = useState(statusOptions?.[0]?.value ?? "");

  const showStatusAction = statusOptions && statusOptions.length > 0 && onApplyStatus;

  return (
    <div className="inline-flex items-center gap-0 divide-x divide-app-border overflow-hidden rounded-full border border-app-border bg-app-card text-sm shadow-sm">
      {/* Count */}
      <span className="px-4 py-1.5 font-semibold text-brand-primary">
        {selectedCount} selected
      </span>

      {/* Status action */}
      {showStatusAction && (
        <div className="flex items-center gap-0 divide-x divide-app-border">
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            disabled={isLoading}
            className="h-8 appearance-none border-0 bg-transparent px-3 text-sm text-app-text outline-none disabled:opacity-50"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => onApplyStatus(bulkStatus)}
            disabled={isLoading}
            className="px-4 py-1.5 font-medium text-app-text transition hover:bg-app-surface-2 disabled:opacity-50"
          >
            {isLoading ? "Applying…" : "Apply"}
          </button>
        </div>
      )}

      {/* Delete */}
      {onDelete && (
        <button
          onClick={onDelete}
          disabled={isLoading}
          className="px-4 py-1.5 font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
        >
          Delete
        </button>
      )}

      {/* Clear */}
      <button
        onClick={onClear}
        disabled={isLoading}
        className="px-3 py-1.5 text-app-text-muted transition hover:bg-app-surface-2 hover:text-app-text disabled:opacity-50"
      >
        ✕
      </button>
    </div>
  );
}

export default BulkActionBar;
