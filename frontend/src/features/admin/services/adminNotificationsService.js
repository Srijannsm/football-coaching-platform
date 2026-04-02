import api from "../../../api/axios";

export async function getAdminNotifications() {
  const response = await api.get("/admin/notifications/");
  return response.data;
}

export async function markNotificationRead(id) {
  const response = await api.patch(`/admin/notifications/${id}/read/`);
  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await api.post("/admin/notifications/mark-all-read/");
  return response.data;
}
