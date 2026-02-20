// pages/api/invoices/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage
let invoices: any[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    customerId: 'cust-1',
    customerName: 'Arkim AI',
    customerEmail: 'jacob@arkim.ai',
    issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'sent',
    lineItems: [
      {
        id: 'li-1',
        description: 'B2B Research - Fix AI',
        quantity: 12,
        unit: 'hours',
        rate: 150,
        amount: 1800,
      },
    ],
    subtotal: 1800,
    taxRate: 0,
    taxAmount: 0,
    total: 1800,
    paidAmount: 0,
    notes: 'Net 30 payment terms',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-002',
    customerId: 'cust-2',
    customerName: 'Coast Cycle',
    customerEmail: 'info@coastcycle.lk',
    issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'draft',
    lineItems: [
      {
        id: 'li-2',
        description: 'BOI Proposal Development',
        quantity: 16,
        unit: 'hours',
        rate: 120,
        amount: 1920,
      },
    ],
    subtotal: 1920,
    taxRate: 0,
    taxAmount: 0,
    total: 1920,
    paidAmount: 0,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return res.status(200).json({ invoices });
    
    case 'POST':
      const newInvoice = {
        id: `inv-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
      };
      invoices.push(newInvoice);
      return res.status(201).json(newInvoice);
    
    case 'PUT':
      const { id, ...updates } = req.body;
      const index = invoices.findIndex(i => i.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      invoices[index] = { ...invoices[index], ...updates };
      return res.status(200).json(invoices[index]);
    
    case 'DELETE':
      const { id: deleteId } = req.query;
      invoices = invoices.filter(i => i.id !== deleteId);
      return res.status(204).end();
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
