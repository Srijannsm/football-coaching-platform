import api from "../../../api/axios";

export async function getAdminDashboard() {
  const response = await api.get("/admin/dashboard/");
  return response.data;
}