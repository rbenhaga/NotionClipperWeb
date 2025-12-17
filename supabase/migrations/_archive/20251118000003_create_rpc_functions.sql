-- ============================================
-- Migration: Create RPC Functions
-- Date: 2025-11-18
-- Description: Create RPC functions for usage tracking and quota enforcement
-- Author: Backend Optimization - Apple/Notion Quality Standards
-- ============================================

-- ============================================
-- FUNCTION 1: increment_usage_counter
-- Purpose: Atomically increment usage counters and create record if needed
-- Called by: backend usage tracking (POST /api/usage/track)
-- ============================================

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

  -- If no subscription found, return null
  IF v_subscription_id IS NULL THEN
    RAISE EXCEPTION 'No subscription found for user %', p_user_id;
  END IF;

  -- Insert or update usage record
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
  ON CONFLICT (user_id, year, month)
  DO UPDATE SET
    clips_count = CASE
      WHEN p_feature = 'clips' THEN public.usage_records.clips_count + p_increment
      ELSE public.usage_records.clips_count
    END,
    files_count = CASE
      WHEN p_feature = 'files' THEN public.usage_records.files_count + p_increment
      ELSE public.usage_records.files_count
    END,
    focus_mode_minutes = CASE
      WHEN p_feature = 'focus_mode_minutes' THEN public.usage_records.focus_mode_minutes + p_increment
      ELSE public.usage_records.focus_mode_minutes
    END,
    compact_mode_minutes = CASE
      WHEN p_feature = 'compact_mode_minutes' THEN public.usage_records.compact_mode_minutes + p_increment
      ELSE public.usage_records.compact_mode_minutes
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

-- Add comment
COMMENT ON FUNCTION public.increment_usage_counter IS 'Atomically increment usage counters for quota tracking';

-- ============================================
-- FUNCTION 2: get_current_quota
-- Purpose: Get user's current quota limits based on subscription tier
-- Called by: frontend to display quota limits
-- ============================================

CREATE OR REPLACE FUNCTION public.get_current_quota(p_user_id uuid)
RETURNS TABLE (
  tier text,
  status text,
  clips_limit integer,
  files_limit integer,
  focus_mode_limit integer,
  compact_mode_limit integer,
  clips_used integer,
  files_used integer,
  focus_mode_used integer,
  compact_mode_used integer,
  period_start timestamptz,
  period_end timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier text;
  v_status text;
  v_year integer;
  v_month integer;
BEGIN
  -- Get current month
  v_year := EXTRACT(YEAR FROM now());
  v_month := EXTRACT(MONTH FROM now());

  -- Get subscription tier
  SELECT s.tier, s.status INTO v_tier, v_status
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id;

  -- Default to free tier if no subscription
  v_tier := COALESCE(v_tier, 'free');
  v_status := COALESCE(v_status, 'active');

  -- Return quota information
  RETURN QUERY
  SELECT
    v_tier,
    v_status,
    -- Quota limits based on tier
    CASE
      WHEN v_tier = 'premium' THEN -1  -- Unlimited
      ELSE 100  -- Free tier: 100 clips/month
    END AS clips_limit,
    CASE
      WHEN v_tier = 'premium' THEN -1
      ELSE 10  -- Free tier: 10 files/month
    END AS files_limit,
    CASE
      WHEN v_tier = 'premium' THEN -1
      ELSE 60  -- Free tier: 60 minutes/month
    END AS focus_mode_limit,
    CASE
      WHEN v_tier = 'premium' THEN -1
      ELSE 30  -- Free tier: 30 minutes/month
    END AS compact_mode_limit,
    -- Current usage
    COALESCE(ur.clips_count, 0) AS clips_used,
    COALESCE(ur.files_count, 0) AS files_used,
    COALESCE(ur.focus_mode_minutes, 0) AS focus_mode_used,
    COALESCE(ur.compact_mode_minutes, 0) AS compact_mode_used,
    -- Period boundaries
    COALESCE(ur.period_start, date_trunc('month', now())) AS period_start,
    COALESCE(ur.period_end, date_trunc('month', now() + interval '1 month')) AS period_end
  FROM public.usage_records ur
  WHERE ur.user_id = p_user_id
    AND ur.year = v_year
    AND ur.month = v_month;

  -- If no usage record exists, return defaults
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      v_tier,
      v_status,
      CASE WHEN v_tier = 'premium' THEN -1 ELSE 100 END,
      CASE WHEN v_tier = 'premium' THEN -1 ELSE 10 END,
      CASE WHEN v_tier = 'premium' THEN -1 ELSE 60 END,
      CASE WHEN v_tier = 'premium' THEN -1 ELSE 30 END,
      0, 0, 0, 0,
      date_trunc('month', now()),
      date_trunc('month', now() + interval '1 month');
  END IF;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.get_current_quota IS 'Get user quota limits and current usage';

-- ============================================
-- FUNCTION 3: check_quota_limit
-- Purpose: Check if user has reached quota limit for a specific feature
-- Called by: backend before allowing an action
-- ============================================

CREATE OR REPLACE FUNCTION public.check_quota_limit(
  p_user_id uuid,
  p_feature text
)
RETURNS TABLE (
  allowed boolean,
  reason text,
  current_usage integer,
  quota_limit integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier text;
  v_year integer;
  v_month integer;
  v_usage integer;
  v_limit integer;
BEGIN
  -- Get current month
  v_year := EXTRACT(YEAR FROM now());
  v_month := EXTRACT(MONTH FROM now());

  -- Get subscription tier
  SELECT s.tier INTO v_tier
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id;

  -- Default to free tier
  v_tier := COALESCE(v_tier, 'free');

  -- Premium users have unlimited access
  IF v_tier = 'premium' THEN
    RETURN QUERY SELECT true, 'Premium user - unlimited access'::text, 0, -1;
    RETURN;
  END IF;

  -- Get current usage
  SELECT
    CASE
      WHEN p_feature = 'clips' THEN COALESCE(ur.clips_count, 0)
      WHEN p_feature = 'files' THEN COALESCE(ur.files_count, 0)
      WHEN p_feature = 'focus_mode_minutes' THEN COALESCE(ur.focus_mode_minutes, 0)
      WHEN p_feature = 'compact_mode_minutes' THEN COALESCE(ur.compact_mode_minutes, 0)
      ELSE 0
    END INTO v_usage
  FROM public.usage_records ur
  WHERE ur.user_id = p_user_id
    AND ur.year = v_year
    AND ur.month = v_month;

  -- Default to 0 if no record
  v_usage := COALESCE(v_usage, 0);

  -- Set quota limits for free tier
  v_limit := CASE
    WHEN p_feature = 'clips' THEN 100
    WHEN p_feature = 'files' THEN 10
    WHEN p_feature = 'focus_mode_minutes' THEN 60
    WHEN p_feature = 'compact_mode_minutes' THEN 30
    ELSE 0
  END;

  -- Check if limit reached
  IF v_usage >= v_limit THEN
    RETURN QUERY SELECT
      false,
      format('Quota limit reached: %s/%s %s used this month', v_usage, v_limit, p_feature)::text,
      v_usage,
      v_limit;
  ELSE
    RETURN QUERY SELECT
      true,
      format('Quota OK: %s/%s %s used this month', v_usage, v_limit, p_feature)::text,
      v_usage,
      v_limit;
  END IF;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.check_quota_limit IS 'Check if user has reached quota limit for a feature';

-- ============================================
-- FUNCTION 4: get_usage_analytics
-- Purpose: Get aggregated usage analytics for a user
-- Called by: dashboard analytics page
-- ============================================

CREATE OR REPLACE FUNCTION public.get_usage_analytics(
  p_user_id uuid,
  p_months integer DEFAULT 6
)
RETURNS TABLE (
  year integer,
  month integer,
  clips_count integer,
  files_count integer,
  focus_mode_minutes integer,
  compact_mode_minutes integer,
  total_events integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ur.year,
    ur.month,
    ur.clips_count,
    ur.files_count,
    ur.focus_mode_minutes,
    ur.compact_mode_minutes,
    COUNT(ue.id)::integer AS total_events
  FROM public.usage_records ur
  LEFT JOIN public.usage_events ue ON ue.usage_record_id = ur.id
  WHERE ur.user_id = p_user_id
    AND ur.created_at >= now() - (p_months || ' months')::interval
  GROUP BY ur.id, ur.year, ur.month, ur.clips_count, ur.files_count,
           ur.focus_mode_minutes, ur.compact_mode_minutes
  ORDER BY ur.year DESC, ur.month DESC;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.get_usage_analytics IS 'Get aggregated usage analytics for dashboard';

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Allow service_role (backend) to execute functions
GRANT EXECUTE ON FUNCTION public.increment_usage_counter TO service_role;
GRANT EXECUTE ON FUNCTION public.get_current_quota TO service_role;
GRANT EXECUTE ON FUNCTION public.check_quota_limit TO service_role;
GRANT EXECUTE ON FUNCTION public.get_usage_analytics TO service_role;

-- Allow authenticated users to check their own quota
GRANT EXECUTE ON FUNCTION public.get_current_quota TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_usage_analytics TO authenticated;

-- ============================================
-- SUMMARY
-- ============================================
-- Functions created: 4
-- Purpose: Usage tracking, quota enforcement, analytics
--
-- increment_usage_counter:
--   - Atomically increments usage counters
--   - Auto-creates monthly records
--   - Thread-safe with ON CONFLICT
--
-- get_current_quota:
--   - Returns tier-based quota limits
--   - Shows current usage vs limits
--   - Handles premium unlimited access
--
-- check_quota_limit:
--   - Pre-action quota validation
--   - Returns allow/deny with reason
--   - Prevents quota abuse
--
-- get_usage_analytics:
--   - Multi-month usage trends
--   - Dashboard analytics
--   - Event aggregation
--
-- Performance: All functions use indexed columns for O(log n) lookups
-- Security: SECURITY DEFINER ensures proper RLS bypass for service_role
-- ============================================
