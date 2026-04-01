import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getTrainingSessions } from "../services/trainingSessionService";
import { createBooking } from "../services/bookingService";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";
import { Card, CardContent } from "../components/ui/Card";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/formatDate";
import { formatSessionTimeRange } from "../utils/formatSessionTimeRange";

function SessionInfoRow({ label, value, bordered = true }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        bordered ? "border-b border-app-border pb-3" : ""
      }`}
    >
      <span className="text-sm font-medium text-app-text-muted">{label}</span>
      <span className="text-right text-sm font-semibold text-app-text">
        {value}
      </span>
    </div>
  );
}

function TrainingSessionsPage() {
  const { showToast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingSessionId, setBookingSessionId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const isAdmin = user?.role === "admin";

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

  useEffect(() => {
    fetchSessions();
  }, []);

  async function handleBookSession(sessionId) {
    const selectedSession = sessions.find((session) => session.id === sessionId);

    if (selectedSession?.is_booked_by_current_user) {
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
      setBookingSessionId(sessionId);

      await createBooking(sessionId);
      showToast("Booking successful.", "success");

      await fetchSessions();
    } catch (err) {
      console.error("Booking failed:", err);

      if (err.response?.status === 401) {
        setBookingError("Your session expired. Please log in again.");
        await logout();
        navigate("/login", { state: { from: location } });
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

  function handleEditSessionFromFrontend(sessionId) {
    navigate("/admin-dashboard/sessions", {
      state: {
        highlightSessionId: sessionId,
        highlightNonce: Date.now(),
      },
    });
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
      const locationName = session.location?.toLowerCase() || "";
      const sessionType = session.session_type || "";
      const isFull = session.is_full;

      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        programTitle.includes(search) ||
        coachName.includes(search) ||
        locationName.includes(search);

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
      <div className="app-shell">
        <Navbar />
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-28 lg:px-10">
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
      <div className="app-shell">
        <Navbar />
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-28 lg:px-10">
          <EmptyState
            title="Training Sessions"
            description={error}
            className="w-full max-w-xl"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <section className="bg-app-surface pt-32 pb-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
              Training Sessions
            </p>

            <h1 className="text-4xl font-black tracking-tight text-app-text md:text-5xl">
              Book your next session
            </h1>

            <p className="mt-4 text-lg leading-8 text-app-text-soft">
              {isAuthenticated
                ? `Welcome${user?.first_name ? `, ${user.first_name}` : ""}. Browse available sessions, refine your search, and reserve your place.`
                : "Browse available academy sessions, explore training options, and log in when you're ready to book."}
            </p>
          </div>

          {bookingError && (
            <div className="mt-6 max-w-2xl">
              <Alert variant="error">{bookingError}</Alert>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-app-text">
                  Find the right session
                </h2>
                <p className="mt-2 text-sm text-app-text-soft">
                  Search by program, coach, or location and refine using filters.
                </p>
              </div>

              <Button type="button" variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="xl:col-span-2">
                <Input
                  type="text"
                  label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by program, coach, or location"
                />
              </div>

              <Select
                label="Session Type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: "all", label: "All types" },
                  ...sessionTypes.map((type) => ({
                    value: type,
                    label: type.replaceAll("_", " "),
                  })),
                ]}
              />

              <Select
                label="Availability"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "all", label: "All" },
                  { value: "open", label: "Open" },
                  { value: "full", label: "Full" },
                ]}
              />
            </div>

            <div className="mt-5 text-sm text-app-text-soft">
              Showing{" "}
              <span className="font-bold text-app-text">{filteredSessions.length}</span>{" "}
              of <span className="font-bold text-app-text">{sessions.length}</span>{" "}
              sessions
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
              <Button type="button" onClick={handleClearFilters}>
                Reset Filters
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
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
                  className="overflow-hidden transition duration-200 hover:-translate-y-1"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* <div className="lg:w-[320px] lg:min-w-[320px]">
                        {session.hero_image ? (
                          <img
                            src={session.hero_image}
                            alt={session.program_title || "Training session"}
                            className="h-64 w-full object-cover lg:h-full"
                          />
                        ) : (
                          <div className="flex h-64 w-full items-center justify-center border-b border-app-border bg-app-surface-2 text-sm text-app-text-muted lg:h-full lg:border-b-0 lg:border-r">
                            No session image
                          </div>
                        )}
                      </div> */}

                      <div className="flex flex-1 flex-col p-6 lg:p-1">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="max-w-3xl">
                            <p className="mb-3 inline-flex rounded-full bg-brand-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-app-text">
                              {session.session_type
                                ? session.session_type.replaceAll("_", " ")
                                : "Training"}
                            </p>

                            <h2 className="text-2xl font-bold tracking-tight text-app-text lg:text-3xl">
                              {session.program_title || "Training Session"}
                            </h2>

                            <p className="mt-2 text-sm text-app-text-soft">
                              Train with{" "}
                              <span className="font-semibold text-app-text">
                                {session.coach_full_name || "Not assigned"}
                              </span>{" "}
                              at{" "}
                              <span className="font-semibold text-app-text">
                                {session.location || "Not set"}
                              </span>
                              .
                            </p>
                          </div>

                          <div className="shrink-0">
                            <StatusBadge status={badgeStatus} />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div className="rounded-2xl border border-app-border bg-app-surface-2 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-text-muted">
                              Date
                            </p>
                            <p className="mt-2 text-sm font-semibold text-app-text">
                              {formatDate(session.session_date)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-app-border bg-app-surface-2 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-text-muted">
                              Time
                            </p>
                            <p className="mt-2 text-sm font-semibold text-app-text">
                              {formatSessionTimeRange(
                                session.start_time,
                                session.end_time
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-app-border bg-app-surface-2 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-text-muted">
                              Price
                            </p>
                            <p className="mt-2 text-sm font-semibold text-app-text">
                              Rs. {session.price}
                            </p>
                          </div>
                        </div>

                        {/* <div className="mt-5 grid gap-3 md:grid-cols-2">
                          <SessionInfoRow
                            label="Coach"
                            value={session.coach_full_name || "Not assigned"}
                          />
                          <SessionInfoRow
                            label="Location"
                            value={session.location || "Not set"}
                          />
                          <SessionInfoRow
                            label="Available Slots"
                            value={session.available_slots}
                          />
                          <SessionInfoRow
                            label="Status"
                            value={
                              isAlreadyBooked
                                ? "Already booked"
                                : isFull
                                ? "Full"
                                : "Open"
                            }
                            bordered={false}
                          />
                        </div> */}

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                          {isAdmin ? (
                            <Button
                              type="button"
                              onClick={() => handleEditSessionFromFrontend(session.id)}
                            >
                              Edit Session
                            </Button>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  navigate(`/training-sessions/${session.id}`)
                                }
                                className="sm:min-w-[160px]"
                              >
                                View Details
                              </Button>

                              <Button
                                type="button"
                                disabled={
                                  isAlreadyBooked || isFull || isBookingThisSession
                                }
                                variant={
                                  isAlreadyBooked || isFull || isBookingThisSession
                                    ? "secondary"
                                    : "primary"
                                }
                                onClick={() => handleBookSession(session.id)}
                                className="sm:min-w-[180px]"
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
                            </>
                          )}
                        </div>
                      </div>
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