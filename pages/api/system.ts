import { NextApiRequest, NextApiResponse } from 'next';
import { execSync } from 'child_process';
import os from 'os';

interface HealthCheckResult {
  status: string;
  latency: number;
  message?: string;
}

interface SystemMetrics {
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
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { type } = req.query;

  try {
    if (method === 'GET') {
      if (type === 'metrics') {
        return await getSystemMetrics(req, res);
      } else if (type === 'health') {
        return await getHealthStatus(req, res);
      }
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error: any) {
    console.error('System API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function getSystemMetrics(req: NextApiRequest, res: NextApiResponse) {
  try {
    const metrics: SystemMetrics = {
      timestamp: Date.now(),
      cpu: getCPUInfo(),
      memory: getMemoryInfo(),
      disk: getDiskInfo(),
      network: getNetworkInfo(),
      uptime: os.uptime(),
      hostname: os.hostname(),
      platform: `${os.platform()} ${os.arch()}`,
    };

    return res.status(200).json(metrics);
  } catch (error: any) {
    // Return mock data if system calls fail
    return res.status(200).json({
      ...getMockMetrics(),
      mock: true,
      error: error.message,
    });
  }
}

async function getHealthStatus(req: NextApiRequest, res: NextApiResponse) {
  const services: { name: string; check: () => Promise<HealthCheckResult> }[] = [
    { name: 'OpenClaw Gateway', check: checkOpenClawGateway },
    { name: 'Mission Control', check: () => Promise.resolve({ status: 'healthy', latency: 0, message: 'OK' }) },
    { name: 'Docker', check: checkDocker },
    { name: 'PostgreSQL', check: () => checkPort(5432, 'PostgreSQL') },
    { name: 'Redis', check: () => checkPort(6379, 'Redis') },
  ];

  const results = await Promise.all(
    services.map(async (service) => {
      const startTime = Date.now();
      try {
        const result = await service.check();
        return {
          name: service.name,
          status: result.status,
          latency: result.latency || Date.now() - startTime,
          message: result.message || 'No message',
        };
      } catch (error: any) {
        return {
          name: service.name,
          status: 'unhealthy',
          latency: Date.now() - startTime,
          message: error.message,
        };
      }
    })
  );

  const allHealthy = results.every(r => r.status === 'healthy');

  return res.status(200).json({
    overall: allHealthy ? 'healthy' : 'degraded',
    services: results,
    timestamp: new Date().toISOString(),
  });
}

function getCPUInfo() {
  const cpus = os.cpus();
  const loadAvg = os.loadavg();
  
  // Calculate CPU usage percentage
  let totalIdle = 0;
  let totalTick = 0;
  
  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  });
  
  const usagePercent = 100 - Math.floor((totalIdle / totalTick) * 100);
  
  return {
    usage_percent: usagePercent,
    load_average: loadAvg,
    cores: cpus.length,
  };
}

function getMemoryInfo() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  
  return {
    total,
    used,
    free,
    percent: Math.round((used / total) * 100),
  };
}

function getDiskInfo() {
  try {
    // macOS df command
    const output = execSync('df -k /', { encoding: 'utf-8' });
    const lines = output.trim().split('\n');
    const dataLine = lines[1];
    const parts = dataLine.split(/\s+/);
    
    const total = parseInt(parts[1]) * 1024; // Convert from KB to bytes
    const used = parseInt(parts[2]) * 1024;
    const free = parseInt(parts[3]) * 1024;
    
    return {
      total,
      used,
      free,
      percent: Math.round((used / total) * 100),
    };
  } catch (e) {
    // Fallback
    return {
      total: 0,
      used: 0,
      free: 0,
      percent: 0,
    };
  }
}

function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const result = [];
  
  for (const [name, nets] of Object.entries(interfaces)) {
    if (!nets || name.startsWith('lo')) continue;
    
    // Note: Getting actual byte counts would require platform-specific tools
    result.push({
      name,
      bytesIn: 0,
      bytesOut: 0,
    });
  }
  
  return {
    interfaces: result,
  };
}

async function checkOpenClawGateway(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    // Try to ping the gateway
    const output = execSync('openclaw gateway status', { 
      encoding: 'utf-8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const isRunning = output.includes('running') || output.includes('active');
    
    return {
      status: isRunning ? 'healthy' : 'unhealthy',
      latency: Date.now() - startTime,
      message: isRunning ? 'Gateway is running' : 'Gateway is not running',
    };
  } catch (e) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      message: 'Gateway check failed',
    };
  }
}

async function checkDocker(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    execSync('docker info', { 
      encoding: 'utf-8',
      timeout: 3000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    return {
      status: 'healthy',
      latency: Date.now() - startTime,
      message: 'Docker daemon is running',
    };
  } catch (e) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      message: 'Docker daemon is not running',
    };
  }
}

async function checkPort(port: number, name: string): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    // Use nc (netcat) to check port
    execSync(`nc -z localhost ${port}`, { 
      encoding: 'utf-8',
      timeout: 2000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    return {
      status: 'healthy',
      latency: Date.now() - startTime,
      message: `${name} is accepting connections on port ${port}`,
    };
  } catch (e) {
    return {
      status: 'unhealthy',
      latency: Date.now() - startTime,
      message: `${name} is not available on port ${port}`,
    };
  }
}

function getMockMetrics(): SystemMetrics {
  return {
    timestamp: Date.now(),
    cpu: {
      usage_percent: 25 + Math.floor(Math.random() * 30),
      load_average: [1.2, 1.5, 1.3],
      cores: 8,
    },
    memory: {
      total: 17179869184, // 16GB
      used: 8589934592,   // 8GB
      free: 8589934592,   // 8GB
      percent: 50,
    },
    disk: {
      total: 494384795648, // ~460GB
      used: 247192397824,  // ~230GB
      free: 247192397824,  // ~230GB
      percent: 50,
    },
    network: {
      interfaces: [
        { name: 'en0', bytesIn: 1024000, bytesOut: 512000 },
        { name: 'en1', bytesIn: 0, bytesOut: 0 },
      ],
    },
    uptime: 86400,
    hostname: 'mock-system',
    platform: 'darwin arm64',
  };
}