import { useCallback, useEffect, useState } from "react";
import { getPlayerDashboard } from "../services/playerDashboardService";
import { getErrorMessage } from "../utils/getErrorMessage";

export function usePlayerDashboard() {
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
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}