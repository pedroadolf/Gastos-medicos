-- 1. Updates to tramites table for Auto-Fix control
ALTER TABLE tramites 
ADD COLUMN IF NOT EXISTS retry_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_error TEXT,
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMP WITH TIME ZONE;

-- 2. Create workflow_logs table for observability
CREATE TABLE IF NOT EXISTS workflow_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tramite_id UUID REFERENCES tramites(id) ON DELETE CASCADE,
    step TEXT NOT NULL, -- e.g., 'OCR', 'AUDIT', 'PDF', 'ZIP', 'AUTOFIX'
    status TEXT NOT NULL, -- e.g., 'success', 'error', 'processing'
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enable RLS for workflow_logs
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;

-- 4. Simple RLS Policy (Allow authenticated users to read logs)
CREATE POLICY "Allow authenticated users to read workflow logs" 
ON workflow_logs FOR SELECT 
TO authenticated 
USING (true);

-- 5. Enable Real-time for workflow_logs
ALTER PUBLICATION supabase_realtime ADD TABLE workflow_logs;
