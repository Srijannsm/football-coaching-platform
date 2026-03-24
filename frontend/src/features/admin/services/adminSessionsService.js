import api from "../../../api/axios";
import { buildAdminQueryParams } from "../utils/buildAdminQueryParams";

export function buildSessionFormData(data) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, value);
  });

  return formData;
}

export async function getAdminSessions(params = {}) {
  const response = await api.get("/admin/sessions/", {
    params: buildAdminQueryParams(params),
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

export async function getAdminCoaches() {
  const response = await api.get("/admin/coaches/directory/");
  return response.data;
}
