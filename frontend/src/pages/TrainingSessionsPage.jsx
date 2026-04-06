import { createElement, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { List, LayoutGrid, Calendar, Search, X } from "lucide-react";
import { getTrainingSessions, getAllTrainingSessions } from "../services/trainingSessionService";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import CalendarView, { CompactSessionCard } from "../components/CalendarView";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/formatDate";
import { formatSessionTimeRange } from "../utils/formatSessionTimeRange";

const VIEW_MODES = [
  { mode: "list", icon: List, label: "List" },
  { mode: "card", icon: LayoutGrid, label: "Card" },
  { mode: "calendar", icon: Calendar, label: "Calendar" },
];

function TrainingSessionsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState("list");
  const [allSessions, setAllSessions] = useState([]);
  const [allSessionsLoading, setAllSessionsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const isAdmin = user?.role === "admin";
  const hasActiveFilters = searchTerm || typeFilter !== "all" || statusFilter !== "all";

  async function fetchSessions(page = 1) {
    try {
      setLoading(true);
      setError("");
      const { results, count } = await getTrainingSessions(page);
      setSessions(results);
      setTotalCount(count);
    } catch (err) {
      console.error("Failed to load training sessions:", err);
      setError("Failed to load training sessions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions(currentPage);
  }, [currentPage]);

  function handleClearFilters() {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  }

  function handlePageChange(page) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter]);

  useEffect(() => {
    if (viewMode !== "calendar") return;
    let cancelled = false;

    async function fetchAll() {
      setAllSessionsLoading(true);
      try {
        const data = await getAllTrainingSessions();
        if (!cancelled) setAllSessions(data);
      } catch (err) {
        console.error("Failed to fetch all sessions for calendar:", err);
      } finally {
        if (!cancelled) setAllSessionsLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [viewMode]);

  const sessionTypes = useMemo(() => {
    const source = viewMode === "calendar" ? allSessions : sessions;
    return [...new Set(source.map((s) => s.session_type).filter(Boolean))];
  }, [sessions, allSessions, viewMode]);

  function makeFilter(search, type, status) {
    const q = search.trim().toLowerCase();
    return (s) => {
      const matchesSearch =
        !q ||
        (s.program_title?.toLowerCase() || "").includes(q) ||
        (s.coach_full_name?.toLowerCase() || "").includes(q) ||
        (s.location?.toLowerCase() || "").includes(q);
      const matchesType = type === "all" || s.session_type === type;
      const matchesStatus =
        status === "all" ||
        (status === "open" && !s.is_full) ||
        (status === "full" && s.is_full);
      return matchesSearch && matchesType && matchesStatus;
    };
  }

  const filteredSessions = useMemo(
    () => sessions.filter(makeFilter(searchTerm, typeFilter, statusFilter)),
    [sessions, searchTerm, typeFilter, statusFilter],
  );

  const calendarFilteredSessions = useMemo(
    () =>
      viewMode === "calendar"
        ? allSessions.filter(makeFilter(searchTerm, typeFilter, statusFilter))
        : [],
    [allSessions, searchTerm, typeFilter, statusFilter, viewMode],
  );

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
            action={
              <Button type="button" onClick={() => fetchSessions(currentPage)}>
                Try Again
              </Button>
            }
            className="w-full max-w-xl"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      {/* ── Hero + Filters ──────────────────────────────────────────── */}
      <section className="bg-app-surface pt-32 pb-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">

          {/* Title row */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
                Training Sessions
              </p>
              <h1 className="text-4xl font-black tracking-tight text-app-text md:text-5xl">
                Book your next session
              </h1>
              <p className="mt-3 text-base leading-7 text-app-text-soft">
                {isAuthenticated
                  ? `Welcome${user?.first_name ? `, ${user.first_name}` : ""}. Find a session and reserve your place.`
                  : "Browse sessions and log in when you're ready to book."}
              </p>
            </div>

            {/* View toggle */}
            <div className="flex shrink-0 items-center gap-1 self-start rounded-xl border border-app-border bg-app-card p-1 sm:self-auto">
              {VIEW_MODES.map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  type="button"
                  title={`${label} view`}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? "bg-brand-primary text-white shadow-sm"
                      : "text-app-text-muted hover:text-app-text"
                  }`}
                >
                  {createElement(icon, { size: 14 })}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-app-text-muted"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by program, coach, or location…"
                className="h-10 w-full rounded-xl border border-app-border bg-app-card pl-9 pr-4 text-sm text-app-text outline-none transition placeholder:text-app-text-muted focus:border-brand-primary"
              />
            </div>

            {/* Session type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-xl border border-app-border bg-app-card px-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
            >
              <option value="all">All types</option>
              {sessionTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replaceAll("_", " ")}
                </option>
              ))}
            </select>

            {/* Availability */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-app-border bg-app-card px-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
            >
              <option value="all">All availability</option>
              <option value="open">Open</option>
              <option value="full">Full</option>
            </select>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex h-10 items-center gap-1.5 rounded-xl border border-app-border bg-app-card px-3 text-sm font-medium text-app-text-muted transition hover:border-brand-primary hover:text-brand-primary"
              >
                <X size={13} />
                Clear
              </button>
            )}
          </div>

          {/* Stats line */}
          <p className="mt-3 text-sm text-app-text-muted">
            {viewMode === "calendar" ? (
              allSessionsLoading ? (
                "Loading all sessions…"
              ) : (
                <>
                  <span className="font-semibold text-app-text">{calendarFilteredSessions.length}</span>
                  {" "}of{" "}
                  <span className="font-semibold text-app-text">{allSessions.length}</span>
                  {" "}sessions across all months
                </>
              )
            ) : (
              <>
                <span className="font-semibold text-app-text">{filteredSessions.length}</span>
                {" "}of{" "}
                <span className="font-semibold text-app-text">{totalCount}</span>
                {" "}sessions
                {totalPages > 1 && (
                  <> — page <span className="font-semibold text-app-text">{currentPage}</span> of <span className="font-semibold text-app-text">{totalPages}</span></>
                )}
              </>
            )}
          </p>
        </div>
      </section>

      {/* ── Sessions ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-8 pb-16 lg:px-10">

        {/* Calendar */}
        {viewMode === "calendar" && (
          allSessionsLoading ? (
            <EmptyState
              title="Building your calendar…"
              description="Fetching all sessions, this only takes a moment."
              className="mx-auto w-full max-w-xl"
            />
          ) : (
            <CalendarView
              sessions={calendarFilteredSessions}
              isAdmin={isAdmin}
            />
          )
        )}

        {/* Card grid */}
        {viewMode === "card" && (
          filteredSessions.length === 0 ? (
            <EmptyState
              title="No matching sessions found"
              description="Try adjusting your search or filters."
              action={<Button type="button" onClick={handleClearFilters}>Reset Filters</Button>}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredSessions.map((session) => (
                <CompactSessionCard
                  key={session.id}
                  session={session}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )
        )}

        {/* List */}
        {viewMode === "list" && (
          filteredSessions.length === 0 ? (
            <EmptyState
              title="No matching sessions found"
              description="Try adjusting your search or filters."
              action={<Button type="button" onClick={handleClearFilters}>Reset Filters</Button>}
            />
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                const isFull = session.is_full;
                const isAlreadyBooked = session.is_booked_by_current_user;
                const badgeStatus = isAlreadyBooked ? "booked" : isFull ? "full" : "open";
                const accentColor = isAlreadyBooked
                  ? "bg-blue-500"
                  : isFull
                  ? "bg-red-400"
                  : "bg-emerald-500";

                return (
                  <div
                    key={session.id}
                    className="group flex overflow-hidden rounded-2xl border border-app-border bg-app-card transition duration-200 hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-md"
                  >
                    {/* Status accent strip */}
                    <div className={`w-1 shrink-0 ${accentColor}`} />

                    <div className="flex flex-1 flex-col gap-4 p-5 lg:flex-row lg:items-center lg:gap-8 lg:p-6">
                      {/* Session info */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-brand-primary-soft px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-app-text">
                            {session.session_type?.replaceAll("_", " ") || "Training"}
                          </span>
                          <StatusBadge status={badgeStatus} />
                        </div>
                        <h3 className="text-lg font-bold tracking-tight text-app-text lg:text-xl">
                          {session.program_title || "Training Session"}
                        </h3>
                        <p className="mt-1 text-sm text-app-text-soft">
                          <span className="font-medium text-app-text">
                            {session.coach_full_name || "No coach assigned"}
                          </span>
                          {session.location && <> · {session.location}</>}
                        </p>
                      </div>

                      {/* Meta stats */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">Date</p>
                          <p className="mt-0.5 text-sm font-semibold text-app-text">
                            {formatDate(session.session_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">Time</p>
                          <p className="mt-0.5 text-sm font-semibold text-app-text">
                            {formatSessionTimeRange(session.start_time, session.end_time)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">Price</p>
                          <p className="mt-0.5 text-sm font-semibold text-app-text">
                            Rs. {session.price}
                          </p>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="shrink-0">
                        {isAdmin ? (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              navigate("/admin-dashboard/sessions", {
                                state: { highlightSessionId: session.id, highlightNonce: Date.now() },
                              })
                            }
                          >
                            Edit Session
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/training-sessions/${session.id}`)}
                          >
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Pagination */}
        {viewMode !== "calendar" && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`h-9 w-9 rounded-lg text-sm font-semibold transition-colors ${
                    page === currentPage
                      ? "bg-brand-primary text-white"
                      : "text-app-text-soft hover:bg-app-surface-2 hover:text-app-text"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

export default TrainingSessionsPage;
