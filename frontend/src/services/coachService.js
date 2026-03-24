import api from "../api/axios";

export async function getCoachProfiles() {
  const response = await api.get("/coaches/profiles/");
  return Array.isArray(response.data) ? response.data : response.data?.results || [];
}