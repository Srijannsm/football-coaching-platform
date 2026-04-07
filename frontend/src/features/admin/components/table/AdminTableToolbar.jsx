import { Search } from "lucide-react";

function AdminTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  actions,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-app-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      {/* Search + filters */}
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted"
          />
          <input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-app-border bg-app-card pl-9 pr-3 text-sm text-app-text outline-none transition placeholder:text-app-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
          />
        </div>
        {filters ? (
          <div className="flex flex-wrap items-center gap-2">{filters}</div>
        ) : null}
      </div>

      {/* Actions */}
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export default AdminTableToolbar;
