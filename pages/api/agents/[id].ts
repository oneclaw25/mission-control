import type { NextApiRequest, NextApiResponse } from 'next';
import { spawnedAgents } from './spawn';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    switch (req.method) {
      case 'GET': {
        return res.status(200).json(agent);
      }
      
      case 'POST': {
        const { action } = req.body;
        
        if (action === 'kill') {
          agent.status = 'completed';
          agent.endTime = new Date().toISOString();
          agent.result = 'Agent terminated by user';
          spawnedAgents.set(id, agent);
          
          return res.status(200).json({ 
            success: true, 
            message: 'Agent killed',
            agentId: id 
          });
        }
        
        if (action === 'message') {
          const { content } = req.body;
          
          // In a real implementation, this would send the message to the agent
          return res.status(200).json({
            success: true,
            message: 'Message queued',
            agentId: id,
            content: content?.substring(0, 100)
          });
        }
        
        return res.status(400).json({ error: 'Unknown action' });
      }
      
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Agent API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
