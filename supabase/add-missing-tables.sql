-- Add missing tables to Supabase
-- Run this in SQL Editor: https://app.supabase.com/project/smwusuvlqtqgmkywgxbe/sql/new

-- TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'review', 'done')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
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

-- BUSINESS METRICS TABLE
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

-- INSERT SAMPLE DATA
INSERT INTO tasks (title, status, priority, source, tags) VALUES
    ('Set up Voicebox on Mac Studio', 'todo', 'high', 'manual', ARRAY['voice', 'mac-studio']),
    ('Train first voice model', 'in-progress', 'high', 'manual', ARRAY['ml', 'voice']),
    ('Update Mission Control dashboard', 'done', 'high', 'internal', ARRAY['internal'])
ON CONFLICT DO NOTHING;

INSERT INTO business_metrics (metric_type, value, period) VALUES
    ('mrr', 15400.00, 'current'),
    ('arr', 184800.00, 'current')
ON CONFLICT DO NOTHING;

-- ENABLE RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all" ON business_metrics FOR ALL USING (true);
