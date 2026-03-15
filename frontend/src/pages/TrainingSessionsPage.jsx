import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function TrainingSessionsPage() {
  const navigate = useNavigate();

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

  async function fetchSessions() {
    try {
      setError("");

      const response = await api.get("/training-sessions/");

      if (Array.isArray(response.data)) {
        setSessions(response.data);
      } else if (Array.isArray(response.data.results)) {
        setSessions(response.data.results);
      } else {
        setSessions([]);
      }
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

    try {
      const response = await api.get("/me/");
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Failed to fetch current user:", err);
      setUser(null);
      setIsAuthenticated(false);
    }
  }

  useEffect(() => {
    fetchSessions();
    fetchCurrentUser();
  }, []);

  async function handleBookSession(sessionId) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setBookingMessage("");
      setBookingError("");
      setBookingSessionId(sessionId);

      await api.post("/bookings/", {
        session: sessionId,
      });

      setBookingMessage("Session booked successfully.");
      await fetchSessions();
    } catch (err) {
      console.error("Booking failed:", err);

      if (err.response?.status === 401) {
        setBookingError("Please log in to book a session.");
        setIsAuthenticated(false);
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
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
            <h2 className="text-2xl font-bold text-white">
              Loading training sessions...
            </h2>
            <p className="mt-3 text-neutral-400">
              Please wait while we fetch the latest academy sessions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <Navbar />
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-24 lg:px-10">
          <div className="w-full max-w-xl rounded-3xl border border-red-500/20 bg-white/5 p-10 text-center backdrop-blur">
            <h2 className="text-3xl font-extrabold text-white">
              Football Academy
            </h2>
            <p className="mt-4 text-red-400">{error}</p>
          </div>
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
              <Link
                to="/my-bookings"
                className="rounded-full bg-yellow-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
              >
                My Bookings
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-yellow-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
              >
                Login to Book
              </Link>
            )}
          </div>

          {bookingMessage && (
            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-emerald-300">
              {bookingMessage}
            </div>
          )}

          {bookingError && (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-300">
              {bookingError}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white">
                Find the right session
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                Search by program, coach, or location and refine using filters.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="xl:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-white">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by program, coach, or location"
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Session Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              >
                <option value="all">All types</option>
                {sessionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Availability
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="full">Full</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-neutral-400">
            <span>
              Showing{" "}
              <span className="font-bold text-white">
                {filteredSessions.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-white">{sessions.length}</span>{" "}
              sessions
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14 lg:px-10">
        {filteredSessions.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
            <h2 className="text-2xl font-bold text-white">
              No matching sessions found
            </h2>
            <p className="mt-3 text-neutral-400">
              Try adjusting your search or filters to see more sessions.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-6 rounded-full bg-yellow-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredSessions.map((session) => {
              const isBookingThisSession = bookingSessionId === session.id;
              const isFull = session.is_full;

              return (
                <div
                  key={session.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:border-yellow-400/30"
                >
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

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${isFull
                          ? "bg-red-500/10 text-red-300"
                          : "bg-emerald-500/10 text-emerald-300"
                        }`}
                    >
                      {isFull ? "Full" : "Open"}
                    </span>
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

                  <button
                    className={`mt-6 w-full rounded-full px-5 py-3 text-sm font-bold transition ${isFull || isBookingThisSession
                        ? "cursor-not-allowed bg-neutral-700 text-neutral-300"
                        : isAuthenticated
                          ? "bg-yellow-400 text-black hover:bg-yellow-300"
                          : "border border-white/10 bg-transparent text-white hover:border-yellow-400 hover:text-yellow-400"
                      }`}
                    disabled={isFull || isBookingThisSession}
                    onClick={() => handleBookSession(session.id)}
                  >
                    {isFull
                      ? "Session Full"
                      : isBookingThisSession
                        ? "Booking..."
                        : isAuthenticated
                          ? "Book Session"
                          : "Login to Book"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default TrainingSessionsPage;