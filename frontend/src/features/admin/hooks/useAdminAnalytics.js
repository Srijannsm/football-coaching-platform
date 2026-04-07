import { useCallback, useEffect, useState } from 'react';
import { getAnalytics } from '../services/analyticsService';

export function useAdminAnalytics() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);
      const response = await getAnalytics();
      setData(response.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err?.response?.data?.detail || 'Failed to load analytics data.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
