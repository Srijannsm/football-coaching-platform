import AdminStatusBadge from "./AdminStatusBadge";
import { formatDate } from "../../../../utils/formatDate";

function formatBookingStatus(status) {
  if (status === "confirmed") return "Confirmed";
  if (status === "cancelled") return "Cancelled";
  if (status === "attended") return "Attended";
  if (status === "missed") return "Missed";
  return "Pending";
}

function AdminPlayerBookingsDetailsView({
  playerName,
  bookings = [],
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-app-border bg-app-surface-2 p-6 text-sm text-app-text-muted">
        Loading player bookings...
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="rounded-2xl border border-app-border bg-app-surface-2 p-6 text-sm text-app-text-muted">
        {playerName || "This player"} has no bookings yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-app-border">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-app-border">
          <thead className="bg-app-surface-2/70">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-app-text-muted">
                Program
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-app-text-muted">
                Session Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-app-text-muted">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-app-text-muted">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-app-text-muted">
                Booked On
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-app-border bg-app-card">
            {bookings.map((booking) => (
              <tr key={booking.id} className="text-sm text-app-text">
                <td className="px-4 py-3 font-medium">
                  {booking.program_title || "Training session"}
                </td>
                <td className="px-4 py-3 text-app-text-muted">
                  {booking.session_date ? formatDate(booking.session_date) : "N/A"}
                </td>
                <td className="px-4 py-3 text-app-text-muted">
                  {booking.location || "Location unavailable"}
                </td>
                <td className="px-4 py-3">
                  <AdminStatusBadge label={formatBookingStatus(booking.status)} />
                </td>
                <td className="px-4 py-3 text-app-text-muted">
                  {booking.booked_at ? formatDate(booking.booked_at) : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPlayerBookingsDetailsView;
