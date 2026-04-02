import { memo } from "react";
import { Trash2, X } from "lucide-react";

function GalleryBulkBar({ count, isDeleting, onDelete, onClear }) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-app-border bg-app-card px-4 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.28)] backdrop-blur-md">
        <span className="text-sm font-semibold text-app-text">
          {count} {count === 1 ? "item" : "items"} selected
        </span>

        <span className="h-4 w-px bg-app-border" />

        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-60"
        >
          <Trash2 size={12} />
          {isDeleting ? "Deleting…" : "Delete selected"}
        </button>

        <button
          type="button"
          onClick={onClear}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-app-text-muted hover:text-app-text transition"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default memo(GalleryBulkBar);
