import type { NextApiRequest, NextApiResponse } from 'next';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'busy' | 'idle' | 'offline';
  model: string;
  currentTask?: string;
  lastActive: string;
  uptime: number;
}

const agents: Agent[] = [
  {
    id: 'oneclaw',
    name: 'OneClaw',
    type: 'primary',
    status: 'online',
    model: 'kimi-k2.5',
    currentTask: 'Mission Control Testing',
    lastActive: new Date().toISOString(),
    uptime: 3600,
  },
  {
    id: 'builder',
    name: 'Builder',
    type: 'sub-agent',
    status: 'online',
    model: 'claude-sonnet-4-6',
    lastActive: new Date().toISOString(),
    uptime: 2400,
  },
  {
    id: 'operator',
    name: 'Operator',
    type: 'sub-agent',
    status: 'online',
    model: 'kimi-k2.5',
    lastActive: new Date().toISOString(),
    uptime: 1800,
  },
  {
    id: 'money-maker',
    name: 'Money Maker',
    type: 'sub-agent',
    status: 'idle',
    model: 'claude-sonnet-4-6',
    lastActive: new Date().toISOString(),
    uptime: 1200,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ agents });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
