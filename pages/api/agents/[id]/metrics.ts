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
    // Simulate metrics
    const uptime = agent.endTime 
      ? new Date(agent.endTime).getTime() - new Date(agent.startTime).getTime()
      : Date.now() - new Date(agent.startTime).getTime();
    
    const metrics = {
      agentId: id,
      status: agent.status,
      uptime: Math.floor(uptime / 1000), // seconds
      cpu: agent.status === 'running' ? Math.random() * 30 + 10 : 0, // Simulated CPU %
      memory: agent.status === 'running' ? Math.random() * 500 + 200 : 0, // Simulated MB
      tokensProcessed: agent.status === 'completed' ? Math.floor(Math.random() * 5000) : 0,
      messagesExchanged: agent.status === 'completed' ? Math.floor(Math.random() * 20) : 0,
    };
    
    return res.status(200).json(metrics);
  } catch (error) {
    console.error('Agent metrics API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
