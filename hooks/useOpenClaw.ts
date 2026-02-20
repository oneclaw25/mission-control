/**
 * React hooks for OpenClaw API integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import openclaw, { 
  SystemStatus, 
  AgentInfo, 
  AgentStatus, 
  Task, 
  MemoryEntry, 
  CronJob, 
  Model,
  ModelMetrics,
  ActivityEvent,
  Metrics 
} from '../lib/openclaw';

// Hook for polling with interval
function usePolling<T>(
  fetchFn: () => Promise<T>,
  interval: number = 30000,
  immediate: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }

    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, interval, immediate]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for system status
export function useSystemStatus(pollInterval: number = 30000) {
  return usePolling<SystemStatus>(() => openclaw.getStatus(), pollInterval);
}

// Hook for metrics
export function useMetrics(pollInterval: number = 30000) {
  return usePolling<Metrics>(() => openclaw.getMetrics(), pollInterval);
}

// Hook for agents
export function useAgents(pollInterval: number = 30000) {
  return usePolling<AgentInfo[]>(() => openclaw.getAgents(), pollInterval);
}

// Hook for single agent status
export function useAgentStatus(agentId: string, pollInterval: number = 30000) {
  return usePolling<AgentStatus>(
    () => openclaw.getAgentStatus(agentId),
    pollInterval
  );
}

// Hook for tasks
export function useTasks(pollInterval: number = 30000) {
  const { data, loading, error, refetch } = usePolling<Task[]>(
    () => openclaw.getTasks(),
    pollInterval
  );

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const updated = await openclaw.updateTask(taskId, updates);
    refetch();
    return updated;
  }, [refetch]);

  const createTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await openclaw.createTask(task);
    refetch();
    return created;
  }, [refetch]);

  return { 
    tasks: data || [], 
    loading, 
    error, 
    refetch, 
    updateTask, 
    createTask 
  };
}

// Hook for memory entries
export function useMemoryEntries(pollInterval: number = 60000) {
  return usePolling<MemoryEntry[]>(() => openclaw.getMemoryEntries(), pollInterval);
}

// Hook for memory search
export function useMemorySearch(query: string) {
  const [results, setResults] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      try {
        setLoading(true);
        const entries = await openclaw.searchMemory(query);
        setResults(entries);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { results, loading, error };
}

// Hook for cron jobs
export function useCronJobs(pollInterval: number = 60000) {
  return usePolling<CronJob[]>(() => openclaw.getCronJobs(), pollInterval);
}

// Hook for models
export function useModels(pollInterval: number = 60000) {
  const { data, loading, error, refetch } = usePolling<Model[]>(
    () => openclaw.getModels(),
    pollInterval
  );

  const switchModel = useCallback(async (modelId: string, agentId?: string) => {
    await openclaw.switchModel(modelId, agentId);
    refetch();
  }, [refetch]);

  return {
    models: data || [],
    loading,
    error,
    refetch,
    switchModel,
  };
}

// Hook for current model
export function useCurrentModel(pollInterval: number = 30000) {
  const { data, loading, error } = usePolling<string>(
    () => openclaw.getCurrentModel(),
    pollInterval
  );

  return {
    currentModel: data || 'unknown',
    loading,
    error,
  };
}

// Hook for model metrics
export function useModelMetrics(modelId: string, pollInterval: number = 30000) {
  return usePolling<ModelMetrics>(
    () => openclaw.getModelMetrics(modelId),
    pollInterval
  );
}

// Hook for activity feed
export function useActivityFeed(limit: number = 20, pollInterval: number = 30000) {
  return usePolling<ActivityEvent[]>(
    () => openclaw.getRecentActivity(limit),
    pollInterval
  );
}

export default {
  useSystemStatus,
  useMetrics,
  useAgents,
  useAgentStatus,
  useTasks,
  useMemoryEntries,
  useMemorySearch,
  useCronJobs,
  useModels,
  useCurrentModel,
  useModelMetrics,
  useActivityFeed,
};
