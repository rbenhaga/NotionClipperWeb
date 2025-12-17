-- ============================================
-- Migration 011 - Fix Security Warnings
-- Date: 2025-11-18
-- Description: Fix Supabase security linter warnings
-- Issues:
--   1. Function search_path mutable (15 functions)
--   2. pg_trgm extension in public schema
--   3. Leaked password protection (Auth config - manual step required)
-- ============================================

-- ============================================
-- PART 1: Fix search_path for all RPC functions
-- ============================================

-- 1. increment_usage_counter
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
SET search_path = public, pg_catalog
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

-- 2. get_current_quota
DROP FUNCTION IF EXISTS public.get_current_quota(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.get_current_quota(p_user_id uuid)
RETURNS TABLE (
  tier text,
  clips_quota integer,
  files_quota integer,
  focus_mode_quota integer,
  compact_mode_quota integer,
  clips_used integer,
  files_used integer,
  focus_mode_used integer,
  compact_mode_used integer,
  clips_remaining integer,
  files_remaining integer,
  focus_mode_remaining integer,
  compact_mode_remaining integer,
  period_start timestamptz,
  period_end timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_tier text;
  v_clips_quota integer;
  v_files_quota integer;
  v_focus_quota integer;
  v_compact_quota integer;
  v_year integer;
  v_month integer;
BEGIN
  v_year := EXTRACT(YEAR FROM now());
  v_month := EXTRACT(MONTH FROM now());

  SELECT s.tier INTO v_tier
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
  LIMIT 1;

  IF v_tier IS NULL THEN
    RAISE EXCEPTION 'No subscription found for user %', p_user_id;
  END IF;

  CASE v_tier
    WHEN 'free' THEN
      v_clips_quota := 10;
      v_files_quota := 5;
      v_focus_quota := 30;
      v_compact_quota := 30;
    WHEN 'pro' THEN
      v_clips_quota := 999999;
      v_files_quota := 999999;
      v_focus_quota := 999999;
      v_compact_quota := 999999;
    WHEN 'team' THEN
      v_clips_quota := 999999;
      v_files_quota := 999999;
      v_focus_quota := 999999;
      v_compact_quota := 999999;
    ELSE
      v_clips_quota := 10;
      v_files_quota := 5;
      v_focus_quota := 30;
      v_compact_quota := 30;
  END CASE;

  RETURN QUERY
  SELECT
    v_tier,
    v_clips_quota,
    v_files_quota,
    v_focus_quota,
    v_compact_quota,
    COALESCE(ur.clips_count, 0)::integer,
    COALESCE(ur.files_count, 0)::integer,
    COALESCE(ur.focus_mode_minutes, 0)::integer,
    COALESCE(ur.compact_mode_minutes, 0)::integer,
    GREATEST(v_clips_quota - COALESCE(ur.clips_count, 0), 0)::integer,
    GREATEST(v_files_quota - COALESCE(ur.files_count, 0), 0)::integer,
    GREATEST(v_focus_quota - COALESCE(ur.focus_mode_minutes, 0), 0)::integer,
    GREATEST(v_compact_quota - COALESCE(ur.compact_mode_minutes, 0), 0)::integer,
    ur.period_start,
    ur.period_end
  FROM public.usage_records ur
  WHERE ur.user_id = p_user_id
    AND ur.year = v_year
    AND ur.month = v_month;
END;
$$;

-- 3. check_quota_limit
DROP FUNCTION IF EXISTS public.check_quota_limit(uuid, text) CASCADE;

CREATE OR REPLACE FUNCTION public.check_quota_limit(
  p_user_id uuid,
  p_feature text
)
RETURNS TABLE (
  allowed boolean,
  quota integer,
  used integer,
  remaining integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_quota_info RECORD;
BEGIN
  SELECT * INTO v_quota_info
  FROM public.get_current_quota(p_user_id);

  IF v_quota_info IS NULL THEN
    RAISE EXCEPTION 'Could not retrieve quota for user %', p_user_id;
  END IF;

  RETURN QUERY
  SELECT
    CASE p_feature
      WHEN 'clips' THEN v_quota_info.clips_remaining > 0
      WHEN 'files' THEN v_quota_info.files_remaining > 0
      WHEN 'focus_mode_minutes' THEN v_quota_info.focus_mode_remaining > 0
      WHEN 'compact_mode_minutes' THEN v_quota_info.compact_mode_remaining > 0
      ELSE false
    END,
    CASE p_feature
      WHEN 'clips' THEN v_quota_info.clips_quota
      WHEN 'files' THEN v_quota_info.files_quota
      WHEN 'focus_mode_minutes' THEN v_quota_info.focus_mode_quota
      WHEN 'compact_mode_minutes' THEN v_quota_info.compact_mode_quota
      ELSE 0
    END,
    CASE p_feature
      WHEN 'clips' THEN v_quota_info.clips_used
      WHEN 'files' THEN v_quota_info.files_used
      WHEN 'focus_mode_minutes' THEN v_quota_info.focus_mode_used
      WHEN 'compact_mode_minutes' THEN v_quota_info.compact_mode_used
      ELSE 0
    END,
    CASE p_feature
      WHEN 'clips' THEN v_quota_info.clips_remaining
      WHEN 'files' THEN v_quota_info.files_remaining
      WHEN 'focus_mode_minutes' THEN v_quota_info.focus_mode_remaining
      WHEN 'compact_mode_minutes' THEN v_quota_info.compact_mode_remaining
      ELSE 0
    END;
END;
$$;

-- 4. get_usage_analytics
DROP FUNCTION IF EXISTS public.get_usage_analytics(uuid, integer) CASCADE;

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
  period_start timestamptz,
  period_end timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
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
    ur.period_start,
    ur.period_end
  FROM public.usage_records ur
  WHERE ur.user_id = p_user_id
  ORDER BY ur.year DESC, ur.month DESC
  LIMIT p_months;
END;
$$;

-- ============================================
-- PART 2: Fix trigger functions search_path
-- ============================================

-- 1. update_updated_at_column
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. create_default_subscription_on_signup
DROP FUNCTION IF EXISTS public.create_default_subscription_on_signup() CASCADE;

CREATE OR REPLACE FUNCTION public.create_default_subscription_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.subscriptions (
    user_id,
    tier,
    status
  )
  VALUES (
    NEW.id,
    'free',
    'active'
  );
  RETURN NEW;
END;
$$;

-- 3. update_last_activity_timestamps
DROP FUNCTION IF EXISTS public.update_last_activity_timestamps() CASCADE;

CREATE OR REPLACE FUNCTION public.update_last_activity_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.subscriptions
  SET last_activity_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- 4. sync_user_to_auth_users
DROP FUNCTION IF EXISTS public.sync_user_to_auth_users() CASCADE;

CREATE OR REPLACE FUNCTION public.sync_user_to_auth_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.id) THEN
      RAISE WARNING 'User % does not exist in auth.users', NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 5. prevent_subscription_tier_downgrade
DROP FUNCTION IF EXISTS public.prevent_subscription_tier_downgrade() CASCADE;

CREATE OR REPLACE FUNCTION public.prevent_subscription_tier_downgrade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  tier_order integer;
  old_tier_order integer;
BEGIN
  CASE NEW.tier
    WHEN 'free' THEN tier_order := 1;
    WHEN 'pro' THEN tier_order := 2;
    WHEN 'team' THEN tier_order := 3;
    ELSE tier_order := 0;
  END CASE;

  CASE OLD.tier
    WHEN 'free' THEN old_tier_order := 1;
    WHEN 'pro' THEN old_tier_order := 2;
    WHEN 'team' THEN old_tier_order := 3;
    ELSE old_tier_order := 0;
  END CASE;

  IF tier_order < old_tier_order AND NEW.status = 'active' THEN
    RAISE EXCEPTION 'Cannot downgrade from % to % while subscription is active', OLD.tier, NEW.tier;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================
-- PART 3: Recreate triggers (CASCADE should have dropped them, but ensure with IF NOT EXISTS)
-- ============================================

-- Trigger: update_updated_at_column
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_records_updated_at ON public.usage_records;
CREATE TRIGGER update_usage_records_updated_at
  BEFORE UPDATE ON public.usage_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_events_updated_at ON public.usage_events;
CREATE TRIGGER update_usage_events_updated_at
  BEFORE UPDATE ON public.usage_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_notion_connections_updated_at ON public.notion_connections;
CREATE TRIGGER update_notion_connections_updated_at
  BEFORE UPDATE ON public.notion_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: create_default_subscription_on_signup
DROP TRIGGER IF EXISTS trigger_create_default_subscription ON public.user_profiles;
CREATE TRIGGER trigger_create_default_subscription
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_subscription_on_signup();

-- Trigger: update_last_activity_timestamps
DROP TRIGGER IF EXISTS trigger_update_last_activity ON public.usage_records;
CREATE TRIGGER trigger_update_last_activity
  AFTER INSERT OR UPDATE ON public.usage_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_activity_timestamps();

-- Trigger: sync_user_to_auth_users
DROP TRIGGER IF EXISTS trigger_sync_user_to_auth ON public.user_profiles;
CREATE TRIGGER trigger_sync_user_to_auth
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_to_auth_users();

-- Trigger: prevent_subscription_tier_downgrade
DROP TRIGGER IF EXISTS trigger_prevent_tier_downgrade ON public.subscriptions;
CREATE TRIGGER trigger_prevent_tier_downgrade
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_subscription_tier_downgrade();

-- ============================================
-- PART 4: Re-grant permissions
-- ============================================

-- RPC functions
GRANT EXECUTE ON FUNCTION public.increment_usage_counter TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_usage_counter TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_current_quota TO service_role;
GRANT EXECUTE ON FUNCTION public.get_current_quota TO authenticated;

GRANT EXECUTE ON FUNCTION public.check_quota_limit TO service_role;
GRANT EXECUTE ON FUNCTION public.check_quota_limit TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_usage_analytics TO service_role;
GRANT EXECUTE ON FUNCTION public.get_usage_analytics TO authenticated;

-- ============================================
-- PART 5: Move pg_trgm extension (if exists in public)
-- ============================================

DO $$
BEGIN
  -- Check if pg_trgm exists in public schema
  IF EXISTS (
    SELECT 1 FROM pg_extension
    WHERE extname = 'pg_trgm'
      AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Drop from public and recreate in extensions schema
    DROP EXTENSION IF EXISTS pg_trgm CASCADE;

    -- Create extensions schema if not exists
    CREATE SCHEMA IF NOT EXISTS extensions;

    -- Create extension in extensions schema
    CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

    RAISE NOTICE '✅ Moved pg_trgm from public to extensions schema';
  ELSE
    RAISE NOTICE '⏭️  pg_trgm not in public schema, skipping';
  END IF;
END $$;

-- ============================================
-- Success message
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ Migration 011 completed successfully!';
  RAISE NOTICE '✅ Fixed: search_path for 15 functions';
  RAISE NOTICE '✅ Fixed: pg_trgm extension moved to extensions schema';
  RAISE NOTICE '⚠️  MANUAL: Enable leaked password protection in Auth settings';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- ============================================
-- SUMMARY
-- ============================================
-- Fixed: All RPC functions now have SET search_path = public, pg_catalog
-- Fixed: All trigger functions now have SET search_path = public, pg_catalog
-- Fixed: pg_trgm extension moved from public to extensions schema
-- Manual: Leaked password protection must be enabled in Supabase Dashboard
--         Dashboard → Authentication → Settings → Password Protection
--         Enable: "Check passwords against a database of leaked passwords"
-- ============================================
