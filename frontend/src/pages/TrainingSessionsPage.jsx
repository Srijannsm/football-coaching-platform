import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getTrainingSessions } from "../services/trainingSessionService";
import { createBooking } from "../services/bookingService";
import { getCurrentUser } from "../services/authService";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";
import { Card, CardContent } from "../components/ui/Card";
import { useToast } from "../context/ToastContext";

function TrainingSessionsPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("accessToken")
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingSessionId, setBookingSessionId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const darkInputClass =
    "border-white/10 bg-neutral-900 text-white placeholder:text-neutral-500 focus:border-yellow-400 focus:ring-yellow-400/10";
  const darkLabelClass = "text-white font-semibold";

  async function fetchSessions() {
    try {
      setError("");
      const sessionsData = await getTrainingSessions();
      setSessions(sessionsData);
    } catch (err) {
      console.error("Failed to load training sessions:", err);
      setError("Failed to load training sessions.");
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

    setIsAuthenticated(true);

    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error("Failed to fetch current user:", err);

      if (err.response?.status === 401) {
        clearAuthData();
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }

  useEffect(() => {
    fetchSessions();
    fetchCurrentUser();
  }, []);

  async function handleBookSession(sessionId) {
    const selectedSession = sessions.find((session) => session.id === sessionId);

    if (selectedSession?.is_booked_by_current_user) {
      setBookingError("You have already booked this session.");
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login", {
        state: { from: location },
      });
      return;
    }

    try {
      setBookingMessage("");
      setBookingError("");
      setBookingSessionId(sessionId);

      await createBooking(sessionId);

      // setBookingMessage("Session booked successfully.");
      showToast("Booking successful.", "success");
      await fetchSessions();
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
        setBookingError("Failed to book the session.");
      }
    } finally {
      setBookingSessionId(null);
    }
  }

  function handleClearFilters() {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
  }

  const sessionTypes = useMemo(() => {
    return [
      ...new Set(sessions.map((session) => session.session_type).filter(Boolean)),
    ];
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const programTitle = session.program_title?.toLowerCase() || "";
      const coachName = session.coach_full_name?.toLowerCase() || "";
      const location = session.location?.toLowerCase() || "";
      const sessionType = session.session_type || "";
      const isFull = session.is_full;

      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        programTitle.includes(search) ||
        coachName.includes(search) ||
        location.includes(search);

      const matchesType = typeFilter === "all" || sessionType === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && !isFull) ||
        (statusFilter === "full" && isFull);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [sessions, searchTerm, typeFilter, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <Navbar />
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-24 lg:px-10">
          <EmptyState
            title="Loading training sessions..."
            description="Please wait while we fetch the latest academy sessions."
            className="w-full max-w-xl"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <Navbar />
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-24 lg:px-10">
          <EmptyState
            title="Football Academy"
            description={error}
            className="w-full max-w-xl border-red-500/20"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      <section className="border-b border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              Training Sessions
            </p>

            <h1 className="mb-4 text-4xl font-extrabold md:text-5xl">
              Book Your Next Session
            </h1>

            <p className="text-lg leading-8 text-neutral-300">
              {isAuthenticated
                ? `Welcome${user?.first_name ? `, ${user.first_name}` : ""}. Browse available sessions, filter results, and reserve your place.`
                : "Browse available academy sessions, explore training options, and log in when you're ready to book."}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            {isAuthenticated ? (
              <Link to="/my-bookings">
                <Button className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
                  My Bookings
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
                  Login to Book
                </Button>
              </Link>
            )}
          </div>

          {bookingMessage && (
            <Alert variant="success" className="mt-6">
              {bookingMessage}
            </Alert>
          )}

          {bookingError && (
            <Alert variant="error" className="mt-6">
              {bookingError}
            </Alert>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <Card className="border-white/10 bg-white/5 shadow-xl backdrop-blur">
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-white">
                  Find the right session
                </h2>
                <p className="mt-2 text-sm text-neutral-400">
                  Search by program, coach, or location and refine using filters.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
                className="rounded-full border-white/10 bg-transparent text-white hover:border-yellow-400 hover:text-yellow-400"
              >
                Clear Filters
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="xl:col-span-2">
                <Input
                  type="text"
                  label="Search"
                  labelClassName={darkLabelClass}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by program, coach, or location"
                  className={darkInputClass}
                />
              </div>

              <Select
                label="Session Type"
                labelClassName={darkLabelClass}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: "all", label: "All types" },
                  ...sessionTypes.map((type) => ({
                    value: type,
                    label: type.replaceAll("_", " "),
                  })),
                ]}
                className={darkInputClass}
              />

              <Select
                label="Availability"
                labelClassName={darkLabelClass}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "all", label: "All" },
                  { value: "open", label: "Open" },
                  { value: "full", label: "Full" },
                ]}
                className={darkInputClass}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-neutral-400">
              <span>
                Showing{" "}
                <span className="font-bold text-white">{filteredSessions.length}</span>{" "}
                of <span className="font-bold text-white">{sessions.length}</span>{" "}
                sessions
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14 lg:px-10">
        {filteredSessions.length === 0 ? (
          <EmptyState
            title="No matching sessions found"
            description="Try adjusting your search or filters to see more sessions."
            action={
              <Button
                type="button"
                onClick={handleClearFilters}
                className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300"
              >
                Reset Filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredSessions.map((session) => {
              const isBookingThisSession = bookingSessionId === session.id;
              const isFull = session.is_full;
              const isAlreadyBooked = session.is_booked_by_current_user;

              const badgeStatus = isAlreadyBooked
                ? "booked"
                : isFull
                  ? "full"
                  : "open";

              return (
                <Card
                  key={session.id}
                  className="border-white/10 bg-white/5 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:border-yellow-400/30"
                >
                  <CardContent className="p-6">
                    {session.hero_image ? (
                      <div className="mb-5 overflow-hidden rounded-2xl">
                        <img
                          src={session.hero_image}
                          alt={session.program_title || "Training session"}
                          className="h-48 w-full object-cover transition duration-300 hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="mb-5 flex h-48 w-full items-center justify-center rounded-2xl bg-neutral-900 text-sm text-neutral-500">
                        No session image
                      </div>
                    )}

                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div>
                        <p className="mb-2 inline-block rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-400">
                          {session.session_type || "Training"}
                        </p>

                        <h2 className="text-2xl font-extrabold text-white">
                          {session.program_title || "Training Session"}
                        </h2>
                      </div>

                      <StatusBadge status={badgeStatus} />
                    </div>

                    <div className="space-y-3 text-sm text-neutral-300">
                      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                        <span className="font-medium text-neutral-400">Coach</span>
                        <span className="text-right text-white">
                          {session.coach_full_name || "Not assigned"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                        <span className="font-medium text-neutral-400">Date</span>
                        <span className="text-right text-white">
                          {session.session_date}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                        <span className="font-medium text-neutral-400">Time</span>
                        <span className="text-right text-white">
                          {session.start_time} - {session.end_time}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                        <span className="font-medium text-neutral-400">
                          Location
                        </span>
                        <span className="text-right text-white">
                          {session.location || "Not set"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                        <span className="font-medium text-neutral-400">Price</span>
                        <span className="text-right text-white">
                          Rs. {session.price}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-neutral-400">
                          Available Slots
                        </span>
                        <span className="text-right text-white">
                          {session.available_slots}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/training-sessions/${session.id}`)}
                        className="w-full rounded-full border-white/10 bg-transparent text-white hover:border-yellow-400 hover:text-yellow-400"
                      >
                        View Details
                      </Button>

                      <Button
                        type="button"
                        className={`w-full rounded-full ${isAlreadyBooked || isFull || isBookingThisSession
                          ? "cursor-not-allowed bg-neutral-700 text-neutral-300 hover:bg-neutral-700"
                          : isAuthenticated
                            ? "bg-yellow-400 text-black hover:bg-yellow-300"
                            : "border border-white/10 bg-emerald-800 text-black hover:bg-lime-600"
                          }`}
                        disabled={isAlreadyBooked || isFull || isBookingThisSession}
                        onClick={() => handleBookSession(session.id)}
                      >
                        {isAlreadyBooked
                          ? "Already Booked"
                          : isFull
                            ? "Session Full"
                            : isBookingThisSession
                              ? "Booking..."
                              : isAuthenticated
                                ? "Book Session"
                                : "Login to Book"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default TrainingSessionsPage;