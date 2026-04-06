import api from "../api/axios";

export async function createBooking(sessionId, paymentMethod = "cash") {
  const response = await api.post("/bookings/", {
    session: sessionId,
    payment_method: paymentMethod,
  });

  return response.data;
}

export async function initiatePayment(bookingId, method) {
  const response = await api.post("/payments/initiate/", {
    booking_id: bookingId,
    method,
  });
  return response.data;
}

export async function verifyPayment(payload) {
  const response = await api.post("/payments/verify/", payload);
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

export async function cancelBooking(bookingId, reason = "") {
  const response = await api.patch(`/my-bookings/${bookingId}/cancel/`, {
    cancellation_reason: reason,
  });
  return response.data;
}