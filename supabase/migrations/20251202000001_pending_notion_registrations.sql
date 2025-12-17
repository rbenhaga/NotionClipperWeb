-- ============================================
-- PENDING NOTION REGISTRATIONS
-- ============================================
-- Stores temporary Notion OAuth data while waiting for email verification
-- Records expire after 1 hour

CREATE TABLE IF NOT EXISTS public.pending_notion_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL UNIQUE,
  workspace_name TEXT,
  workspace_icon TEXT,
  access_token TEXT NOT NULL, -- Encrypted
  owner_name TEXT,
  owner_avatar TEXT,
  email TEXT, -- Email provided by user (not from Notion)
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  source TEXT DEFAULT 'web', -- 'app' or 'web'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Index for quick lookup by workspace_id
CREATE INDEX IF NOT EXISTS idx_pending_notion_workspace ON public.pending_notion_registrations(workspace_id);

-- Index for cleanup of expired records
CREATE INDEX IF NOT EXISTS idx_pending_notion_expires ON public.pending_notion_registrations(expires_at);

-- Index for email lookup
CREATE INDEX IF NOT EXISTS idx_pending_notion_email ON public.pending_notion_registrations(email);

-- RLS Policies (service role only)
ALTER TABLE public.pending_notion_registrations ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table
CREATE POLICY "Service role only" ON public.pending_notion_registrations
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to clean up expired pending registrations
CREATE OR REPLACE FUNCTION cleanup_expired_pending_registrations()
RETURNS void AS $$
BEGIN
  DELETE FROM public.pending_notion_registrations
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.pending_notion_registrations IS 'Temporary storage for Notion OAuth data while waiting for email verification';
