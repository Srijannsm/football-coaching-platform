import api from "../api/axios";

export async function getPlayerDashboard() {
  const response = await api.get("/bookings/dashboard/");
  return response.data;
}