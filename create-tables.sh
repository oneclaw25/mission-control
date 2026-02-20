#!/bin/bash

# Create tables in Supabase using psql-like approach with REST API

SUPABASE_URL="https://smwusuvlqtqgmkywgxbe.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtd3VzdXZscXRxZ21reXdneGJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU4ODMwNCwiZXhwIjoyMDg3MTY0MzA0fQ.Ql7WcXJiFQrDGl-ig3Auppm0RFdHCKZh9FrDzgs0Gr8"

echo "🚀 Creating Mission Control database tables..."

# Create agents table
echo "📦 Creating agents table..."
curl -s -X POST "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "CREATE TABLE IF NOT EXISTS agents (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), agent_id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL CHECK (type IN ('\''primary'\'', '\''secondary'\'', '\''sub-agent'\'')), status TEXT NOT NULL CHECK (status IN ('\''online'\'', '\''offline'\'', '\''busy'\'', '\''idle'\'')), model TEXT NOT NULL, current_task TEXT, last_active TIMESTAMPTZ DEFAULT NOW(), uptime_seconds INTEGER DEFAULT 0, metadata JSONB DEFAULT '\'{}}'\'', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())"
  }'

echo ""
echo "✅ Database setup initiated!"
echo ""
echo "📋 Please manually run the SQL file in Supabase SQL Editor:"
echo "   https://app.supabase.com/project/smwusuvlqtqgmkywgxbe/sql/new"
echo ""
echo "📄 File to copy: ~/workspace/mission-control/supabase/setup.sql"
