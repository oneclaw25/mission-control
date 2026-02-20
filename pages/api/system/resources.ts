import type { NextApiRequest, NextApiResponse } from 'next';
import os from 'os';

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
    // Get system resources
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    const resources = {
      cpu: {
        count: cpus.length,
        model: cpus[0]?.model || 'Unknown',
        loadAvg: os.loadavg(),
        usagePercent: Math.floor((os.loadavg()[0] / cpus.length) * 100)
      },
      memory: {
        total: Math.floor(totalMem / 1024 / 1024), // MB
        free: Math.floor(freeMem / 1024 / 1024), // MB
        used: Math.floor(usedMem / 1024 / 1024), // MB
        usagePercent: Math.floor((usedMem / totalMem) * 100)
      },
      uptime: Math.floor(os.uptime()),
      platform: os.platform(),
      hostname: os.hostname(),
      timestamp: new Date().toISOString()
    };
    
    return res.status(200).json(resources);
  } catch (error) {
    console.error('System resources API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
