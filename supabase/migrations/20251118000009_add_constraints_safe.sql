-- ============================================
-- Migration 009 SAFE - Add Missing Constraints (Idempotent)
-- Date: 2025-11-18
-- Description: Safe version that handles existing indexes and constraints
-- ============================================

-- ============================================
-- 1. USAGE_RECORDS: Add unique constraint on (user_id, year, month)
-- ============================================

DO $$
BEGIN
  -- Check if constraint or unique index already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.usage_records'::regclass
      AND conname = 'usage_records_unique_user_month'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'usage_records'
      AND indexdef LIKE '%UNIQUE%'
      AND indexdef LIKE '%user_id%'
      AND indexdef LIKE '%year%'
      AND indexdef LIKE '%month%'
  ) THEN
    ALTER TABLE public.usage_records
      ADD CONSTRAINT usage_records_unique_user_month
      UNIQUE (user_id, year, month);
    RAISE NOTICE '✅ Created constraint: usage_records_unique_user_month';
  ELSE
    RAISE NOTICE '⏭️  Skipped: usage_records_unique_user_month already exists';
  END IF;
END $$;

-- ============================================
-- 2. USER_PROFILES: Email unique constraint
-- ============================================

DO $$
DECLARE
  constraint_exists BOOLEAN;
  index_exists BOOLEAN;
BEGIN
  -- Check if constraint exists
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.user_profiles'::regclass
      AND conname = 'user_profiles_email_unique'
  ) INTO constraint_exists;

  -- Check if unique index exists on email column
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND indexname = 'user_profiles_email_unique'
  ) INTO index_exists;

  -- Only create if neither constraint nor index exists
  IF NOT constraint_exists AND NOT index_exists THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_email_unique
      UNIQUE (email);
    RAISE NOTICE '✅ Created constraint: user_profiles_email_unique';
  ELSIF index_exists THEN
    RAISE NOTICE '⏭️  Skipped: user_profiles_email_unique exists as index';
  ELSE
    RAISE NOTICE '⏭️  Skipped: user_profiles_email_unique constraint exists';
  END IF;
END $$;

-- ============================================
-- 3. USER_PROFILES: Email validation constraint
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.user_profiles'::regclass
      AND conname = 'user_profiles_email_valid'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_email_valid
      CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    RAISE NOTICE '✅ Created constraint: user_profiles_email_valid';
  ELSE
    RAISE NOTICE '⏭️  Skipped: user_profiles_email_valid already exists';
  END IF;
END $$;

-- ============================================
-- 4. USAGE_RECORDS: Year range constraint
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.usage_records'::regclass
      AND conname = 'usage_records_year_check'
  ) THEN
    ALTER TABLE public.usage_records
      ADD CONSTRAINT usage_records_year_check
      CHECK (year >= 2024 AND year <= 2100);
    RAISE NOTICE '✅ Created constraint: usage_records_year_check';
  ELSE
    RAISE NOTICE '⏭️  Skipped: usage_records_year_check already exists';
  END IF;
END $$;

-- ============================================
-- Success summary
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ Migration 009 completed successfully!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================
-- SUMMARY
-- ============================================
-- This migration safely adds constraints even if they exist as indexes
-- Checks performed:
-- 1. Constraint name in pg_constraint
-- 2. Index name in pg_indexes
-- 3. Index definition for unique indexes
-- ============================================
