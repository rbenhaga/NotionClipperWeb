-- ============================================
-- Migration 010 - Fix RPC Function Column Ambiguity (v2)
-- Date: 2025-11-18
-- Description: Fix "column reference is ambiguous" error in increment_usage_counter
-- Solution: Use ON CONFLICT ON CONSTRAINT instead of column list
-- ============================================

-- Drop and recreate the function
DROP FUNCTION IF EXISTS public.increment_usage_counter(uuid, text, integer) CASCADE;

CREATE OR REPLACE FUNCTION public.increment_usage_counter(
  p_user_id uuid,
  p_feature text,
  p_increment integer DEFAULT 1
)
RETURNS TABLE (
  id uuid,
  clips_count integer,
  files_count integer,
  focus_mode_minutes integer,
  compact_mode_minutes integer,
  year integer,
  month integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_id uuid;
  v_year integer;
  v_month integer;
  v_period_start timestamptz;
  v_period_end timestamptz;
BEGIN
  -- Get current year and month
  v_year := EXTRACT(YEAR FROM now());
  v_month := EXTRACT(MONTH FROM now());

  -- Calculate period boundaries
  v_period_start := date_trunc('month', now());
  v_period_end := date_trunc('month', now() + interval '1 month');

  -- Get user's subscription ID
  SELECT s.id INTO v_subscription_id
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
  LIMIT 1;

  -- If no subscription found, raise exception
  IF v_subscription_id IS NULL THEN
    RAISE EXCEPTION 'No subscription found for user %', p_user_id;
  END IF;

  -- Insert or update usage record
  -- FIX: Use ON CONFLICT ON CONSTRAINT instead of column list
  -- This avoids ambiguity between PL/pgSQL variables and table columns
  INSERT INTO public.usage_records (
    user_id,
    subscription_id,
    period_start,
    period_end,
    year,
    month,
    clips_count,
    files_count,
    focus_mode_minutes,
    compact_mode_minutes
  )
  VALUES (
    p_user_id,
    v_subscription_id,
    v_period_start,
    v_period_end,
    v_year,
    v_month,
    CASE WHEN p_feature = 'clips' THEN p_increment ELSE 0 END,
    CASE WHEN p_feature = 'files' THEN p_increment ELSE 0 END,
    CASE WHEN p_feature = 'focus_mode_minutes' THEN p_increment ELSE 0 END,
    CASE WHEN p_feature = 'compact_mode_minutes' THEN p_increment ELSE 0 END
  )
  -- Use constraint name to avoid ambiguity
  ON CONFLICT ON CONSTRAINT usage_records_user_id_year_month_key
  DO UPDATE SET
    clips_count = CASE
      WHEN p_feature = 'clips' THEN usage_records.clips_count + p_increment
      ELSE usage_records.clips_count
    END,
    files_count = CASE
      WHEN p_feature = 'files' THEN usage_records.files_count + p_increment
      ELSE usage_records.files_count
    END,
    focus_mode_minutes = CASE
      WHEN p_feature = 'focus_mode_minutes' THEN usage_records.focus_mode_minutes + p_increment
      ELSE usage_records.focus_mode_minutes
    END,
    compact_mode_minutes = CASE
      WHEN p_feature = 'compact_mode_minutes' THEN usage_records.compact_mode_minutes + p_increment
      ELSE usage_records.compact_mode_minutes
    END,
    updated_at = now();

  -- Return updated record
  RETURN QUERY
  SELECT
    ur.id,
    ur.clips_count,
    ur.files_count,
    ur.focus_mode_minutes,
    ur.compact_mode_minutes,
    ur.year,
    ur.month
  FROM public.usage_records ur
  WHERE ur.user_id = p_user_id
    AND ur.year = v_year
    AND ur.month = v_month;
END;
$$;

-- Re-grant permissions
GRANT EXECUTE ON FUNCTION public.increment_usage_counter TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_usage_counter TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.increment_usage_counter IS
  'Atomically increment usage counters for quota tracking (uses constraint name to avoid ambiguity)';

-- ============================================
-- OPTIONAL: Remove duplicate unique constraint
-- ============================================

DO $$
BEGIN
  -- Remove usage_records_user_period_unique if it exists (duplicate)
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.usage_records'::regclass
      AND conname = 'usage_records_user_period_unique'
  ) THEN
    ALTER TABLE public.usage_records
      DROP CONSTRAINT usage_records_user_period_unique;
    RAISE NOTICE '✅ Removed duplicate constraint: usage_records_user_period_unique';
  ELSE
    RAISE NOTICE '⏭️  No duplicate constraint to remove';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ Migration 010 v2 completed successfully!';
  RAISE NOTICE '✅ Fixed: ON CONFLICT (columns) → ON CONFLICT ON CONSTRAINT';
  RAISE NOTICE '✅ Cleaned up: Duplicate unique constraint if existed';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================
-- SUMMARY
-- ============================================
-- Problem: Column ambiguity in ON CONFLICT (user_id, year, month)
--          PostgreSQL couldn't tell if 'year' and 'month' referred to
--          PL/pgSQL variables or table columns
--
-- Solution: Changed to ON CONFLICT ON CONSTRAINT usage_records_user_id_year_month_key
--           This explicitly references the unique constraint by name
--
-- Bonus: Removed duplicate constraint usage_records_user_period_unique
-- ============================================
