// pages/api/calendar/events.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage for demo (would use database in production)
let events: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return res.status(200).json({ events });
    
    case 'POST':
      const newEvent = {
        id: `evt-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
      };
      events.push(newEvent);
      return res.status(201).json(newEvent);
    
    case 'PUT':
      const { id, ...updates } = req.body;
      const index = events.findIndex(e => e.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Event not found' });
      }
      events[index] = { ...events[index], ...updates };
      return res.status(200).json(events[index]);
    
    case 'DELETE':
      const { id: deleteId } = req.query;
      events = events.filter(e => e.id !== deleteId);
      return res.status(204).end();
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
