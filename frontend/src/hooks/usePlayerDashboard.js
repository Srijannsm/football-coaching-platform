import { useCallback, useEffect, useState } from "react";
import { getPlayerDashboard } from "../services/playerDashboardService";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useAuth } from "./useAuth";

export function usePlayerDashboard() {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setError("");
      setIsLoading(true);

      const data = await getPlayerDashboard();
      setDashboard(data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError(getErrorMessage(err, "Failed to load player dashboard."));
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      setDashboard(null);
      setError("");
      setIsLoading(false);
      return;
    }

    fetchDashboard();
  }, [isAuthLoading, isAuthenticated, fetchDashboard]);

  return {
    dashboard,
    isLoading: isAuthLoading || isLoading,
    error,
    refetch: fetchDashboard,
  };
}