import { CalendarDays, Clock3, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import AdminSectionCard from "../ui/AdminSectionCard";
import AdminEmptyState from "../ui/AdminEmptyState";
import { formatDate } from "../../../../utils/formatDate";
import { formatTime } from "../../../../utils/formatTime";

function InfoPill({ icon: Icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-app-border bg-app-card px-3 py-1.5 text-xs font-medium text-app-text-muted">
      <Icon size={14} className="text-app-text-muted" />
      <span>{text}</span>
    </div>
  );
}

function StatusPill({ label, tone = "default" }) {
  const toneClassMap = {
    default: "border-app-border bg-app-card text-app-text-muted",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    danger: "border-red-200 bg-red-50 text-red-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
        toneClassMap[tone] || toneClassMap.default
      }`}
    >
      {label}
    </span>
  );
}

function UpcomingSessionsCard({ sessions = [] }) {
  return (
    <AdminSectionCard
      title="Upcoming Sessions"
      description="Keep track of the next scheduled training sessions."
      actions={
        <Link to="/admin-dashboard/sessions">
          <Button variant="outline" className="whitespace-nowrap">
            Manage Sessions
          </Button>
        </Link>
      }
    >
      {!sessions.length ? (
        <div className="py-4">
          <AdminEmptyState
            title="No upcoming sessions"
            description="Upcoming sessions will appear here once created."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const isCancelled = Boolean(session.is_cancelled);
            const isPublished = Boolean(session.is_published);

            return (
              <div
                key={session.id}
                className="group rounded-3xl border border-app-border bg-app-surface-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/30 hover:bg-app-surface hover:shadow-[var(--shadow-soft)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-bold tracking-tight text-app-text sm:text-lg">
                        {session.program_title || "Training Session"}
                      </h3>

                      {isCancelled ? (
                        <StatusPill label="Cancelled" tone="danger" />
                      ) : isPublished ? (
                        <StatusPill label="Published" tone="success" />
                      ) : (
                        <StatusPill label="Draft" tone="warning" />
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <InfoPill
                        icon={UserRound}
                        text={session.coach_name || session.coach_full_name || "Coach not assigned"}
                      />
                      <InfoPill
                        icon={MapPin}
                        text={session.location || "Location not set"}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <InfoPill
                        icon={Clock3}
                        text={`${formatTime(session.start_time)}${
                          session.end_time ? ` - ${formatTime(session.end_time)}` : ""
                        }`}
                      />

                      {typeof session.max_players !== "undefined" &&
                      session.max_players !== null ? (
                        <InfoPill
                          icon={ShieldCheck}
                          text={`Capacity: ${session.max_players}`}
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-app-border bg-app-card px-3 py-2 text-sm font-semibold text-app-text">
                      <CalendarDays size={16} className="text-brand-primary" />
                      <span>{formatDate(session.session_date)}</span>
                    </div>
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

export default UpcomingSessionsCard;