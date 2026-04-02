import { memo } from "react";
import { Play, CheckCircle2 } from "lucide-react";

function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?[^&]*v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/);
  return m ? m[1] : null;
}

function getYouTubeThumbnail(url) {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function GalleryCard({ item, isSelected, onSelect, onClick }) {
  const isVideo = item.media_type === "video";
  // Priority: backend thumbnail → image_url → YouTube API thumbnail
  const thumbSrc =
    item.thumbnail_url ||
    item.image_url ||
    (isVideo ? getYouTubeThumbnail(item.video_url) : null);
  const directVideoSrc = isVideo ? (item.video_file_url || item.video_file) : null;

  function handleCheckboxClick(e) {
    e.stopPropagation();
    onSelect(item.id);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(item)}
      onKeyDown={(e) => e.key === "Enter" && onClick(item)}
      className={[
        "group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200",
        isSelected
          ? "border-brand-primary ring-2 ring-brand-primary/30 shadow-[0_0_0_1px_var(--color-brand-primary)]"
          : "border-app-border hover:border-brand-primary/40 hover:shadow-[var(--shadow-soft)]",
        "bg-app-card",
      ].join(" ")}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-neutral-900">
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={item.caption || "Gallery item"}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : directVideoSrc ? (
          /* Render video element — browser shows first frame, no CORS needed */
          <video
            src={directVideoSrc}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onLoadedMetadata={(e) => { e.target.currentTime = 1; }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play size={28} className="text-app-text-muted" />
          </div>
        )}

        {/* Video overlay */}
        {item.media_type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/35">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/40 backdrop-blur-sm">
              <Play size={14} fill="white" className="translate-x-0.5 text-white" />
            </div>
          </div>
        )}

        {/* Selection overlay */}
        <div
          className={`absolute inset-0 bg-brand-primary/8 transition-opacity duration-150 ${
            isSelected ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Checkbox */}
        <button
          type="button"
          aria-label={isSelected ? "Deselect item" : "Select item"}
          onClick={handleCheckboxClick}
          className={[
            "absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-150",
            isSelected
              ? "opacity-100 scale-100"
              : "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100",
          ].join(" ")}
        >
          {isSelected ? (
            <CheckCircle2 size={20} className="text-brand-primary drop-shadow-sm" fill="white" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-black/30 backdrop-blur-sm" />
          )}
        </button>

        {/* Inactive badge */}
        {!item.is_active && (
          <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">
            Hidden
          </span>
        )}
      </div>

      {/* Caption */}
      <div className="px-3 py-2">
        <p className="truncate text-xs font-medium text-app-text">
          {item.caption || <span className="italic text-app-text-muted">No caption</span>}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-app-text-muted">
          {item.category_name}
        </p>
      </div>
    </div>
  );
}

export default memo(GalleryCard);
