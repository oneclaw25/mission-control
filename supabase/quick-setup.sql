-- Run this SQL in Supabase SQL Editor:
-- https://app.supabase.com/project/smwusuvlqtqgmkywgxbe/sql/new

-- ============================================
-- SUPABASE SCHEMA FOR MISSION CONTROL
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AGENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS agents (
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'review', 'done')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assignee_id UUID REFERENCES agents(id),
    due_date DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    tags TEXT[] DEFAULT '{}',
    source TEXT DEFAULT 'manual',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- BUSINESS METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS business_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type TEXT NOT NULL,
    value DECIMAL(12,2) NOT NULL,
    period TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_business_metrics_type ON business_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_business_metrics_timestamp ON business_metrics(timestamp DESC);

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================
INSERT INTO agents (agent_id, name, type, status, model, current_task) 
VALUES
    ('oneclaw', 'OneClaw', 'primary', 'online', 'kimi-k2.5', 'Mission Control Operations'),
    ('builder', 'Builder', 'sub-agent', 'online', 'claude-sonnet-4-6', 'Development Tasks'),
    ('operator', 'Operator', 'sub-agent', 'online', 'kimi-k2.5', 'System Operations'),
    ('money-maker', 'Money Maker', 'sub-agent', 'idle', 'claude-sonnet-4-6', 'Business Analysis')
ON CONFLICT (agent_id) DO NOTHING;

INSERT INTO business_metrics (metric_type, value, period) 
VALUES
    ('mrr', 15400.00, 'current'),
    ('arr', 184800.00, 'current')
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, status, priority, source, tags) 
VALUES
    ('Set up Voicebox on Mac Studio', 'todo', 'high', 'manual', ARRAY['voice', 'mac-studio']),
    ('Train first voice model', 'in-progress', 'high', 'manual', ARRAY['ml', 'voice']),
    ('Update Mission Control dashboard', 'done', 'high', 'internal', ARRAY['internal'])
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;

-- Allow all access (customize as needed)
CREATE POLICY "Allow all" ON agents FOR ALL USING (true);
CREATE POLICY "Allow all" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all" ON business_metrics FOR ALL USING (true);
