import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!isSupabaseConfigured()) {
    return res.status(503).json({ 
      error: 'Supabase not configured',
      timeEntries: []
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        const { agent_id, start_date, end_date } = req.query;
        
        let query = supabase!
          .from('time_entries')
          .select('*')
          .order('start_time', { ascending: false });

        if (agent_id) {
          query = query.eq('agent_id', agent_id);
        }
        
        if (start_date) {
          query = query.gte('start_time', start_date);
        }
        
        if (end_date) {
          query = query.lte('start_time', end_date);
        }

        const { data: timeEntries, error } = await query;

        if (error) throw error;

        return res.status(200).json(timeEntries || []);

      case 'POST':
        const { agent_id: agentId, task_id, description, billable, hourly_rate } = req.body;
        
        const { data: newEntry, error: createError } = await supabase!
          .from('time_entries')
          .insert([{
            agent_id: agentId,
            task_id,
            description,
            start_time: new Date().toISOString(),
            billable: billable || false,
            hourly_rate
          }])
          .select()
          .single();

        if (createError) throw createError;

        return res.status(201).json(newEntry);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Time entries API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      timeEntries: []
    });
  }
}
