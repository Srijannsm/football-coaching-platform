import { useCallback, useEffect, useState } from "react";
import { getAdminDashboard } from "../services/adminDashboardService";
import { getErrorMessage } from "../../../utils/getErrorMessage";

export function useAdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getAdminDashboard();
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load admin dashboard."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}