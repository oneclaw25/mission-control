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
      metrics: null
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get latest business metrics
        const { data: metrics, error } = await supabase!
          .from('business_metrics')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

        // Get time entries for today
        const today = new Date().toISOString().split('T')[0];
        const { data: timeEntries, error: timeError } = await supabase!
          .from('time_entries')
          .select('*')
          .gte('start_time', today);

        if (timeError) throw timeError;

        const todayHours = timeEntries?.reduce((acc, entry) => {
          return acc + (entry.duration_minutes || 0) / 60;
        }, 0) || 0;

        // Get content stats
        const { data: contentItems, error: contentError } = await supabase!
          .from('content_items')
          .select('stage');

        if (contentError) throw contentError;

        const contentStats = {
          idea: contentItems?.filter(i => i.stage === 'idea').length || 0,
          script: contentItems?.filter(i => i.stage === 'script').length || 0,
          filming: contentItems?.filter(i => i.stage === 'filming').length || 0,
          editing: contentItems?.filter(i => i.stage === 'editing').length || 0,
          published: contentItems?.filter(i => i.stage === 'published').length || 0,
        };

        return res.status(200).json({
          revenue: {
            daily: metrics?.value || 0,
            weekly: (metrics?.value || 0) * 7,
            monthly: (metrics?.value || 0) * 30,
          },
          costs: {
            daily: 45,
            weekly: 315,
            monthly: 1350,
          },
          profit: {
            daily: (metrics?.value || 0) - 45,
            weekly: ((metrics?.value || 0) * 7) - 315,
            monthly: ((metrics?.value || 0) * 30) - 1350,
          },
          hours: {
            today: Math.round(todayHours * 10) / 10,
            week: Math.round(todayHours * 7 * 10) / 10,
            month: Math.round(todayHours * 30 * 10) / 10,
          },
          content: contentStats,
          lastUpdated: metrics?.timestamp || new Date().toISOString(),
        });

      case 'POST':
        const { metric_type, value, period, metadata } = req.body;
        
        const { data: newMetric, error: createError } = await supabase!
          .from('business_metrics')
          .insert([{
            metric_type,
            value,
            period,
            timestamp: new Date().toISOString(),
            metadata: metadata || {}
          }])
          .select()
          .single();

        if (createError) throw createError;

        return res.status(201).json(newMetric);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Business metrics API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      metrics: null
    });
  }
}
