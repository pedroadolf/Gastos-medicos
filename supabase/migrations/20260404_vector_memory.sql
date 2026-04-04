-- 🧠 GMM SINGULARITY - Persistent Vector Memory & Brain Logs
-- This file defines the tables needed for the self-evolving system.

-- 1. Enable pgvector extension (if available in self-hosted version)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create Vector Memory Table
-- Stores embeddings of previous problems and solutions.
CREATE TABLE IF NOT EXISTS singular_memory (
  id BIGSERIAL PRIMARY KEY,
  trace_id TEXT,
  content TEXT NOT NULL,
  embedding vector(1536), -- Default OpenAI embedding size
  category TEXT, -- 'ERROR', 'SUCCESS', 'REFAC', 'HEURISTIC'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Brain Debate Logs
-- Tracks the multi-agent debate and refinement process.
CREATE TABLE IF NOT EXISTS singular_brain_logs (
  id BIGSERIAL PRIMARY KEY,
  trace_id TEXT,
  problem TEXT NOT NULL,
  initial_proposal TEXT,
  critique TEXT,
  final_plan TEXT,
  consensus_score FLOAT DEFAULT 0.0,
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'CONSENSUS', 'REJECTED'
  executed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create System Approvals Table
-- For Human-in-the-loop validation of structural changes.
CREATE TABLE IF NOT EXISTS system_approvals (
  id BIGSERIAL PRIMARY KEY,
  brain_log_id BIGINT REFERENCES singular_brain_logs(id),
  admin_id UUID,
  decision TEXT, -- 'APPROVED', 'DENIED', 'NEEDS_CHANGES'
  feedback TEXT,
  signed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Add Index for Fast Similarity Search
-- (Using HNSW for high performance with vectors)
CREATE INDEX ON singular_memory USING hnsw (embedding vector_cosine_ops);

-- 6. Add Helper Functions
-- Simple cosine similarity wrapper for the API.
CREATE OR REPLACE FUNCTION match_memories (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  content text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    m.category,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM singular_memory m
  WHERE 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
