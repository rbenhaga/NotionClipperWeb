-- Migration: Fix auth_provider constraint to allow 'email' provider
-- Date: 2025-12-01
-- Description: Add 'email' to the allowed auth_provider values

-- Drop the existing constraint
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS check_auth_provider;

-- Add the updated constraint with 'email' included
ALTER TABLE public.user_profiles ADD CONSTRAINT check_auth_provider
  CHECK (auth_provider IN ('google', 'notion', 'email'));

-- Log the change
DO $$
BEGIN
  RAISE NOTICE '✅ Updated check_auth_provider constraint to include email provider';
END $$;
