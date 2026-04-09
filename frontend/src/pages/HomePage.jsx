import { useCallback, useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import SEO, { buildOrganizationSchema } from "../components/SEO";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Alert from "../components/ui/Alert";
import { Card, CardContent } from "../components/ui/Card";
import { createEnquiry } from "../services/enquiryService";
import { getRandomGalleryItems } from "../services/galleryService";
import { useToast } from "../hooks/useToast";
import Footer from "../components/Footer";

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

function GroupIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function GoalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="2" y1="9" x2="22" y2="9" />
      <line x1="8" y1="3" x2="8" y2="17" />
      <line x1="16" y1="3" x2="16" y2="17" />
      <path d="M6 21l6-4 6 4" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function TrendingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function HomeGalleryCard({ item, onOpen }) {
  const isVideo = item.media_type === "video";
  // Priority: backend thumbnail → YouTube API thumbnail (sync, no state needed)
  const thumbSrc = item.thumbnail_url || (isVideo ? getYouTubeThumbnail(item.video_url) : null) || item.image_url;
  const directSrc = isVideo ? (item.video_file_url || item.video_file) : null;

  return (
    <button
      onClick={() => onOpen(item)}
      className="group relative overflow-hidden rounded-[1.5rem] border border-app-border bg-app-card shadow-[var(--shadow-soft)]"
    >
      <div className="relative h-72 w-full overflow-hidden bg-neutral-900">
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={item.caption || "Gallery item"}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : directSrc ? (
          /* Render video element directly — browser shows first frame, no CORS needed */
          <video
            src={directSrc}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            onLoadedMetadata={(e) => { e.target.currentTime = 1; }}
          />
        ) : (
          <div className="h-full w-full" />
        )}
      </div>

      <div className={`absolute inset-0 transition duration-300 ${isVideo ? "bg-black/30 group-hover:bg-black/40" : "bg-black/0 group-hover:bg-black/30"}`} />

      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40 backdrop-blur-sm transition group-hover:scale-110">
            <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6 translate-x-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {item.caption && (
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 transition duration-300 ${isVideo ? "" : "translate-y-full group-hover:translate-y-0"}`}>
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
          className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-6 top-6 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
      >
        ✕
      </button>

      <div
        className="relative max-h-[90vh] max-w-5xl w-full"
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


function HomePage() {
  const { showToast } = useToast();
  const location = useLocation();
  const [lightboxItem, setLightboxItem] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    program: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const staticGalleryImages = [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
  ];

  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryLoaded, setGalleryLoaded] = useState(false);

  useEffect(() => {
    getRandomGalleryItems(8)
      .then((items) => {
        setGalleryItems(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        // fall back to static images
      })
      .finally(() => setGalleryLoaded(true));
  }, []);

  const programOptions = [
    { value: "", label: "Select a program (optional)" },
    { value: "1", label: "Group Training" },
    { value: "2", label: "1-to-1 Coaching" },
    { value: "3", label: "Goalkeeper Training" },
  ];

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        program: formData.program || null,
      };

      await createEnquiry(payload);

      showToast("Enquiry sent successfully.", "success");

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        program: "",
      });
    } catch (err) {
      const data = err.response?.data;

      if (data) {
        const firstError =
          data.name?.[0] ||
          data.email?.[0] ||
          data.phone?.[0] ||
          data.message?.[0] ||
          data.program?.[0] ||
          data.detail ||
          "Failed to send enquiry. Please try again.";

        showToast(firstError, "error");
      } else {
        showToast("Failed to send enquiry. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        const timer = setTimeout(() => {
          const y = element.getBoundingClientRect().top + window.scrollY - 88;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }, 80);
        return () => clearTimeout(timer);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  const orgSchema = buildOrganizationSchema({
    name: "Football Academy",
    url: window.location.origin,
    phone: "+977-98XXXXXXXX",
    email: "academy@example.com",
    address: { city: "Nepal", country: "NP" },
  });

  return (
    <div className="app-shell">
      <SEO
        description="Professional football coaching academy offering group sessions, 1-to-1 coaching, and goalkeeper training. Book your place online today."
        jsonLd={[orgSchema]}
      />
      <Navbar mode="overlay" />

      <section
        className="relative min-h-[88vh] overflow-hidden px-6 pt-20 pb-28 lg:px-10 lg:pt-28 lg:pb-36"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(17, 17, 17, 0.72) 0%, rgba(17, 17, 17, 0.56) 38%, rgba(17, 17, 17, 0.28) 100%), url('https://i.pinimg.com/1200x/81/d9/b5/81d9b59b6a53801b9c94bbb5df584cc2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-app-bg" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-brand-primary-soft">
              Elite Football Development
            </p>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Train smarter, improve faster, and perform with confidence.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">
              Professional football coaching designed to improve technique,
              movement, decision-making, and match confidence for every player.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/training-sessions">
                <Button size="lg">Book Your First Session</Button>
              </Link>

              <Link to="/coaches">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/40 bg-white/10 text-white hover:border-white hover:bg-white/15 hover:text-white"
                >
                  Meet Our Coaches
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 text-sm text-white/75">
              {["Structured coaching", "Flexible bookings", "Player-first development"].map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 animate-bounce flex-col items-center gap-1.5 lg:flex">
          <span className="text-xs font-medium uppercase tracking-widest text-white/40">Scroll</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white/40">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
        </div>
      </section>

      <section className="relative z-10 -mt-14 px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            { value: "100+", label: "Training Sessions", Icon: CalendarIcon },
            { value: "Expert", label: "Coach-Led Development", Icon: TargetIcon },
            { value: "All Levels", label: "Youth to Competitive Players", Icon: GroupIcon },
            { value: "Flexible", label: "Easy Online Booking", Icon: TrendingIcon },
          ].map((item) => (
            <Card key={item.label} className="h-full">
              <CardContent className="p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-primary">
                  <item.Icon />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight text-app-text">
                  {item.value}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-app-text-soft">
                  {item.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 pt-24 pb-16 lg:px-10 lg:pt-28 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
              Programs
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
              Training designed around real player development
            </h2>
            <p className="mt-4 text-lg leading-8 text-app-text-soft">
              Choose from structured sessions that target technical growth,
              physical sharpness, and match performance.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: "Group Training",
                description:
                  "Improve technical ability, awareness, and decision-making in high-quality academy group sessions.",
                Icon: GroupIcon,
              },
              {
                title: "1-to-1 Coaching",
                description:
                  "Focused individual coaching built around your strengths, weaknesses, and performance goals.",
                Icon: PersonIcon,
              },
              {
                title: "Goalkeeper Training",
                description:
                  "Specialist goalkeeper sessions covering handling, reactions, positioning, footwork, and confidence.",
                Icon: GoalIcon,
              },
            ].map((program) => (
              <Card key={program.title} className="group h-full transition-shadow duration-300 hover:shadow-[var(--shadow-premium)]">
                <CardContent className="flex h-full flex-col p-8">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-primary">
                    <program.Icon />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-app-text">
                    {program.title}
                  </h3>
                  <p className="mt-4 flex-1 leading-7 text-app-text-soft">
                    {program.description}
                  </p>
                  <Link
                    to="/training-sessions"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary transition-opacity hover:opacity-75"
                  >
                    View sessions
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-app-surface py-16 lg:py-24">
        <div id="about" className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-center lg:px-10">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
              About Us
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
              Building better players through structured football coaching
            </h2>
            <p className="mt-5 leading-8 text-app-text-soft">
              Football Academy is focused on developing players through
              professional coaching, structured training environments, and
              consistent football education.
            </p>
            <p className="mt-4 leading-8 text-app-text-soft">
              We help players improve technical ability, movement, match
              awareness, confidence, and discipline through sessions designed
              for long-term progress rather than short-term results.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Professional coaching approach",
                "Player-first development",
                "Structured session planning",
                "Supportive learning environment",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-app-border bg-app-card p-4 text-sm font-medium text-app-text-soft shadow-[var(--shadow-soft)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-app-border bg-app-card shadow-[var(--shadow-premium)]">
            <img
              src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80"
              alt="Football coaching session"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section
        id="gallery"
        className="scroll-mt-20 px-6 py-16 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
              Gallery
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
              A look inside our training environment
            </h2>
            <p className="mt-4 text-lg leading-8 text-app-text-soft">
              See the intensity, focus, and professionalism behind our football
              development sessions.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {galleryLoaded && galleryItems.length > 0
              ? galleryItems.map((item) => (
                  <HomeGalleryCard
                    key={item.id}
                    item={item}
                    onOpen={setLightboxItem}
                  />
                ))
              : staticGalleryImages.map((image, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[1.5rem] border border-app-border bg-app-card shadow-[var(--shadow-soft)]"
                >
                  <img
                    src={image}
                    alt={`Football Academy gallery ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="h-72 w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>
              ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/gallery">
              <Button variant="outline" size="lg">
                Visit Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-app-surface py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
              Why Choose Us
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
              More than training sessions
            </h2>
            <p className="mt-4 text-lg leading-8 text-app-text-soft">
              We help players build the habits, discipline, and confidence
              needed to perform better in real matches.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Structured Coaching",
                description:
                  "Sessions are planned with clear outcomes instead of random drills.",
                Icon: TargetIcon,
              },
              {
                title: "Player-Focused Development",
                description:
                  "Training is designed to improve technical ability and game understanding.",
                Icon: PersonIcon,
              },
              {
                title: "Easy Booking Experience",
                description:
                  "Browse sessions, reserve your place, and manage bookings easily.",
                Icon: CalendarIcon,
              },
              {
                title: "Long-Term Progress",
                description:
                  "We focus on continuous development, not just one good session.",
                Icon: TrendingIcon,
              },
            ].map((item) => (
              <Card key={item.title} className="h-full">
                <CardContent className="p-7">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-primary">
                    <item.Icon />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-app-text">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-7 text-app-text-soft">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-10 lg:py-24">
        <div id="contact" className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
              Contact Us
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
              Enquire about training, programs, or player development
            </h2>
            <p className="mt-5 leading-8 text-app-text-soft">
              Whether you are looking for academy training, individual coaching,
              or more information about available programs, send us a message
              and we will get back to you.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-[1.25rem] border border-app-border bg-app-card p-5 shadow-[var(--shadow-soft)]">
                <p className="text-sm text-app-text-muted">Phone</p>
                <p className="mt-2 font-semibold text-app-text">
                  +977-98XXXXXXXX
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-app-border bg-app-card p-5 shadow-[var(--shadow-soft)]">
                <p className="text-sm text-app-text-muted">Email</p>
                <p className="mt-2 font-semibold text-app-text">
                  academy@example.com
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-app-border bg-app-card p-5 shadow-[var(--shadow-soft)]">
                <p className="text-sm text-app-text-muted">Location</p>
                <p className="mt-2 font-semibold text-app-text">
                  Your academy training location
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold tracking-tight text-app-text">
                Send an enquiry
              </h3>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />

                <Select
                  label="Interested Program"
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  options={programOptions}
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-app-text">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Tell us what you are looking for..."
                    className="w-full rounded-2xl border border-app-border bg-app-card px-4 py-3 text-sm text-app-text outline-none transition placeholder:text-app-text-muted focus:border-brand-primary"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  loading={submitting}
                  disabled={submitting}
                  className="w-full"
                >
                  Send Enquiry
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-app-border bg-app-card p-10 text-center shadow-[var(--shadow-premium)]">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
            Start Today
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
            Ready to take your game to the next level?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-app-text-soft">
            Join the academy, explore available sessions, and begin your player
            development journey.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/training-sessions">
              <Button size="lg">Book Your First Session</Button>
            </Link>

            <Link to="/register">
              <Button variant="outline" size="lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {lightboxItem && (
        <Lightbox
          item={lightboxItem}
          onClose={() => setLightboxItem(null)}
        />
      )}
    </div>
  );
}

export default HomePage;