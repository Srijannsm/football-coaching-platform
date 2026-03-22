import api from "../../../api/axios";
import { buildAdminQueryParams } from "../utils/buildAdminQueryParams";

export function buildProgramFormData(data) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, value);
  });

  return formData;
}

export async function getAdminPrograms(params = {}) {
  const response = await api.get("/admin/programs/", {
    params: buildAdminQueryParams(params),
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
