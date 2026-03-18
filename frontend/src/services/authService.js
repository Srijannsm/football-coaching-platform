import api from "../api/axios";

export async function getCurrentUser() {
  const response = await api.get("/me/");
  return response.data;
}

export async function loginUser(credentials) {
  const response = await api.post("/token/", credentials);
  return response.data;
}