import { memo } from "react";
import { Play, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "../../utils/formatDate";

function GalleryListRow({ item, isSelected, onSelect, onClick, onEdit, onDelete }) {
  const mediaSrc = item.thumbnail_url || item.image_url;

  return (
    <tr
      className={`group border-t border-app-border transition-colors ${
        isSelected ? "bg-brand-primary/5" : "hover:bg-app-surface-2/40"
      }`}
    >
      {/* Checkbox */}
      <td className="w-10 px-3 py-3">
        <button
          type="button"
          aria-label={isSelected ? "Deselect" : "Select"}
          onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
          className="flex items-center justify-center"
        >
          {isSelected ? (
            <CheckCircle2 size={18} className="text-brand-primary" fill="white" />
          ) : (
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 border-app-border bg-app-surface-2 transition group-hover:border-brand-primary/50" />
          )}
        </button>
      </td>

      {/* Preview */}
      <td className="w-16 px-3 py-3">
        <button
          type="button"
          onClick={() => onClick(item)}
          className="relative block h-10 w-14 overflow-hidden rounded-lg bg-neutral-900"
        >
          {mediaSrc ? (
            <img
              src={mediaSrc}
              alt={item.caption || "Preview"}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Play size={14} className="text-app-text-muted" />
            </div>
          )}
          {item.media_type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play size={10} fill="white" className="text-white" />
            </div>
          )}
        </button>
      </td>

      {/* Type */}
      <td className="px-3 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            item.media_type === "video"
              ? "border-violet-400/30 bg-violet-500/10 text-violet-600 dark:text-violet-300"
              : "border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300"
          }`}
        >
          {item.media_type === "video" ? <Play size={9} /> : null}
          {item.media_type === "video" ? "Video" : "Photo"}
        </span>
      </td>

      {/* Caption */}
      <td className="max-w-[220px] px-3 py-3">
        <button
          type="button"
          onClick={() => onClick(item)}
          className="text-left text-sm font-medium text-app-text hover:text-brand-primary transition truncate block max-w-full"
        >
          {item.caption || <span className="italic text-app-text-muted font-normal">No caption</span>}
        </button>
      </td>

      {/* Category */}
      <td className="px-3 py-3 text-sm text-app-text-soft">
        {item.category_name}
      </td>

      {/* Date */}
      <td className="hidden px-3 py-3 text-xs text-app-text-muted md:table-cell">
        {formatDate(item.created_at)}
      </td>

      {/* Status */}
      <td className="px-3 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            item.is_active
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
              : "border-slate-400/30 bg-slate-500/10 text-slate-500 dark:text-slate-400"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${item.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
          {item.is_active ? "Active" : "Hidden"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-app-border bg-app-surface-2 text-app-text-muted hover:border-brand-primary/40 hover:text-brand-primary transition"
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(item); }}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default memo(GalleryListRow);
