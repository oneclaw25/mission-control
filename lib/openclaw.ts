/**
 * OpenClaw API Client
 * Wraps OpenClaw CLI commands for use in Mission Control
 */

export interface SystemStatus {
  gateway: {
    mode: string;
    url: string;
    reachable: boolean;
    connectLatencyMs: number;
  };
  gatewayService: {
    installed: boolean;
    runtimeShort: string;
  };
  agents: {
    totalSessions: number;
    agents: AgentInfo[];
  };
  memory: {
    files: number;
    chunks: number;
    workspaceDir: string;
  };
  os: {
    platform: string;
    arch: string;
    release: string;
  };
}

export interface AgentInfo {
  id: string;
  workspaceDir: string;
  sessionsCount: number;
  lastUpdatedAt: number | null;
  lastActiveAgeMs: number | null;
  model?: string;
}

export interface AgentStatus {
  id: string;
  status: 'online' | 'busy' | 'idle' | 'offline';
  lastActive: string;
  currentTask?: string;
  model: string;
  sessionsCount: number;
}

export interface Session {
  agentId: string;
  sessionId: string;
  updatedAt: number;
  age: number;
  model: string;
  totalTokens: number | null;
  remainingTokens: number | null;
  percentUsed: number | null;
  flags: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  projectId?: string;
  tags: string[];
  estimatedHours?: number;
  createdAt: string;
  updatedAt: string;
  source: 'memory' | 'session' | 'manual';
}

export interface MemoryEntry {
  id: string;
  content: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

export interface Model {
  id: string;
  key: string;
  name: string;
  provider: string;
  contextWindow: number;
  available: boolean;
  local: boolean;
  tags: string[];
  input: string;
}

export interface ModelMetrics {
  id: string;
  requestsToday: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  totalTokensUsed: number;
  estimatedCost: number;
}

export interface ActivityEvent {
  id: string;
  type: 'session.started' | 'session.completed' | 'agent.spawned' | 'task.updated' | 'memory.added' | 'model.switched' | 'cron.triggered';
  timestamp: string;
  agentId?: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface Metrics {
  activeSessions: number;
  tasksCompletedToday: number;
  memoryEntries: number;
  cronJobsRunning: number;
  totalTokensUsed: number;
  sessionsToday: number;
}

class OpenClawAPI {
  private baseDelay = 1000;
  private maxRetries = 3;

  private async execCommand(command: string): Promise<string> {
    try {
      const response = await fetch('/api/openclaw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      
      if (!response.ok) {
        throw new Error(`Command failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.output || '';
    } catch (error) {
      console.error('OpenClaw API Error:', error);
      throw error;
    }
  }

  private async retry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        const delay = this.baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  // Status & Metrics
  async getStatus(): Promise<SystemStatus> {
    return this.retry(async () => {
      const output = await this.execCommand('openclaw status --json');
      const data = JSON.parse(output);
      
      return {
        gateway: data.gateway,
        gatewayService: data.gatewayService,
        agents: data.agents,
        memory: data.memory,
        os: data.os,
      };
    });
  }

  async getMetrics(): Promise<Metrics> {
    return this.retry(async () => {
      const output = await this.execCommand('openclaw status --json');
      const data = JSON.parse(output);
      
      const sessions = data.sessions?.recent || [];
      const today = new Date().toDateString();
      const sessionsToday = sessions.filter((s: Session) => {
        const sessionDate = new Date(s.updatedAt).toDateString();
        return sessionDate === today;
      }).length;

      return {
        activeSessions: data.sessions?.count || 0,
        tasksCompletedToday: 0, // Will be calculated from memory files
        memoryEntries: data.memory?.chunks || 0,
        cronJobsRunning: (data.heartbeat?.agents || []).filter((a: any) => a.enabled).length,
        totalTokensUsed: sessions.reduce((sum: number, s: Session) => sum + (s.totalTokens || 0), 0),
        sessionsToday,
      };
    });
  }

  // Agents
  async getAgents(): Promise<AgentInfo[]> {
    return this.retry(async () => {
      const output = await this.execCommand('openclaw agents list --json');
      const data = JSON.parse(output);
      
      // Get detailed status for each agent
      const statusOutput = await this.execCommand('openclaw status --json');
      const statusData = JSON.parse(statusOutput);
      
      return (statusData.agents?.agents || []).map((agent: any) => ({
        id: agent.id,
        workspaceDir: agent.workspaceDir,
        sessionsCount: agent.sessionsCount,
        lastUpdatedAt: agent.lastUpdatedAt,
        lastActiveAgeMs: agent.lastActiveAgeMs,
        model: agent.id === 'main' ? statusData.sessions?.defaults?.model : undefined,
      }));
    });
  }

  async getAgentStatus(agentId: string): Promise<AgentStatus> {
    return this.retry(async () => {
      const output = await this.execCommand('openclaw status --json');
      const data = JSON.parse(output);
      
      const agentInfo = data.agents?.agents?.find((a: any) => a.id === agentId);
      const sessions = data.sessions?.byAgent?.find((a: any) => a.agentId === agentId);
      const recentSession = sessions?.recent?.[0];
      
      let status: 'online' | 'busy' | 'idle' | 'offline' = 'offline';
      if (agentInfo) {
        if (recentSession) {
          const ageMs = Date.now() - recentSession.updatedAt;
          status = ageMs < 300000 ? 'busy' : 'idle'; // 5 minutes threshold
        } else if (agentInfo.sessionsCount > 0) {
          status = 'idle';
        }
      }

      return {
        id: agentId,
        status,
        lastActive: agentInfo?.lastUpdatedAt ? new Date(agentInfo.lastUpdatedAt).toISOString() : '',
        model: recentSession?.model || data.sessions?.defaults?.model || 'unknown',
        sessionsCount: agentInfo?.sessionsCount || 0,
      };
    });
  }

  // Tasks - These will be managed through memory files
  async getTasks(): Promise<Task[]> {
    return this.retry(async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    });
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    return this.retry(async () => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    });
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    return this.retry(async () => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    });
  }

  // Memory
  async getMemoryEntries(): Promise<MemoryEntry[]> {
    return this.retry(async () => {
      const output = await this.execCommand('openclaw memory search --query "" --json');
      const data = JSON.parse(output);
      return (data.results || []).map((r: any) => ({
        id: r.id || String(Math.random()),
        content: r.content || r.text || '',
        source: r.source || 'memory',
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
      }));
    });
  }

  async searchMemory(query: string): Promise<MemoryEntry[]> {
    return this.retry(async () => {
      const output = await this.execCommand(`openclaw memory search --query "${query}" --json`);
      const data = JSON.parse(output);
      return (data.results || []).map((r: any) => ({
        id: r.id || String(Math.random()),
        content: r.content || r.text || '',
        source: r.source || 'memory',
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
      }));
    });
  }

  // Cron
  async getCronJobs(): Promise<CronJob[]> {
    return this.retry(async () => {
      const output = await this.execCommand('openclaw cron list --json');
      const data = JSON.parse(output);
      return (data.jobs || []).map((j: any) => ({
        id: j.id || String(Math.random()),
        name: j.name || 'Unnamed Job',
        schedule: j.schedule || 'manual',
        enabled: j.enabled !== false,
        lastRun: j.lastRun,
        nextRun: j.nextRun,
      }));
    });
  }

  // Models
  async getModels(): Promise<Model[]> {
    return this.retry(async () => {
      const output = await this.execCommand('openclaw models list --json');
      const data = JSON.parse(output);
      return (data.models || []).map((m: any) => ({
        id: m.key,
        key: m.key,
        name: m.name,
        provider: m.key.split('/')[0] || 'unknown',
        contextWindow: m.contextWindow,
        available: m.available,
        local: m.local,
        tags: m.tags || [],
        input: m.input,
      }));
    });
  }

  async getCurrentModel(): Promise<string> {
    return this.retry(async () => {
      const output = await this.execCommand('openclaw models status --json');
      const data = JSON.parse(output);
      return data.model || 'unknown';
    });
  }

  async switchModel(modelId: string, agentId?: string): Promise<void> {
    return this.retry(async () => {
      const agentFlag = agentId ? ` --agent ${agentId}` : '';
      await this.execCommand(`openclaw models set ${modelId}${agentFlag}`);
    });
  }

  async getModelStatus(modelId: string): Promise<{ available: boolean; pingMs?: number }> {
    return this.retry(async () => {
      const start = Date.now();
      // Try to ping the model through a simple status check
      const output = await this.execCommand('openclaw models status --json');
      const data = JSON.parse(output);
      const pingMs = Date.now() - start;
      
      return {
        available: data.model === modelId,
        pingMs,
      };
    });
  }

  async getModelMetrics(modelId: string): Promise<ModelMetrics> {
    return this.retry(async () => {
      const output = await this.execCommand('openclaw status --json');
      const data = JSON.parse(output);
      
      const sessions = data.sessions?.recent || [];
      const modelSessions = sessions.filter((s: Session) => s.model === modelId);
      
      return {
        id: modelId,
        requestsToday: modelSessions.length,
        averageResponseTime: 0, // Would need more detailed metrics
        successRate: 100, // Simplified
        errorRate: 0,
        totalTokensUsed: modelSessions.reduce((sum: number, s: Session) => sum + (s.totalTokens || 0), 0),
        estimatedCost: 0, // Would need pricing data
      };
    });
  }

  // Activity Feed
  async getRecentActivity(limit: number = 20): Promise<ActivityEvent[]> {
    return this.retry(async () => {
      const output = await this.execCommand('openclaw status --json');
      const data = JSON.parse(output);
      
      const events: ActivityEvent[] = [];
      
      // Convert sessions to activity events
      const sessions = data.sessions?.recent || [];
      sessions.slice(0, limit).forEach((s: Session) => {
        events.push({
          id: `session-${s.sessionId}`,
          type: 'session.completed',
          timestamp: new Date(s.updatedAt).toISOString(),
          agentId: s.agentId,
          description: `Session completed on ${s.agentId} using ${s.model}`,
          metadata: {
            sessionId: s.sessionId,
            tokens: s.totalTokens,
            model: s.model,
          },
        });
      });
      
      // Sort by timestamp descending
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return events.slice(0, limit);
    });
  }
}

export const openclaw = new OpenClawAPI();
export default openclaw;
