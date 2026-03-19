import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPlayerDashboard } from "../services/playerDashboardService";
import EmptyState from "../components/ui/EmptyState";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import { formatDate } from "../utils/formatDate";
import { formatTime } from "../utils/formatTime";

function MetaItem({ label, value }) {
  return (
    <div className="rounded-[1.25rem] border border-app-border bg-app-surface-2 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-app-text-muted">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-app-text">{value}</p>
    </div>
  );
}

function ActivityItem({ booking }) {
  return (
    <div className="rounded-[1.25rem] border border-app-border bg-app-surface-2 p-4 transition duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-app-text">
            {booking.program_title}
          </h3>
          <p className="mt-1 text-sm text-app-text-soft">
            {formatDate(booking.session_date)} • {formatTime(booking.start_time)}
          </p>
        </div>

        <div className="self-start">
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetaItem
          label="Coach"
          value={booking.coach_full_name || "Not assigned"}
        />
        <MetaItem
          label="Location"
          value={booking.location || "Location not set"}
        />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 pt-32 pb-10 lg:px-10">
        <div className="rounded-[1.5rem] border border-app-border bg-app-card p-6">
          <div className="h-4 w-32 animate-pulse rounded bg-app-surface-2" />
          <div className="mt-3 h-9 w-64 animate-pulse rounded bg-app-surface-2" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-app-surface-2" />
          <div className="mt-5 flex gap-3">
            <div className="h-10 w-36 animate-pulse rounded-full bg-app-surface-2" />
            <div className="h-10 w-32 animate-pulse rounded-full bg-app-surface-2" />
            <div className="h-10 w-32 animate-pulse rounded-full bg-app-surface-2" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-[1.25rem] bg-app-surface-2"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="h-[320px] animate-pulse rounded-[1.5rem] bg-app-surface-2" />
          <div className="h-[320px] animate-pulse rounded-[1.5rem] bg-app-surface-2" />
        </div>
      </div>
    </div>
  );
}

function PlayerDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchDashboard() {
    try {
      setError("");
      setLoading(true);
      const data = await getPlayerDashboard();
      setDashboard(data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to load player dashboard.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const firstName = dashboard?.user?.first_name || "";
  const stats = dashboard?.stats || {};
  const nextBooking = dashboard?.next_booking;
  const recentBookings = dashboard?.recent_bookings || [];

  const greeting = useMemo(() => {
    return firstName ? `Welcome back, ${firstName}` : "Welcome back";
  }, [firstName]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !dashboard) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 pt-32 pb-20 lg:px-10">
          <EmptyState
            title="Player Dashboard"
            description={error || "Unable to load dashboard."}
            action={
              <div className="flex flex-wrap gap-3">
                <Link to="/training-sessions">
                  <Button>Browse Sessions</Button>
                </Link>
                <Button variant="outline" onClick={fetchDashboard}>
                  Try Again
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <section className="bg-app-surface pt-32 pb-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
                Player Dashboard
              </p>
              <h1 className="text-3xl font-black tracking-tight text-app-text md:text-4xl">
                {greeting}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-app-text-soft md:text-base">
                Track your next session, review recent bookings, and manage your
                football academy activity.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/training-sessions">
                <Button>Browse Sessions</Button>
              </Link>

              <Link to="/my-bookings">
                <Button variant="outline">My Bookings</Button>
              </Link>

              <Link to="/player-profile">
                <Button variant="outline">Player Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total Bookings" value={stats.total_bookings ?? 0} />
          <StatCard label="Upcoming" value={stats.upcoming_bookings ?? 0} />
          <StatCard label="Confirmed" value={stats.confirmed_bookings ?? 0} />
          <StatCard label="Cancelled" value={stats.cancelled_bookings ?? 0} />
          <StatCard label="Attended" value={stats.attended_sessions ?? 0} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-10">
        <div className="grid items-start gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardContent className="p-6">
              <SectionHeader
                title="Next Session"
                subtitle="Your nearest upcoming training session."
                action={nextBooking ? <StatusBadge status={nextBooking.status} /> : null}
              />

              {nextBooking ? (
                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-app-border bg-app-surface-2 p-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                            Upcoming Booking
                          </p>

                          <h3 className="text-xl font-bold leading-tight text-app-text md:text-2xl">
                            {nextBooking.program_title}
                          </h3>

                          <p className="mt-2 text-sm text-app-text-soft">
                            {formatDate(nextBooking.session_date)} •{" "}
                            {formatTime(nextBooking.start_time)}
                            {nextBooking.end_time
                              ? ` - ${formatTime(nextBooking.end_time)}`
                              : ""}
                          </p>
                        </div>

                        <div className="self-start rounded-full bg-brand-primary-soft px-4 py-2 text-sm font-medium text-app-text">
                          {nextBooking.location || "Location not set"}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <MetaItem
                          label="Coach"
                          value={nextBooking.coach_full_name || "Not assigned"}
                        />
                        <MetaItem
                          label="Date"
                          value={formatDate(nextBooking.session_date)}
                        />
                        <MetaItem
                          label="Time"
                          value={`${formatTime(nextBooking.start_time)}${
                            nextBooking.end_time
                              ? ` - ${formatTime(nextBooking.end_time)}`
                              : ""
                          }`}
                        />
                      </div>

                      <div className="flex flex-wrap gap-3 pt-1">
                        <Link to="/my-bookings">
                          <Button variant="outline">Manage Bookings</Button>
                        </Link>

                        <Link to="/training-sessions">
                          <Button>Book New Session</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No upcoming session"
                  description="You do not have any future session booked right now."
                  action={
                    <div className="flex flex-wrap gap-3">
                      <Link to="/training-sessions">
                        <Button>Book a Session</Button>
                      </Link>

                      <Link to="/my-bookings">
                        <Button variant="outline">Manage Bookings</Button>
                      </Link>
                    </div>
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <SectionHeader
                title="Recent Bookings"
                subtitle="Your latest booking activity."
                action={
                  <Link
                    to="/my-bookings"
                    className="text-sm font-medium text-brand-primary hover:text-app-text"
                  >
                    View all →
                  </Link>
                }
              />

              {recentBookings.length ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <ActivityItem key={booking.id} booking={booking} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No bookings yet"
                  description="You have not made any bookings yet."
                  action={
                    <Link to="/training-sessions">
                      <Button>Browse Sessions</Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default PlayerDashboardPage;