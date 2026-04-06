import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Clock } from "lucide-react";
import Button from "./ui/Button";
import { formatSessionTimeRange } from "../utils/formatSessionTimeRange";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CompactSessionCard({ session, isAdmin }) {
  const navigate = useNavigate();
  const isFull = session.is_full;
  const isAlreadyBooked = session.is_booked_by_current_user;

  const statusLabel = isAlreadyBooked ? "Booked" : isFull ? "Full" : "Open";
  const statusClass = isAlreadyBooked
    ? "bg-blue-100 text-blue-700"
    : isFull
    ? "bg-red-100 text-red-700"
    : "bg-green-100 text-green-700";

  const accentColor = isAlreadyBooked
    ? "bg-blue-500"
    : isFull
    ? "bg-red-400"
    : "bg-emerald-500";

  // Parse date without timezone shift
  const dateLabel = session.session_date
    ? (() => {
        const [y, mo, d] = session.session_date.split("-").map(Number);
        return new Date(y, mo - 1, d).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
      })()
    : null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-app-border bg-app-card transition duration-200 hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-md">
      {/* Top accent strip */}
      <div className={`h-1 w-full ${accentColor}`} />

      <div className="flex flex-1 flex-col p-4">
        {/* Header row */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            {dateLabel && (
              <p className="mb-1 text-xs font-medium text-app-text-muted">{dateLabel}</p>
            )}
            <span className="inline-flex rounded-full bg-brand-primary-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-app-text">
              {session.session_type?.replaceAll("_", " ") || "Training"}
            </span>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}>
            {statusLabel}
          </span>
        </div>

        {/* Title */}
        <h4 className="mb-3 text-sm font-bold leading-snug text-app-text line-clamp-2">
          {session.program_title || "Training Session"}
        </h4>

        {/* Meta */}
        <div className="mb-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-app-text-soft">
            <User size={11} className="shrink-0 text-app-text-muted" />
            <span className="truncate">{session.coach_full_name || "Coach not assigned"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-app-text-soft">
            <MapPin size={11} className="shrink-0 text-app-text-muted" />
            <span className="truncate">{session.location || "Location not set"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-app-text-soft">
            <Clock size={11} className="shrink-0 text-app-text-muted" />
            <span>{formatSessionTimeRange(session.start_time, session.end_time)}</span>
          </div>
        </div>

        {/* Price + actions */}
        <div className="mt-auto">
          <div className="mb-3 flex items-center justify-between border-t border-app-border pt-3">
            <span className="text-xs text-app-text-muted">Price</span>
            <span className="text-sm font-bold text-app-text">Rs. {session.price}</span>
          </div>

          <div className="flex gap-2">
            {isAdmin ? (
              <Button
                size="sm"
                type="button"
                fullWidth
                onClick={() =>
                  navigate("/admin-dashboard/sessions", {
                    state: { highlightSessionId: session.id, highlightNonce: Date.now() },
                  })
                }
              >
                Edit Session
              </Button>
            ) : (
              <Button
                size="sm"
                type="button"
                variant="outline"
                fullWidth
                onClick={() => navigate(`/training-sessions/${session.id}`)}
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarView({ sessions, isAdmin }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const sessionsByDate = useMemo(() => {
    const map = {};
    sessions.forEach((session) => {
      const key = session.session_date;
      if (key) {
        if (!map[key]) map[key] = [];
        map[key].push(session);
      }
    });
    return map;
  }, [sessions]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [currentYear, currentMonth]);

  function getDateKey(day) {
    if (!day) return null;
    return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  }

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const selectedSessions = selectedDate ? (sessionsByDate[selectedDate] || []) : [];

  return (
    <div className="space-y-6">
      {/* Calendar grid */}
      <div className="overflow-hidden rounded-2xl border border-app-border bg-app-card">
        {/* Month navigation */}
        <div className="flex items-center justify-between border-b border-app-border px-6 py-4">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-full text-app-text-muted transition-colors hover:bg-app-surface-2 hover:text-app-text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h3 className="text-lg font-bold text-app-text">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-full text-app-text-muted transition-colors hover:bg-app-surface-2 hover:text-app-text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-app-border bg-app-surface">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-app-text-muted"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dateKey = getDateKey(day);
            const daySessions = dateKey ? (sessionsByDate[dateKey] || []) : [];
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDate;
            const hasSessions = daySessions.length > 0;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (!day || !hasSessions) return;
                  setSelectedDate(isSelected ? null : dateKey);
                }}
                className={[
                  "min-h-[88px] border-b border-r border-app-border p-1.5 transition-colors",
                  !day ? "bg-app-surface" : "",
                  day && hasSessions ? "cursor-pointer hover:bg-brand-primary/5" : "",
                  isSelected ? "bg-brand-primary/5 ring-1 ring-inset ring-brand-primary/20" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {day && (
                  <>
                    <div
                      className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday ? "bg-brand-primary text-white" : "text-app-text"
                      }`}
                    >
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {daySessions.slice(0, 2).map((s) => (
                        <div
                          key={s.id}
                          className={`truncate rounded px-1.5 py-0.5 text-[10px] font-semibold leading-4 text-white ${
                            s.is_booked_by_current_user
                              ? "bg-blue-500"
                              : s.is_full
                              ? "bg-app-danger"
                              : "bg-app-success"
                          }`}
                        >
                          {s.program_title || "Session"}
                        </div>
                      ))}
                      {daySessions.length > 2 && (
                        <p className="px-1 text-[10px] font-medium text-app-text-muted">
                          +{daySessions.length - 2} more
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 text-xs text-app-text-muted">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-app-success" />
          Open
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-app-danger" />
          Full
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-500" />
          Already booked
        </div>
        <p className="ml-auto text-app-text-soft">Click a day to see its sessions</p>
      </div>

      {/* Selected day sessions */}
      {selectedDate && (
        <div>
          <h3 className="mb-4 text-base font-bold text-app-text">
            {(() => {
              const [y, mo, d] = selectedDate.split("-").map(Number);
              return new Date(y, mo - 1, d).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              });
            })()}
            <span className="ml-2 text-sm font-normal text-app-text-muted">
              — {selectedSessions.length} session{selectedSessions.length !== 1 ? "s" : ""}
            </span>
          </h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {selectedSessions.map((session) => (
              <CompactSessionCard
                key={session.id}
                session={session}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarView;
