import api from "../../../api/axios";
import { buildAdminQueryParams } from "../utils/buildAdminQueryParams";

export async function getAdminBookings(params = {}) {
  const response = await api.get("/admin/bookings/", {
    params: buildAdminQueryParams(params),
  });
  return response.data;
}

export async function deleteAdminBooking(bookingId) {
  const response = await api.delete(`/admin/bookings/${bookingId}/`);
  return response.data;
}

export async function updateAdminBookingStatus(bookingId, payload) {
  const response = await api.patch(`/admin/bookings/${bookingId}/status/`, payload);
  return response.data;
}

export async function bulkUpdateAdminBookingStatus(payload) {
  const response = await api.post("/admin/bookings/bulk-status/", payload);
  return response.data;
}

export async function bulkDeleteAdminBookings(ids) {
  const response = await api.post("/admin/bookings/bulk-delete/", { ids });
  return response.data;
}
