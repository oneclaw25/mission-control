import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

// Mock business metrics
const mockMetrics = {
  revenue: { daily: 250, weekly: 1750, monthly: 7500 },
  costs: { daily: 45, weekly: 315, monthly: 1350 },
  profit: { daily: 205, weekly: 1435, monthly: 6150 },
  hours: { today: 4.5, week: 31.5, month: 135 },
  content: { idea: 5, script: 3, filming: 2, editing: 4, published: 12 },
  lastUpdated: new Date().toISOString(),
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (isSupabaseConfigured()) {
      switch (req.method) {
        case 'GET':
          const { data: metrics, error } = await supabase!
            .from('business_metrics')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

          if (error) {
            console.warn('Supabase error, using mock:', error.message);
            return res.status(200).json({ ...mockMetrics, mock: true });
          }

          return res.status(200).json(metrics?.value ? {
            revenue: { daily: metrics.value, weekly: metrics.value * 7, monthly: metrics.value * 30 },
            costs: mockMetrics.costs,
            profit: { 
              daily: metrics.value - 45, 
              weekly: (metrics.value * 7) - 315, 
              monthly: (metrics.value * 30) - 1350 
            },
            hours: mockMetrics.hours,
            content: mockMetrics.content,
            lastUpdated: metrics.timestamp,
          } : mockMetrics);

        case 'POST':
          const { metric_type, value, period, metadata } = req.body;
          const { data: newMetric, error: createError } = await supabase!
            .from('business_metrics')
            .insert([{ metric_type, value, period, timestamp: new Date().toISOString(), metadata }])
            .select()
            .single();

          if (createError) return res.status(201).json({ mock: true, ...req.body });
          return res.status(201).json(newMetric);

        default:
          return res.status(405).json({ error: 'Method not allowed' });
      }
    } else {
      if (req.method === 'GET') return res.status(200).json({ ...mockMetrics, mock: true });
      if (req.method === 'POST') return res.status(201).json({ mock: true, ...req.body });
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Business metrics API error:', error);
    return res.status(200).json({ ...mockMetrics, mock: true, error: error.message });
  }
}
