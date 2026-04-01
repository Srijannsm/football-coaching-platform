import api from "../api/axios";

export async function getCurrentUser() {
  const response = await api.get("/me/");
  return response.data;
}
