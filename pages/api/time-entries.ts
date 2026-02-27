import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// Mock time entries
const mockTimeEntries = [
  { id: '1', agent_id: 'oneclaw', description: 'Testing Mission Control', start_time: new Date().toISOString(), duration_minutes: 45, billable: true, hourly_rate: 50 },
  { id: '2', agent_id: 'builder', description: 'Building features', start_time: new Date(Date.now() - 3600000).toISOString(), duration_minutes: 60, billable: true, hourly_rate: 75 },
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
          const { agent_id, start_date, end_date } = req.query;
          let query = supabase!.from('time_entries').select('*').order('start_time', { ascending: false });
          if (agent_id) query = query.eq('agent_id', agent_id);
          if (start_date) query = query.gte('start_time', start_date);
          if (end_date) query = query.lte('start_time', end_date);

          const { data: entries, error } = await query;
          if (error) return res.status(200).json(mockTimeEntries.map(e => ({ ...e, mock: true })));
          return res.status(200).json(entries || mockTimeEntries);

        case 'POST':
          const { data: newEntry, error: createError } = await supabase!
            .from('time_entries')
            .insert([{ ...req.body, start_time: new Date().toISOString() }])
            .select()
            .single();
          if (createError) return res.status(201).json({ ...req.body, id: Date.now().toString(), mock: true });
          return res.status(201).json(newEntry);

        default:
          return res.status(405).json({ error: 'Method not allowed' });
      }
    } else {
      if (req.method === 'GET') return res.status(200).json(mockTimeEntries.map(e => ({ ...e, mock: true })));
      if (req.method === 'POST') return res.status(201).json({ ...req.body, id: Date.now().toString(), mock: true });
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Time entries API error:', error);
    return res.status(200).json(mockTimeEntries.map(e => ({ ...e, mock: true, error: error.message })));
  }
}
