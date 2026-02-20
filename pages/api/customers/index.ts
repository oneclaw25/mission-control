// pages/api/customers/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage
let customers: any[] = [
  {
    id: 'cust-1',
    name: 'Jacob Johnson',
    email: 'jacob@arkim.ai',
    company: 'Arkim AI',
    hourlyRate: 150,
    paymentTerms: 30,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cust-2',
    name: 'Coast Cycle Team',
    email: 'info@coastcycle.lk',
    company: 'Coast Cycle Sri Lanka',
    hourlyRate: 120,
    paymentTerms: 30,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cust-3',
    name: 'Voice AI Labs',
    email: 'team@voiceailabs.com',
    company: 'Voice AI Labs',
    hourlyRate: 200,
    paymentTerms: 15,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return res.status(200).json({ customers });
    
    case 'POST':
      const newCustomer = {
        id: `cust-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
      };
      customers.push(newCustomer);
      return res.status(201).json(newCustomer);
    
    case 'PUT':
      const { id, ...updates } = req.body;
      const index = customers.findIndex(c => c.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      customers[index] = { ...customers[index], ...updates };
      return res.status(200).json(customers[index]);
    
    case 'DELETE':
      const { id: deleteId } = req.query;
      customers = customers.filter(c => c.id !== deleteId);
      return res.status(204).end();
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
