// pages/api/time/entries.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage
let entries: any[] = [
  {
    id: 'te-1',
    projectId: '1',
    projectName: 'Clarity',
    description: 'Voice AI Assessment',
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    duration: 120,
    billable: true,
    hourlyRate: 150,
    userId: 'user-1',
    userName: 'OneClaw',
    tags: ['assessment', 'ai'],
  },
  {
    id: 'te-2',
    projectId: '2',
    projectName: 'Coast Cycle Sri Lanka',
    description: 'BOI Proposal Research',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    duration: 240,
    billable: true,
    hourlyRate: 120,
    userId: 'user-1',
    userName: 'OneClaw',
    tags: ['research', 'proposal'],
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return res.status(200).json({ entries });
    
    case 'POST':
      const newEntry = {
        id: `te-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
      };
      entries.push(newEntry);
      return res.status(201).json(newEntry);
    
    case 'PUT':
      const { id, ...updates } = req.body;
      const index = entries.findIndex(e => e.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      entries[index] = { ...entries[index], ...updates };
      return res.status(200).json(entries[index]);
    
    case 'DELETE':
      const { id: deleteId } = req.query;
      entries = entries.filter(e => e.id !== deleteId);
      return res.status(204).end();
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
