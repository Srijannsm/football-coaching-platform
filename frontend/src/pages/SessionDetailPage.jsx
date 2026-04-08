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

function DetailItem({ label, value }) {
  return (
    <div className="rounded-[1.25rem] border border-app-border bg-app-surface-2 p-4">
      <p className="text-sm font-medium text-app-text-muted">{label}</p>
      <p className="mt-2 text-lg font-bold text-app-text">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, bordered = true }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${bordered ? "border-b border-app-border pb-4" : "pb-2"
        }`}
    >
      <span className="text-app-text-soft">{label}</span>
      <span className="font-bold text-app-text">{value}</span>
    </div>
  );
}

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
  const [confirmingBooking, setConfirmingBooking] = useState(false);

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

    // Show inline confirmation step instead of booking immediately
    setConfirmingBooking(true);
  }

  async function handleConfirmBooking() {
    try {
      setBookingLoading(true);
      setConfirmingBooking(false);

      await createBooking(session.id, paymentMethod);
      await loadPageData();

      if (paymentMethod === "cash") {
        showToast("Booking submitted. Awaiting admin confirmation.", "success");
      } else {
        showToast("Booking confirmed.", "success");
      }
    } catch (err) {
      console.error("Booking failed:", err);

      if (err.response?.status === 401) {
        showToast("Your session expired. Please log in again.", "error");
        logout();
        navigate("/login", {
          state: { from: location },
        });
        return;
      }

      if (err.response?.data?.session) {
        const sessionError = err.response.data.session;
        showToast(
          Array.isArray(sessionError) ? sessionError[0] : sessionError,
          "error"
        );
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
    if (confirmingBooking) return "Confirm Booking";
    return "Book Session";
  }, [isAlreadyBooked, isPast, isFull, isAuthenticated, confirmingBooking]);

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-28 lg:px-10">
          <EmptyState
            title="Loading session details..."
            description="Please wait while we fetch the full session information."
          />
        </div>
      </div>
    );
  }

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
                  <Button type="button" onClick={loadPageData}>
                    Try Again
                  </Button>
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

  return (
    <div className="app-shell">
      <SEO
        title={session.program_title || "Training Session"}
        description={`${session.session_type?.replace("_", " ")} training session on ${session.session_date} at ${session.location || "Football Academy"}. Rs. ${session.price}. Book your place now.`}
        canonical={sessionUrl}
        jsonLd={[sessionSchema]}
      />
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pt-32 pb-12 lg:px-10">
        {isPast && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>This session has already taken place and is no longer available for booking.</span>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Link to="/training-sessions">
            <Button variant="outline">← Back to Sessions</Button>
          </Link>

          <StatusBadge status={badgeStatus} />

          <span className="rounded-full bg-brand-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-app-text">
            {session.session_type || "Training"}
          </span>
        </div>

        <Card className="overflow-hidden">
          {session.hero_image ? (
            <img
              src={session.hero_image}
              alt={session.program_title || "Training session"}
              loading="lazy"
              decoding="async"
              className="h-72 w-full object-cover md:h-96"
            />
          ) : (
            <div className="flex h-72 w-full items-center justify-center border-b border-app-border bg-app-surface-2 text-sm text-app-text-muted md:h-96">
              No session image
            </div>
          )}

          <CardContent className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-app-text md:text-4xl">
                {session.program_title || "Training Session"}
              </h1>

              <p className="mt-4 text-lg leading-8 text-app-text-soft">
                {session.notes?.trim()
                  ? session.notes
                  : "Join this academy session to improve your football development with structured coaching and a professional training environment."}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <DetailItem
                  label="Coach"
                  value={session.coach_full_name || "Not assigned"}
                />
                <DetailItem
                  label="Date"
                  value={formatDate(session.session_date)}
                />
                <DetailItem
                  label="Time"
                  value={formatSessionTimeRange(
                    session.start_time,
                    session.end_time
                  )}
                />
                <DetailItem
                  label="Location"
                  value={session.location || "Not set"}
                />
              </div>
            </div>

            <Card className="shadow-none">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold tracking-tight text-app-text">
                  Booking Summary
                </h2>

                <div className="mt-6 space-y-4 text-sm">
                  <SummaryRow label="Price" value={`Rs. ${session.price}`} />
                  <SummaryRow label="Max Players" value={session.max_players} />
                  <SummaryRow
                    label="Booked Players"
                    value={session.booked_players_count}
                  />
                  <SummaryRow
                    label="Available Slots"
                    value={session.available_slots}
                    bordered={false}
                  />
                </div>

                {!isAlreadyBooked && !isFull && !isPast && (
                  <div className="mt-6 border-t border-app-border pt-5">
                    <PaymentMethodSelector
                      value={paymentMethod}
                      onChange={setPaymentMethod}
                    />
                  </div>
                )}

                {confirmingBooking ? (
                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-brand-primary/30 bg-brand-primary/5 px-4 py-3 text-sm text-app-text-soft">
                      <p className="font-semibold text-app-text">Confirm your booking</p>
                      <p className="mt-1">
                        <span className="font-medium">{session.program_title}</span> · {paymentMethod === "cash" ? "Pay in person (cash)" : paymentMethod}
                      </p>
                      {user?.first_name && (
                        <p className="mt-1 text-xs text-app-text-muted">Booking as {user.first_name}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={handleConfirmBooking}
                      loading={bookingLoading}
                      disabled={bookingLoading}
                      variant="primary"
                      className="w-full"
                    >
                      Yes, Book Session
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setConfirmingBooking(false)}
                      disabled={bookingLoading}
                      variant="outline"
                      className="w-full"
                    >
                      Go Back
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={handleBookSession}
                      disabled={isAlreadyBooked || isFull || isPast || bookingLoading}
                      loading={bookingLoading}
                      variant={isAlreadyBooked || isFull || isPast ? "secondary" : "primary"}
                      className="mt-6 w-full"
                    >
                      {bookingButtonText}
                    </Button>

                    {!isAuthenticated && (
                      <p className="mt-4 text-sm text-app-text-muted">
                        Log in to reserve your place in this session.
                      </p>
                    )}

                    {isAuthenticated && user?.first_name && !isAlreadyBooked && !isFull && !isPast && (
                      <p className="mt-4 text-sm text-app-text-muted">
                        Booking as <span className="font-medium text-app-text">{user.first_name}</span>.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default SessionDetailPage;