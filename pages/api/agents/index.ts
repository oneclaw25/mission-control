import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

// Mock data for testing without Supabase
const mockAgents = [
  {
    id: 'oneclaw',
    agent_id: 'oneclaw',
    name: 'OneClaw',
    type: 'primary',
    status: 'online',
    model: 'kimi-k2.5',
    current_task: 'Mission Control Testing',
    last_active: new Date().toISOString(),
    uptime_seconds: 3600,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'builder',
    agent_id: 'builder',
    name: 'Builder',
    type: 'sub-agent',
    status: 'online',
    model: 'claude-sonnet-4-6',
    current_task: 'Building features',
    last_active: new Date().toISOString(),
    uptime_seconds: 2400,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'operator',
    agent_id: 'operator',
    name: 'Operator',
    type: 'sub-agent',
    status: 'online',
    model: 'kimi-k2.5',
    current_task: 'Operations',
    last_active: new Date().toISOString(),
    uptime_seconds: 1800,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Try to use Supabase if configured
    if (isSupabaseConfigured()) {
      switch (req.method) {
        case 'GET':
          const { data: agents, error } = await supabase!
            .from('agents')
            .select('*')
            .order('last_active', { ascending: false });

          if (error) {
            console.warn('Supabase error, using mock data:', error.message);
            return res.status(200).json({ agents: mockAgents, count: mockAgents.length, mock: true });
          }

          return res.status(200).json({ 
            agents: agents || mockAgents, 
            count: (agents || mockAgents).length 
          });

        case 'POST':
          const { name, type, status, model, current_task } = req.body;
          
          const { data: newAgent, error: createError } = await supabase!
            .from('agents')
            .insert([{
              agent_id: `agent_${Date.now()}`,
              name,
              type: type || 'sub-agent',
              status: status || 'idle',
              model: model || 'kimi-k2.5',
              current_task,
              last_active: new Date().toISOString(),
              uptime_seconds: 0,
              metadata: {}
            }])
            .select()
            .single();

          if (createError) {
            console.warn('Supabase insert error:', createError.message);
            // Return mock response
            const mockNewAgent = {
              id: `agent_${Date.now()}`,
              agent_id: `agent_${Date.now()}`,
              name,
              type: type || 'sub-agent',
              status: status || 'idle',
              model: model || 'kimi-k2.5',
              current_task,
              last_active: new Date().toISOString(),
              uptime_seconds: 0,
              metadata: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            return res.status(201).json({ ...mockNewAgent, mock: true });
          }

          return res.status(201).json(newAgent);

        default:
          return res.status(405).json({ error: 'Method not allowed' });
      }
    } else {
      // Fallback to mock data
      console.log('Supabase not configured, using mock data');
      
      switch (req.method) {
        case 'GET':
          return res.status(200).json({ 
            agents: mockAgents, 
            count: mockAgents.length,
            mock: true 
          });

        case 'POST':
          const { name, type, status, model, current_task } = req.body;
          const mockNewAgent = {
            id: `agent_${Date.now()}`,
            agent_id: `agent_${Date.now()}`,
            name,
            type: type || 'sub-agent',
            status: status || 'idle',
            model: model || 'kimi-k2.5',
            current_task,
            last_active: new Date().toISOString(),
            uptime_seconds: 0,
            metadata: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          return res.status(201).json({ ...mockNewAgent, mock: true });

        default:
          return res.status(405).json({ error: 'Method not allowed' });
      }
    }
  } catch (error: any) {
    console.error('Agents API error:', error);
    // Return mock data on any error
    return res.status(200).json({ 
      agents: mockAgents, 
      count: mockAgents.length,
      mock: true,
      error: error.message 
    });
  }
}
