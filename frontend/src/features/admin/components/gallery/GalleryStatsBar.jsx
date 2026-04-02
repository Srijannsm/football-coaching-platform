import { memo } from "react";
import { Image, Video, Layers, CheckSquare } from "lucide-react";

function StatPill({ icon: Icon, label, value, accent }) {
  const accentMap = {
    default: "text-app-text-muted",
    blue: "text-sky-500",
    violet: "text-violet-500",
    emerald: "text-emerald-500",
    brand: "text-brand-primary",
  };

  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className={accentMap[accent] || accentMap.default} />
      <span className="text-xs font-semibold text-app-text">
        {value}
      </span>
      <span className="text-xs text-app-text-muted">{label}</span>
    </div>
  );
}

function GalleryStatsBar({ items, selectedCount }) {
  const photoCount = items.filter((i) => i.media_type === "photo").length;
  const videoCount = items.filter((i) => i.media_type === "video").length;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-app-border bg-app-card px-4 py-2.5 shadow-[var(--shadow-soft)]">
      <StatPill icon={Layers} label="total" value={items.length} accent="default" />

      <span className="hidden h-3.5 w-px bg-app-border sm:block" />

      <StatPill icon={Image} label="photos" value={photoCount} accent="blue" />

      <span className="hidden h-3.5 w-px bg-app-border sm:block" />

      <StatPill icon={Video} label="videos" value={videoCount} accent="violet" />

      {selectedCount > 0 && (
        <>
          <span className="hidden h-3.5 w-px bg-app-border sm:block" />
          <StatPill
            icon={CheckSquare}
            label="selected"
            value={selectedCount}
            accent="brand"
          />
        </>
      )}
    </div>
  );
}

export default memo(GalleryStatsBar);
