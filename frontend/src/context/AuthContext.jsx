import { useEffect, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        // The access_token cookie is sent automatically.
        // If it is expired the axios interceptor will transparently refresh it
        // using the refresh_token cookie before this await resolves.
        const response = await api.get("/me/");
        setUser(response.data);
        setIsAuthenticated(true);
      } catch {
        // Both the access and refresh tokens are absent or expired.
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    }

    initAuth();
  }, []);

  async function login(credentials) {
    // POST /login/ sets the access_token and refresh_token cookies server-side.
    await api.post("/login/", credentials);

    // Fetch the user object now that the cookie is in place.
    const userResponse = await api.get("/me/");
    setUser(userResponse.data);
    setIsAuthenticated(true);

    return userResponse.data;
  }

  async function logout() {
    try {
      // Ask the server to clear both HttpOnly cookies.
      await api.post("/logout/");
    } catch {
      // Even if the request fails, clear client state.
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
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
