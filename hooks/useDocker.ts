import { useState, useEffect, useCallback } from 'react';
import { dockerAPI, Container } from '../lib/docker';

export function useDocker() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  const fetchContainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dockerAPI.listContainers();
      setContainers(data.containers);
      setIsMock(data.mock || false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const controlContainer = useCallback(async (id: string, operation: 'start' | 'stop' | 'restart' | 'pause' | 'unpause') => {
    try {
      await dockerAPI.controlContainer(id, operation);
      await fetchContainers();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [fetchContainers]);

  const getLogs = useCallback(async (id: string, tail: number = 100) => {
    try {
      const data = await dockerAPI.getContainerLogs(id, tail);
      return data.logs;
    } catch (err: any) {
      setError(err.message);
      return '';
    }
  }, []);

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchContainers]);

  return {
    containers,
    loading,
    error,
    isMock,
    refresh: fetchContainers,
    startContainer: (id: string) => controlContainer(id, 'start'),
    stopContainer: (id: string) => controlContainer(id, 'stop'),
    restartContainer: (id: string) => controlContainer(id, 'restart'),
    pauseContainer: (id: string) => controlContainer(id, 'pause'),
    unpauseContainer: (id: string) => controlContainer(id, 'unpause'),
    getLogs,
  };
}