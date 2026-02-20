// pages/api/cron/jobs.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// Default cron jobs (using any type for API flexibility)
const defaultJobs: any[] = [
  {
    id: 'cron-1',
    name: 'Heartbeat Check',
    schedule: '0 */6 * * *',
    command: 'check heartbeats',
    status: 'active',
    lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    lastStatus: 'success',
    runCount: 124,
    failCount: 2,
  },
  {
    id: 'cron-2',
    name: 'Email Digest',
    schedule: '0 9 * * *',
    command: 'send daily digest',
    status: 'active',
    lastRun: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
    lastStatus: 'success',
    runCount: 45,
    failCount: 0,
  },
  {
    id: 'cron-3',
    name: 'Backup Data',
    schedule: '0 2 * * 0',
    command: 'backup all data',
    status: 'active',
    lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    lastStatus: 'success',
    runCount: 12,
    failCount: 0,
  },
  {
    id: 'cron-4',
    name: 'Sync Google Calendar',
    schedule: '*/30 * * * *',
    command: 'sync calendar events',
    status: 'active',
    lastRun: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    lastStatus: 'success',
    runCount: 892,
    failCount: 5,
  },
  {
    id: 'cron-5',
    name: 'Generate Reports',
    schedule: '0 0 1 * *',
    command: 'generate monthly reports',
    status: 'paused',
    nextRun: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    runCount: 3,
    failCount: 1,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ jobs: defaultJobs });
  }

  if (req.method === 'POST') {
    // Toggle job status
    const { id, action } = req.body;
    const job = defaultJobs.find(j => j.id === id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (action === 'toggle') {
      job.status = job.status === 'active' ? 'paused' : 'active';
    } else if (action === 'run') {
      job.lastRun = new Date().toISOString();
      job.lastStatus = 'success';
      job.runCount++;
    }

    return res.status(200).json(job);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
