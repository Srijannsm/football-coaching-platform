import api from "../api/axios";

export async function createBooking(sessionId) {
  const response = await api.post("/bookings/", {
    session: sessionId,
  });

  return response.data;
}

export async function getMyBookings() {
  const response = await api.get("/my-bookings/?status=all");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data.results)) {
    return response.data.results;
  }

  return [];
}

export async function cancelBooking(bookingId) {
  const response = await api.put(`/my-bookings/${bookingId}/cancel/`);
  return response.data;
}