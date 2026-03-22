import { useEffect, useState } from "react";
import api from "../api/axios";
import { getRefreshToken, setTokens, clearAuthData } from "../utils/auth";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        delete api.defaults.headers.common.Authorization;
        setUser(null);
        setIsAuthenticated(false);
        setIsAuthLoading(false);
        return;
      }

      try {
        const refreshResponse = await api.post("/token/refresh/", {
          refresh: refreshToken,
        });

        const newAccessToken = refreshResponse.data.access;

        setTokens({
          access: newAccessToken,
          refresh: refreshToken,
        });

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        const userResponse = await api.get("/me/");
        setUser(userResponse.data);
        setIsAuthenticated(true);
      } catch {
        clearAuthData();
        delete api.defaults.headers.common.Authorization;
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    }

    initAuth();
  }, []);

  async function login(credentials) {
    const response = await api.post("/login/", credentials);
    const { access, refresh } = response.data;

    setTokens({ access, refresh });
    api.defaults.headers.common.Authorization = `Bearer ${access}`;

    const userResponse = await api.get("/me/");
    setUser(userResponse.data);
    setIsAuthenticated(true);

    return userResponse.data;
  }

  function logout() {
    clearAuthData();
    delete api.defaults.headers.common.Authorization;
    setUser(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        isAuthLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}