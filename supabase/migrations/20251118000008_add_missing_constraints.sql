-- ============================================
-- Migration FIX: Add missing constraints
-- Date: 2025-11-18
-- Description: Add critical constraints for data integrity
-- ============================================

-- ============================================
-- USAGE_RECORDS: Add unique constraint on (user_id, year, month)
-- Required for: RPC increment_usage_counter ON CONFLICT clause
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'usage_records_unique_user_month'
  ) THEN
    ALTER TABLE public.usage_records
      ADD CONSTRAINT usage_records_unique_user_month
      UNIQUE (user_id, year, month);
  END IF;
END $$;

-- ============================================
-- USER_PROFILES: Add email unique constraint and validation
-- ============================================

DO $$
BEGIN
  -- Add unique constraint on email if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_email_unique'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_email_unique
      UNIQUE (email);
  END IF;

  -- Add email validation constraint if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_email_valid'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_email_valid
      CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- ============================================
-- USAGE_RECORDS: Add year constraint if missing
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'usage_records_year_check'
  ) THEN
    ALTER TABLE public.usage_records
      ADD CONSTRAINT usage_records_year_check
      CHECK (year >= 2024 AND year <= 2100);
  END IF;
END $$;

-- ============================================
-- Add comments for clarity
-- ============================================

COMMENT ON CONSTRAINT usage_records_unique_user_month ON public.usage_records IS
  'Ensures one usage record per user per month (required for increment_usage_counter RPC)';

COMMENT ON CONSTRAINT user_profiles_email_unique ON public.user_profiles IS
  'Ensures email uniqueness across all users';

COMMENT ON CONSTRAINT user_profiles_email_valid ON public.user_profiles IS
  'Validates email format (RFC 5322 simplified)';

-- ============================================
-- SUMMARY
-- ============================================
-- Added: usage_records unique constraint (user_id, year, month)
-- Added: user_profiles email unique constraint
-- Added: user_profiles email validation constraint
-- Added: usage_records year range check
-- ============================================
