-- ============================================
-- CONSOLIDATED SCHEMA MIGRATION
-- Date: 2025-12-01
-- Description: Complete database schema for NotionClipper
-- This replaces all migrations from 20251118000000 to 20251119
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: USER_PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  avatar_data text,
  avatar_updated_at timestamptz,
  auth_provider text NOT NULL CHECK (auth_provider IN ('google', 'notion', 'email')),
  email_verified boolean DEFAULT false,
  password_reset_token text,
  password_reset_expires timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_provider ON public.user_profiles(auth_provider);
CREATE INDEX IF NOT EXISTS idx_user_profiles_password_reset_token ON public.user_profiles(password_reset_token) WHERE password_reset_token IS NOT NULL;

-- ============================================
-- TABLE 2: SUBSCRIPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'FREE' CHECK (tier IN ('FREE', 'PREMIUM', 'GRACE_PERIOD')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired')),
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '1 month'),
  cancel_at timestamptz,
  canceled_at timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  grace_period_ends_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON public.subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier_status ON public.subscriptions(tier, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_cancel_at_period_end ON public.subscriptions(cancel_at_period_end) WHERE cancel_at_period_end = true;

-- ============================================
-- TABLE 3: USAGE_RECORDS
-- ============================================
CREATE TABLE IF NOT EXISTS public.usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  year integer NOT NULL CHECK (year >= 2024 AND year <= 2100),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  clips_count integer NOT NULL DEFAULT 0 CHECK (clips_count >= 0),
  files_count integer NOT NULL DEFAULT 0 CHECK (files_count >= 0),
  focus_mode_minutes integer NOT NULL DEFAULT 0 CHECK (focus_mode_minutes >= 0),
  compact_mode_minutes integer NOT NULL DEFAULT 0 CHECK (compact_mode_minutes >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT usage_records_user_id_year_month_key UNIQUE (user_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_usage_records_user_period ON public.usage_records(user_id, year DESC, month DESC);
CREATE INDEX IF NOT EXISTS idx_usage_records_subscription_id ON public.usage_records(subscription_id);

-- ============================================
-- TABLE 4: USAGE_EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  usage_record_id uuid REFERENCES public.usage_records(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('clip_sent', 'file_uploaded', 'focus_mode_started', 'focus_mode_ended', 'compact_mode_started', 'compact_mode_ended', 'quota_exceeded', 'subscription_upgraded', 'subscription_downgraded')),
  feature text NOT NULL CHECK (feature IN ('clips', 'files', 'focus_mode_minutes', 'compact_mode_minutes')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_user_id_created ON public.usage_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_event_type ON public.usage_events(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_events_usage_record ON public.usage_events(usage_record_id);

-- ============================================
-- TABLE 5: NOTION_CONNECTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.notion_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id text NOT NULL,
  workspace_name text,
  workspace_icon text,
  access_token_encrypted text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  is_default boolean DEFAULT false,
  last_used_at timestamptz,
  last_synced_at timestamptz,
  connection_status text DEFAULT 'active' CHECK (connection_status IN ('active', 'disconnected', 'expired', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notion_connections_unique_user_workspace UNIQUE (user_id, workspace_id),
  CONSTRAINT notion_connections_workspace_unique UNIQUE (workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_notion_connections_user_id ON public.notion_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_notion_connections_workspace_id ON public.notion_connections(workspace_id);
CREATE INDEX IF NOT EXISTS idx_notion_connections_active ON public.notion_connections(user_id, is_active) WHERE is_active = true;

-- ============================================
-- TABLE 6: ACTIVITY_LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('clip_sent', 'file_uploaded', 'page_created', 'selection_saved', 'bulk_export')),
  content_preview text,
  content_length integer DEFAULT 0,
  source_url text,
  source_title text,
  notion_page_id text,
  notion_page_title text,
  notion_database_id text,
  notion_database_name text,
  sections_selected text[],
  sections_count integer DEFAULT 1,
  has_files boolean DEFAULT false,
  file_names text[],
  files_count integer DEFAULT 0,
  total_file_size integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON public.activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON public.activity_logs(activity_type);


-- ============================================
-- TABLE 7: WORKSPACE_USAGE_HISTORY (Anti-abuse)
-- ============================================
CREATE TABLE IF NOT EXISTS public.workspace_usage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id text NOT NULL,
  workspace_name text,
  first_user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  first_user_email text NOT NULL,
  connected_at timestamptz NOT NULL DEFAULT now(),
  disconnected_at timestamptz,
  is_blocked boolean DEFAULT false,
  block_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_workspace_global UNIQUE (workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_history_user ON public.workspace_usage_history(first_user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_history_workspace ON public.workspace_usage_history(workspace_id);

-- ============================================
-- TABLE 8: CONNECTION_ATTEMPTS (Anti-abuse audit)
-- ============================================
CREATE TABLE IF NOT EXISTS public.connection_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  workspace_id text NOT NULL,
  attempt_type text NOT NULL CHECK (attempt_type IN ('connect', 'disconnect', 'blocked')),
  success boolean DEFAULT false,
  error_message text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_connection_attempts_user ON public.connection_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_attempts_workspace ON public.connection_attempts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_connection_attempts_created ON public.connection_attempts(created_at);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notion_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_attempts ENABLE ROW LEVEL SECURITY;

-- Force RLS
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records FORCE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events FORCE ROW LEVEL SECURITY;
ALTER TABLE public.notion_connections FORCE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_usage_history FORCE ROW LEVEL SECURITY;
ALTER TABLE public.connection_attempts FORCE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- user_profiles
CREATE POLICY "Service role full access" ON public.user_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT TO authenticated USING (id = (select auth.uid()));
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE TO authenticated USING (id = (select auth.uid())) WITH CHECK (id = (select auth.uid()));

-- subscriptions
CREATE POLICY "Service role full access" ON public.subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

-- usage_records
CREATE POLICY "Service role can manage usage records" ON public.usage_records FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can view own usage records" ON public.usage_records FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

-- usage_events
CREATE POLICY "Service role can manage usage events" ON public.usage_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can view own usage events" ON public.usage_events FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

-- notion_connections
CREATE POLICY "Service role full access" ON public.notion_connections FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Users can view own connections" ON public.notion_connections FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "Users can insert own connections" ON public.notion_connections FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can update own connections" ON public.notion_connections FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Users can delete own connections" ON public.notion_connections FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- activity_logs
CREATE POLICY "Users can view own activity logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- workspace_usage_history
CREATE POLICY "Users can view own workspace history" ON public.workspace_usage_history FOR SELECT USING (first_user_id = auth.uid());
CREATE POLICY "Service role can manage workspace history" ON public.workspace_usage_history FOR ALL USING (auth.role() = 'service_role');

-- connection_attempts
CREATE POLICY "Users can view own connection attempts" ON public.connection_attempts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service role can manage connection attempts" ON public.connection_attempts FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TRIGGER FUNCTION: update_updated_at_column
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$;

-- Apply to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_usage_records_updated_at BEFORE UPDATE ON public.usage_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notion_connections_updated_at BEFORE UPDATE ON public.notion_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER workspace_history_updated_at BEFORE UPDATE ON public.workspace_usage_history FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TRIGGER: Auto-create subscription on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.create_default_subscription_on_signup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $
BEGIN
  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'FREE', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$;

CREATE TRIGGER trigger_create_default_subscription AFTER INSERT ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.create_default_subscription_on_signup();

-- ============================================
-- TRIGGER: Single default workspace per user
-- ============================================
CREATE OR REPLACE FUNCTION public.ensure_single_default_workspace()
RETURNS TRIGGER LANGUAGE plpgsql AS $
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE public.notion_connections SET is_default = FALSE WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$;

CREATE TRIGGER single_default_workspace BEFORE INSERT OR UPDATE ON public.notion_connections FOR EACH ROW WHEN (NEW.is_default = TRUE) EXECUTE FUNCTION public.ensure_single_default_workspace();


-- ============================================
-- RPC FUNCTION: increment_usage_counter
-- ============================================
CREATE OR REPLACE FUNCTION public.increment_usage_counter(
  p_user_id uuid,
  p_feature text,
  p_increment integer DEFAULT 1
)
RETURNS TABLE (id uuid, clips_count integer, files_count integer, focus_mode_minutes integer, compact_mode_minutes integer, year integer, month integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $
DECLARE
  v_subscription_id uuid;
  v_year integer;
  v_month integer;
  v_period_start timestamptz;
  v_period_end timestamptz;
BEGIN
  v_year := EXTRACT(YEAR FROM now());
  v_month := EXTRACT(MONTH FROM now());
  v_period_start := date_trunc('month', now());
  v_period_end := date_trunc('month', now() + interval '1 month');

  SELECT s.id INTO v_subscription_id FROM public.subscriptions s WHERE s.user_id = p_user_id LIMIT 1;
  IF v_subscription_id IS NULL THEN RAISE EXCEPTION 'No subscription found for user %', p_user_id; END IF;

  INSERT INTO public.usage_records (user_id, subscription_id, period_start, period_end, year, month, clips_count, files_count, focus_mode_minutes, compact_mode_minutes)
  VALUES (p_user_id, v_subscription_id, v_period_start, v_period_end, v_year, v_month,
    CASE WHEN p_feature = 'clips' THEN p_increment ELSE 0 END,
    CASE WHEN p_feature = 'files' THEN p_increment ELSE 0 END,
    CASE WHEN p_feature = 'focus_mode_minutes' THEN p_increment ELSE 0 END,
    CASE WHEN p_feature = 'compact_mode_minutes' THEN p_increment ELSE 0 END)
  ON CONFLICT ON CONSTRAINT usage_records_user_id_year_month_key DO UPDATE SET
    clips_count = CASE WHEN p_feature = 'clips' THEN usage_records.clips_count + p_increment ELSE usage_records.clips_count END,
    files_count = CASE WHEN p_feature = 'files' THEN usage_records.files_count + p_increment ELSE usage_records.files_count END,
    focus_mode_minutes = CASE WHEN p_feature = 'focus_mode_minutes' THEN usage_records.focus_mode_minutes + p_increment ELSE usage_records.focus_mode_minutes END,
    compact_mode_minutes = CASE WHEN p_feature = 'compact_mode_minutes' THEN usage_records.compact_mode_minutes + p_increment ELSE usage_records.compact_mode_minutes END,
    updated_at = now();

  RETURN QUERY SELECT ur.id, ur.clips_count, ur.files_count, ur.focus_mode_minutes, ur.compact_mode_minutes, ur.year, ur.month
  FROM public.usage_records ur WHERE ur.user_id = p_user_id AND ur.year = v_year AND ur.month = v_month;
END;
$;

-- ============================================
-- RPC FUNCTION: get_current_quota
-- ============================================
CREATE OR REPLACE FUNCTION public.get_current_quota(p_user_id uuid)
RETURNS TABLE (tier text, clips_quota integer, files_quota integer, clips_used integer, files_used integer, clips_remaining integer, files_remaining integer, period_start timestamptz, period_end timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $
DECLARE
  v_tier text;
  v_clips_quota integer;
  v_files_quota integer;
  v_year integer;
  v_month integer;
BEGIN
  v_year := EXTRACT(YEAR FROM now());
  v_month := EXTRACT(MONTH FROM now());

  SELECT s.tier INTO v_tier FROM public.subscriptions s WHERE s.user_id = p_user_id LIMIT 1;
  IF v_tier IS NULL THEN v_tier := 'FREE'; END IF;

  IF v_tier = 'PREMIUM' THEN v_clips_quota := 999999; v_files_quota := 999999;
  ELSE v_clips_quota := 100; v_files_quota := 10; END IF;

  RETURN QUERY SELECT v_tier, v_clips_quota, v_files_quota,
    COALESCE(ur.clips_count, 0)::integer, COALESCE(ur.files_count, 0)::integer,
    GREATEST(v_clips_quota - COALESCE(ur.clips_count, 0), 0)::integer,
    GREATEST(v_files_quota - COALESCE(ur.files_count, 0), 0)::integer,
    COALESCE(ur.period_start, date_trunc('month', now())), COALESCE(ur.period_end, date_trunc('month', now() + interval '1 month'))
  FROM public.usage_records ur WHERE ur.user_id = p_user_id AND ur.year = v_year AND ur.month = v_month;

  IF NOT FOUND THEN
    RETURN QUERY SELECT v_tier, v_clips_quota, v_files_quota, 0, 0, v_clips_quota, v_files_quota, date_trunc('month', now()), date_trunc('month', now() + interval '1 month');
  END IF;
END;
$;

-- ============================================
-- RPC FUNCTION: check_quota_limit
-- ============================================
CREATE OR REPLACE FUNCTION public.check_quota_limit(p_user_id uuid, p_feature text)
RETURNS TABLE (allowed boolean, quota integer, used integer, remaining integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $
DECLARE
  v_tier text;
  v_year integer;
  v_month integer;
  v_usage integer;
  v_limit integer;
BEGIN
  v_year := EXTRACT(YEAR FROM now());
  v_month := EXTRACT(MONTH FROM now());

  SELECT s.tier INTO v_tier FROM public.subscriptions s WHERE s.user_id = p_user_id;
  v_tier := COALESCE(v_tier, 'FREE');

  IF v_tier = 'PREMIUM' THEN RETURN QUERY SELECT true, 999999, 0, 999999; RETURN; END IF;

  SELECT CASE WHEN p_feature = 'clips' THEN COALESCE(ur.clips_count, 0) WHEN p_feature = 'files' THEN COALESCE(ur.files_count, 0) ELSE 0 END INTO v_usage
  FROM public.usage_records ur WHERE ur.user_id = p_user_id AND ur.year = v_year AND ur.month = v_month;
  v_usage := COALESCE(v_usage, 0);

  v_limit := CASE WHEN p_feature = 'clips' THEN 100 WHEN p_feature = 'files' THEN 10 ELSE 0 END;

  RETURN QUERY SELECT v_usage < v_limit, v_limit, v_usage, GREATEST(v_limit - v_usage, 0);
END;
$;

-- ============================================
-- RPC FUNCTION: get_usage_analytics
-- ============================================
CREATE OR REPLACE FUNCTION public.get_usage_analytics(p_user_id uuid, p_months integer DEFAULT 6)
RETURNS TABLE (year integer, month integer, clips_count integer, files_count integer, focus_mode_minutes integer, compact_mode_minutes integer, period_start timestamptz, period_end timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $
BEGIN
  RETURN QUERY SELECT ur.year, ur.month, ur.clips_count, ur.files_count, ur.focus_mode_minutes, ur.compact_mode_minutes, ur.period_start, ur.period_end
  FROM public.usage_records ur WHERE ur.user_id = p_user_id ORDER BY ur.year DESC, ur.month DESC LIMIT p_months;
END;
$;

-- ============================================
-- RPC FUNCTION: get_user_activity
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_activity(p_user_id uuid, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0, p_start_date timestamptz DEFAULT NULL, p_end_date timestamptz DEFAULT NULL)
RETURNS TABLE (id uuid, activity_type text, content_preview text, content_length integer, source_url text, source_title text, notion_page_title text, notion_database_name text, sections_selected text[], sections_count integer, has_files boolean, file_names text[], files_count integer, total_file_size integer, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER AS $
BEGIN
  RETURN QUERY SELECT al.id, al.activity_type, al.content_preview, al.content_length, al.source_url, al.source_title, al.notion_page_title, al.notion_database_name, al.sections_selected, al.sections_count, al.has_files, al.file_names, al.files_count, al.total_file_size, al.created_at
  FROM public.activity_logs al WHERE al.user_id = p_user_id AND (p_start_date IS NULL OR al.created_at >= p_start_date) AND (p_end_date IS NULL OR al.created_at <= p_end_date)
  ORDER BY al.created_at DESC LIMIT p_limit OFFSET p_offset;
END;
$;

-- ============================================
-- RPC FUNCTION: check_workspace_availability
-- ============================================
CREATE OR REPLACE FUNCTION public.check_workspace_availability(p_workspace_id text, p_user_id uuid)
RETURNS TABLE (available boolean, reason text, owner_email text)
LANGUAGE plpgsql SECURITY DEFINER AS $
DECLARE v_existing RECORD;
BEGIN
  SELECT * INTO v_existing FROM public.workspace_usage_history WHERE workspace_id = p_workspace_id;
  IF v_existing IS NULL THEN RETURN QUERY SELECT TRUE, 'Workspace available'::TEXT, NULL::TEXT;
  ELSIF v_existing.first_user_id = p_user_id THEN RETURN QUERY SELECT TRUE, 'Workspace belongs to this user'::TEXT, v_existing.first_user_email;
  ELSIF v_existing.is_blocked THEN RETURN QUERY SELECT FALSE, ('Workspace blocked: ' || COALESCE(v_existing.block_reason, 'abuse detected'))::TEXT, v_existing.first_user_email;
  ELSE RETURN QUERY SELECT FALSE, 'This Notion workspace is already linked to another account.'::TEXT, v_existing.first_user_email;
  END IF;
END;
$;

-- ============================================
-- RPC FUNCTION: register_workspace_connection
-- ============================================
CREATE OR REPLACE FUNCTION public.register_workspace_connection(p_workspace_id text, p_workspace_name text, p_user_id uuid, p_user_email text)
RETURNS TABLE (success boolean, message text)
LANGUAGE plpgsql SECURITY DEFINER AS $
DECLARE v_check RECORD;
BEGIN
  SELECT * INTO v_check FROM public.check_workspace_availability(p_workspace_id, p_user_id);
  IF NOT v_check.available THEN RETURN QUERY SELECT FALSE, v_check.reason; RETURN; END IF;
  INSERT INTO public.workspace_usage_history (workspace_id, workspace_name, first_user_id, first_user_email)
  VALUES (p_workspace_id, p_workspace_name, p_user_id, p_user_email)
  ON CONFLICT (workspace_id) DO UPDATE SET workspace_name = EXCLUDED.workspace_name, disconnected_at = NULL, updated_at = NOW();
  RETURN QUERY SELECT TRUE, 'Workspace registered successfully'::TEXT;
END;
$;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION public.increment_usage_counter TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_quota TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION public.check_quota_limit TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION public.get_usage_analytics TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_workspace_availability TO service_role;
GRANT EXECUTE ON FUNCTION public.register_workspace_connection TO service_role;

GRANT SELECT ON public.user_profiles TO authenticated;
GRANT UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.usage_records TO authenticated;
GRANT SELECT ON public.usage_events TO authenticated;
GRANT SELECT, UPDATE ON public.notion_connections TO authenticated;
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;

REVOKE ALL ON public.user_profiles FROM anon;
REVOKE ALL ON public.subscriptions FROM anon;
REVOKE ALL ON public.usage_records FROM anon;
REVOKE ALL ON public.usage_events FROM anon;
REVOKE ALL ON public.notion_connections FROM anon;
REVOKE ALL ON public.activity_logs FROM anon;

-- ============================================
-- VIEW: workspace_abuse_stats (admin)
-- ============================================
CREATE OR REPLACE VIEW public.workspace_abuse_stats AS
SELECT wuh.workspace_id, wuh.workspace_name, wuh.first_user_email, wuh.connected_at, wuh.is_blocked,
  COUNT(ca.id) FILTER (WHERE ca.attempt_type = 'blocked') as blocked_attempts,
  COUNT(DISTINCT ca.user_id) FILTER (WHERE ca.user_id != wuh.first_user_id) as other_users_tried
FROM public.workspace_usage_history wuh
LEFT JOIN public.connection_attempts ca ON ca.workspace_id = wuh.workspace_id
GROUP BY wuh.id;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.user_profiles IS 'User profiles from OAuth (Google/Notion) and Email authentication';
COMMENT ON TABLE public.subscriptions IS 'User subscription tiers and Stripe billing information';
COMMENT ON TABLE public.usage_records IS 'Monthly usage records for quota tracking';
COMMENT ON TABLE public.usage_events IS 'Detailed usage event tracking';
COMMENT ON TABLE public.notion_connections IS 'Notion OAuth connections with encrypted access tokens';
COMMENT ON TABLE public.activity_logs IS 'Detailed activity logs for dashboard display';
COMMENT ON TABLE public.workspace_usage_history IS 'Tracks workspace ownership to prevent abuse (one workspace = one account forever)';
COMMENT ON TABLE public.connection_attempts IS 'Logs all connection attempts for security auditing';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
DO $$ BEGIN RAISE NOTICE '✅ Consolidated schema migration completed successfully'; END $$;
