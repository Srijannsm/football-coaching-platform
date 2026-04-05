import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getGalleryCategories } from "../services/galleryService";

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

function Lightbox({ item, onClose }) {
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function renderMedia() {
    if (item.media_type !== "video") {
      return (
        <img
          src={item.image_url}
          className="mx-auto block max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
        />
      );
    }
    // Prefer direct file; fall back to URL
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
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      );
    }
    // Generic video URL (non-YouTube)
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-6 top-6 z-50 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
      >
        ✕
      </button>

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
      </div>
    </div>
  );
}

function GalleryPage() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxItem, setLightboxItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getGalleryCategories();
        const list = Array.isArray(data) ? data : data.results ?? [];
        setCategories(list);
      } catch {
        setError("Failed to load gallery. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") {
      return categories.flatMap((cat) => cat.items ?? []);
    }
    const cat = categories.find((c) => c.id === activeCategory);
    return cat ? (cat.items ?? []) : [];
  }, [categories, activeCategory]);

  const totalCount = useMemo(
    () => categories.reduce((acc, c) => acc + (c.item_count ?? 0), 0),
    [categories]
  );

  return (
    <div className="min-h-screen bg-app-surface text-app-text">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-app-card pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/8 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
            Gallery
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-app-text sm:text-5xl">
            Our Training in Action
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-app-text-soft">
            Browse photos and videos from our training sessions, camps, and
            events. See the dedication and skill that defines Football Academy.
          </p>
          {totalCount > 0 && (
            <p className="mt-4 text-sm text-app-text-muted">
              {totalCount} {totalCount === 1 ? "item" : "items"} across{" "}
              {categories.length}{" "}
              {categories.length === 1 ? "category" : "categories"}
            </p>
          )}
        </div>
      </section>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="sticky top-[72px] z-30 border-b border-app-border bg-app-surface/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl overflow-x-auto px-6 lg:px-10">
            <div className="flex gap-1 py-3">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${activeCategory === "all"
                  ? "bg-brand-primary text-black"
                  : "text-app-text-soft hover:bg-app-surface-2 hover:text-app-text"
                  }`}
              >
                All ({totalCount})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${activeCategory === cat.id
                    ? "bg-brand-primary text-black"
                    : "text-app-text-soft hover:bg-app-surface-2 hover:text-app-text"
                    }`}
                >
                  {cat.name} ({cat.item_count})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
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
            {error}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-app-text-soft">
              No items in this category yet.
            </p>
            <p className="mt-2 text-sm text-app-text-muted">
              Check back soon for updates.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <GalleryItemCard
                key={item.id}
                item={item}
                onOpen={setLightboxItem}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />

      {lightboxItem && (
        <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
      )}
    </div>
  );
}

export default GalleryPage;
