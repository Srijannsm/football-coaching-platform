export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

export function getStoredUser() {
  const user = localStorage.getItem("user");

  try {
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to parse stored user:", error);
    return null;
  }
}

export function isAuthenticated() {
  return !!getAccessToken();
}

export function clearAuthData() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}