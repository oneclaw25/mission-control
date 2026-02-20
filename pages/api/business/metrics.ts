// pages/api/business/metrics.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { BusinessMetrics } from '../../../types';

// Mock metrics data
const mockMetrics: BusinessMetrics = {
  revenue: {
    mrr: 15400,
    arr: 184800,
    byProject: {
      'Clarity': 5200,
      'Coast Cycle Sri Lanka': 4800,
      'Fix AI': 3600,
      'Mission Control': 1800,
    },
    byCustomer: {
      'Arkim AI': 5400,
      'Coast Cycle': 4800,
      'Voice AI Labs': 5200,
    },
    growth: 12.5,
    lastMonth: 13700,
    thisMonth: 15400,
  },
  costs: {
    infrastructure: 500,
    agents: 250,
    time: 3200,
    total: 3950,
  },
  profit: {
    gross: 11450,
    margin: 74.4,
    perProject: {
      'Clarity': 3900,
      'Coast Cycle Sri Lanka': 3600,
      'Fix AI': 2700,
      'Mission Control': 1250,
    },
  },
  forecast: {
    runway: 18,
    breakEven: null,
    cashFlow: [
      { month: 'Feb 2026', in: 15400, out: 3950, net: 11450 },
      { month: 'Mar 2026', in: 16500, out: 4100, net: 12400 },
      { month: 'Apr 2026', in: 17200, out: 4200, net: 13000 },
      { month: 'May 2026', in: 18000, out: 4300, net: 13700 },
      { month: 'Jun 2026', in: 18800, out: 4400, net: 14400 },
      { month: 'Jul 2026', in: 19500, out: 4500, net: 15000 },
    ],
  },
  timeTracking: {
    totalHours: 184.5,
    billableHours: 162.0,
    utilization: 87.8,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(mockMetrics);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
