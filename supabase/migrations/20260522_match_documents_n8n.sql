-- =====================================================================
-- Migration: Add match_documents function for n8n Supabase Vector Store
-- 
-- The n8n node @n8n/n8n-nodes-langchain.vectorStoreSupabase (v1.3+) 
-- calls an RPC function named `match_documents` with the signature:
--   match_documents(filter jsonb, match_count int, query_embedding vector)
--
-- Our schema had `match_embeddings` which has a different signature.
-- This migration adds the exact function signature n8n expects.
-- =====================================================================

-- Ensure pgvector is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing function if signature mismatch
DROP FUNCTION IF EXISTS public.match_documents(jsonb, int, vector);

-- Create match_documents with the exact signature n8n vectorStoreSupabase expects
CREATE OR REPLACE FUNCTION public.match_documents(
  filter       jsonb    DEFAULT '{}',
  match_count  int      DEFAULT 10,
  query_embedding vector(1536) DEFAULT NULL
)
RETURNS TABLE (
  id        bigint,
  content   text,
  metadata  jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF query_embedding IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    e.id,
    e.content,
    e.metadata,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM public.gmm_embeddings e
  WHERE
    -- Apply metadata filter if provided (e.g. {"source": "siniestro-123"})
    (filter = '{}' OR e.metadata @> filter)
    AND 1 - (e.embedding <=> query_embedding) > 0.5
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute to service_role and authenticated
GRANT EXECUTE ON FUNCTION public.match_documents(jsonb, int, vector) TO service_role;
GRANT EXECUTE ON FUNCTION public.match_documents(jsonb, int, vector) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_documents(jsonb, int, vector) TO anon;

-- Also ensure the vector column size matches Gemini embeddings (768 dims)
-- Gemini text-embedding-004 uses 768 dimensions, not 1536 (OpenAI)
-- Check current size and add alternate function for 768-dim embeddings

-- Alternate: match_documents for 768-dim Gemini embeddings
DROP FUNCTION IF EXISTS public.match_documents_768(jsonb, int, vector);

CREATE OR REPLACE FUNCTION public.match_documents_768(
  filter       jsonb    DEFAULT '{}',
  match_count  int      DEFAULT 10,
  query_embedding vector(768) DEFAULT NULL
)
RETURNS TABLE (
  id        bigint,
  content   text,
  metadata  jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF query_embedding IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    e.id,
    e.content,
    e.metadata,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM public.gmm_embeddings e
  WHERE
    (filter = '{}' OR e.metadata @> filter)
    AND 1 - (e.embedding <=> query_embedding) > 0.5
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.match_documents_768(jsonb, int, vector) TO service_role;
GRANT EXECUTE ON FUNCTION public.match_documents_768(jsonb, int, vector) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_documents_768(jsonb, int, vector) TO anon;

COMMENT ON FUNCTION public.match_documents IS 
  'Vector similarity search for n8n vectorStoreSupabase node. Searches gmm_embeddings table.';
