// types/index.ts
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'google' | 'cron' | 'mission' | 'meeting' | 'deadline' | 'reminder';
  status: 'pending' | 'completed' | 'overdue' | 'running' | 'failed';
  color?: string;
  location?: string;
  attendees?: string[];
  recurrence?: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  command: string;
  status: 'active' | 'paused' | 'error';
  lastRun?: Date;
  nextRun: Date;
  lastStatus?: 'success' | 'failed';
  runCount: number;
  failCount: number;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskName?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  billable: boolean;
  hourlyRate?: number;
  userId: string;
  userName: string;
  tags: string[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  notes?: string;
  createdAt: Date;
  sentAt?: Date;
  paidAt?: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  timeEntryIds?: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string;
  address?: string;
  hourlyRate?: number;
  paymentTerms?: number; // days
  createdAt: Date;
}

export interface BusinessMetrics {
  revenue: {
    mrr: number;
    arr: number;
    byProject: Record<string, number>;
    byCustomer: Record<string, number>;
    growth: number;
    lastMonth: number;
    thisMonth: number;
  };
  costs: {
    infrastructure: number;
    agents: number;
    time: number;
    total: number;
  };
  profit: {
    gross: number;
    margin: number;
    perProject: Record<string, number>;
  };
  forecast: {
    runway: number;
    breakEven: Date | null;
    cashFlow: CashFlowItem[];
  };
  timeTracking: {
    totalHours: number;
    billableHours: number;
    utilization: number;
  };
}

export interface CashFlowItem {
  month: string;
  in: number;
  out: number;
  net: number;
}

export interface ProjectRevenue {
  projectId: string;
  projectName: string;
  revenue: number;
  costs: number;
  hours: number;
  profit: number;
  margin: number;
}
