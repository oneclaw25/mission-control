import { useState, useEffect, useCallback } from 'react';
import { systemAPI, SystemMetrics, HealthStatus } from '../lib/system';

export function useSystemMetrics(refreshInterval: number = 3000) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [history, setHistory] = useState<Array<{ time: number; cpu: number; memory: number }>>([]);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await systemAPI.getMetrics();
      setMetrics(data);
      setIsMock(data.mock || false);
      
      // Update history
      setHistory(prev => {
        const newHistory = [...prev, { 
          time: data.timestamp, 
          cpu: data.cpu.usage_percent, 
          memory: data.memory.percent 
        }];
        // Keep last 60 data points (3 minutes at 3 second intervals)
        if (newHistory.length > 60) {
          return newHistory.slice(-60);
        }
        return newHistory;
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchMetrics, refreshInterval]);

  return {
    metrics,
    history,
    loading,
    error,
    isMock,
    refresh: fetchMetrics,
    formatBytes: systemAPI.formatBytes,
    formatUptime: systemAPI.formatUptime,
  };
}

export function useHealthStatus(refreshInterval: number = 10000) {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await systemAPI.getHealth();
      setStatus(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchHealth, refreshInterval]);

  return {
    status,
    loading,
    error,
    refresh: fetchHealth,
  };
}