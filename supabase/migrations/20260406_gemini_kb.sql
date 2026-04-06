-- 🧠 GMM OS - Gemini Optimized Knowledge Base
-- Table for storing medical/procedural knowledge with 768-dimensional vectors for Gemini text-embedding-004

-- 1. Create the knowledge base table
CREATE TABLE IF NOT EXISTS public.gmm_kb (
  id bigserial PRIMARY KEY,
  content text NOT NULL, -- Text chunk
  metadata jsonb DEFAULT '{}', -- Source (manual, policy, etc.), tags
  embedding vector(768), -- Optimized for Gemini text-embedding-004
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create index for fast retrieval
CREATE INDEX ON public.gmm_kb USING hnsw (embedding vector_cosine_ops);

-- 3. Dedicated matching function for Gemini embeddings (768d)
CREATE OR REPLACE FUNCTION match_gmm_kb (
  query_embedding vector(768),
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
    k.id,
    k.content,
    k.metadata,
    1 - (k.embedding <=> query_embedding) AS similarity
  FROM gmm_kb k
  WHERE 1 - (k.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 4. RLS Policies
ALTER TABLE public.gmm_kb ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to public"
  ON public.gmm_kb
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow full access to service role"
  ON public.gmm_kb
  FOR ALL
  TO service_role
  USING (true);
