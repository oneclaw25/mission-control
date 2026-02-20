// Docker API Client

export interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  ports: Array<{
    host: string;
    container: string;
    protocol: string;
  }>;
  created: string;
  cpu?: string | null;
  memory?: string | null;
  memoryUsage?: string;
  netIO?: string;
  blockIO?: string;
}

const API_BASE = '/api/docker';

export const dockerAPI = {
  // List all containers
  async listContainers(): Promise<{ containers: Container[]; mock?: boolean; error?: string }> {
    const response = await fetch(`${API_BASE}?action=containers`);
    if (!response.ok) throw new Error('Failed to list containers');
    return response.json();
  },

  // Control container (start, stop, restart, pause, unpause, kill)
  async controlContainer(id: string, operation: 'start' | 'stop' | 'restart' | 'pause' | 'unpause' | 'kill'): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}?action=container-control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, operation }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to control container');
    }
    return response.json();
  },

  // Get container logs
  async getContainerLogs(id: string, tail: number = 100): Promise<{ logs: string }> {
    const response = await fetch(`${API_BASE}?action=container-logs&id=${id}&tail=${tail}`);
    if (!response.ok) {
      const error = await response.json();
      return { logs: error.logs || 'Failed to retrieve logs' };
    }
    return response.json();
  },

  // Convenience methods
  async startContainer(id: string): Promise<void> {
    await this.controlContainer(id, 'start');
  },

  async stopContainer(id: string): Promise<void> {
    await this.controlContainer(id, 'stop');
  },

  async restartContainer(id: string): Promise<void> {
    await this.controlContainer(id, 'restart');
  },

  async pauseContainer(id: string): Promise<void> {
    await this.controlContainer(id, 'pause');
  },

  async unpauseContainer(id: string): Promise<void> {
    await this.controlContainer(id, 'unpause');
  },
};