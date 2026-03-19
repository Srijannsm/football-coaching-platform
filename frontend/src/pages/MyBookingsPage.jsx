import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";
import Alert from "../components/ui/Alert";
import { Card, CardContent } from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import { useToast } from "../context/ToastContext";
import { getMyBookings, cancelBooking } from "../services/bookingService";
import { formatDate } from "../utils/formatDate";
import { formatTime } from "../utils/formatTime";

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Pending", value: "pending" },
  { label: "Attended", value: "attended" },
  { label: "Missed", value: "missed" },
  { label: "Cancelled", value: "cancelled" },
];

function BookingMetaItem({ label, value }) {
  return (
    <div className="rounded-[1rem] border border-app-border bg-app-surface-2 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-app-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-app-text">{value}</p>
    </div>
  );
}

function StatusFilterBar({ value, onChange }) {
  return (
    <div className="mb-8">
      <div className="mb-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
          Filter by Status
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {STATUS_FILTERS.map((filter) => {
          const isActive = value === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChange(filter.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-brand-primary bg-brand-primary text-black"
                  : "border-app-border bg-app-card text-app-text-soft hover:border-brand-primary hover:text-app-text"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancel, isCancelling, faded = false }) {
  const isCancelled = booking.status === "cancelled";

  return (
    <Card
      className={`overflow-hidden transition ${faded ? "opacity-70" : "hover:-translate-y-0.5"}`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-brand-primary">
                  Training Booking
                </p>
                <h3 className="text-xl font-bold tracking-tight text-app-text">
                  {booking.program_title}
                </h3>
                <p className="mt-2 text-sm text-app-text-soft">
                  Manage your reserved training session details below.
                </p>
              </div>

              <div className="self-start">
                <StatusBadge status={booking.status} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <BookingMetaItem
                label="Session Date"
                value={formatDate(booking.session_date)}
              />
              <BookingMetaItem
                label="Start Time"
                value={formatTime(booking.start_time)}
              />
              <BookingMetaItem
                label="Coach"
                value={booking.coach_full_name || "Not assigned"}
              />
              <BookingMetaItem
                label="Location"
                value={booking.location || "Location not set"}
              />
            </div>
          </div>

          {!isCancelled && (
            <div className="flex w-full shrink-0 flex-col gap-3 lg:w-auto lg:min-w-[180px]">
              <Button
                onClick={() => onCancel(booking.id)}
                loading={isCancelling}
                disabled={isCancelling}
                variant="danger"
                className="w-full"
              >
                Cancel Booking
              </Button>

              <Link to="/training-sessions" className="w-full">
                <Button variant="outline" className="w-full">
                  Browse Sessions
                </Button>
              </Link>
            </div>
          )}
        </div>

        {isCancelled && (
          <div className="border-t border-app-border bg-app-surface px-6 py-4">
            <p className="text-sm text-app-text-muted">
              This booking has been cancelled and is kept here for your record.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MyBookingsPage() {
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  async function fetchBookings() {
    try {
      setError("");
      setLoading(true);

      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "Failed to load your bookings. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking(id) {
    try {
      setError("");
      setCancelBookingId(id);

      await cancelBooking(id);
      await fetchBookings();

      showToast("Booking cancelled successfully.", "success");
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "Failed to cancel booking. Please try again.";

      setError(message);
      showToast(message, "error");
    } finally {
      setCancelBookingId(null);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    if (statusFilter === "all") return bookings;
    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const upcomingBookings = useMemo(
    () => filteredBookings.filter((booking) => booking.status !== "cancelled"),
    [filteredBookings]
  );

  const cancelledBookings = useMemo(
    () => filteredBookings.filter((booking) => booking.status === "cancelled"),
    [filteredBookings]
  );

  const hasFilteredResults = filteredBookings.length > 0;

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 pt-32 pb-16">
          <div className="mb-8">
            <div className="h-10 w-40 animate-pulse rounded-full bg-app-surface-2" />
          </div>

          <div className="mb-10 rounded-[1.5rem] border border-app-border bg-app-card p-8">
            <div className="h-6 w-48 animate-pulse rounded bg-app-surface-2" />
            <div className="mt-4 h-4 w-80 animate-pulse rounded bg-app-surface-2" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-28 animate-pulse rounded-[1.25rem] bg-app-surface-2" />
            <div className="h-28 animate-pulse rounded-[1.25rem] bg-app-surface-2" />
            <div className="h-28 animate-pulse rounded-[1.25rem] bg-app-surface-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 pt-32 pb-16">
        <section className="mb-10 rounded-[1.75rem] border border-app-border bg-app-surface p-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
            Player Dashboard
          </p>
          <h1 className="text-4xl font-black tracking-tight text-app-text sm:text-5xl">
            My Bookings
          </h1>
          <p className="mt-3 max-w-2xl text-app-text-soft">
            View your upcoming sessions, keep track of cancelled bookings, and
            manage your football training schedule in one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/training-sessions">
              <Button>Browse Sessions</Button>
            </Link>
            <Link to="/player-dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </div>
        </section>

        {error && (
          <div className="mb-6">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <section className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total Bookings" value={bookings.length} />
          <StatCard label="Upcoming Sessions" value={upcomingBookings.length} />
          <StatCard
            label="Cancelled Sessions"
            value={cancelledBookings.length}
          />
        </section>

        {bookings.length > 0 && (
          <StatusFilterBar value={statusFilter} onChange={setStatusFilter} />
        )}

        {bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="You have not booked any training sessions yet. Start exploring available sessions and reserve your place."
            action={
              <Link to="/training-sessions">
                <Button>Browse Sessions</Button>
              </Link>
            }
          />
        ) : !hasFilteredResults ? (
          <EmptyState
            title="No matching bookings"
            description={`There are no bookings with the status "${statusFilter}".`}
            action={
              <Button variant="outline" onClick={() => setStatusFilter("all")}>
                Clear Filter
              </Button>
            }
          />
        ) : (
          <div className="space-y-14">
            {upcomingBookings.length > 0 && (
              <section>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
                      Active Bookings
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight text-app-text">
                      Upcoming Sessions
                    </h2>
                    <p className="mt-1 text-sm text-app-text-muted">
                      These are your current active session bookings.
                    </p>
                  </div>

                  <div className="rounded-full border border-app-border bg-app-card px-4 py-2 text-sm text-app-text-soft">
                    {upcomingBookings.length} active booking
                    {upcomingBookings.length !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="space-y-5">
                  {upcomingBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCancel={handleCancelBooking}
                      isCancelling={cancelBookingId === booking.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {cancelledBookings.length > 0 && (
              <section>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-app-text-muted">
                      Booking History
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight text-app-text">
                      Cancelled Sessions
                    </h2>
                    <p className="mt-1 text-sm text-app-text-muted">
                      Your cancelled sessions are shown here for reference.
                    </p>
                  </div>

                  <div className="rounded-full border border-app-border bg-app-card px-4 py-2 text-sm text-app-text-soft">
                    {cancelledBookings.length} cancelled booking
                    {cancelledBookings.length !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="space-y-4">
                  {cancelledBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCancel={handleCancelBooking}
                      isCancelling={false}
                      faded
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookingsPage;