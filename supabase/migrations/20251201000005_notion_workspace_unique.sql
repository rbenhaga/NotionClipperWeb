-- ============================================
-- Migration: Notion Workspace Unique Constraint
-- Date: 2025-12-01
-- Description: Ensure one Notion workspace can only be linked to one user
--              to prevent abuse with multiple free accounts
-- ============================================

-- Add unique constraint on workspace_id (one workspace = one user)
-- This prevents users from creating multiple accounts with the same Notion workspace
DO $$
BEGIN
    -- First, check if there are any duplicate workspace_ids
    -- If so, keep only the most recent connection
    DELETE FROM public.notion_connections a
    USING public.notion_connections b
    WHERE a.id < b.id
    AND a.workspace_id = b.workspace_id
    AND a.is_active = true
    AND b.is_active = true;

    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'notion_connections_workspace_unique'
    ) THEN
        ALTER TABLE public.notion_connections
        ADD CONSTRAINT notion_connections_workspace_unique 
        UNIQUE (workspace_id);
    END IF;
END $$;

-- Add email_verified column to user_profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN email_verified boolean DEFAULT false;
    END IF;
END $$;

-- Add password_reset_token and password_reset_expires columns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'password_reset_token'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN password_reset_token text,
        ADD COLUMN password_reset_expires timestamptz;
    END IF;
END $$;

-- Create index for password reset token lookup
CREATE INDEX IF NOT EXISTS idx_user_profiles_password_reset_token 
ON public.user_profiles(password_reset_token) 
WHERE password_reset_token IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.user_profiles.email_verified IS 'Whether the user has verified their email address';
COMMENT ON COLUMN public.user_profiles.password_reset_token IS 'Token for password reset (hashed)';
COMMENT ON COLUMN public.user_profiles.password_reset_expires IS 'Expiration time for password reset token';
COMMENT ON CONSTRAINT notion_connections_workspace_unique ON public.notion_connections IS 'Ensures one Notion workspace can only be linked to one user account';
