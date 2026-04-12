-- Add metadata column to workflow_logs for detailed step tracking
ALTER TABLE public.workflow_logs 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update indices for performance if needed
CREATE INDEX IF NOT EXISTS idx_workflow_logs_tramite_id ON public.workflow_logs(tramite_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_created_at ON public.workflow_logs(created_at DESC);
