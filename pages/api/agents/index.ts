import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return res.status(503).json({ 
      error: 'Supabase not configured',
      agents: []
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        const { data: agents, error } = await supabase!
          .from('agents')
          .select('*')
          .order('last_active', { ascending: false });

        if (error) throw error;

        return res.status(200).json({ 
          agents: agents || [],
          count: agents?.length || 0
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

        if (createError) throw createError;

        return res.status(201).json(newAgent);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Agents API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      agents: []
    });
  }
}
