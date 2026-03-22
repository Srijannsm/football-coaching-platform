import AdminSectionCard from "../ui/AdminSectionCard";
import AdminStatusBadge from "../ui/AdminStatusBadge";
import AdminEmptyState from "../ui/AdminEmptyState";
import { formatDate } from "../../../../utils/formatDate";

function RecentBookingsCard({ bookings = [] }) {
    return (
        <AdminSectionCard
            title="Recent Bookings"
            description="Latest booking activity across the academy."
        >
            {!bookings.length ? (
                <AdminEmptyState
                    title="No recent bookings"
                    description="Recent booking activity will appear here."
                />
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="flex items-start justify-between gap-4 rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 transition hover:bg-app-surface-2/80"
                        >
                            <div className="min-w-0">
                                <p className="font-medium text-app-text">
                                    {booking.player_name ||
                                        booking.player_username ||
                                        "Unknown Player"}
                                </p>

                                <p className="mt-1 text-sm text-app-text-muted">
                                    {booking.program_title ||
                                        booking.session_program_title ||
                                        "Training session"}
                                </p>

                                <p className="mt-1 text-xs text-app-text-muted">
                                    Booked on {formatDate(booking.created_at || booking.booked_at)}
                                </p>
                            </div>

                            <AdminStatusBadge label={booking.status || "Pending"} />
                        </div>
                    ))}
                </div>
            )}
        </AdminSectionCard>
    );
}

export default RecentBookingsCard;