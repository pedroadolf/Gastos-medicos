-- 🏗️ UPDATING AUDIT RESULTS FOR CLAIMS
-- v1.1 - Link to Tramites

ALTER TABLE public.audit_results 
ADD COLUMN IF NOT EXISTS tramite_id UUID REFERENCES public.tramites(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS automated BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN public.audit_results.issues IS 'JSON list of findings (AuditFinding[])';
