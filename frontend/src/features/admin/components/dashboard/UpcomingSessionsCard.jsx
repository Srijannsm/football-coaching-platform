import AdminSectionCard from "../ui/AdminSectionCard";
import AdminEmptyState from "../ui/AdminEmptyState";
import { formatDate } from "../../../../utils/formatDate";
import { formatTime } from "../../../../utils/formatTime";

function UpcomingSessionsCard({ sessions = [] }) {
  return (
    <AdminSectionCard
      title="Upcoming Sessions"
      description="Keep track of the next scheduled training sessions."
    >
      {!sessions.length ? (
        <AdminEmptyState
          title="No upcoming sessions"
          description="Upcoming sessions will appear here once created."
        />
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 transition hover:bg-app-surface-2/80"
            >
              <p className="font-medium text-app-text">
                {session.program_title || "Training session"}
              </p>

              <p className="mt-1 text-sm text-app-text-muted">
                {session.location || "Location not set"}
              </p>

              <p className="mt-2 text-xs text-app-text-muted">
                {formatDate(session.session_date)} • {formatTime(session.start_time)}
                {session.end_time ? ` - ${formatTime(session.end_time)}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </AdminSectionCard>
  );
}

export default UpcomingSessionsCard;