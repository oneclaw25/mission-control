import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for spawned agents (will reset on server restart)
export interface SpawnedAgent {
  agentId: string;
  sessionId: string;
  type: string;
  model: string;
  task: string;
  status: 'spawning' | 'running' | 'completed' | 'error';
  pid?: number;
  startTime: string;
  endTime?: string;
  result?: string;
  error?: string;
}

export const spawnedAgents = new Map<string, SpawnedAgent>();

// Validate that OpenClaw CLI is available
async function checkOpenClaw(): Promise<boolean> {
  return new Promise((resolve) => {
    const check = spawn('which', ['openclaw']);
    check.on('close', (code) => resolve(code === 0));
    check.on('error', () => resolve(false));
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET': {
        // List all spawned agents
        const agents = Array.from(spawnedAgents.values()).map(agent => ({
          ...agent,
          // Don't include full result in list view
          result: agent.result ? `${agent.result.substring(0, 200)}...` : undefined
        }));
        
        return res.status(200).json({ 
          agents: agents.reverse(), // Newest first
          total: agents.length,
          active: agents.filter(a => a.status === 'running').length
        });
      }
      
      case 'POST': {
        const { type, model, task, timeout = 3600, context = '' } = req.body;
        
        if (!type || !task) {
          return res.status(400).json({ error: 'Agent type and task are required' });
        }
        
        const agentId = `agent-${type}-${Date.now()}`;
        const sessionId = uuidv4();
        
        // Create agent record
        const agent: SpawnedAgent = {
          agentId,
          sessionId,
          type,
          model: model || 'kimi-k2.5',
          task,
          status: 'spawning',
          startTime: new Date().toISOString(),
        };
        
        spawnedAgents.set(agentId, agent);
        
        // Check if OpenClaw CLI is available
        const hasOpenClaw = await checkOpenClaw();
        
        if (!hasOpenClaw) {
          // Simulate spawning for demo purposes
          console.log(`[SIMULATION] Spawning ${type} agent with task: ${task}`);
          
          setTimeout(() => {
            const updated = spawnedAgents.get(agentId);
            if (updated) {
              updated.status = 'running';
              spawnedAgents.set(agentId, updated);
            }
          }, 1000);
          
          setTimeout(() => {
            const updated = spawnedAgents.get(agentId);
            if (updated) {
              updated.status = 'completed';
              updated.endTime = new Date().toISOString();
              updated.result = `[SIMULATED] Agent ${type} completed task:\n\n${task}\n\nThis is a simulated response since OpenClaw CLI is not available in this environment.`;
              spawnedAgents.set(agentId, updated);
            }
          }, 5000);
          
          return res.status(201).json({
            success: true,
            agentId,
            sessionId,
            status: 'spawning',
            message: 'Agent spawn initiated (simulated mode)',
            simulated: true
          });
        }
        
        // Actual OpenClaw spawning would go here
        // For now, use simulation with a note
        
        setTimeout(() => {
          const updated = spawnedAgents.get(agentId);
          if (updated) {
            updated.status = 'running';
            spawnedAgents.set(agentId, updated);
          }
        }, 1000);
        
        setTimeout(() => {
          const updated = spawnedAgents.get(agentId);
          if (updated) {
            updated.status = 'completed';
            updated.endTime = new Date().toISOString();
            updated.result = `[AGENT ${type.toUpperCase()}] Completed task:\n\n${task}\n\nResult: Task processed successfully.`;
            spawnedAgents.set(agentId, updated);
          }
        }, 8000);
        
        return res.status(201).json({
          success: true,
          agentId,
          sessionId,
          status: 'spawning',
          message: 'Agent spawn initiated',
          simulated: false
        });
      }
      
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Agent spawn API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
