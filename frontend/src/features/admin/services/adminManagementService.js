import api from "../../../api/axios";

// ---------- Players ----------
export async function getAdminPlayers() {
  const response = await api.get("/admin/players/");
  return response.data;
}

export async function updateAdminPlayer(playerId, payload) {
  const response = await api.patch(`/admin/players/${playerId}/`, payload);
  return response.data;
}

// ---------- Coaches ----------
export async function getAdminCoaches() {
  const response = await api.get("/admin/coaches/directory/");
  return response.data;
}

// ---------- Programs ----------
export async function getAdminPrograms(status = "") {
  const response = await api.get("/admin/programs/", {
    params: status ? { status } : {},
  });
  return response.data;
}

export async function createAdminProgram(payload) {
  const response = await api.post("/admin/programs/", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function updateAdminProgram(programId, payload) {
  const response = await api.patch(`/admin/programs/${programId}/`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteAdminProgram(programId) {
  const response = await api.delete(`/admin/programs/${programId}/`);
  return response.data;
}

// ---------- Sessions ----------
export async function getAdminSessions(status = "") {
  const response = await api.get("/admin/sessions/", {
    params: status ? { status } : {},
  });
  return response.data;
}

export async function createAdminSession(payload) {
  const response = await api.post("/admin/sessions/", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function updateAdminSession(sessionId, payload) {
  const response = await api.patch(`/admin/sessions/${sessionId}/`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteAdminSession(sessionId) {
  const response = await api.delete(`/admin/sessions/${sessionId}/`);
  return response.data;
}

// ---------- Bookings ----------
export async function getAdminBookings(status = "") {
  const response = await api.get("/admin/bookings/", {
    params: status ? { status } : {},
  });
  return response.data;
}

export async function updateAdminBookingStatus(bookingId, status) {
  const response = await api.patch(`/admin/bookings/${bookingId}/status/`, {
    status,
  });
  return response.data;
}

export async function deleteAdminBooking(bookingId) {
  const response = await api.delete(`/admin/bookings/${bookingId}/`);
  return response.data;
}

// ---------- Enquiries ----------
export async function getAdminEnquiries(status = "") {
  const response = await api.get("/admin/enquiries/", {
    params: status ? { status } : {},
  });
  return response.data;
}

export async function getAdminEnquiryDetail(enquiryId) {
  const response = await api.get(`/admin/enquiries/${enquiryId}/`);
  return response.data;
}

export async function updateAdminEnquiry(enquiryId, payload) {
  const response = await api.patch(`/admin/enquiries/${enquiryId}/`, payload);
  return response.data;
}

export async function deleteAdminEnquiry(enquiryId) {
  const response = await api.delete(`/admin/enquiries/${enquiryId}/`);
  return response.data;
}

// ---------- Helpers ----------
export function buildMultipartFormData(values, options = {}) {
  const {
    skipEmptyString = false,
    skipNull = true,
    skipUndefined = true,
  } = options;

  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (skipUndefined && value === undefined) return;
    if (skipNull && value === null) return;
    if (skipEmptyString && value === "") return;

    formData.append(key, value);
  });

  return formData;
}

export function buildProgramFormData(values) {
  return buildMultipartFormData(values, {
    skipEmptyString: false,
  });
}

export function buildSessionFormData(values) {
  return buildMultipartFormData(values, {
    skipEmptyString: false,
  });
}