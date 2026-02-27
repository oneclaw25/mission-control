import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

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
      activity: []
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        const { agent_id, type, limit = 50 } = req.query;
        
        let query = supabase!
          .from('activity_log')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(parseInt(limit as string) || 50);

        if (agent_id) {
          query = query.eq('agent_id', agent_id);
        }
        
        if (type) {
          query = query.eq('type', type);
        }

        const { data: activity, error } = await query;

        if (error) throw error;

        return res.status(200).json(activity || []);

      case 'POST':
        const { agent_id: agentId, type: activityType, description, metadata } = req.body;
        
        const { data: newActivity, error: createError } = await supabase!
          .from('activity_log')
          .insert([{
            agent_id: agentId,
            type: activityType,
            description,
            timestamp: new Date().toISOString(),
            metadata: metadata || {}
          }])
          .select()
          .single();

        if (createError) throw createError;

        return res.status(201).json(newActivity);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Activity log API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      activity: []
    });
  }
}
