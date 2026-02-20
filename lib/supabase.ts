import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured - using local file system fallback');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!supabase;
};

// Type definitions for database
export type Agent = {
  id: string;
  agent_id: string;
  name: string;
  type: 'primary' | 'secondary' | 'sub-agent';
  status: 'online' | 'offline' | 'busy' | 'idle';
  model: string;
  current_task?: string;
  last_active: string;
  uptime_seconds: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee_id?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
};

export type BusinessMetric = {
  id: string;
  metric_type: string;
  value: number;
  period: string;
  timestamp: string;
  metadata: Record<string, any>;
};

export type TimeEntry = {
  id: string;
  agent_id?: string;
  task_id?: string;
  description: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  billable: boolean;
  hourly_rate?: number;
  created_at: string;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  customer_email?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  paid_at?: string;
  paid_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type ContentItem = {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'article' | 'social' | 'podcast' | 'other';
  stage: 'idea' | 'script' | 'thumbnail' | 'filming' | 'editing' | 'published';
  assignee_id?: string;
  script?: string;
  video_url?: string;
  thumbnail_url?: string;
  published_url?: string;
  due_date?: string;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  published_at?: string;
};

export type ActivityLog = {
  id: string;
  agent_id?: string;
  type: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: string;
};

export type SystemMetric = {
  id: string;
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
  network_in?: number;
  network_out?: number;
  active_processes?: number;
  timestamp: string;
};
