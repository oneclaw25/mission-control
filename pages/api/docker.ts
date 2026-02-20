import { NextApiRequest, NextApiResponse } from 'next';
import { execSync } from 'child_process';
import os from 'os';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { action } = req.query;

  try {
    switch (method) {
      case 'GET':
        // Default: list containers if no action specified
        if (!action || action === 'containers') {
          return await listContainers(req, res);
        } else if (action === 'container-logs') {
          return await getContainerLogs(req, res);
        }
        break;

      case 'POST':
        if (action === 'container-control') {
          return await controlContainer(req, res);
        }
        break;
    }

    return res.status(404).json({ error: 'Not found', validActions: ['containers', 'container-logs', 'container-control'] });
  } catch (error: any) {
    console.error('Docker API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

async function listContainers(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Try Docker first
    const dockerOutput = execSync('docker ps -a --format "{{json .}}"', { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const containers = dockerOutput
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          const parsed = JSON.parse(line);
          return {
            id: parsed.ID || parsed.Id,
            name: (parsed.Names || parsed.Names || '').replace(/^\//, ''),
            image: parsed.Image,
            status: parsed.Status || parsed.State,
            state: parsed.State,
            ports: parsePorts(parsed.Ports),
            created: parsed.RunningFor || parsed.Created,
            cpu: null,
            memory: null,
          };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    // Get stats for running containers
    try {
      const statsOutput = execSync('docker stats --no-stream --format "{{json .}}"', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const stats = statsOutput
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);

      // Merge stats into containers
      containers.forEach((container: any) => {
        const stat = stats.find((s: any) => s.Container === container.id || s.Name === container.name);
        if (stat) {
          container.cpu = stat.CPUPerc || stat['CPUPerc'];
          container.memory = stat.MemPerc || stat['MemPerc'];
          container.memoryUsage = stat.MemUsage || stat['MemUsage'];
          container.netIO = stat.NetIO || stat['NetIO'];
          container.blockIO = stat.BlockIO || stat['BlockIO'];
        }
      });
    } catch (e) {
      // Stats may fail if no containers running
    }

    return res.status(200).json({ containers });
  } catch (error: any) {
    // Docker not available - return mock data for demo
    return res.status(200).json({ 
      containers: getMockContainers(),
      mock: true,
      error: 'Docker not available'
    });
  }
}

async function getContainerLogs(req: NextApiRequest, res: NextApiResponse) {
  const { id, tail = '100' } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Container ID required' });
  }

  try {
    const logs = execSync(`docker logs --tail=${tail} "${id}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    return res.status(200).json({ logs });
  } catch (error: any) {
    return res.status(500).json({ 
      error: error.message,
      logs: 'Unable to retrieve logs. Container may not exist or be running.'
    });
  }
}

async function controlContainer(req: NextApiRequest, res: NextApiResponse) {
  const { id, operation } = req.body;
  
  if (!id || !operation) {
    return res.status(400).json({ error: 'Container ID and operation required' });
  }

  const validOperations = ['start', 'stop', 'restart', 'pause', 'unpause', 'kill'];
  if (!validOperations.includes(operation)) {
    return res.status(400).json({ error: 'Invalid operation' });
  }

  try {
    execSync(`docker ${operation} "${id}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    return res.status(200).json({ 
      success: true, 
      message: `Container ${operation}ed successfully` 
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

function parsePorts(portsStr: string): Array<{ host: string; container: string; protocol: string }> {
  if (!portsStr) return [];
  
  const ports: Array<{ host: string; container: string; protocol: string }> = [];
  const parts = portsStr.split(', ');
  
  for (const part of parts) {
    const match = part.match(/(.+?):(.+?)\/(tcp|udp)/);
    if (match) {
      ports.push({
        host: match[1].trim(),
        container: match[2].trim(),
        protocol: match[3]
      });
    }
  }
  
  return ports;
}

function getMockContainers() {
  return [
    {
      id: 'mock-mission-control',
      name: 'mission-control',
      image: 'mission-control:latest',
      status: 'Up 2 hours',
      state: 'running',
      ports: [{ host: '3000', container: '3000', protocol: 'tcp' }],
      created: '2 hours ago',
      cpu: '0.5%',
      memory: '2.1%',
      memoryUsage: '42.5MiB / 2GiB',
    },
    {
      id: 'mock-postgres',
      name: 'postgres',
      image: 'postgres:15',
      status: 'Up 5 days',
      state: 'running',
      ports: [{ host: '5432', container: '5432', protocol: 'tcp' }],
      created: '5 days ago',
      cpu: '0.1%',
      memory: '5.2%',
      memoryUsage: '105MiB / 2GiB',
    },
    {
      id: 'mock-redis',
      name: 'redis',
      image: 'redis:alpine',
      status: 'Exited (0) 3 days ago',
      state: 'exited',
      ports: [],
      created: '1 week ago',
      cpu: null,
      memory: null,
    },
    {
      id: 'mock-nginx',
      name: 'nginx-proxy',
      image: 'nginx:alpine',
      status: 'Up 2 hours',
      state: 'running',
      ports: [{ host: '80', container: '80', protocol: 'tcp' }, { host: '443', container: '443', protocol: 'tcp' }],
      created: '2 hours ago',
      cpu: '0.05%',
      memory: '0.8%',
      memoryUsage: '16MiB / 2GiB',
    },
  ];
}