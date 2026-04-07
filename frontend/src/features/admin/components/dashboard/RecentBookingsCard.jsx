import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import AdminSectionCard from "../ui/AdminSectionCard";
import AdminStatusBadge from "../ui/AdminStatusBadge";
import AdminEmptyState from "../ui/AdminEmptyState";
import { formatDate } from "../../../../utils/formatDate";
import { updateAdminBookingStatus } from "../../services/adminBookingsService";

function RecentBookingsCard({ bookings: initialBookings = [] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  async function handleStatusChange(bookingId, newStatus) {
    try {
      setUpdatingId(bookingId);
      await updateAdminBookingStatus(bookingId, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );
    } catch {
      // silently fail — admin can use the full bookings page for retry
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AdminSectionCard
      title="Recent Bookings"
      description="Latest booking activity across the academy."
      actions={
        <Link to="/admin-dashboard/bookings">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            View All
          </Button>
        </Link>
      }
      contentClassName="!p-0"
    >
      {!bookings.length ? (
        <div className="p-6">
          <AdminEmptyState
            title="No recent bookings"
            description="Recent booking activity will appear here."
          />
        </div>
      ) : (
        <div className="divide-y divide-app-border">
          {bookings.map((booking) => {
            const playerName =
              booking.player_name ||
              booking.player_username ||
              "Unknown Player";

            const sessionTitle =
              booking.session_title ||
              booking.program_title ||
              booking.session_program_title ||
              "Training session";

            const bookedDate = booking.created_at || booking.booked_at;
            const isPending = booking.status === "pending";
            const isUpdating = updatingId === booking.id;

            return (
              <div
                key={booking.id}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-app-surface-2"
              >
                {/* Avatar + info */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-semibold text-brand-primary">
                    {playerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-app-text">
                      {playerName}
                    </p>
                    <p className="truncate text-xs text-app-text-muted">
                      {sessionTitle} · {formatDate(bookedDate)}
                    </p>
                  </div>
                </div>

                {/* Status + actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <AdminStatusBadge label={booking.status || "Pending"} />

                  {isPending && (
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={isUpdating}
                        loading={isUpdating}
                        onClick={() =>
                          handleStatusChange(booking.id, "confirmed")
                        }
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="danger-outline"
                        disabled={isUpdating}
                        onClick={() =>
                          handleStatusChange(booking.id, "cancelled")
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminSectionCard>
  );
}

export default RecentBookingsCard;
