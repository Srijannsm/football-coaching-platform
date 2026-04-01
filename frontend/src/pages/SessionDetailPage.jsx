import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";
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
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

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

  async function handleBookSession() {
    if (session?.is_booked_by_current_user) {
      setBookingError("You have already booked this session.");
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: location },
      });
      return;
    }

    try {
      setBookingError("");
      setBookingLoading(true);

      await createBooking(session.id);
      await loadPageData();

      showToast("Booking successful.", "success");
    } catch (err) {
      console.error("Booking failed:", err);

      if (err.response?.status === 401) {
        setBookingError("Your session expired. Please log in again.");
        logout();
        navigate("/login", {
          state: { from: location },
        });
        return;
      }

      if (err.response?.data?.session) {
        const sessionError = err.response.data.session;
        setBookingError(
          Array.isArray(sessionError) ? sessionError[0] : sessionError
        );
      } else if (err.response?.data?.detail) {
        setBookingError(err.response.data.detail);
      } else if (err.response?.data?.non_field_errors) {
        setBookingError(err.response.data.non_field_errors[0]);
      } else {
        setBookingError("Failed to book this session.");
      }
    } finally {
      setBookingLoading(false);
    }
  }

  const isFull = session?.is_full;
  const isAlreadyBooked = session?.is_booked_by_current_user;

  const badgeStatus = useMemo(() => {
    if (isAlreadyBooked) return "booked";
    if (isFull) return "full";
    return "open";
  }, [isAlreadyBooked, isFull]);

  const bookingButtonText = useMemo(() => {
    if (isAlreadyBooked) return "Already Booked";
    if (isFull) return "Session Full";
    if (bookingLoading) return "Booking...";
    if (!isAuthenticated) return "Login to Book";
    return "Book Session";
  }, [isAlreadyBooked, isFull, bookingLoading, isAuthenticated]);

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
              <Link to="/training-sessions">
                <Button>Back to Sessions</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 pt-32 pb-12 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Link to="/training-sessions">
            <Button variant="outline">← Back to Sessions</Button>
          </Link>

          <StatusBadge status={badgeStatus} />

          <span className="rounded-full bg-brand-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-app-text">
            {session.session_type || "Training"}
          </span>
        </div>

        {bookingError && (
          <Alert variant="error" className="mb-6">
            {bookingError}
          </Alert>
        )}

        <Card className="overflow-hidden">
          {session.hero_image ? (
            <img
              src={session.hero_image}
              alt={session.program_title || "Training session"}
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

                <Button
                  type="button"
                  onClick={handleBookSession}
                  disabled={isAlreadyBooked || isFull || bookingLoading}
                  variant={
                    isAlreadyBooked || isFull || bookingLoading
                      ? "secondary"
                      : "primary"
                  }
                  className="mt-8 w-full"
                >
                  {bookingButtonText}
                </Button>

                {!isAuthenticated && (
                  <p className="mt-4 text-sm text-app-text-muted">
                    Log in to reserve your place in this session.
                  </p>
                )}

                {isAuthenticated && user?.first_name && (
                  <p className="mt-4 text-sm text-app-text-muted">
                    Booking as {user.first_name}.
                  </p>
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