import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// Mock activity log
const mockActivity = [
  { id: '1', agent_id: 'oneclaw', type: 'login', description: 'OneClaw logged in', timestamp: new Date().toISOString(), metadata: {} },
  { id: '2', agent_id: 'builder', type: 'task_created', description: 'Builder created a new task', timestamp: new Date(Date.now() - 60000).toISOString(), metadata: {} },
  { id: '3', agent_id: 'operator', type: 'status_change', description: 'Operator went online', timestamp: new Date(Date.now() - 120000).toISOString(), metadata: {} },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (isSupabaseConfigured()) {
      switch (req.method) {
        case 'GET':
          const { agent_id, type, limit = 50 } = req.query;
          let query = supabase!
            .from('activity_log')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(parseInt(limit as string) || 50);

          if (agent_id) query = query.eq('agent_id', agent_id);
          if (type) query = query.eq('type', type);

          const { data: activity, error } = await query;
          if (error) return res.status(200).json(mockActivity.map(a => ({ ...a, mock: true })));
          return res.status(200).json(activity || mockActivity);

        case 'POST':
          const { data: newActivity, error: createError } = await supabase!
            .from('activity_log')
            .insert([{ ...req.body, timestamp: new Date().toISOString() }])
            .select()
            .single();
          if (createError) return res.status(201).json({ ...req.body, id: Date.now().toString(), mock: true });
          return res.status(201).json(newActivity);

        default:
          return res.status(405).json({ error: 'Method not allowed' });
      }
    } else {
      if (req.method === 'GET') return res.status(200).json(mockActivity.map(a => ({ ...a, mock: true })));
      if (req.method === 'POST') return res.status(201).json({ ...req.body, id: Date.now().toString(), mock: true });
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Activity log API error:', error);
    return res.status(200).json(mockActivity.map(a => ({ ...a, mock: true, error: error.message })));
  }
}
