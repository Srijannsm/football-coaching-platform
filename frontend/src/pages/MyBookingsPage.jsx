import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";
import Alert from "../components/ui/Alert";
import { Card, CardContent } from "../components/ui/Card";
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

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5">
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function BookingMetaItem({ label, value }) {
  return (
    <div className="rounded-xl border border-white/5 bg-neutral-800/60 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-neutral-200">{value}</p>
    </div>
  );
}

function StatusFilterBar({ value, onChange }) {
  return (
    <div className="mb-8">
      <div className="mb-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
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
                  ? "border-yellow-400 bg-yellow-400 text-black"
                  : "border-white/10 bg-neutral-900 text-neutral-300 hover:border-yellow-400/30 hover:text-white"
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
      className={`overflow-hidden border-white/10 bg-neutral-900 transition ${
        faded ? "opacity-65" : "hover:border-yellow-400/20"
      }`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-yellow-400">
                  Training Booking
                </p>
                <h3 className="text-xl font-bold text-white">
                  {booking.program_title}
                </h3>
                <p className="mt-2 text-sm text-neutral-400">
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
                className="w-full rounded-full"
              >
                Cancel Booking
              </Button>

              <Link to="/training-sessions" className="w-full">
                <Button
                  variant="secondary"
                  className="w-full rounded-full border border-white/10"
                >
                  Browse Sessions
                </Button>
              </Link>
            </div>
          )}
        </div>

        {isCancelled && (
          <div className="border-t border-white/5 bg-neutral-950/40 px-6 py-4">
            <p className="text-sm text-neutral-500">
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
  const navigate = useNavigate();

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
      <div className="min-h-screen bg-neutral-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8">
            <div className="h-10 w-40 animate-pulse rounded-full bg-neutral-800" />
          </div>

          <div className="mb-10 rounded-3xl border border-white/10 bg-neutral-900 p-8">
            <div className="h-6 w-48 animate-pulse rounded bg-neutral-800" />
            <div className="mt-4 h-4 w-80 animate-pulse rounded bg-neutral-800" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-28 animate-pulse rounded-2xl bg-neutral-900" />
            <div className="h-28 animate-pulse rounded-2xl bg-neutral-900" />
            <div className="h-28 animate-pulse rounded-2xl bg-neutral-900" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-16">

        <section className="mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 p-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400">
            Player Dashboard
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            My Bookings
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-400">
            View your upcoming sessions, keep track of cancelled bookings, and
            manage your football training schedule in one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/training-sessions">
              <Button className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
                Browse Sessions
              </Button>
            </Link>
            <Link to="/player-dashboard">
              <Button
                variant="secondary"
                className="rounded-full border border-white/10"
              >
                Go to Dashboard
              </Button>
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
          <div className="rounded-3xl border border-dashed border-white/10 bg-neutral-900/60 p-8">
            <EmptyState
              title="No bookings yet"
              description="You have not booked any training sessions yet. Start exploring available sessions and reserve your place."
              action={
                <Link to="/training-sessions">
                  <Button className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
                    Browse Sessions
                  </Button>
                </Link>
              }
            />
          </div>
        ) : !hasFilteredResults ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-neutral-900/60 p-8">
            <EmptyState
              title="No matching bookings"
              description={`There are no bookings with the status "${statusFilter}".`}
              action={
                <Button
                  variant="secondary"
                  className="rounded-full border border-white/10"
                  onClick={() => setStatusFilter("all")}
                >
                  Clear Filter
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-14">
            {upcomingBookings.length > 0 && (
              <section>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
                      Active Bookings
                    </p>
                    <h2 className="text-2xl font-bold">Upcoming Sessions</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      These are your current active session bookings.
                    </p>
                  </div>

                  <div className="rounded-full border border-white/10 bg-neutral-900 px-4 py-2 text-sm text-neutral-300">
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
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
                      Booking History
                    </p>
                    <h2 className="text-2xl font-bold text-neutral-300">
                      Cancelled Sessions
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Your cancelled sessions are shown here for reference.
                    </p>
                  </div>

                  <div className="rounded-full border border-white/10 bg-neutral-900 px-4 py-2 text-sm text-neutral-300">
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