// components/InvoiceGenerator.tsx
import React, { useState, useMemo } from 'react';
import {
  Plus, Trash2, Save, Send, Download, FileText, CheckCircle,
  ChevronLeft, Eye, X, Calendar, DollarSign, Clock, User,
  Search, Filter, ArrowRight
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Invoice, Customer, TimeEntry, InvoiceLineItem } from '../types';
import { saveInvoices } from '../lib/storage';

interface InvoiceGeneratorProps {
  invoices: Invoice[];
  customers: Customer[];
  timeEntries: TimeEntry[];
  onInvoicesChange: (invoices: Invoice[]) => void;
}

export default function InvoiceGenerator({ 
  invoices, 
  customers, 
  timeEntries, 
  onInvoicesChange 
}: InvoiceGeneratorProps) {
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<Invoice['status'] | 'all'>('all');

  const filteredInvoices = useMemo(() => {
    if (filterStatus === 'all') return invoices;
    return invoices.filter(inv => inv.status === filterStatus);
  }, [invoices, filterStatus]);

  const handleCreateInvoice = (invoice: Invoice) => {
    const updated = [...invoices, invoice];
    onInvoicesChange(updated);
    setView('list');
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    const updated = invoices.map(inv => 
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    );
    onInvoicesChange(updated);
    setSelectedInvoice(updatedInvoice);
  };

  const handleDeleteInvoice = (id: string) => {
    const updated = invoices.filter(inv => inv.id !== id);
    onInvoicesChange(updated);
    setView('list');
  };

  const handleSendInvoice = (invoice: Invoice) => {
    const updated: Invoice = {
      ...invoice,
      status: 'sent',
      sentAt: new Date(),
    };
    handleUpdateInvoice(updated);
  };

  const handleMarkPaid = (invoice: Invoice) => {
    const updated: Invoice = {
      ...invoice,
      status: 'paid',
      paidAt: new Date(),
      paidAmount: invoice.total,
    };
    handleUpdateInvoice(updated);
  };

  if (view === 'create') {
    return (
      <InvoiceCreator
        customers={customers}
        timeEntries={timeEntries}
        onSave={handleCreateInvoice}
        onCancel={() => setView('list')}
        existingInvoices={invoices}
      />
    );
  }

  if (view === 'detail' && selectedInvoice) {
    return (
      <InvoiceDetail
        invoice={selectedInvoice}
        onBack={() => setView('list')}
        onUpdate={handleUpdateInvoice}
        onDelete={handleDeleteInvoice}
        onSend={handleSendInvoice}
        onMarkPaid={handleMarkPaid}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-800 rounded-lg p-1">
            {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
                  filterStatus === status 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setView('create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400 mb-1">Total Outstanding</p>
          <p className="text-2xl font-bold text-white">
            ${invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400 mb-1">Paid This Month</p>
          <p className="text-2xl font-bold text-green-400">
            ${invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400 mb-1">Draft Invoices</p>
          <p className="text-2xl font-bold text-gray-300">
            {invoices.filter(i => i.status === 'draft').length}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400 mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-400">
            {invoices.filter(i => i.status === 'overdue').length}
          </p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase bg-gray-800/50">
              <th className="px-6 py-3">Invoice #</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Issue Date</th>
              <th className="px-6 py-3">Due Date</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredInvoices.map((invoice) => (
              <tr 
                key={invoice.id} 
                className="hover:bg-gray-800/50 cursor-pointer"
                onClick={() => { setSelectedInvoice(invoice); setView('detail'); }}
              >
                <td className="px-6 py-4 text-white font-medium">{invoice.invoiceNumber}</td>
                <td className="px-6 py-4 text-gray-300">{invoice.customerName}</td>
                <td className="px-6 py-4 text-gray-400">{format(invoice.issueDate, 'MMM d, yyyy')}</td>
                <td className="px-6 py-4 text-gray-400">{format(invoice.dueDate, 'MMM d, yyyy')}</td>
                <td className="px-6 py-4 text-right text-white font-medium">${invoice.total.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  <StatusBadge status={invoice.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Invoice['status'] }) {
  const styles = {
    draft: 'bg-gray-500/20 text-gray-400',
    sent: 'bg-blue-500/20 text-blue-400',
    paid: 'bg-green-500/20 text-green-400',
    overdue: 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

function InvoiceCreator({
  customers,
  timeEntries,
  onSave,
  onCancel,
  existingInvoices,
}: {
  customers: Customer[];
  timeEntries: TimeEntry[];
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
  existingInvoices: Invoice[];
}) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [step, setStep] = useState<'customer' | 'items' | 'review'>('customer');

  const nextInvoiceNumber = useMemo(() => {
    const year = new Date().getFullYear();
    const existing = existingInvoices.filter(inv => 
      inv.invoiceNumber.startsWith(`INV-${year}`)
    );
    const nextNum = existing.length + 1;
    return `INV-${year}-${nextNum.toString().padStart(3, '0')}`;
  }, [existingInvoices]);

  const addLineItem = (item: Partial<InvoiceLineItem>) => {
    const newItem: InvoiceLineItem = {
      id: `li-${Date.now()}`,
      description: item.description || '',
      quantity: item.quantity || 1,
      unit: item.unit || 'hours',
      rate: item.rate || 0,
      amount: (item.quantity || 1) * (item.rate || 0),
      timeEntryIds: item.timeEntryIds,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, updates: Partial<InvoiceLineItem>) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        updated.amount = updated.quantity * updated.rate;
        return updated;
      }
      return item;
    }));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleSave = () => {
    if (!selectedCustomer || lineItems.length === 0) return;

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: nextInvoiceNumber,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerEmail: selectedCustomer.email,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      status: 'draft',
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      total,
      paidAmount: 0,
      notes,
      createdAt: new Date(),
    };

    onSave(invoice);
  };

  if (step === 'customer') {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Select Customer</h3>
        <div className="grid grid-cols-2 gap-4">
          {customers.map((customer) => (
            <button
              key={customer.id}
              onClick={() => { setSelectedCustomer(customer); setStep('items'); }}
              className="p-4 rounded-xl border border-gray-700 hover:border-gray-600 text-left"
            >
              <p className="text-white font-medium">{customer.name}</p>
              <p className="text-sm text-gray-500">{customer.company || customer.email}</p>
              <p className="text-sm text-gray-400 mt-1">${customer.hourlyRate}/hr</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'items') {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Add Line Items</h3>
          <button
            onClick={() => setStep('review')}
            disabled={lineItems.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-lg"
          >
            Review
          </button>
        </div>

        <div className="space-y-3">
          {lineItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-800 rounded-lg">
              <div className="col-span-5">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                  placeholder="Description"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, { quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  step="0.1"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) => updateLineItem(item.id, { rate: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
              <div className="col-span-2 text-white">${item.amount.toFixed(0)}</div>
              <div className="col-span-1">
                <button
                  onClick={() => removeLineItem(item.id)}
                  className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          <button
            onClick={() => addLineItem({ description: '', quantity: 1, unit: 'hours', rate: selectedCustomer?.hourlyRate || 100 })}
            className="flex items-center gap-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-white">Total</span>
            <span className="text-green-400">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Review Invoice</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setStep('items')} className="px-4 py-2 text-gray-400">Back</button>
          <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg">Save</button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-8">
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">INVOICE</h2>
            <p className="text-gray-400">{nextInvoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400">Issue: {format(new Date(issueDate), 'MMM d, yyyy')}</p>
            <p className="text-gray-400">Due: {format(new Date(dueDate), 'MMM d, yyyy')}</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-gray-500 text-sm">Bill To</p>
          <p className="text-white font-medium">{selectedCustomer?.name}</p>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-700">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => (
              <tr key={item.id} className="text-gray-300">
                <td className="py-3">{item.description}</td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">${item.rate.toFixed(2)}</td>
                <td className="py-3 text-right">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-gray-400">Subtotal: ${subtotal.toFixed(2)}</p>
            <p className="text-gray-400">Tax: ${taxAmount.toFixed(2)}</p>
            <p className="text-white font-semibold text-lg">Total: ${total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceDetail({
  invoice,
  onBack,
  onSend,
  onMarkPaid,
  onUpdate,
  onDelete,
}: {
  invoice: Invoice;
  onBack: () => void;
  onSend: (invoice: Invoice) => void;
  onMarkPaid: (invoice: Invoice) => void;
  onUpdate: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-lg font-semibold text-white">{invoice.invoiceNumber}</h3>
            <p className="text-gray-400">{invoice.customerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === 'draft' && (
            <button onClick={() => onSend(invoice)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Send
            </button>
          )}
          {invoice.status === 'sent' && (
            <button onClick={() => onMarkPaid(invoice)} className="px-4 py-2 bg-green-600 text-white rounded-lg">
              Mark Paid
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">INVOICE</h2>
            <p className="text-xl text-gray-400">{invoice.invoiceNumber}</p>
            <StatusBadge status={invoice.status} />
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-sm">Issue Date</p>
            <p className="text-white">{format(invoice.issueDate, 'MMMM d, yyyy')}</p>
            <p className="text-gray-500 text-sm mt-2">Due Date</p>
            <p className="text-white">{format(invoice.dueDate, 'MMMM d, yyyy')}</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-gray-500 text-sm">Bill To</p>
          <p className="text-white font-medium text-lg">{invoice.customerName}</p>
          {invoice.customerEmail && <p className="text-gray-400">{invoice.customerEmail}</p>}
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-700">
              <th className="py-3">Description</th>
              <th className="py-3 text-right">Quantity</th>
              <th className="py-3 text-right">Rate</th>
              <th className="py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {invoice.lineItems.map((item) => (
              <tr key={item.id} className="text-gray-300">
                <td className="py-4">{item.description}</td>
                <td className="py-4 text-right">{item.quantity} {item.unit}</td>
                <td className="py-4 text-right">${item.rate.toFixed(2)}</td>
                <td className="py-4 text-right text-white">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Tax</span>
              <span>${invoice.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-semibold text-lg pt-2 border-t border-gray-700">
              <span>Total</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
