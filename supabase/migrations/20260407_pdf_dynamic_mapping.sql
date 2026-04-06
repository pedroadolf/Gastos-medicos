-- 🚀 PDF DYNAMIC MAPPING ENGINE v1.0
-- This migration enables programmatic mapping of 212+ GMM columns without hardcoding.

-- 1. PDF Templates Registry
CREATE TABLE IF NOT EXISTS public.pdf_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- file path or storage reference
    type TEXT NOT NULL,      -- e.g. 'SRGMM', 'CARTA_REMESA', 'PROGRAMACION'
    version TEXT DEFAULT 'v1',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enforce unique active templates per type
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_template_per_type ON public.pdf_templates(type) WHERE is_active = true;

-- 2. PDF Field Mappings
-- This table stores the association between DB data and PDF form fields.
CREATE TABLE IF NOT EXISTS public.pdf_field_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.pdf_templates(id) ON DELETE CASCADE,
    
    -- Source definition
    source_entity TEXT NOT NULL,    -- 'tramite', 'siniestro', 'factura', 'user'
    source_field TEXT NOT NULL,     -- column name or path
    
    -- PDF definition
    pdf_field_name TEXT NOT NULL,   -- exact name of the field in the PDF form
    field_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'checkbox', 'date'
    
    -- Transformation logic
    transform_rule TEXT,            -- e.g. 'uppercase', 'date_day', 'date_month', 'date_year', 'split_name_part_0'
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_field_mappings ENABLE ROW LEVEL SECURITY;

-- Policies (Service role only for management, public read for engine)
CREATE POLICY "Public Read Templates" ON public.pdf_templates FOR SELECT USING (true);
CREATE POLICY "Public Read Mappings" ON public.pdf_field_mappings FOR SELECT USING (true);

-- 3. INITIAL SEED (Example for SRGMM)
-- Note: In a real scenario, this would be populated via a dedicated UI or script for all 212 cols.
INSERT INTO public.pdf_templates (name, file_path, type)
VALUES ('SRGMM Oficial Mar26', '4_SRGMM-Mar26.pdf', 'SRGMM')
ON CONFLICT DO NOTHING;

-- Map some basic fields for SRGMM
DO $$
DECLARE
    tpl_id UUID;
BEGIN
    SELECT id INTO tpl_id FROM public.pdf_templates WHERE type = 'SRGMM' LIMIT 1;
    
    IF tpl_id IS NOT NULL THEN
        INSERT INTO public.pdf_field_mappings (template_id, source_entity, source_field, pdf_field_name, field_type, transform_rule)
        VALUES 
            (tpl_id, 'siniestro', 'poliza', 'Póliza', 'text', NULL),
            (tpl_id, 'siniestro', 'rfc', 'RFC_2', 'text', 'uppercase'),
            (tpl_id, 'tramite', 'tipo', 'REMBOLSO', 'checkbox', 'compare:reembolso'),
            (tpl_id, 'user', 'full_name', 'Apellido paterno_2', 'text', 'split:0'),
            (tpl_id, 'user', 'full_name', 'Apellido materno_2', 'text', 'split:1'),
            (tpl_id, 'user', 'full_name', 'Nombres_2', 'text', 'split_rest:2')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
