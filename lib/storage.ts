// lib/storage.ts
import { 
  CalendarEvent, CronJob, TimeEntry, Invoice, Customer, 
  BusinessMetrics, ProjectRevenue, CashFlowItem 
} from '../types';

// LocalStorage keys
const STORAGE_KEYS = {
  CALENDAR_EVENTS: 'mc_calendar_events',
  CRON_JOBS: 'mc_cron_jobs',
  TIME_ENTRIES: 'mc_time_entries',
  INVOICES: 'mc_invoices',
  CUSTOMERS: 'mc_customers',
  BUSINESS_METRICS: 'mc_business_metrics',
  GOOGLE_TOKEN: 'mc_google_token',
  ACTIVE_TIMER: 'mc_active_timer',
};

// Calendar Events
export const saveCalendarEvents = (events: CalendarEvent[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(events));
  }
};

export const loadCalendarEvents = (): CalendarEvent[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS);
  if (!data) return [];
  try {
    return JSON.parse(data).map((e: any) => ({
      ...e,
      start: new Date(e.start),
      end: new Date(e.end),
    }));
  } catch {
    return [];
  }
};

// Cron Jobs
export const saveCronJobs = (jobs: CronJob[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CRON_JOBS, JSON.stringify(jobs));
  }
};

export const loadCronJobs = (): CronJob[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.CRON_JOBS);
  if (!data) return getDefaultCronJobs();
  try {
    return JSON.parse(data).map((j: any) => ({
      ...j,
      lastRun: j.lastRun ? new Date(j.lastRun) : undefined,
      nextRun: new Date(j.nextRun),
    }));
  } catch {
    return getDefaultCronJobs();
  }
};

const getDefaultCronJobs = (): CronJob[] => [
  {
    id: 'cron-1',
    name: 'Heartbeat Check',
    schedule: '0 */6 * * *',
    command: 'check heartbeats',
    status: 'active',
    lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000),
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
    lastRun: new Date(Date.now() - 8 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 16 * 60 * 60 * 1000),
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
    lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
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
    lastRun: new Date(Date.now() - 25 * 60 * 1000),
    nextRun: new Date(Date.now() + 5 * 60 * 1000),
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
    nextRun: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    runCount: 3,
    failCount: 1,
  },
];

// Time Entries
export const saveTimeEntries = (entries: TimeEntry[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(entries));
  }
};

export const loadTimeEntries = (): TimeEntry[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.TIME_ENTRIES);
  if (!data) return getDefaultTimeEntries();
  try {
    return JSON.parse(data).map((e: any) => ({
      ...e,
      startTime: new Date(e.startTime),
      endTime: e.endTime ? new Date(e.endTime) : undefined,
    }));
  } catch {
    return getDefaultTimeEntries();
  }
};

const getDefaultTimeEntries = (): TimeEntry[] => [
  {
    id: 'te-1',
    projectId: '1',
    projectName: 'Clarity',
    description: 'Voice AI Assessment',
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
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
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 20 * 60 * 60 * 1000),
    duration: 240,
    billable: true,
    hourlyRate: 120,
    userId: 'user-1',
    userName: 'OneClaw',
    tags: ['research', 'proposal'],
  },
  {
    id: 'te-3',
    projectId: '3',
    projectName: 'Fix AI',
    description: 'B2B Research Documents',
    startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 44 * 60 * 60 * 1000),
    duration: 240,
    billable: true,
    hourlyRate: 150,
    userId: 'user-1',
    userName: 'OneClaw',
    tags: ['research', 'documents'],
  },
];

// Invoices
export const saveInvoices = (invoices: Invoice[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }
};

export const loadInvoices = (): Invoice[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
  if (!data) return getDefaultInvoices();
  try {
    return JSON.parse(data).map((i: any) => ({
      ...i,
      issueDate: new Date(i.issueDate),
      dueDate: new Date(i.dueDate),
      createdAt: new Date(i.createdAt),
      sentAt: i.sentAt ? new Date(i.sentAt) : undefined,
      paidAt: i.paidAt ? new Date(i.paidAt) : undefined,
    }));
  } catch {
    return getDefaultInvoices();
  }
};

const getDefaultInvoices = (): Invoice[] => [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    customerId: 'cust-1',
    customerName: 'Arkim AI',
    customerEmail: 'jacob@arkim.ai',
    issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
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
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    sentAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-002',
    customerId: 'cust-2',
    customerName: 'Coast Cycle',
    customerEmail: 'info@coastcycle.lk',
    issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
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
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

// Customers
export const saveCustomers = (customers: Customer[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }
};

export const loadCustomers = (): Customer[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  if (!data) return getDefaultCustomers();
  try {
    return JSON.parse(data).map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
    }));
  } catch {
    return getDefaultCustomers();
  }
};

const getDefaultCustomers = (): Customer[] => [
  {
    id: 'cust-1',
    name: 'Jacob Johnson',
    email: 'jacob@arkim.ai',
    company: 'Arkim AI',
    hourlyRate: 150,
    paymentTerms: 30,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'cust-2',
    name: 'Coast Cycle Team',
    email: 'info@coastcycle.lk',
    company: 'Coast Cycle Sri Lanka',
    hourlyRate: 120,
    paymentTerms: 30,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'cust-3',
    name: 'Voice AI Labs',
    email: 'team@voiceailabs.com',
    company: 'Voice AI Labs',
    hourlyRate: 200,
    paymentTerms: 15,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
];

// Business Metrics
export const calculateBusinessMetrics = (
  timeEntries: TimeEntry[],
  invoices: Invoice[],
  projects: any[]
): BusinessMetrics => {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  // Calculate revenue
  const thisMonthInvoices = invoices.filter(inv => {
    const d = new Date(inv.issueDate);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const lastMonthInvoices = invoices.filter(inv => {
    const d = new Date(inv.issueDate);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });

  const thisMonthRevenue = thisMonthInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const lastMonthRevenue = lastMonthInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const growth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

  // Calculate costs (simplified)
  const infrastructureCost = 500; // Monthly infrastructure
  const agentCost = timeEntries.length * 0.5; // Cost per entry
  const timeCost = timeEntries.reduce((sum, e) => sum + (e.duration / 60) * 25, 0); // $25/hour internal cost

  const totalCost = infrastructureCost + agentCost + timeCost;

  // Revenue by project
  const byProject: Record<string, number> = {};
  timeEntries.forEach(entry => {
    const revenue = (entry.duration / 60) * (entry.hourlyRate || 0);
    byProject[entry.projectName] = (byProject[entry.projectName] || 0) + revenue;
  });

  // Revenue by customer
  const byCustomer: Record<string, number> = {};
  invoices.forEach(inv => {
    byCustomer[inv.customerName] = (byCustomer[inv.customerName] || 0) + inv.total;
  });

  // Cash flow forecast (next 6 months)
  const cashFlow: CashFlowItem[] = [];
  for (let i = 0; i < 6; i++) {
    const month = new Date(thisYear, thisMonth + i, 1);
    const monthStr = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    // Projected revenue based on current MRR
    const projectedIn = thisMonthRevenue * (1 + growth / 100);
    const projectedOut = totalCost;
    
    cashFlow.push({
      month: monthStr,
      in: Math.round(projectedIn),
      out: Math.round(projectedOut),
      net: Math.round(projectedIn - projectedOut),
    });
  }

  // Calculate runway (simplified)
  const monthlyBurn = totalCost;
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const runway = monthlyBurn > 0 ? Math.round(totalRevenue / monthlyBurn) : 12;

  // Time tracking stats
  const totalHours = timeEntries.reduce((sum, e) => sum + (e.duration / 60), 0);
  const billableHours = timeEntries.filter(e => e.billable).reduce((sum, e) => sum + (e.duration / 60), 0);
  const utilization = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

  return {
    revenue: {
      mrr: Math.round(thisMonthRevenue),
      arr: Math.round(thisMonthRevenue * 12),
      byProject,
      byCustomer,
      growth: Math.round(growth * 100) / 100,
      lastMonth: Math.round(lastMonthRevenue),
      thisMonth: Math.round(thisMonthRevenue),
    },
    costs: {
      infrastructure: infrastructureCost,
      agents: Math.round(agentCost),
      time: Math.round(timeCost),
      total: Math.round(totalCost),
    },
    profit: {
      gross: Math.round(thisMonthRevenue - totalCost),
      margin: thisMonthRevenue > 0 ? Math.round(((thisMonthRevenue - totalCost) / thisMonthRevenue) * 100) : 0,
      perProject: byProject,
    },
    forecast: {
      runway,
      breakEven: null, // Would need more complex calculation
      cashFlow,
    },
    timeTracking: {
      totalHours: Math.round(totalHours * 10) / 10,
      billableHours: Math.round(billableHours * 10) / 10,
      utilization: Math.round(utilization * 10) / 10,
    },
  };
};

// Google Token
export const saveGoogleToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.GOOGLE_TOKEN, token);
  }
};

export const loadGoogleToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.GOOGLE_TOKEN);
};

export const clearGoogleToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.GOOGLE_TOKEN);
  }
};

// Active Timer
export const saveActiveTimer = (entry: TimeEntry | null) => {
  if (typeof window !== 'undefined') {
    if (entry) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TIMER, JSON.stringify(entry));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
    }
  }
};

export const loadActiveTimer = (): TimeEntry | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_TIMER);
  if (!data) return null;
  try {
    const entry = JSON.parse(data);
    return {
      ...entry,
      startTime: new Date(entry.startTime),
      endTime: entry.endTime ? new Date(entry.endTime) : undefined,
    };
  } catch {
    return null;
  }
};
