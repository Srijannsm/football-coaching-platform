import { memo, useEffect, useRef, useState } from "react";
import {
  X,
  Image,
  Video,
  Calendar,
  Tag,
  Pencil,
  Check,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "../../utils/formatDate";

function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?[^&]*v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/);
  return m ? m[1] : null;
}

function getYouTubeEmbedUrl(url) {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

function MetaRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-app-border last:border-0">
      <Icon size={14} className="mt-0.5 shrink-0 text-app-text-muted" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-app-text-muted">
          {label}
        </p>
        <p className="mt-0.5 break-all text-sm text-app-text">{value}</p>
      </div>
    </div>
  );
}

function GalleryDetailPanel({ item, onClose, onEdit, onDelete }) {
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState(item.caption || "");
  const captionRef = useRef(null);

  useEffect(() => {
    setCaptionDraft(item.caption || "");
    setEditingCaption(false);
  }, [item.id]);

  useEffect(() => {
    if (editingCaption) captionRef.current?.focus();
  }, [editingCaption]);

  const isVideo = item.media_type === "video";
  const mediaSrc = item.thumbnail_url || item.image_url;
  const directVideoSrc = isVideo ? (item.video_file_url || item.video_file) : null;
  const youtubeEmbedUrl = isVideo ? getYouTubeEmbedUrl(item.video_url) : null;
  const fileUrl = item.image_url || item.video_file_url || item.video_url || null;

  function handleCaptionSave() {
    onEdit({ ...item, _captionOnly: true, caption: captionDraft });
    setEditingCaption(false);
  }

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-app-border bg-app-card shadow-[var(--shadow-soft)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-app-border px-4 py-3">
        <div className="flex items-center gap-2">
          {isVideo ? (
            <Video size={15} className="text-violet-500" />
          ) : (
            <Image size={15} className="text-sky-500" />
          )}
          <span className="text-sm font-semibold text-app-text">
            {isVideo ? "Video" : "Photo"} details
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-app-text-muted hover:bg-app-surface-2 hover:text-app-text transition"
        >
          <X size={14} />
        </button>
      </div>

      {/* Preview / Player */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-950 shrink-0">
        {isVideo ? (
          /* ── Video player ── */
          directVideoSrc ? (
            <video
              key={directVideoSrc}
              src={directVideoSrc}
              controls
              playsInline
              className="h-full w-full object-contain"
            />
          ) : youtubeEmbedUrl ? (
            <iframe
              key={youtubeEmbedUrl}
              src={youtubeEmbedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : mediaSrc ? (
            <img src={mediaSrc} alt={item.caption || "Preview"} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Video size={32} className="text-app-text-muted" />
            </div>
          )
        ) : (
          /* ── Image preview ── */
          mediaSrc ? (
            <img src={mediaSrc} alt={item.caption || "Preview"} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Video size={32} className="text-app-text-muted" />
            </div>
          )
        )}

        {!item.is_active && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
            <div className="flex items-center gap-2 rounded-xl bg-black/70 px-3 py-1.5">
              <EyeOff size={13} className="text-white/70" />
              <span className="text-xs font-medium text-white/70">Hidden</span>
            </div>
          </div>
        )}

        {/* Badges — only show for non-playing states */}
        {!(isVideo && (directVideoSrc || youtubeEmbedUrl)) && (
          <div className="absolute bottom-2 left-2 flex gap-1.5">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase backdrop-blur-sm ${
                isVideo
                  ? "border-violet-400/40 bg-violet-900/70 text-violet-200"
                  : "border-sky-400/40 bg-sky-900/70 text-sky-200"
              }`}
            >
              {isVideo ? "Video" : "Photo"}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase backdrop-blur-sm ${
                item.is_active
                  ? "border-emerald-400/40 bg-emerald-900/70 text-emerald-200"
                  : "border-slate-400/40 bg-slate-900/70 text-slate-300"
              }`}
            >
              {item.is_active ? "Active" : "Hidden"}
            </span>
          </div>
        )}
      </div>

      {/* Scrollable metadata */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {/* Caption (editable) */}
        <div className="flex items-start gap-3 py-2.5 border-b border-app-border">
          <Pencil size={14} className="mt-0.5 shrink-0 text-app-text-muted" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-app-text-muted">
              Caption
            </p>
            {editingCaption ? (
              <div className="mt-1 flex items-center gap-1.5">
                <input
                  ref={captionRef}
                  type="text"
                  value={captionDraft}
                  onChange={(e) => setCaptionDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCaptionSave();
                    if (e.key === "Escape") setEditingCaption(false);
                  }}
                  className="flex-1 rounded-lg border border-app-border bg-app-surface px-2 py-1 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                />
                <button
                  type="button"
                  onClick={handleCaptionSave}
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30 transition"
                >
                  <Check size={12} />
                </button>
              </div>
            ) : (
              <div className="mt-0.5 flex items-center gap-2 group/caption">
                <p className="text-sm text-app-text">
                  {item.caption || (
                    <span className="italic text-app-text-muted">No caption</span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setEditingCaption(true)}
                  className="opacity-0 group-hover/caption:opacity-100 flex h-5 w-5 items-center justify-center rounded text-app-text-muted hover:text-brand-primary transition"
                >
                  <Pencil size={11} />
                </button>
              </div>
            )}
          </div>
        </div>

        <MetaRow icon={Tag} label="Category" value={item.category_name} />
        <MetaRow icon={Calendar} label="Added" value={formatDate(item.created_at)} />

        {item.video_url && (
          <div className="flex items-start gap-3 py-2.5 border-b border-app-border last:border-0">
            <ExternalLink size={14} className="mt-0.5 shrink-0 text-app-text-muted" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-app-text-muted">
                Video URL
              </p>
              <a
                href={item.video_url}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 block break-all text-sm text-brand-primary underline-offset-2 hover:underline"
              >
                {item.video_url}
              </a>
            </div>
          </div>
        )}

        {fileUrl && !item.video_url && (
          <div className="flex items-start gap-3 py-2.5 border-b border-app-border last:border-0">
            <ExternalLink size={14} className="mt-0.5 shrink-0 text-app-text-muted" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-app-text-muted">
                File URL
              </p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 block break-all text-sm text-brand-primary underline-offset-2 hover:underline"
              >
                {fileUrl}
              </a>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 py-2.5">
          <Eye size={14} className="shrink-0 text-app-text-muted" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-app-text-muted">
              Display order
            </p>
            <p className="mt-0.5 text-sm text-app-text">{item.display_order ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-app-border px-4 py-3 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-app-border bg-app-surface-2 px-3 py-2 text-xs font-semibold text-app-text hover:border-brand-primary/40 hover:text-brand-primary transition"
        >
          <Pencil size={12} />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>
    </aside>
  );
}

export default memo(GalleryDetailPanel);
