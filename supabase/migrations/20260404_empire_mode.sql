-- 🏛️ GMM EMPIRE - Meta-Brain Metrics & Experiments
-- This file defines the tables for the highest layer of autonomic coordination.

-- 1. Create Experiments Table
-- Stores A/B tests between different agent strategies.
CREATE TABLE IF NOT EXISTS empire_experiments (
  id BIGSERIAL PRIMARY KEY,
  issue TEXT NOT NULL,
  candidates JSONB NOT NULL, -- { A: versionA, B: versionB }
  winner TEXT, -- 'OPTION_A' or 'OPTION_B'
  winning_plan TEXT,
  metrics JSONB DEFAULT '{}', -- { scoreA: 95, scoreB: 98, costA: 0.1, costB: 0.08 }
  status TEXT DEFAULT 'COMPLETED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Global Strategy History
-- Tracks the Meta-Brain's changing focus (STABILITY, SPEED, etc.).
CREATE TABLE IF NOT EXISTS empire_strategy (
  id BIGSERIAL PRIMARY KEY,
  focus TEXT NOT NULL, -- 'STABILITY', 'OPTIMIZATION', 'COST'
  reason TEXT,
  metrics_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create RPC for Global Metrics
-- Helper function to synthesize data for the Meta-Brain.
CREATE OR REPLACE FUNCTION get_global_empire_metrics()
RETURNS TABLE (
  total_jobs bigint,
  error_rate float,
  avg_resilience_score float
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint AS total_jobs,
    (COUNT(*) FILTER (WHERE status = 'FAILED')::float / NULLIF(COUNT(*), 0)) AS error_rate,
    AVG(COALESCE((metrics->>'resilience')::float, 0)) AS avg_resilience_score
  FROM jobs;
END;
$$;
