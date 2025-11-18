-- ============================================
-- Migration FIX: Remove redundant access_token column
-- Date: 2025-11-18
-- Description: Clean up notion_connections table (only keep encrypted token)
-- ============================================

-- Problem: notion_connections has TWO token columns:
-- - access_token_encrypted (correct, should be kept)
-- - access_token (redundant, plain text, should be removed)

-- Remove the redundant plain-text column if it exists
ALTER TABLE public.notion_connections
  DROP COLUMN IF EXISTS access_token CASCADE;

-- Add unique constraint on user_id + workspace_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'notion_connections_unique_user_workspace'
  ) THEN
    ALTER TABLE public.notion_connections
      ADD CONSTRAINT notion_connections_unique_user_workspace
      UNIQUE (user_id, workspace_id);
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN public.notion_connections.access_token_encrypted IS
  'Notion access token encrypted with AES-256-GCM. Use crypto.service.ts to decrypt.';

-- Verify schema
-- Expected columns: id, user_id, workspace_id, workspace_name, workspace_icon,
--                   access_token_encrypted, is_active, last_synced_at,
--                   created_at, updated_at

-- ============================================
-- SUMMARY
-- ============================================
-- Fixed: Removed redundant access_token column
-- Security: Only encrypted token remains in database
-- Constraint: Added unique constraint on (user_id, workspace_id)
-- ============================================
