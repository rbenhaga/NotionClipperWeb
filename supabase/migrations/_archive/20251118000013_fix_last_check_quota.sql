-- ============================================
-- Migration 013 - Fix Last Security Warning
-- Date: 2025-11-18
-- Description: Drop remaining check_quota function
-- ============================================

-- Drop ALL possible versions of check_quota
DROP FUNCTION IF EXISTS public.check_quota CASCADE;
DROP FUNCTION IF EXISTS public.check_quota(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_quota(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.check_quota(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.check_quota(text) CASCADE;
DROP FUNCTION IF EXISTS public.check_quota(text, text) CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ Migration 013 completed successfully!';
  RAISE NOTICE '✅ Removed: All remaining check_quota variants';
  RAISE NOTICE '✅ All function security warnings resolved!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================
-- SUMMARY
-- ============================================
-- Removed all check_quota function variants (obsolete, replaced by check_quota_limit RPC)
-- This completes the security warning cleanup
-- ============================================
