import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";
import { Card, CardContent } from "../components/ui/Card";
import { useToast } from "../context/ToastContext";
import { getTrainingSessionDetail } from "../services/trainingSessionService";
import { createBooking } from "../services/bookingService";
import { getCurrentUser } from "../services/authService";
import { formatDate } from "../utils/formatDate";
import { formatSessionTimeRange } from "../utils/formatSessionTimeRange";

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/70 p-4">
      <p className="text-sm font-medium text-neutral-400">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, bordered = true }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${bordered ? "border-b border-white/10 pb-4" : "pb-2"
        }`}
    >
      <span className="text-neutral-400">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}

function SessionDetailPage() {
  const { showToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const isAuthenticated = !!localStorage.getItem("accessToken");

  async function loadSessionDetail() {
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
  }

  async function loadCurrentUser() {
    if (!isAuthenticated) {
      setUser(null);
      return;
    }

    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch current user:", err);
      setUser(null);
    }
  }

  async function loadPageData() {
    try {
      setLoading(true);
      await Promise.all([loadSessionDetail(), loadCurrentUser()]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, [id]);

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

      await createBooking({ session: session.id });
      await loadPageData();

      showToast("Booking successful.", "success");
    } catch (err) {
      console.error("Booking failed:", err);

      if (err.response?.status === 401) {
        setBookingError("Your session expired. Please log in again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        navigate("/login", {
          state: { redirectTo: location.pathname },
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

  const bookingButtonClassName = useMemo(() => {
    if (isAlreadyBooked || isFull || bookingLoading) {
      return "mt-8 w-full cursor-not-allowed rounded-full bg-neutral-700 text-neutral-300 hover:bg-neutral-700";
    }

    if (!isAuthenticated) {
      return "mt-8 w-full rounded-full border border-white/10 bg-emerald-800 text-white hover:bg-emerald-700";
    }

    return "mt-8 w-full rounded-full bg-yellow-400 text-black hover:bg-yellow-300";
  }, [isAlreadyBooked, isFull, bookingLoading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-24 lg:px-10">
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
      <div className="min-h-screen bg-neutral-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-24 lg:px-10">
          <EmptyState
            title="Session Detail"
            description={error || "Session not found."}
            className="border-red-500/20"
            action={
              <Link to="/training-sessions">
                <Button className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
                  Back to Sessions
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Link to="/training-sessions">
            <Button
              variant="outline"
              className="rounded-full border-white/10 bg-transparent text-white hover:border-yellow-400 hover:text-yellow-400"
            >
              ← Back to Sessions
            </Button>
          </Link>

          <StatusBadge status={badgeStatus} />

          <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-400">
            {session.session_type || "Training"}
          </span>
        </div>

        {bookingError && (
          <Alert variant="error" className="mb-6">
            {bookingError}
          </Alert>
        )}

        <Card className="overflow-hidden border-white/10 bg-white/5 shadow-xl backdrop-blur">
          {session.hero_image ? (
            <img
              src={session.hero_image}
              alt={session.program_title || "Training session"}
              className="h-72 w-full object-cover md:h-96"
            />
          ) : (
            <div className="flex h-72 w-full items-center justify-center bg-neutral-900 text-sm text-neutral-500 md:h-96">
              No session image
            </div>
          )}

          <CardContent className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <h1 className="text-3xl font-extrabold md:text-4xl">
                {session.program_title || "Training Session"}
              </h1>

              <p className="mt-4 text-lg leading-8 text-neutral-300">
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

            <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-6">
              <h2 className="text-2xl font-extrabold text-white">
                Booking Summary
              </h2>

              <div className="mt-6 space-y-4 text-sm text-neutral-300">
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
                className={bookingButtonClassName}
              >
                {bookingButtonText}
              </Button>

              {!isAuthenticated && (
                <p className="mt-4 text-sm text-neutral-400">
                  Log in to reserve your place in this session.
                </p>
              )}

              {isAuthenticated && user?.first_name && (
                <p className="mt-4 text-sm text-neutral-400">
                  Booking as {user.first_name}.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default SessionDetailPage;