import axios from "axios";

// In development the Vite proxy rewrites /api → http://localhost:8000/api,
// so a relative path is all that's needed.  Set VITE_API_BASE_URL to an
// absolute URL (e.g. https://api.example.com/api) in production builds.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send HttpOnly cookies with every request
  timeout: 30000, // 30 s — prevents indefinite hangs if the server goes away
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;

    // Never retry refresh or login requests — avoids infinite loops.
    const isRefreshRequest = originalRequest?.url?.includes("/token/refresh/");
    const isLoginRequest = originalRequest?.url?.includes("/login/");

    if (isRefreshRequest || isLoginRequest) {
      return Promise.reject(error);
    }

    if (isUnauthorized && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests that arrived while a refresh is already in flight.
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // The refresh_token cookie is sent automatically — no body needed.
        await api.post("/token/refresh/");
        onRefreshed();
        return api(originalRequest);
      } catch (refreshError) {
        refreshSubscribers = [];
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
