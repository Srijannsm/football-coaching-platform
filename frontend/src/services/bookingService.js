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
  const allBookings = [];
  let url = "/my-bookings/?status=all";

  while (url) {
    const response = await api.get(url);
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response.data.results)) {
      allBookings.push(...response.data.results);
    }
    url = response.data.next || null;
  }

  return allBookings;
}

export async function cancelBooking(bookingId, reason = "") {
  const response = await api.patch(`/my-bookings/${bookingId}/cancel/`, {
    cancellation_reason: reason,
  });
  return response.data;
}
