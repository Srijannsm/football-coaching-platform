import { useEffect, useMemo, useState } from "react";
import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/ui/Button";
import { getGalleryCategories } from "../services/galleryService";

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}


function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/watch\?[^&]*v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/
  );
  return match ? match[1] : null;
}

function getYouTubeEmbedUrl(url) {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
}

function getYouTubeThumbnail(url) {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function VideoPlayIcon() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40 backdrop-blur-sm transition group-hover:bg-white/30 group-hover:scale-110">
      <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6 translate-x-0.5">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );
}

function GalleryItemCard({ item, onOpen }) {
  // 🎬 VIDEO CARD
  if (item.media_type === "video") {
    // Priority: backend thumbnail → YouTube API thumbnail → direct video element
    const thumbSrc = item.thumbnail_url || getYouTubeThumbnail(item.video_url);
    const directSrc = item.video_file_url || item.video_file;

    return (
      <button
        onClick={() => onOpen(item)}
        aria-label={item.caption ? `Play video: ${item.caption}` : "Play video"}
        className="group relative block w-full overflow-hidden rounded-[1.5rem] border border-app-border bg-app-card shadow-[var(--shadow-soft)]"
      >
        <div className="relative h-64 w-full overflow-hidden bg-neutral-900">
          {thumbSrc ? (
            <img
              src={thumbSrc}
              alt="Video thumbnail"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : directSrc ? (
            /* Render the video itself — browser shows first frame, no CORS needed */
            <video
              src={directSrc}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              onLoadedMetadata={(e) => { e.target.currentTime = 1; }}
            />
          ) : (
            <div className="h-full w-full" />
          )}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/40">
          <VideoPlayIcon />
        </div>

        {item.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
            <p className="text-sm font-medium text-white">
              {item.caption}
            </p>
          </div>
        )}
      </button>
    );
  }

  // 📸 IMAGE CARD
  return (
    <button
      onClick={() => onOpen(item)}
      aria-label={item.caption ? `View image: ${item.caption}` : "View image"}
      className="group relative block w-full overflow-hidden rounded-[1.5rem] border border-app-border bg-app-card shadow-[var(--shadow-soft)]"
    >
      <img
        src={item.image_url}
        alt={item.caption}
        loading="lazy"
        decoding="async"
        className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />

      {item.caption && (
        <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent px-4 py-3 transition duration-300 group-hover:translate-y-0">
          <p className="text-sm text-white">{item.caption}</p>
        </div>
      )}
    </button>
  );
}

function Lightbox({ items, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const item = items[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) setCurrentIndex((i) => i - 1);
      if (e.key === "ArrowRight" && currentIndex < items.length - 1) setCurrentIndex((i) => i + 1);
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, currentIndex, items.length]);

  function renderMedia() {
    if (item.media_type !== "video") {
      return (
        <img
          src={item.image_url}
          alt={item.caption || "Gallery image"}
          className="mx-auto block max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
        />
      );
    }
    const directSrc = item.video_file_url || item.video_file;
    if (directSrc) {
      return (
        <video
          src={directSrc}
          controls
          autoPlay
          className="max-h-[85vh] w-full rounded-2xl shadow-2xl"
        />
      );
    }
    const embedUrl = getYouTubeEmbedUrl(item.video_url);
    if (embedUrl) {
      return (
        <div
          className="w-full overflow-hidden rounded-2xl shadow-2xl"
          style={{ aspectRatio: "16/9" }}
        >
          <iframe
            src={embedUrl}
            title={item.caption || "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      );
    }
    return (
      <video
        src={item.video_url}
        controls
        autoPlay
        className="max-h-[85vh] w-full rounded-2xl shadow-2xl"
      />
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gallery lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute right-6 top-6 z-50 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
      >
        ✕
      </button>

      {/* Prev */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentIndex((i) => i - 1); }}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
        >
          ‹
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentIndex((i) => i + 1); }}
          aria-label="Next image"
          className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
        >
          ›
        </button>
      )}

      <div
        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {renderMedia()}

        {item.caption && (
          <p className="mt-3 text-center text-white/80">
            {item.caption}
          </p>
        )}

        {items.length > 1 && (
          <p className="mt-1.5 text-xs text-white/40">
            {currentIndex + 1} / {items.length}
          </p>
        )}
      </div>
    </div>
  );
}

function GalleryPage() {
  const [categories, setCategories] = useState([]);
  const [activeType, setActiveType] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadGallery() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getGalleryCategories();
      const list = Array.isArray(data) ? data : data.results ?? [];
      setCategories(list);
    } catch {
      setError("Failed to load gallery. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadGallery();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allItems = useMemo(
    () => categories.flatMap((cat) => cat.items ?? []),
    [categories]
  );

  const typeCounts = useMemo(() => ({
    all: allItems.length,
    photo: allItems.filter((i) => i.media_type !== "video").length,
    video: allItems.filter((i) => i.media_type === "video").length,
  }), [allItems]);

  const filteredItems = useMemo(() => {
    if (activeType === "photo") return allItems.filter((i) => i.media_type !== "video");
    if (activeType === "video") return allItems.filter((i) => i.media_type === "video");
    return allItems;
  }, [allItems, activeType]);

  const totalCount = useMemo(
    () => categories.reduce((acc, c) => acc + (c.item_count ?? 0), 0),
    [categories]
  );

  return (
    <div className="min-h-screen bg-app-surface text-app-text">
      <SEO
        title="Gallery"
        description="A look inside our football coaching sessions — photos and videos from training, drills, and academy events."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-app-card pt-30 pb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/8 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-10">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
            Gallery
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-app-text sm:text-3xl">
            Our Training in Action
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-app-text-soft">
            Browse photos and videos from our training sessions, camps, and
            events. See the dedication and skill that defines Football Academy.
          </p>
          {totalCount > 0 && (
            <p className="mt-2 text-xs text-app-text-muted">
              {totalCount} {totalCount === 1 ? "item" : "items"} across{" "}
              {categories.length}{" "}
              {categories.length === 1 ? "category" : "categories"}
            </p>
          )}
        </div>
      </section>

      {/* Media type filter */}
      {!isLoading && allItems.length > 0 && (
        <div className="mx-auto max-w-7xl px-6 pt-8 lg:px-10">
          <div className="flex justify-center">
            <div className="flex gap-1 rounded-2xl border border-app-border bg-app-card p-1 shadow-sm">
              {[
                { id: "all", label: "All", Icon: GridIcon },
                { id: "photo", label: "Photos", Icon: CameraIcon },
                { id: "video", label: "Videos", Icon: VideoIcon },
              ]
                .filter((t) => t.id === "all" || typeCounts[t.id] > 0)
                .map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveType(id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      activeType === id
                        ? "bg-brand-primary text-black shadow-sm"
                        : "text-app-text-soft hover:text-app-text"
                    }`}
                  >
                    <Icon />
                    <span>{label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                        activeType === id
                          ? "bg-black/15 text-black"
                          : "bg-app-surface-2 text-app-text-muted"
                      }`}
                    >
                      {typeCounts[id]}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-[1.5rem] bg-app-surface-2"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-400">
            <p>{error}</p>
            <div className="mt-4 flex justify-center">
              <Button type="button" onClick={loadGallery}>Try Again</Button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-app-text-soft">
              {activeType !== "all"
                ? `No ${activeType === "photo" ? "photos" : "videos"} in this category yet.`
                : "No items in this category yet."}
            </p>
            <p className="mt-2 text-sm text-app-text-muted">
              Check back soon for updates.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredItems.map((item, idx) => (
              <GalleryItemCard
                key={item.id}
                item={item}
                onOpen={() => setLightboxIndex(idx)}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />

      {lightboxIndex !== null && (
        <Lightbox
          items={filteredItems}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

export default GalleryPage;
