import { useCallback, useEffect, useState } from "react";
import {
  getAdminNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/adminNotificationsService";

const POLL_INTERVAL = 30_000;

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getAdminNotifications();
      setNotifications(data.results ?? []);
      setUnreadCount(data.unread_count ?? 0);
    } catch {
      // Silently fail — polling must not disrupt the UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  const markRead = useCallback(
    async (id) => {
      try {
        await markNotificationRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    },
    []
  );

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  return { notifications, unreadCount, loading, markRead, markAllRead };
}
