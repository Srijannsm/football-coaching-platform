import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";
import { Card, CardContent } from "../components/ui/Card";

function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("accessToken")
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  async function fetchSessionDetail() {
    try {
      setError("");
      const response = await api.get(`/training-sessions/${id}/`);
      setSession(response.data);
    } catch (err) {
      console.error("Failed to load session detail:", err);

      if (err.response?.status === 404) {
        setError("Session not found.");
      } else {
        setError("Failed to load session details.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchCurrentUser() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    // token exists, so keep user authenticated unless backend proves otherwise
    setIsAuthenticated(true);

    try {
      const response = await api.get("/me/");
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch current user:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }

  useEffect(() => {
    fetchSessionDetail();
    fetchCurrentUser();
  }, [id]);

  async function handleBookSession() {
    if (session?.is_booked_by_current_user) {
      setBookingError("You have already booked this session.");
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setBookingMessage("");
      setBookingError("");
      setBookingLoading(true);

      await api.post("/bookings/", {
        session: session.id,
      });

      setBookingMessage("Session booked successfully.");
      await fetchSessionDetail();
      await fetchCurrentUser();
    } catch (err) {
      console.error("Booking failed:", err);

      if (err.response?.status === 401) {
        setBookingError("Your session expired. Please log in again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
        navigate("/login");
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

  const isFull = session.is_full;
  const isAlreadyBooked = session.is_booked_by_current_user;
  const badgeStatus = isAlreadyBooked ? "booked" : isFull ? "full" : "open";

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

        {bookingMessage && (
          <Alert variant="success" className="mb-6">
            {bookingMessage}
          </Alert>
        )}

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
                {[
                  ["Coach", session.coach_full_name || "Not assigned"],
                  ["Date", session.session_date || "Not set"],
                  ["Time", `${session.start_time} - ${session.end_time}`],
                  ["Location", session.location || "Not set"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-neutral-900/70 p-4"
                  >
                    <p className="text-sm font-medium text-neutral-400">{label}</p>
                    <p className="mt-2 text-lg font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-6">
              <h2 className="text-2xl font-extrabold text-white">
                Booking Summary
              </h2>

              <div className="mt-6 space-y-4 text-sm text-neutral-300">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <span className="text-neutral-400">Price</span>
                  <span className="font-bold text-white">Rs. {session.price}</span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <span className="text-neutral-400">Max Players</span>
                  <span className="font-bold text-white">{session.max_players}</span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <span className="text-neutral-400">Booked Players</span>
                  <span className="font-bold text-white">
                    {session.booked_players_count}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 pb-2">
                  <span className="text-neutral-400">Available Slots</span>
                  <span className="font-bold text-white">
                    {session.available_slots}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleBookSession}
                disabled={isAlreadyBooked || isFull || bookingLoading}
                className={`mt-8 w-full rounded-full ${isAlreadyBooked || isFull || bookingLoading
                    ? "cursor-not-allowed bg-neutral-700 text-neutral-300 hover:bg-neutral-700"
                    : isAuthenticated
                      ? "bg-yellow-400 text-black hover:bg-yellow-300"
                      : "border border-white/10 bg-transparent text-white hover:border-yellow-400 hover:text-yellow-400"
                  }`}
              >
                {isAlreadyBooked
                  ? "Already Booked"
                  : isFull
                    ? "Session Full"
                    : bookingLoading
                      ? "Booking..."
                      : isAuthenticated
                        ? "Book Session"
                        : "Login to Book"}
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