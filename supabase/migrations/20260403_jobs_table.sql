-- migration_jobs_table.sql
-- Propietario: Antigravity (Auditoría PASH)

DROP TABLE IF EXISTS public.jobs CASCADE;

CREATE TABLE IF NOT EXISTS public.jobs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  job_type      TEXT        DEFAULT 'gmm_audit',
  status        TEXT        NOT NULL DEFAULT 'processing'
                            CHECK (status IN ('processing', 'completed', 'failed')),
  file_count    INTEGER     DEFAULT 0,
  results       JSONB,
  error_message TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar el polling del Dashboard
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);

-- Función de actualización de timestamp (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at automático
DROP TRIGGER IF EXISTS set_jobs_updated_at ON public.jobs;
CREATE TRIGGER set_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
