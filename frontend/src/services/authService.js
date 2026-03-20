import api from "../api/axios";
import { getRefreshToken, setTokens, clearAuthData } from "../utils/auth";

export async function getCurrentUser() {
  const response = await api.get("/me/");
  return response.data;
}

export async function loginUser(credentials) {
  const response = await api.post("/token/", credentials);
  return response.data;
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();

  if (!refresh) {
    throw new Error("No refresh token found");
  }

  try {
    const response = await api.post("/token/refresh/", { refresh });

    const newAccess = response.data.access;

    setTokens({ access: newAccess, refresh });
    return newAccess;
  } catch (error) {
    clearAuthData();
    throw error;
  }
}