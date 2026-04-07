import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar, MessageSquare, UserPlus, X } from "lucide-react";
import { useAdminNotifications } from "../../hooks/useAdminNotifications";

const TYPE_ICON = {
  enquiry: MessageSquare,
  booking: Calendar,
  cancellation: X,
  registration: UserPlus,
};

const TYPE_COLOR = {
  enquiry: "text-blue-500 bg-blue-500/10",
  booking: "text-emerald-500 bg-emerald-500/10",
  cancellation: "text-red-500 bg-red-500/10",
  registration: "text-brand-primary bg-brand-primary/10",
};

function timeAgo(dateString) {
  const diff = (Date.now() - new Date(dateString)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationItem({ notification, onRead }) {
  const navigate = useNavigate();
  const Icon = TYPE_ICON[notification.notification_type] ?? Bell;
  const colorClass = TYPE_COLOR[notification.notification_type] ?? "text-app-text-muted bg-app-surface-2";

  function handleClick() {
    if (!notification.is_read) onRead(notification.id);
    if (notification.link) navigate(notification.link);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-app-surface-2 ${
        notification.is_read ? "opacity-60" : ""
      }`}
    >
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
        <Icon size={15} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${notification.is_read ? "font-normal text-app-text-soft" : "font-semibold text-app-text"}`}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
          )}
        </div>
        {notification.message && (
          <p className="mt-0.5 truncate text-xs text-app-text-muted">
            {notification.message}
          </p>
        )}
        <p className="mt-1 text-xs text-app-text-muted">
          {timeAgo(notification.created_at)}
        </p>
      </div>
    </button>
  );
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, unreadCount, loading, markRead, markAllRead } =
    useAdminNotifications();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-2xl border border-app-border bg-app-surface-2 p-2 text-app-text-muted transition hover:border-brand-primary hover:text-brand-primary"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-[1.25rem] border border-app-border bg-app-card shadow-[var(--shadow-premium)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-app-border px-4 py-3">
            <p className="text-sm font-semibold text-app-text">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-brand-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto app-scroll">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-app-text-muted">
                Loading…
              </p>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={28} className="mx-auto mb-2 text-app-text-muted opacity-40" />
                <p className="text-sm text-app-text-muted">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-app-border">
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onRead={markRead}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
