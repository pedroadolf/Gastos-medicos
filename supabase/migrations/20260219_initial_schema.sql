-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the gmm_embeddings table
CREATE TABLE IF NOT EXISTS public.gmm_embeddings (
  id bigserial PRIMARY KEY,
  content text NOT NULL, -- The original text chunk
  metadata jsonb,        -- File source, page number, timestamp, etc.
  embedding vector(1536) -- Vector size for OpenAI text-embedding-3-small/ada-002
);

-- 3. Create an index for vector search (HNSW or IVFFlat)
-- HNSW is generally faster and more accurate for production
CREATE INDEX ON public.gmm_embeddings USING hnsw (embedding vector_cosine_ops);

-- 4. Function for similarity search (used by n8n or Frontend)
CREATE OR REPLACE FUNCTION match_embeddings (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gmm_embeddings.id,
    gmm_embeddings.content,
    gmm_embeddings.metadata,
    1 - (gmm_embeddings.embedding <=> query_embedding) AS similarity
  FROM gmm_embeddings
  WHERE 1 - (gmm_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 5. Set up Row Level Security (RLS) - Basic Example
ALTER TABLE public.gmm_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access"
  ON public.gmm_embeddings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated service role to manage"
  ON public.gmm_embeddings
  FOR ALL
  TO service_role
  USING (true);
