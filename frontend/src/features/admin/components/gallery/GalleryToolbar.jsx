import { memo } from "react";
import { Search, LayoutGrid, List } from "lucide-react";

const TYPE_FILTERS = [
  { key: "all", label: "All" },
  { key: "photo", label: "Images" },
  { key: "video", label: "Video" },
];

function GalleryToolbar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  viewMode,
  onViewModeChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: search + type filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items…"
            className="h-9 w-52 rounded-xl border border-app-border bg-app-surface pl-8 pr-3 text-sm text-app-text placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
        </div>

        {/* Type filter pills */}
        <div className="flex gap-1 rounded-xl border border-app-border bg-app-surface p-1">
          {TYPE_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onTypeFilterChange(key)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                typeFilter === key
                  ? "bg-brand-primary text-black shadow-sm"
                  : "text-app-text-soft hover:text-app-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="h-9 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Right: view toggle */}
      <div className="flex gap-1 rounded-xl border border-app-border bg-app-surface p-1 self-start sm:self-auto">
        <button
          type="button"
          title="Grid view"
          onClick={() => onViewModeChange("grid")}
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
            viewMode === "grid"
              ? "bg-brand-primary text-black shadow-sm"
              : "text-app-text-muted hover:text-app-text"
          }`}
        >
          <LayoutGrid size={14} />
        </button>
        <button
          type="button"
          title="List view"
          onClick={() => onViewModeChange("list")}
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
            viewMode === "list"
              ? "bg-brand-primary text-black shadow-sm"
              : "text-app-text-muted hover:text-app-text"
          }`}
        >
          <List size={14} />
        </button>
      </div>
    </div>
  );
}

export default memo(GalleryToolbar);
