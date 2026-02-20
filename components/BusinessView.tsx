// components/BusinessView.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Clock, Users,
  FileText, Calendar, AlertTriangle, ArrowUpRight, ArrowDownRight,
  CreditCard, Package, Activity, Wallet, BarChart3, PieChart,
  ChevronRight, Plus, Download, Send, CheckCircle, XCircle, Clock3,
  MoreHorizontal, Search, Filter, ArrowLeft
} from 'lucide-react';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths,
  isSameMonth, parseISO
} from 'date-fns';
import { 
  BusinessMetrics, TimeEntry, Invoice, Customer, ProjectRevenue, CashFlowItem 
} from '../types';
import { 
  loadTimeEntries, loadInvoices, loadCustomers, calculateBusinessMetrics,
  saveInvoices, saveCustomers
} from '../lib/storage';
import TimeTracker from './TimeTracker';
// import InvoiceGenerator from './InvoiceGenerator';

// Mock projects data (would come from ProjectsView in real app)
const MOCK_PROJECTS = [
  { id: '1', name: 'Clarity', description: 'Voice AI', status: 'active', priority: 'critical' },
  { id: '2', name: 'Coast Cycle Sri Lanka', description: 'BOI proposal', status: 'active', priority: 'high' },
  { id: '3', name: 'Fix AI', description: 'B2B device inspection', status: 'active', priority: 'high' },
  { id: '4', name: 'Mission Control', description: 'Operations dashboard', status: 'active', priority: 'medium' },
];

// KPICard Component
function KPICard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  color,
  subtitle
}: { 
  title: string; 
  value: string; 
  change?: number; 
  changeLabel?: string;
  icon: any;
  color: string;
  subtitle?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-gray-800`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-2 mt-4">
          <span className={`flex items-center text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}%
          </span>
          <span className="text-sm text-gray-500">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}

// Revenue Chart Component
function RevenueChart({ data }: { data: CashFlowItem[] }) {
  const maxValue = Math.max(...data.map(d => Math.max(d.in, d.out)));
  const height = 200;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Cash Flow Forecast</h3>
      <div className="h-48 flex items-end justify-between gap-2">
        {data.map((item, i) => {
          const inHeight = (item.in / maxValue) * height;
          const outHeight = (item.out / maxValue) * height;
          
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex justify-center gap-1">
                <div 
                  className="w-3 bg-green-500/70 rounded-t"
                  style={{ height: `${inHeight}px` }}
                  title={`In: $${item.in.toLocaleString()}`}
                />
                <div 
                  className="w-3 bg-red-500/70 rounded-t"
                  style={{ height: `${outHeight}px` }}
                  title={`Out: $${item.out.toLocaleString()}`}
                />
              </div>
              <span className="text-xs text-gray-500">{item.month.split(' ')[0]}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500/70 rounded" />
          <span className="text-sm text-gray-400">Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500/70 rounded" />
          <span className="text-sm text-gray-400">Costs</span>
        </div>
      </div>
    </div>
  );
}

// Project Profitability Table
function ProjectTable({ projects }: { projects: ProjectRevenue[] }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Project Profitability</h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-gray-500 uppercase">
            <th className="px-6 py-3">Project</th>
            <th className="px-6 py-3 text-right">Revenue</th>
            <th className="px-6 py-3 text-right">Costs</th>
            <th className="px-6 py-3 text-right">Hours</th>
            <th className="px-6 py-3 text-right">Profit</th>
            <th className="px-6 py-3 text-right">Margin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {projects.map((project) => (
            <tr key={project.projectId} className="hover:bg-gray-800/50">
              <td className="px-6 py-4">
                <span className="text-white font-medium">{project.projectName}</span>
              </td>
              <td className="px-6 py-4 text-right text-green-400">
                ${project.revenue.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right text-red-400">
                ${project.costs.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right text-gray-300">
                {project.hours.toFixed(1)}h
              </td>
              <td className="px-6 py-4 text-right text-white">
                ${project.profit.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right">
                <span className={`px-2 py-1 rounded text-xs ${
                  project.margin >= 50 ? 'bg-green-500/20 text-green-400' :
                  project.margin >= 30 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {project.margin.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Invoice List Component
function InvoiceList({ 
  invoices, 
  onStatusChange 
}: { 
  invoices: Invoice[]; 
  onStatusChange: (id: string, status: Invoice['status']) => void;
}) {
  const [filter, setFilter] = useState<Invoice['status'] | 'all'>('all');

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter);

  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-400',
    sent: 'bg-blue-500/20 text-blue-400',
    paid: 'bg-green-500/20 text-green-400',
    overdue: 'bg-red-500/20 text-red-400',
  };

  const statusIcons = {
    draft: Clock3,
    sent: Send,
    paid: CheckCircle,
    overdue: AlertTriangle,
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Invoices</h3>
        <div className="flex items-center gap-2">
          {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors ${
                filter === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-800">
        {filteredInvoices.map((invoice) => {
          const StatusIcon = statusIcons[invoice.status];
          return (
            <div key={invoice.id} className="px-6 py-4 hover:bg-gray-800/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${statusColors[invoice.status]}`}>
                  <StatusIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-white font-medium">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-500">{invoice.customerName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">${invoice.total.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Due {format(invoice.dueDate, 'MMM d')}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {invoice.status === 'draft' && (
                  <button
                    onClick={() => onStatusChange(invoice.id, 'sent')}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
                    title="Mark as sent"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
                {invoice.status === 'sent' && (
                  <button
                    onClick={() => onStatusChange(invoice.id, 'paid')}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
                    title="Mark as paid"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400" title="Download PDF">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {filteredInvoices.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No invoices found
          </div>
        )}
      </div>
    </div>
  );
}

// Customer List Component
function CustomerList({ customers }: { customers: Customer[] }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Customers</h3>
      </div>
      <div className="divide-y divide-gray-800">
        {customers.map((customer) => (
          <div key={customer.id} className="px-6 py-4 hover:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{customer.name}</p>
                <p className="text-sm text-gray-500">{customer.company || customer.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">${customer.hourlyRate}/hr</p>
                <p className="text-xs text-gray-500">{customer.paymentTerms} day terms</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BusinessView() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'time' | 'invoices' | 'customers'>('dashboard');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);

  // Load data
  useEffect(() => {
    const entries = loadTimeEntries();
    const invs = loadInvoices();
    const custs = loadCustomers();
    
    setTimeEntries(entries);
    setInvoices(invs);
    setCustomers(custs);
    
    const calculatedMetrics = calculateBusinessMetrics(entries, invs, MOCK_PROJECTS);
    setMetrics(calculatedMetrics);
  }, []);

  // Calculate project revenue
  const projectRevenues: ProjectRevenue[] = useMemo(() => {
    const projectMap = new Map<string, ProjectRevenue>();
    
    timeEntries.forEach(entry => {
      const existing = projectMap.get(entry.projectId);
      const revenue = (entry.duration / 60) * (entry.hourlyRate || 0);
      const costs = (entry.duration / 60) * 25; // $25/hour internal cost
      
      if (existing) {
        existing.revenue += revenue;
        existing.costs += costs;
        existing.hours += entry.duration / 60;
        existing.profit = existing.revenue - existing.costs;
        existing.margin = existing.revenue > 0 ? (existing.profit / existing.revenue) * 100 : 0;
      } else {
        projectMap.set(entry.projectId, {
          projectId: entry.projectId,
          projectName: entry.projectName,
          revenue,
          costs,
          hours: entry.duration / 60,
          profit: revenue - costs,
          margin: revenue > 0 ? ((revenue - costs) / revenue) * 100 : 0,
        });
      }
    });
    
    return Array.from(projectMap.values());
  }, [timeEntries]);

  // Update invoice status
  const handleInvoiceStatusChange = (id: string, status: Invoice['status']) => {
    const updated = invoices.map(inv => 
      inv.id === id 
        ? { 
            ...inv, 
            status,
            sentAt: status === 'sent' ? new Date() : inv.sentAt,
            paidAt: status === 'paid' ? new Date() : inv.paidAt,
          }
        : inv
    );
    setInvoices(updated);
    saveInvoices(updated);
  };

  // Refresh metrics when data changes
  const refreshMetrics = () => {
    const calculatedMetrics = calculateBusinessMetrics(timeEntries, invoices, MOCK_PROJECTS);
    setMetrics(calculatedMetrics);
  };

  if (!metrics) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Business</h2>
          <p className="text-gray-400">Revenue, costs, and financial metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {(['dashboard', 'time', 'invoices', 'customers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <KPICard
              title="Monthly Recurring Revenue"
              value={`$${metrics.revenue.mrr.toLocaleString()}`}
              change={metrics.revenue.growth}
              changeLabel="vs last month"
              icon={TrendingUp}
              color="green"
              subtitle={`$${metrics.revenue.arr.toLocaleString()} ARR`}
            />
            <KPICard
              title="Total Costs"
              value={`$${metrics.costs.total.toLocaleString()}`}
              icon={TrendingDown}
              color="red"
              subtitle={`$${metrics.costs.infrastructure} infrastructure`}
            />
            <KPICard
              title="Gross Profit"
              value={`$${metrics.profit.gross.toLocaleString()}`}
              icon={DollarSign}
              color="blue"
              subtitle={`${metrics.profit.margin}% margin`}
            />
            <KPICard
              title="Runway"
              value={`${metrics.forecast.runway} months`}
              icon={Calendar}
              color="purple"
              subtitle="Based on current burn rate"
            />
          </div>

          {/* Second Row KPIs */}
          <div className="grid grid-cols-4 gap-4">
            <KPICard
              title="Billable Hours"
              value={`${metrics.timeTracking.billableHours}h`}
              change={metrics.timeTracking.utilization}
              changeLabel="utilization"
              icon={Clock}
              color="cyan"
              subtitle={`${metrics.timeTracking.totalHours}h total tracked`}
            />
            <KPICard
              title="Outstanding Invoices"
              value={`$${invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0).toLocaleString()}`}
              icon={FileText}
              color="orange"
              subtitle={`${invoices.filter(i => i.status === 'sent').length} pending`}
            />
            <KPICard
              title="Paid This Month"
              value={`$${invoices.filter(i => i.status === 'paid' && isSameMonth(new Date(i.paidAt || 0), new Date())).reduce((s, i) => s + i.total, 0).toLocaleString()}`}
              icon={CheckCircle}
              color="green"
              subtitle={`${invoices.filter(i => i.status === 'paid' && isSameMonth(new Date(i.paidAt || 0), new Date())).length} invoices`}
            />
            <KPICard
              title="Active Customers"
              value={customers.length.toString()}
              icon={Users}
              color="purple"
              subtitle={`Avg $${Math.round(customers.reduce((s, c) => s + (c.hourlyRate || 0), 0) / customers.length)}/hr`}
            />
          </div>

          {/* Charts & Tables */}
          <div className="grid grid-cols-2 gap-6">
            <RevenueChart data={metrics.forecast.cashFlow} />
            <ProjectTable projects={projectRevenues} />
          </div>

          {/* Invoices & Customers */}
          <div className="grid grid-cols-2 gap-6">
            <InvoiceList invoices={invoices} onStatusChange={handleInvoiceStatusChange} />
            <CustomerList customers={customers} />
          </div>
        </>
      )}

      {activeTab === 'time' && (
        <TimeTracker 
          entries={timeEntries} 
          onEntriesChange={(newEntries) => {
            setTimeEntries(newEntries);
            refreshMetrics();
          }}
          projects={MOCK_PROJECTS}
        />
      )}

      {activeTab === 'invoices' && (
        <div className="p-8 text-center text-gray-500">
          Invoice Generator coming soon
        </div>
        // <InvoiceGenerator
        //   invoices={invoices}
        //   customers={customers}
        //   timeEntries={timeEntries}
        //   onInvoicesChange={(newInvoices) => {
        //     setInvoices(newInvoices);
        //     saveInvoices(newInvoices);
        //     refreshMetrics();
        //   }}
        // />
      )}

      {activeTab === 'customers' && (
        <CustomerListFull 
          customers={customers} 
          onCustomersChange={(newCustomers) => {
            setCustomers(newCustomers);
            saveCustomers(newCustomers);
          }}
        />
      )}
    </div>
  );
}

// Full Customer Management
function CustomerListFull({ 
  customers, 
  onCustomersChange 
}: { 
  customers: Customer[]; 
  onCustomersChange: (customers: Customer[]) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({});

  const handleAdd = () => {
    if (newCustomer.name && newCustomer.email) {
      const customer: Customer = {
        id: `cust-${Date.now()}`,
        name: newCustomer.name,
        email: newCustomer.email,
        company: newCustomer.company,
        hourlyRate: newCustomer.hourlyRate || 100,
        paymentTerms: newCustomer.paymentTerms || 30,
        createdAt: new Date(),
      };
      onCustomersChange([...customers, customer]);
      setIsAdding(false);
      setNewCustomer({});
    }
  };

  const handleDelete = (id: string) => {
    onCustomersChange(customers.filter(c => c.id !== id));
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Customer Management</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={newCustomer.name || ''}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
            <input
              type="email"
              placeholder="Email"
              value={newCustomer.email || ''}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
            <input
              type="text"
              placeholder="Company"
              value={newCustomer.company || ''}
              onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
            <input
              type="number"
              placeholder="Hourly Rate"
              value={newCustomer.hourlyRate || ''}
              onChange={(e) => setNewCustomer({ ...newCustomer, hourlyRate: Number(e.target.value) })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg"
            >
              Save
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-gray-500 uppercase">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3 text-right">Rate</th>
            <th className="px-4 py-3 text-right">Terms</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-800/50">
              <td className="px-4 py-4">
                <div>
                  <p className="text-white font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
              </td>
              <td className="px-4 py-4 text-gray-300">{customer.company || '-'}</td>
              <td className="px-4 py-4 text-right text-gray-300">${customer.hourlyRate}/hr</td>
              <td className="px-4 py-4 text-right text-gray-300">{customer.paymentTerms} days</td>
              <td className="px-4 py-4 text-right">
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-gray-400 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
