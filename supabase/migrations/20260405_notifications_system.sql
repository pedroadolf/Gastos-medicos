-- 1. Create Enums for Notifications
CREATE TYPE public.notification_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE public.notification_category AS ENUM ('document', 'system', 'tramite', 'audit');

-- 2. Create Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    priority public.notification_priority NOT NULL DEFAULT 'medium',
    category public.notification_category NOT NULL DEFAULT 'system',
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN NOT NULL DEFAULT false,
    dismissed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    
    -- Constraint to ensure user_id is indexed correctly
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 3. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Set RLS Policies
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update (mark as read/dismiss) their own notifications
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Create Indices for Performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read_status ON public.notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- 6. Automated Cleanup (90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE created_at < now() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- While we can't easily schedule a PG Cron on every Supabase instance without extensions, 
-- we can trigger a cleanup on new inserts for simplicity in some architectures, 
-- or recommend the user to schedule it. 
-- For GMM, we'll keep it as a function that can be called by the Edge Function or a worker.

COMMENT ON TABLE public.notifications IS 'Stores realtime notifications for GMM users.';
