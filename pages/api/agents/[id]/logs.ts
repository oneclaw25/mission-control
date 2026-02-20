import type { NextApiRequest, NextApiResponse } from 'next';
import { spawnedAgents } from '../spawn';

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

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Agent ID is required' });
  }

  const agent = spawnedAgents.get(id);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  try {
    // Generate simulated logs
    const logs = [
      `[${agent.startTime}] Agent ${agent.type} spawned with session ${agent.sessionId}`,
      `[${agent.startTime}] Task assigned: ${agent.task.substring(0, 100)}...`,
      `[${new Date(Date.parse(agent.startTime) + 1000).toISOString()}] Initializing context...`,
      `[${new Date(Date.parse(agent.startTime) + 2000).toISOString()}] Loading configuration files...`,
    ];
    
    if (agent.status === 'running' || agent.status === 'completed') {
      logs.push(`[${new Date(Date.parse(agent.startTime) + 3000).toISOString()}] Processing task...`);
      logs.push(`[${new Date(Date.parse(agent.startTime) + 5000).toISOString()}] Executing workflow...`);
    }
    
    if (agent.status === 'completed') {
      logs.push(`[${agent.endTime}] Task completed successfully`);
      logs.push(`[${agent.endTime}] Results saved`);
    }
    
    if (agent.status === 'error') {
      logs.push(`[${agent.endTime || new Date().toISOString()}] Error: ${agent.error || 'Unknown error'}`);
    }
    
    return res.status(200).json({ 
      agentId: id,
      logs,
      totalLines: logs.length
    });
  } catch (error) {
    console.error('Agent logs API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
