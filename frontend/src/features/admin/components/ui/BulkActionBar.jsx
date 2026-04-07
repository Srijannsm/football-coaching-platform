import { ChevronDown, X } from "lucide-react";

function BulkActionBar({
  selectedCount,
  statusOptions,
  onApplyStatus,
  onDelete,
  onClear,
  isLoading = false,
}) {
  const showStatusActions = statusOptions && statusOptions.length > 0 && onApplyStatus;

  return (
    <div className="flex items-center gap-2">
      {/* "Mark as" dropdown */}
      {showStatusActions && (
        <div className="relative">
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) onApplyStatus(e.target.value);
            }}
            disabled={isLoading}
            className="h-9 cursor-pointer appearance-none rounded-lg border border-app-border bg-app-card pl-3 pr-7 text-sm text-app-text outline-none transition focus:border-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              Mark as…
            </option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-app-text-muted"
          />
        </div>
      )}

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={onDelete}
          disabled={isLoading}
          className="inline-flex h-9 items-center rounded-lg border border-app-danger-border bg-app-danger-bg px-3 text-sm font-medium text-app-danger-text transition-colors hover:bg-app-danger-hover-bg disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete
        </button>
      )}

      {/* Selected count badge with clear */}
      <span className="flex items-center gap-1.5 rounded-lg border border-brand-primary/25 bg-brand-primary/8 pl-3 pr-1.5 py-1.5 text-sm font-medium text-brand-primary">
        {selectedCount} selected
        <button
          onClick={onClear}
          disabled={isLoading}
          aria-label="Clear selection"
          className="flex h-5 w-5 items-center justify-center rounded-md transition-colors hover:bg-brand-primary/15 disabled:opacity-50"
        >
          <X size={12} />
        </button>
      </span>
    </div>
  );
}

export default BulkActionBar;
