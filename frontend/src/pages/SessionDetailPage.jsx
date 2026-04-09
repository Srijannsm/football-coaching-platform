import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import SEO, { buildTrainingSessionSchema } from "../components/SEO";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";
import PaymentMethodSelector from "../components/ui/PaymentMethodSelector";
import { Card, CardContent } from "../components/ui/Card";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { getTrainingSessionDetail } from "../services/trainingSessionService";
import { createBooking } from "../services/bookingService";
import { formatDate } from "../utils/formatDate";
import { formatSessionTimeRange } from "../utils/formatSessionTimeRange";

// ── Icons ─────────────────────────────────────────────────────────────────────

function CalendarIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MapPinIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UserIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function UsersIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CheckCircleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function InfoIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function XIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ArrowLeftIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

// ── Booking Confirmation Modal ─────────────────────────────────────────────────

function ModalRow({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
      <span className="text-app-text-muted">{label}</span>
      <span className={`text-right font-semibold ${highlight ? "text-base text-brand-primary" : "text-app-text"}`}>
        {value}
      </span>
    </div>
  );
}

function BookingConfirmationModal({ session, paymentMethod, user, onConfirm, onCancel, loading }) {
  const [visible, setVisible] = useState(false);

  // Trigger enter animation after mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel, loading]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget && !loading) onCancel();
  }

  const paymentLabel =
    paymentMethod === "cash" ? "Cash (pay in person)" :
    paymentMethod === "esewa" ? "eSewa" :
    paymentMethod === "khalti" ? "Khalti" :
    paymentMethod;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center transition-all duration-300 ${
        visible ? "bg-black/60" : "bg-black/0"
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div
        className={`w-full max-w-md overflow-hidden rounded-2xl border border-app-border bg-app-card shadow-2xl transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-app-border px-6 py-4">
          <div>
            <h2 id="booking-modal-title" className="text-lg font-bold text-app-text">
              Confirm Booking
            </h2>
            <p className="mt-0.5 text-xs text-app-text-muted">Review your details before confirming</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="ml-4 mt-0.5 rounded-lg p-1.5 text-app-text-muted transition-colors hover:bg-app-surface-2 hover:text-app-text disabled:cursor-not-allowed"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          <div className="divide-y divide-app-border overflow-hidden rounded-xl border border-app-border bg-app-surface-2">
            <ModalRow label="Session" value={session.program_title || "Training Session"} />
            <ModalRow label="Date" value={formatDate(session.session_date)} />
            <ModalRow label="Time" value={formatSessionTimeRange(session.start_time, session.end_time)} />
            <ModalRow label="Coach" value={session.coach_full_name || "Not assigned"} />
            <ModalRow label="Location" value={session.location || "Not set"} />
            <ModalRow label="Payment" value={paymentLabel} />
            <ModalRow label="Total" value={`Rs. ${session.price}`} highlight />
          </div>

          {user?.first_name && (
            <p className="text-xs text-app-text-muted">
              Booking as{" "}
              <span className="font-semibold text-app-text">
                {user.first_name} {user.last_name || ""}
              </span>
            </p>
          )}

          {paymentMethod === "cash" && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
              <span className="mt-0.5 shrink-0"><InfoIcon /></span>
              <span>
                Cash bookings are <strong>pending</strong> until an admin confirms your spot. You'll be notified once approved.
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-app-border px-6 py-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            loading={loading}
            loadingText="Booking…"
            className="flex-1"
          >
            Yes, book it
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface-2 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-app-text">{value}</p>
      </div>
    </div>
  );
}

// ── Capacity Bar ──────────────────────────────────────────────────────────────

function CapacityBar({ booked, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((booked / max) * 100)) : 0;
  const available = max - booked;
  const isAlmostFull = available <= 2 && available > 0;
  const isFull = available <= 0;

  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-medium">
        <span className="text-app-text-muted">{booked} / {max} booked</span>
        <span className={isFull ? "font-bold text-app-danger-text" : isAlmostFull ? "font-bold text-amber-600 dark:text-amber-400" : "text-app-text-muted"}>
          {isFull ? "Full" : isAlmostFull ? `Only ${available} ${available === 1 ? "spot" : "spots"} left!` : `${available} available`}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-app-surface-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isFull ? "bg-app-danger-text" : isAlmostFull ? "bg-amber-500" : "bg-brand-primary"}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={booked}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

// ── Coach Card ────────────────────────────────────────────────────────────────

function CoachCard({ name }) {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-app-border bg-app-surface-2 p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-purple-600 text-sm font-bold text-white select-none">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">Your Coach</p>
        <p className="mt-0.5 truncate text-base font-bold text-app-text">{name}</p>
      </div>
      <Link
        to="/coaches"
        className="shrink-0 rounded-lg border border-app-border px-3 py-1.5 text-xs font-semibold text-app-text-muted transition-colors hover:border-brand-primary/60 hover:text-brand-primary"
      >
        View profiles →
      </Link>
    </div>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  { n: "1", title: "Choose & book", desc: "Pick a session and confirm with one tap" },
  { n: "2", title: "Pay on the day", desc: "Cash payment at the venue — no upfront charge" },
  { n: "3", title: "Show up & train", desc: "Arrive ready and improve your game" },
];

function HowItWorks() {
  return (
    <div className="mt-8">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-app-text-muted">How it works</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {HOW_IT_WORKS.map((step) => (
          <div key={step.n} className="flex gap-3 rounded-2xl border border-app-border bg-app-surface-2 p-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-black text-brand-primary">
              {step.n}
            </div>
            <div>
              <p className="text-sm font-semibold text-app-text">{step.title}</p>
              <p className="mt-0.5 text-xs text-app-text-muted">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function SessionDetailPage() {
  const { showToast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showModal, setShowModal] = useState(false);

  const loadSessionDetail = useCallback(async () => {
    try {
      setError("");
      const data = await getTrainingSessionDetail(id);
      setSession(data);
    } catch (err) {
      console.error("Failed to load session detail:", err);
      if (err.response?.status === 404) {
        setError("Session not found.");
      } else {
        setError("Failed to load session details.");
      }
    }
  }, [id]);

  const loadPageData = useCallback(async () => {
    try {
      setLoading(true);
      await loadSessionDetail();
    } finally {
      setLoading(false);
    }
  }, [loadSessionDetail]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  function handleBookSession() {
    if (session?.is_booked_by_current_user) {
      showToast("You have already booked this session.", "error");
      return;
    }
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setShowModal(true);
  }

  async function handleConfirmBooking() {
    try {
      setBookingLoading(true);
      await createBooking(session.id, paymentMethod);
      setShowModal(false);
      await loadPageData();
      if (paymentMethod === "cash") {
        showToast("Booking submitted. Awaiting admin confirmation.", "success");
      } else {
        showToast("Booking confirmed.", "success");
      }
    } catch (err) {
      console.error("Booking failed:", err);
      setShowModal(false);
      if (err.response?.status === 401) {
        showToast("Your session expired. Please log in again.", "error");
        logout();
        navigate("/login", { state: { from: location } });
        return;
      }
      if (err.response?.data?.session) {
        const sessionError = err.response.data.session;
        showToast(Array.isArray(sessionError) ? sessionError[0] : sessionError, "error");
      } else if (err.response?.data?.detail) {
        showToast(err.response.data.detail, "error");
      } else if (err.response?.data?.non_field_errors) {
        showToast(err.response.data.non_field_errors[0], "error");
      } else {
        showToast("Failed to book this session.", "error");
      }
    } finally {
      setBookingLoading(false);
    }
  }

  const isFull = session?.is_full;
  const isAlreadyBooked = session?.is_booked_by_current_user;
  const isPast = session?.session_date
    ? new Date(session.session_date) < new Date(new Date().toDateString())
    : false;

  const badgeStatus = useMemo(() => {
    if (isAlreadyBooked) return "booked";
    if (isFull) return "full";
    return "open";
  }, [isAlreadyBooked, isFull]);

  const bookingButtonText = useMemo(() => {
    if (isAlreadyBooked) return "Already Booked";
    if (isPast) return "Session Ended";
    if (isFull) return "Session Full";
    if (!isAuthenticated) return "Login to Book";
    return "Book Session";
  }, [isAlreadyBooked, isPast, isFull, isAuthenticated]);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        {/* Hero skeleton */}
        <div className="h-64 animate-pulse bg-app-surface-2 md:h-80 lg:h-96" />
        <div className="mx-auto max-w-6xl px-6 py-6 pb-24 lg:px-10 lg:pb-12">
          {/* Badge row */}
          <div className="mb-5 flex gap-2">
            <div className="h-8 w-24 animate-pulse rounded-lg bg-app-surface-2" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-app-surface-2" />
          </div>
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <div className="h-5 w-full animate-pulse rounded bg-app-surface-2" />
              <div className="h-5 w-5/6 animate-pulse rounded bg-app-surface-2" />
              <div className="h-5 w-4/5 animate-pulse rounded bg-app-surface-2" />
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-app-surface-2" />)}
              </div>
              <div className="h-16 animate-pulse rounded-2xl bg-app-surface-2" />
            </div>
            <div className="space-y-3">
              <div className="h-48 animate-pulse rounded-2xl bg-app-surface-2" />
              <div className="h-24 animate-pulse rounded-2xl bg-app-surface-2" />
              <div className="h-11 animate-pulse rounded-xl bg-app-surface-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error || !session) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-28 lg:px-10">
          <EmptyState
            title="Session Detail"
            description={error || "Session not found."}
            action={
              <div className="flex flex-wrap justify-center gap-3">
                {error !== "Session not found." && (
                  <Button type="button" onClick={loadPageData}>Try Again</Button>
                )}
                <Link to="/training-sessions">
                  <Button variant="outline">Back to Sessions</Button>
                </Link>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  const sessionUrl = `${window.location.origin}/training-sessions/${session.id}`;
  const sessionSchema = buildTrainingSessionSchema({ session, url: sessionUrl });
  const isOneToOne = session.session_type === "one_to_one";
  const availableSlots = session.available_slots ?? (session.max_players - session.booked_players_count);
  const isAlmostFull = availableSlots <= 2 && availableSlots > 0 && !isFull;
  const canBook = !isAlreadyBooked && !isFull && !isPast && isAuthenticated;

  return (
    <div className="app-shell">
      <SEO
        title={session.program_title || "Training Session"}
        description={`${session.session_type?.replace("_", " ")} training session on ${session.session_date} at ${session.location || "Football Academy"}. Rs. ${session.price}. Book your place now.`}
        canonical={sessionUrl}
        jsonLd={[sessionSchema]}
      />
      <Navbar />

      {/* Booking confirmation modal */}
      {showModal && (
        <BookingConfirmationModal
          session={session}
          paymentMethod={paymentMethod}
          user={user}
          onConfirm={handleConfirmBooking}
          onCancel={() => !bookingLoading && setShowModal(false)}
          loading={bookingLoading}
        />
      )}

      {/* ── Full-bleed hero ──────────────────────────────────────────────── */}
      <div className="relative h-64 overflow-hidden md:h-80 lg:h-96">
        {session.hero_image ? (
          <img
            src={session.hero_image}
            alt={session.program_title || "Training session"}
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="relative h-full w-full bg-gradient-to-br from-brand-primary/20 via-app-card to-purple-600/15">
            {/* Subtle football pitch lines */}
            <svg
              className="absolute inset-0 h-full w-full text-app-text opacity-[0.04]"
              viewBox="0 0 900 400"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="60" y="20" width="780" height="360" />
              <line x1="450" y1="20" x2="450" y2="380" />
              <circle cx="450" cy="200" r="70" />
              <circle cx="450" cy="200" r="5" fill="currentColor" />
              <rect x="60" y="130" width="90" height="140" />
              <rect x="750" y="130" width="90" height="140" />
              <rect x="60" y="162" width="45" height="76" />
              <rect x="795" y="162" width="45" height="76" />
              <path d="M60 200 Q105 160 150 200 Q105 240 60 200" />
              <path d="M840 200 Q795 160 750 200 Q795 240 840 200" />
            </svg>
          </div>
        )}

        {/* Dark gradient — stronger at bottom for legible text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />

        {/* Title overlay */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-7 md:px-10">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl">
              {session.program_title || "Training Session"}
            </h1>
            {session.coach_full_name && (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-white/80">
                <UserIcon size={14} />
                with {session.coach_full_name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 pb-28 pt-6 lg:px-10 lg:pb-12">

        {/* Breadcrumb + status chips */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Link to="/training-sessions">
            <Button variant="outline" size="sm">
              <span className="flex items-center gap-1.5">
                <ArrowLeftIcon /> Sessions
              </span>
            </Button>
          </Link>
          <StatusBadge status={badgeStatus} />
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            isOneToOne
              ? "bg-purple-500/10 text-purple-700 dark:text-purple-400"
              : "bg-brand-primary-soft text-app-text"
          }`}>
            {isOneToOne ? "1-on-1" : "Group"}
          </span>
          {isAlmostFull && (
            <span className="animate-pulse rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Only {availableSlots} {availableSlots === 1 ? "spot" : "spots"} left!
            </span>
          )}
        </div>

        {/* Past session banner */}
        {isPast && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            <span className="shrink-0"><InfoIcon /></span>
            <span>This session has already taken place and is no longer available for booking.</span>
          </div>
        )}

        {/* Already booked success banner */}
        {isAlreadyBooked && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-green-400/30 bg-green-500/10 px-5 py-4 text-green-700 dark:text-green-400">
            <span className="mt-0.5 shrink-0"><CheckCircleIcon size={18} /></span>
            <div>
              <p className="text-sm font-semibold">You're booked in — see you on the pitch!</p>
              <p className="mt-0.5 text-xs text-green-600 dark:text-green-500">
                Track your booking in your{" "}
                <Link to="/player-dashboard" className="font-medium underline underline-offset-2">
                  Dashboard
                </Link>.
              </p>
            </div>
          </div>
        )}

        {/* ── 2-col layout ─────────────────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">

          {/* ── Left: content ── */}
          <div>
            {/* Description */}
            <p className="text-base leading-8 text-app-text-soft">
              {session.notes?.trim()
                ? session.notes
                : "Join this academy session to sharpen your technical skills, build game intelligence, and train in a focused, professional environment."}
            </p>

            {/* Key stats grid */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <StatCard icon={<CalendarIcon />} label="Date" value={formatDate(session.session_date)} />
              <StatCard icon={<ClockIcon />} label="Time" value={formatSessionTimeRange(session.start_time, session.end_time)} />
              <StatCard icon={<MapPinIcon />} label="Location" value={session.location || "TBC"} />
              <StatCard icon={<UsersIcon />} label="Session type" value={isOneToOne ? "1-on-1 Private" : "Group Training"} />
            </div>

            {/* Coach section */}
            {session.coach_full_name && (
              <div className="mt-6">
                <CoachCard name={session.coach_full_name} />
              </div>
            )}

            {/* How it works (only for upcoming, unbooked sessions) */}
            {!isAlreadyBooked && !isPast && <HowItWorks />}
          </div>

          {/* ── Right: sticky booking card ── */}
          <div className="lg:sticky lg:top-24">
            <Card>
              <CardContent className="space-y-5 p-5">

                {/* Price */}
                <div className="flex items-end justify-between border-b border-app-border pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">Session fee</p>
                    <p className="mt-1 text-4xl font-black tracking-tight">
                      <span className="text-app-text-muted text-2xl font-bold">Rs.</span>
                      <span className="text-brand-primary"> {session.price}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">Format</p>
                    <p className="mt-0.5 text-sm font-bold text-app-text">
                      {isOneToOne ? "Private" : "Group"}
                    </p>
                  </div>
                </div>

                {/* Capacity */}
                <div className="rounded-xl border border-app-border bg-app-surface-2 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-app-text-muted">
                    Availability
                  </p>
                  <CapacityBar
                    booked={session.booked_players_count}
                    max={session.max_players}
                  />
                </div>

                {/* Payment method selector */}
                {canBook && (
                  <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
                )}

                {/* CTA button */}
                <Button
                  type="button"
                  onClick={handleBookSession}
                  disabled={isAlreadyBooked || isFull || isPast || bookingLoading}
                  loading={bookingLoading}
                  variant={canBook ? "primary" : "secondary"}
                  size="lg"
                  className="w-full"
                >
                  {isAlreadyBooked
                    ? <><CheckCircleIcon size={18} /> Already Booked</>
                    : bookingButtonText}
                </Button>

                {/* Contextual hints below CTA */}
                {!isAuthenticated && !isPast && (
                  <p className="text-center text-xs text-app-text-muted">
                    <Link to="/login" className="font-medium text-brand-primary hover:underline">Log in</Link>
                    {" "}or{" "}
                    <Link to="/register" className="font-medium text-brand-primary hover:underline">create an account</Link>
                    {" "}to book your spot.
                  </p>
                )}
                {isAuthenticated && canBook && user?.first_name && (
                  <p className="text-center text-xs text-app-text-muted">
                    Booking as{" "}
                    <span className="font-semibold text-app-text">{user.first_name}</span>
                  </p>
                )}
                {isAlreadyBooked && (
                  <p className="text-center text-xs text-app-text-muted">
                    <Link to="/player-dashboard" className="font-medium text-brand-primary hover:underline">
                      View in Dashboard →
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky CTA ─────────────────────────────────────────────── */}
      {!isAlreadyBooked && !isPast && !isFull && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-app-border bg-app-card/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs text-app-text-muted">Session fee</p>
              <p className="text-lg font-black text-app-text">
                Rs. <span className="text-brand-primary">{session.price}</span>
              </p>
            </div>
            <Button
              type="button"
              onClick={handleBookSession}
              disabled={bookingLoading}
              loading={bookingLoading}
              variant="primary"
              className="flex-1"
            >
              {isAuthenticated ? "Book Session" : "Login to Book"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionDetailPage;
