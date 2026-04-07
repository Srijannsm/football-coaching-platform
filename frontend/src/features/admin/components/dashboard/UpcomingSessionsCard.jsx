import { CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import AdminSectionCard from "../ui/AdminSectionCard";
import AdminEmptyState from "../ui/AdminEmptyState";
import { formatDate } from "../../../../utils/formatDate";
import { formatTime } from "../../../../utils/formatTime";

const statusConfig = {
  cancelled: "bg-app-danger-bg text-app-danger-text border-app-danger-border",
  published: "bg-app-success-bg text-app-success-text border-app-success-border",
  draft: "bg-app-warning-bg text-app-warning-text border-app-warning-border",
};

function SessionStatusBadge({ isCancelled, isPublished }) {
  const label = isCancelled ? "Cancelled" : isPublished ? "Published" : "Draft";
  const cls = isCancelled
    ? statusConfig.cancelled
    : isPublished
    ? statusConfig.published
    : statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}
    >
      {label}
    </span>
  );
}

function UpcomingSessionsCard({ sessions = [] }) {
  return (
    <AdminSectionCard
      title="Upcoming Sessions"
      description="Next scheduled training sessions."
      actions={
        <Link to="/admin-dashboard/sessions">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            Manage Sessions
          </Button>
        </Link>
      }
      contentClassName="!p-0"
    >
      {!sessions.length ? (
        <div className="p-6">
          <AdminEmptyState
            title="No upcoming sessions"
            description="Upcoming sessions will appear here once created."
          />
        </div>
      ) : (
        <div className="divide-y divide-app-border">
          {sessions.map((session) => {
            const isCancelled = Boolean(session.is_cancelled);
            const isPublished = Boolean(session.is_published);

            return (
              <div
                key={session.id}
                className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-app-surface-2"
              >
                {/* Left: Date block + info */}
                <div className="flex min-w-0 items-start gap-3">
                  {/* Date block */}
                  <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-app-border bg-app-surface-2 py-2 text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-app-text-muted">
                      {new Date(session.session_date).toLocaleDateString("en-GB", { month: "short" })}
                    </span>
                    <span className="text-lg font-bold leading-none text-app-text">
                      {new Date(session.session_date).getDate()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-app-text">
                        {session.program_title || "Training Session"}
                      </p>
                      <SessionStatusBadge
                        isCancelled={isCancelled}
                        isPublished={isPublished}
                      />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-app-text-muted">
                      {session.coach_name || session.coach_full_name ? (
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {session.coach_name || session.coach_full_name}
                        </span>
                      ) : null}
                      {session.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {session.location}
                        </span>
                      ) : null}
                      {session.start_time ? (
                        <span className="flex items-center gap-1">
                          <Clock3 size={11} />
                          {formatTime(session.start_time)}
                          {session.end_time ? ` – ${formatTime(session.end_time)}` : ""}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Right: Capacity */}
                {typeof session.max_players !== "undefined" &&
                  session.max_players !== null && (
                    <div className="shrink-0 text-right">
                      <span className="text-xs text-app-text-muted">Capacity</span>
                      <p className="text-sm font-semibold text-app-text">
                        {session.max_players}
                      </p>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </AdminSectionCard>
  );
}

export default UpcomingSessionsCard;
