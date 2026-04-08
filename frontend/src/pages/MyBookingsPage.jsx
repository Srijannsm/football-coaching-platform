import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/ui/StatusBadge";
import Alert from "../components/ui/Alert";
import { Card, CardContent } from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import { useToast } from "../hooks/useToast";
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
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${isActive
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

const PAYMENT_METHOD_LABELS = { cash: "Cash", esewa: "eSewa", khalti: "Khalti" };

function PaymentBadge({ method, paymentStatus }) {
  if (!method) return null;

  const methodLabel = PAYMENT_METHOD_LABELS[method] ?? method;
  const statusLabel =
    paymentStatus === "completed"
      ? "Paid"
      : paymentStatus === "failed"
        ? "Failed"
        : "Pending";

  const colorClass =
    paymentStatus === "completed"
      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : paymentStatus === "failed"
        ? "border-red-400/30 bg-red-500/10 text-red-600 dark:text-red-400"
        : "border-amber-400/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${colorClass}`}
    >
      {methodLabel} · {statusLabel}
    </span>
  );
}

function CancelBookingDialog({ open, onConfirm, onClose, isLoading }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape" && !isLoading) {
        handleClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isLoading]);

  function handleConfirm() {
    onConfirm(reason.trim());
    setReason("");
  }

  function handleClose() {
    setReason("");
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget && !isLoading) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-app-border bg-app-card p-6 shadow-2xl">
        <h3 id="cancel-dialog-title" className="text-lg font-semibold text-app-text">Cancel Booking</h3>
        <p className="mt-2 text-sm text-app-text-muted">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-app-text-soft">
            Reason <span className="text-app-text-muted font-normal">(optional)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Schedule conflict, injury, personal reason..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text placeholder:text-app-text-muted outline-none focus:border-brand-primary"
          />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Go Back
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={isLoading}>
            Yes, Cancel Booking
          </Button>
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancelClick, isCancelling, faded = false }) {
  const isCancelled = booking.status === "cancelled";
  const isCancellable = booking.status === "pending" || booking.status === "confirmed";

  return (
    <Card
      className={`overflow-hidden transition ${faded ? "opacity-70" : "hover:-translate-y-0.5"
        }`}
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

              <div className="flex flex-wrap items-center gap-2 self-start">
                <StatusBadge status={booking.status} />
                <PaymentBadge
                  method={booking.payment_method}
                  paymentStatus={booking.payment_status}
                />
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

          {isCancellable && (
            <div className="flex w-full shrink-0 flex-col gap-3 lg:w-auto lg:min-w-[180px]">
              <Button
                onClick={() => onCancelClick(booking.id)}
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
            {booking.cancellation_reason && (
              <p className="mt-1 text-sm text-app-text-muted">
                <span className="font-medium text-app-text-soft">Reason:</span>{" "}
                {booking.cancellation_reason}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BookingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-[1.5rem] bg-app-card" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-28 animate-pulse rounded-[1.25rem] bg-app-surface-2" />
        <div className="h-28 animate-pulse rounded-[1.25rem] bg-app-surface-2" />
        <div className="h-28 animate-pulse rounded-[1.25rem] bg-app-surface-2" />
      </div>

      <div className="h-16 animate-pulse rounded-[1.25rem] bg-app-card" />
      <div className="h-64 animate-pulse rounded-[1.5rem] bg-app-card" />
      <div className="h-64 animate-pulse rounded-[1.5rem] bg-app-card" />
    </div>
  );
}

function MyBookingsPage() {
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelDialogBookingId, setCancelDialogBookingId] = useState(null);
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

  async function handleCancelConfirm(reason) {
    const id = cancelDialogBookingId;
    try {
      setError("");
      setCancelDialogBookingId(null);
      setCancelBookingId(id);

      await cancelBooking(id, reason);
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

  // Stat cards always reflect the full dataset regardless of active filter
  const totalActiveCount = useMemo(
    () => bookings.filter((b) => b.status !== "cancelled").length,
    [bookings]
  );
  const totalCancelledCount = useMemo(
    () => bookings.filter((b) => b.status === "cancelled").length,
    [bookings]
  );

  const activeBookings = useMemo(
    () => filteredBookings.filter((booking) => booking.status !== "cancelled"),
    [filteredBookings]
  );

  const cancelledBookings = useMemo(
    () => filteredBookings.filter((booking) => booking.status === "cancelled"),
    [filteredBookings]
  );

  const hasFilteredResults = filteredBookings.length > 0;

  if (loading) {
    return <BookingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Intro card */}
      <Card className="border-brand-primary/10 bg-gradient-to-r from-brand-primary/5 via-transparent to-transparent">
      </Card>

      {/* Error */}
      {error && (
        <div className="space-y-3">
          <Alert variant="error">{error}</Alert>
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={fetchBookings}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Bookings" value={bookings.length} />
        <StatCard label="Active Sessions" value={totalActiveCount} />
        <StatCard label="Cancelled Sessions" value={totalCancelledCount} />
      </div>

      {/* Filters */}
      {bookings.length > 0 && (
        <StatusFilterBar value={statusFilter} onChange={setStatusFilter} />
      )}

      {/* Empty / filtered empty / sections */}
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
          {activeBookings.length > 0 && (
            <section>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
                    Active Bookings
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-app-text">
                    Current Sessions
                  </h2>
                  <p className="mt-1 text-sm text-app-text-muted">
                    These are your currently active training bookings.
                  </p>
                </div>

                <div className="rounded-full border border-app-border bg-app-card px-4 py-2 text-sm text-app-text-soft">
                  {activeBookings.length} active booking
                  {activeBookings.length !== 1 ? "s" : ""}
                </div>
              </div>

              <div className="space-y-5">
                {activeBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancelClick={setCancelDialogBookingId}
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
                    onCancelClick={setCancelDialogBookingId}
                    isCancelling={false}
                    faded
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <CancelBookingDialog
        open={Boolean(cancelDialogBookingId)}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancelDialogBookingId(null)}
        isLoading={Boolean(cancelBookingId)}
      />
    </div>
  );
}

export default MyBookingsPage;