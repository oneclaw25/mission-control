// System Metrics API Client

export interface SystemMetrics {
  timestamp: number;
  cpu: {
    usage_percent: number;
    load_average: number[];
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percent: number;
  };
  network: {
    interfaces: Array<{
      name: string;
      bytesIn: number;
      bytesOut: number;
    }>;
  };
  uptime: number;
  hostname: string;
  platform: string;
  mock?: boolean;
  error?: string;
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: Array<{
    name: string;
    status: 'healthy' | 'unhealthy' | 'unknown';
    latency: number;
    message?: string;
  }>;
  timestamp: string;
}

const API_BASE = '/api/system';

export const systemAPI = {
  // Get system metrics
  async getMetrics(): Promise<SystemMetrics> {
    const response = await fetch(`${API_BASE}?type=metrics`);
    if (!response.ok) throw new Error('Failed to fetch system metrics');
    return response.json();
  },

  // Get health status
  async getHealth(): Promise<HealthStatus> {
    const response = await fetch(`${API_BASE}?type=health`);
    if (!response.ok) throw new Error('Failed to fetch health status');
    return response.json();
  },

  // Format bytes to human readable
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  // Format uptime to human readable
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  },
};