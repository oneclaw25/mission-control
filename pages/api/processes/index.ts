import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  status: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let processes: ProcessInfo[] = [];
    
    // Try to get process list based on platform
    try {
      if (process.platform === 'darwin' || process.platform === 'linux') {
        const { stdout } = await execAsync("ps aux | head -20");
        processes = stdout
          .split('\n')
          .slice(1, 11) // Skip header, take first 10
          .filter(line => line.trim())
          .map(line => {
            const parts = line.trim().split(/\s+/);
            return {
              pid: parseInt(parts[1]) || 0,
              name: parts[10] || parts.slice(10).join(' ') || 'unknown',
              cpu: parseFloat(parts[2]) || 0,
              memory: parseFloat(parts[3]) || 0,
              status: 'running'
            };
          });
      } else {
        // Windows or other - return empty with note
        processes = [];
      }
    } catch (e) {
      console.log('Could not get process list:', e);
    }
    
    return res.status(200).json({
      processes,
      total: processes.length,
      platform: process.platform
    });
  } catch (error) {
    console.error('Processes API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
