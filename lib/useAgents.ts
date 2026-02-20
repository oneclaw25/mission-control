import { useState, useEffect, useCallback } from 'react';

export interface SpawnedAgent {
  agentId: string;
  sessionId: string;
  type: string;
  model: string;
  task: string;
  status: 'spawning' | 'running' | 'completed' | 'error';
  pid?: number;
  startTime: string;
  endTime?: string;
  result?: string;
  error?: string;
}

export interface AgentMetrics {
  agentId: string;
  status: string;
  uptime: number;
  cpu: number;
  memory: number;
  tokensProcessed: number;
  messagesExchanged: number;
}

interface UseAgentsReturn {
  agents: SpawnedAgent[];
  isLoading: boolean;
  error: string | null;
  spawnAgent: (config: { type: string; model?: string; task: string; timeout?: number }) => Promise<SpawnedAgent | null>;
  killAgent: (agentId: string) => Promise<boolean>;
  getMetrics: (agentId: string) => Promise<AgentMetrics | null>;
  getLogs: (agentId: string) => Promise<string[]>;
  refresh: () => Promise<void>;
  activeCount: number;
}

export function useAgents(): UseAgentsReturn {
  const [agents, setAgents] = useState<SpawnedAgent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCount, setActiveCount] = useState(0);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/agents/spawn');
      if (!response.ok) throw new Error('Failed to fetch agents');
      
      const data = await response.json();
      setAgents(data.agents || []);
      setActiveCount(data.active || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const spawnAgent = useCallback(async (config: { type: string; model?: string; task: string; timeout?: number }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/agents/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) throw new Error('Failed to spawn agent');
      
      const data = await response.json();
      
      // Refresh agent list
      await refresh();
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [refresh]);

  const killAgent = useCallback(async (agentId: string) => {
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'kill' }),
      });
      
      if (!response.ok) throw new Error('Failed to kill agent');
      
      await refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [refresh]);

  const getMetrics = useCallback(async (agentId: string): Promise<AgentMetrics | null> => {
    try {
      const response = await fetch(`/api/agents/${agentId}/metrics`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      
      return await response.json();
    } catch (err) {
      console.error('Error fetching metrics:', err);
      return null;
    }
  }, []);

  const getLogs = useCallback(async (agentId: string): Promise<string[]> => {
    try {
      const response = await fetch(`/api/agents/${agentId}/logs`);
      if (!response.ok) throw new Error('Failed to fetch logs');
      
      const data = await response.json();
      return data.logs || [];
    } catch (err) {
      console.error('Error fetching logs:', err);
      return [];
    }
  }, []);

  // Polling for updates
  useEffect(() => {
    refresh();
    
    const interval = setInterval(() => {
      refresh();
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    agents,
    isLoading,
    error,
    spawnAgent,
    killAgent,
    getMetrics,
    getLogs,
    refresh,
    activeCount,
  };
}
