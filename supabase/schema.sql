-- Supabase Database Schema for Mission Control
-- Created: 2026-02-20

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- AGENTS TABLE
-- ============================================
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('primary', 'secondary', 'sub-agent')),
    status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'busy', 'idle')),
    model TEXT NOT NULL,
    current_task TEXT,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    uptime_seconds INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for agents
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_type ON agents(type);
CREATE INDEX idx_agents_last_active ON agents(last_active DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'review', 'done')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assignee_id UUID REFERENCES agents(id),
    created_by UUID REFERENCES agents(id),
    due_date DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    tags TEXT[] DEFAULT '{}',
    project_id UUID,
    source TEXT DEFAULT 'manual',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for tasks
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- BUSINESS METRICS TABLE
-- ============================================
CREATE TABLE business_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type TEXT NOT NULL,
    value DECIMAL(12,2) NOT NULL,
    period TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Indexes for metrics
CREATE INDEX idx_business_metrics_type ON business_metrics(metric_type);
CREATE INDEX idx_business_metrics_timestamp ON business_metrics(timestamp DESC);

-- ============================================
-- TIME ENTRIES TABLE
-- ============================================
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id),
    task_id UUID REFERENCES tasks(id),
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    billable BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for time entries
CREATE INDEX idx_time_entries_agent ON time_entries(agent_id);
CREATE INDEX idx_time_entries_task ON time_entries(task_id);
CREATE INDEX idx_time_entries_start ON time_entries(start_time DESC);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    paid_at TIMESTAMPTZ,
    paid_amount DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice line items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    time_entry_id UUID REFERENCES time_entries(id)
);

-- Indexes for invoices
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date DESC);

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONTENT PIPELINE TABLE
-- ============================================
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('video', 'article', 'social', 'podcast', 'other')),
    stage TEXT NOT NULL CHECK (stage IN ('idea', 'script', 'thumbnail', 'filming', 'editing', 'published')),
    assignee_id UUID REFERENCES agents(id),
    script TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    published_url TEXT,
    due_date DATE,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Content stage history
CREATE TABLE content_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    from_stage TEXT NOT NULL,
    to_stage TEXT NOT NULL,
    changed_by UUID REFERENCES agents(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Indexes for content
CREATE INDEX idx_content_stage ON content_items(stage);
CREATE INDEX idx_content_type ON content_items(type);
CREATE INDEX idx_content_assignee ON content_items(assignee_id);

CREATE TRIGGER update_content_updated_at
    BEFORE UPDATE ON content_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SYSTEM METRICS TABLE
-- ============================================
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    disk_usage DECIMAL(5,2),
    network_in BIGINT,
    network_out BIGINT,
    active_processes INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for system metrics
CREATE INDEX idx_system_metrics_timestamp ON system_metrics(timestamp DESC);

-- ============================================
-- ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id),
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activity
CREATE INDEX idx_activity_agent ON activity_log(agent_id);
CREATE INDEX idx_activity_type ON activity_log(type);
CREATE INDEX idx_activity_timestamp ON activity_log(timestamp DESC);

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL,
    theme TEXT DEFAULT 'dark',
    default_model TEXT DEFAULT 'moonshot/kimi-k2.5',
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - customize per app requirements)
CREATE POLICY "Allow all" ON agents FOR ALL USING (true);
CREATE POLICY "Allow all" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all" ON business_metrics FOR ALL USING (true);
CREATE POLICY "Allow all" ON time_entries FOR ALL USING (true);
CREATE POLICY "Allow all" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow all" ON invoice_items FOR ALL USING (true);
CREATE POLICY "Allow all" ON content_items FOR ALL USING (true);
CREATE POLICY "Allow all" ON content_stage_history FOR ALL USING (true);
CREATE POLICY "Allow all" ON system_metrics FOR ALL USING (true);
CREATE POLICY "Allow all" ON activity_log FOR ALL USING (true);
CREATE POLICY "Allow all" ON user_preferences FOR ALL USING (true);

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default agents
INSERT INTO agents (agent_id, name, type, status, model, current_task) VALUES
    ('oneclaw', 'OneClaw', 'primary', 'online', 'kimi-k2.5', 'Mission Control Operations'),
    ('builder', 'Builder', 'sub-agent', 'online', 'claude-sonnet-4-6', 'Development Tasks'),
    ('operator', 'Operator', 'sub-agent', 'online', 'kimi-k2.5', 'System Operations'),
    ('money-maker', 'Money Maker', 'sub-agent', 'idle', 'claude-sonnet-4-6', 'Business Analysis');

-- Insert sample business metrics
INSERT INTO business_metrics (metric_type, value, period) VALUES
    ('mrr', 15400.00, 'current'),
    ('arr', 184800.00, 'current');

-- Insert sample tasks
INSERT INTO tasks (title, status, priority, source, tags) VALUES
    ('Set up Voicebox on Mac Studio', 'todo', 'high', 'manual', ARRAY['voice', 'mac-studio']),
    ('Train first voice model', 'in-progress', 'high', 'manual', ARRAY['ml', 'voice']),
    ('Update Mission Control dashboard', 'done', 'high', 'internal', ARRAY['internal']);

-- Insert sample content
INSERT INTO content_items (title, type, stage, tags) VALUES
    ('Mission Control Demo Video', 'video', 'script', ARRAY['demo', 'dashboard']),
    ('Fix AI Technical Overview', 'article', 'idea', ARRAY['technical', 'fix-ai']);
