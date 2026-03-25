import { CalendarDays, ClipboardList, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import AdminSectionCard from "../ui/AdminSectionCard";
import AdminStatusBadge from "../ui/AdminStatusBadge";
import AdminEmptyState from "../ui/AdminEmptyState";
import { formatDate } from "../../../../utils/formatDate";

function MetaPill({ icon: Icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-app-border bg-app-card px-3 py-1.5 text-xs font-medium text-app-text-muted">
      <Icon size={14} className="text-app-text-muted" />
      <span>{text}</span>
    </div>
  );
}

function RecentBookingsCard({ bookings = [] }) {
  return (
    <AdminSectionCard
      title="Recent Bookings"
      description="Latest booking activity across the academy."
      actions={
        <Link to="/admin-dashboard/bookings">
          <Button variant="outline" className="whitespace-nowrap">
            Manage Sessions
          </Button>
        </Link>
        }      
    >
      {!bookings.length ? (
        <AdminEmptyState
          title="No recent bookings"
          description="Recent booking activity will appear here."
        />
      ) : (
        <div className="space-y-4">
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

            return (
              <div
                key={booking.id}
                className="group rounded-3xl border border-app-border bg-app-surface-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/30 hover:bg-app-surface hover:shadow-[var(--shadow-soft)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-base font-bold tracking-tight text-app-text">
                        {playerName}
                      </h4>
                    </div>

                    <p className="mt-2 text-sm font-medium text-app-text-soft">
                      {sessionTitle}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <MetaPill icon={UserRound} text={playerName} />
                      <MetaPill
                        icon={CalendarDays}
                        text={`Booked ${formatDate(bookedDate)}`}
                      />
                      <MetaPill icon={ClipboardList} text="Booking Activity" />
                    </div>
                  </div>

                  <div className="shrink-0">
                    <AdminStatusBadge label={booking.status || "Pending"} />
                  </div>
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