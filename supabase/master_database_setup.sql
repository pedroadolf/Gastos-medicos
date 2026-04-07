-- ==============================================================================
-- 🏥 GMM - MASTER DATABASE SETUP (Enterprise Grade v4.4 PRO - FIXED)
-- Optimized for: Supabase Cloud & GMM Claims Orchestrator
-- Characterized by: Deterministic Flows, Atomic Locking, and Fixed Vector Types
-- ==============================================================================

/*
👉 NOTA PARA EL ADMINISTRADOR:
Este script corrige el error de "extensions.vector" no encontrado. 
Se ha eliminado el prefijo 'extensions.' para mayor compatibilidad con Supabase Cloud
donde la extensión suele residir en 'public' por defecto.
*/

-- ==============================================================================
-- 🛠️ 1. INFRAESTRUCTURA (EXTENSIONS & SCHEMAS)
-- ==============================================================================

-- Intentamos crear el schema para extensiones, pero no forzamos su uso exclusivo
CREATE SCHEMA IF NOT EXISTS extensions;

-- Habilitar extensiones base
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA public;

-- Manejo inteligente de la extensión VECTOR
DO $$
BEGIN
    -- 1. Si no existe la extensión en ningún lado, intentar crearla
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        BEGIN
            CREATE EXTENSION vector SCHEMA public;
        EXCEPTION WHEN OTHERS THEN
            CREATE EXTENSION vector SCHEMA extensions;
        END;
    END IF;
END $$;

-- 2. Configurar search_path dinámicamente para encontrar 'vector' esté donde esté
DO $$
DECLARE
    vector_schema TEXT;
BEGIN
    SELECT n.nspname INTO vector_schema
    FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE e.extname = 'vector';

    IF vector_schema IS NOT NULL THEN
        EXECUTE 'SET search_path TO public, auth, ' || vector_schema;
        RAISE NOTICE 'Vector found in schema: %. Search path updated.', vector_schema;
    ELSE
        RAISE EXCEPTION 'CRITICAL: Extension pgvector not found. Please enable it in your Supabase dashboard.';
    END IF;
END $$;

-- ==============================================================================
-- 🛠️ 2. DOMINIOS Y TIPOS (ENUMS)
-- ==============================================================================

DO $$ 
BEGIN
    -- Tipos de trámite soportados
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tramite_type') THEN
        CREATE TYPE tramite_type AS ENUM ('reembolso', 'programacion', 'carta_pase');
    END IF;
    
    -- Clasificación de facturas (OCR Engine)
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'factura_tipo') THEN
        CREATE TYPE factura_tipo AS ENUM ('H', 'M', 'F', 'O'); -- Hospital, Medicos, Farmacia, Otros
    END IF;

    -- Máquina de Estados Oficial
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tramite_status') THEN
        CREATE TYPE tramite_status AS ENUM ('pending', 'processing', 'audited', 'completed', 'error');
    END IF;
END $$;

-- ==============================================================================
-- 📊 3. TABLAS NÚCLEO (CORE SCHEMA)
-- ==============================================================================

-- SINIESTROS: Contenedor principal de trámites
CREATE TABLE IF NOT EXISTS public.siniestros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_siniestro TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    nombre_siniestro TEXT NOT NULL,
    descripcion TEXT,
    fecha_apertura TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TRAMITES: El motor de la aplicación (Stateful Entity)
CREATE TABLE IF NOT EXISTS public.tramites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siniestro_id UUID REFERENCES public.siniestros(id) ON DELETE CASCADE,
    num_siniestro_ref TEXT, 
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tipo tramite_type NOT NULL,
    status tramite_status DEFAULT 'pending',
    folio TEXT,
    aseguradora TEXT,
    paciente_nombre TEXT,
    n8n_execution_id TEXT,
    
    -- 📂 Engine Data (Paths en Storage)
    pdf_paths TEXT[] DEFAULT '{}',
    factura_paths TEXT[] DEFAULT '{}',
    anexo_paths TEXT[] DEFAULT '{}',
    url_expediente_zip TEXT,
    
    -- 🔒 Concurrency Control
    locked_at TIMESTAMPTZ,
    locked_by TEXT, 
    
    -- 🚨 Fault Tolerance & Retries
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    last_error TEXT,
    last_error_code TEXT,
    last_error_metadata JSONB DEFAULT '{}',
    last_retry_at TIMESTAMPTZ,
    
    -- 📋 Auditing & Soft Delete
    deleted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- FACTURAS: Datos extraídos por OCR
CREATE TABLE IF NOT EXISTS public.facturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tramite_id UUID NOT NULL REFERENCES public.tramites(id) ON DELETE CASCADE,
    rfc_emisor TEXT,
    nombre_emisor TEXT,
    fecha_emision DATE,
    monto_total DECIMAL(14,2),
    moneda TEXT DEFAULT 'MXN',
    tipo factura_tipo DEFAULT 'O',
    uuid_xml TEXT, 
    url_pdf TEXT,
    url_xml TEXT,
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- AUDIT_RESULTS: Resultados del motor de reglas
CREATE TABLE IF NOT EXISTS public.audit_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tramite_id UUID NOT NULL REFERENCES public.tramites(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    findings JSONB DEFAULT '[]', 
    recommendations TEXT,
    is_auto_fixable BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_audit_per_tramite UNIQUE(tramite_id)
);

-- ADJUNTOS: Registro de archivos en Storage para este trámite
CREATE TABLE IF NOT EXISTS public.adjuntos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tramite_id UUID NOT NULL REFERENCES public.tramites(id) ON DELETE CASCADE,
    tipo_documento TEXT NOT NULL, -- Ej: 'id_oficial', 'receta', 'form_srgmm'
    file_path TEXT NOT NULL,      -- Path en el bucket 'documentos'
    file_name TEXT NOT NULL,      -- Nombre original (display name)
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- WORKFLOW_LOGS: El corazón de la observabilidad (Timeline PRO)
CREATE TABLE IF NOT EXISTS public.workflow_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tramite_id UUID NOT NULL REFERENCES public.tramites(id) ON DELETE CASCADE,
    step TEXT NOT NULL, 
    status TEXT NOT NULL, 
    message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 🧠 4. AI & KNOWLEDGE BASE (VECTOR SEARCH)
-- ==============================================================================

-- GMM_KB: Base de conocimientos para RAG
CREATE TABLE IF NOT EXISTS public.gmm_kb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT, 
    title TEXT,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding vector(768), -- ← Sin prefijo de schema (confiamos en search_path corregido)
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- MEMORIES: Historial de interacciones para el Agente
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    context_type TEXT,
    content TEXT NOT NULL,
    embedding vector(768), -- ← Sin prefijo de schema
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ⚡ 5. PERFORMANCE (INDEXING STRATEGY)
-- ==============================================================================

-- Tramites Optimization
CREATE INDEX IF NOT EXISTS idx_tramites_user_id ON public.tramites(user_id);
CREATE INDEX IF NOT EXISTS idx_tramites_siniestro_id ON public.tramites(siniestro_id);
CREATE INDEX IF NOT EXISTS idx_tramites_status ON public.tramites(status);
CREATE INDEX IF NOT EXISTS idx_tramites_deleted_at ON public.tramites(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tramites_active_processing ON public.tramites(status) WHERE status = 'processing';
CREATE INDEX IF NOT EXISTS idx_tramites_locks ON public.tramites(locked_at) WHERE locked_at IS NOT NULL;

-- Timeline PRO Performance
CREATE INDEX IF NOT EXISTS idx_workflow_logs_query ON public.workflow_logs (tramite_id, created_at DESC);

-- AI Search performance
-- Usamos 'vector_cosine_ops' sin prefijo, buscando donde esté pgvector
CREATE INDEX IF NOT EXISTS idx_gmm_kb_embedding ON public.gmm_kb USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ==============================================================================
-- 🛡️ 6. SEGURIDAD (RLS & POLICIES)
-- ==============================================================================

ALTER TABLE public.siniestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tramites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmm_kb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can see their own siniestros" ON public.siniestros;
    DROP POLICY IF EXISTS "Users can create their own siniestros" ON public.siniestros;
    DROP POLICY IF EXISTS "Users can update their own siniestros" ON public.siniestros;
    DROP POLICY IF EXISTS "Users can access their own tramites" ON public.tramites;
    DROP POLICY IF EXISTS "Users can create tramites" ON public.tramites;
    DROP POLICY IF EXISTS "Users access facturas via tramite" ON public.facturas;
    DROP POLICY IF EXISTS "Users access audits via tramite" ON public.audit_results;
    DROP POLICY IF EXISTS "Users access logs via tramite" ON public.workflow_logs;
    DROP POLICY IF EXISTS "Users access adjuntos via tramite" ON public.adjuntos;
    DROP POLICY IF EXISTS "Knowledge base is readable by all authenticated users" ON public.gmm_kb;
END $$;

CREATE POLICY "Users can see their own siniestros" ON public.siniestros FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own siniestros" ON public.siniestros FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own siniestros" ON public.siniestros FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own tramites" ON public.tramites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can create tramites" ON public.tramites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access facturas via tramite" ON public.facturas FOR SELECT 
USING (tramite_id IN (SELECT id FROM public.tramites WHERE user_id = auth.uid()));

CREATE POLICY "Users access audits via tramite" ON public.audit_results FOR SELECT 
USING (tramite_id IN (SELECT id FROM public.tramites WHERE user_id = auth.uid()));

CREATE POLICY "Users access logs via tramite" ON public.workflow_logs FOR SELECT 
USING (tramite_id IN (SELECT id FROM public.tramites WHERE user_id = auth.uid()));

CREATE POLICY "Knowledge base is readable by all authenticated users" ON public.gmm_kb FOR SELECT TO authenticated USING (true);

-- ==============================================================================
-- 🔐 7. FUNCIONES RPC (ATOMIC OPERATIONS v4.4)
-- ==============================================================================

DROP FUNCTION IF EXISTS public.lock_tramite(uuid, text);
DROP FUNCTION IF EXISTS public.unlock_tramite(uuid);
DROP FUNCTION IF EXISTS public.match_gmm_kb(vector, float, int);
DROP FUNCTION IF EXISTS public.match_memories(vector, float, int);

-- lock_tramite: Bloqueo Pesimista
CREATE OR REPLACE FUNCTION public.lock_tramite(p_id UUID, p_owner TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
DECLARE 
    updated_rows INT;
BEGIN
    UPDATE public.tramites
    SET 
        locked_at = now(),
        locked_by = p_owner,
        updated_at = now()
    WHERE id = p_id 
    AND (locked_at IS NULL OR locked_at < now() - interval '10 minutes');
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    RETURN updated_rows > 0;
END;
$$;

-- unlock_tramite: Liberación manual
CREATE OR REPLACE FUNCTION public.unlock_tramite(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tramites
  SET locked_at = NULL,
      locked_by = NULL,
      updated_at = now()
  WHERE id = p_id;
END;
$$;

-- match_gmm_kb: Búsqueda Semántica
CREATE OR REPLACE FUNCTION public.match_gmm_kb (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    k.id,
    k.content,
    k.metadata,
    1 - (k.embedding <=> query_embedding) AS similarity
  FROM public.gmm_kb k
  WHERE 1 - (k.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- match_memories: Búsqueda Semántica en historial
CREATE OR REPLACE FUNCTION public.match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  content text,
  similarity float
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM public.memories m
  WHERE 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.created_at DESC 
  LIMIT match_count;
END;
$$;

-- ==============================================================================
-- 🔄 8. AUTOMATION (TRIGGERS & LOGIC)
-- ==============================================================================

-- A. Función genérica para actualizar 'updated_at'
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- B. Aplicar disparadores automáticamente
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = 'public') 
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_update_timestamp ON public.%I', t);
        EXECUTE format('CREATE TRIGGER trigger_update_timestamp BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
    END LOOP;
END $$;

-- C. TRIGGER: STATE MACHINE ENFORCEMENT
CREATE OR REPLACE FUNCTION public.validate_tramite_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;

  IF OLD.status = 'completed' AND NEW.status <> 'completed' THEN
    RAISE EXCEPTION 'CRITICAL: El trámite ya está completado y es inmutable (v4.4).';
  END IF;

  IF OLD.status = 'pending' AND NEW.status NOT IN ('processing', 'error') THEN
    RAISE EXCEPTION 'CRITICAL: Un trámite PENDING debe pasar primero por PROCESSING (v4.4).';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_status_flow ON public.tramites;
CREATE TRIGGER validate_status_flow BEFORE UPDATE OF status ON public.tramites FOR EACH ROW EXECUTE FUNCTION public.validate_tramite_status_transition();

-- D. TRIGGER: INTEGRITY CHECK
CREATE OR REPLACE FUNCTION public.enforce_tramite_completion_integrity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.url_expediente_zip IS NULL THEN
    RAISE EXCEPTION 'CRITICAL: No se puede completar el trámite sin un archivo ZIP válido (v4.4).';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enforce_completion ON public.tramites;
CREATE TRIGGER trigger_enforce_completion BEFORE UPDATE OF status ON public.tramites FOR EACH ROW EXECUTE FUNCTION public.enforce_tramite_completion_integrity();

-- ==============================================================================
-- 📡 9. REALTIME BROADCAST
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Intentar agregar tablas si no están ya en la publicación
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tramites;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'tramites already in publication';
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_logs;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'workflow_logs already in publication';
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_results;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'audit_results already in publication';
END $$;

-- ==============================================================================
-- ✅ DATABASE SYNC COMPLETE (v4.4 PRO - FIXED & ROBUST)
-- ==============================================================================
