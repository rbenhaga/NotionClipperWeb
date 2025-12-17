-- ============================================
-- Migration: Create RLS Policies
-- Date: 2025-11-18
-- Description: Comprehensive Row Level Security policies for all tables
-- Author: Backend Optimization - Apple/Notion Quality Standards
-- ============================================

-- NOTE: This migration replaces 20251117_fix_user_profiles_rls.sql with a complete RLS setup

-- ============================================
-- CLEAN UP OLD POLICIES
-- ============================================

-- user_profiles
DROP POLICY IF EXISTS "Service role has full access to user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- subscriptions
DROP POLICY IF EXISTS "Service role has full access to subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;

-- usage_records
DROP POLICY IF EXISTS "Service role has full access to usage records" ON public.usage_records;
DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_records;

-- usage_events
DROP POLICY IF EXISTS "Service role has full access to usage events" ON public.usage_events;
DROP POLICY IF EXISTS "Users can view their own usage events" ON public.usage_events;

-- notion_connections
DROP POLICY IF EXISTS "Service role has full access to Notion connections" ON public.notion_connections;
DROP POLICY IF EXISTS "Users can manage their Notion connections" ON public.notion_connections;

-- ============================================
-- RLS POLICIES: USER_PROFILES
-- ============================================

-- Service role has full access (for OAuth user creation)
CREATE POLICY "service_role_all_user_profiles"
  ON public.user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view their own profile
CREATE POLICY "users_select_own_profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (name, avatar)
CREATE POLICY "users_update_own_profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users CANNOT insert or delete profiles (service_role only)
-- This is intentionally restrictive for security

COMMENT ON POLICY "service_role_all_user_profiles" ON public.user_profiles IS 'Backend VPS can manage all user profiles (OAuth signup)';
COMMENT ON POLICY "users_select_own_profile" ON public.user_profiles IS 'Users can read their own profile';
COMMENT ON POLICY "users_update_own_profile" ON public.user_profiles IS 'Users can update their name/avatar';

-- ============================================
-- RLS POLICIES: SUBSCRIPTIONS
-- ============================================

-- Service role has full access (for Stripe webhooks)
CREATE POLICY "service_role_all_subscriptions"
  ON public.subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view their own subscription
CREATE POLICY "users_select_own_subscription"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users CANNOT modify subscriptions directly
-- All modifications go through Stripe webhooks (service_role)

COMMENT ON POLICY "service_role_all_subscriptions" ON public.subscriptions IS 'Backend VPS can manage subscriptions (Stripe webhooks)';
COMMENT ON POLICY "users_select_own_subscription" ON public.subscriptions IS 'Users can read their subscription status';

-- ============================================
-- RLS POLICIES: USAGE_RECORDS
-- ============================================

-- Service role has full access (for usage tracking)
CREATE POLICY "service_role_all_usage_records"
  ON public.usage_records
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view their own usage records
CREATE POLICY "users_select_own_usage_records"
  ON public.usage_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users CANNOT modify usage records directly
-- All modifications go through backend RPC functions (service_role)

COMMENT ON POLICY "service_role_all_usage_records" ON public.usage_records IS 'Backend VPS can track all usage';
COMMENT ON POLICY "users_select_own_usage_records" ON public.usage_records IS 'Users can view their usage statistics';

-- ============================================
-- RLS POLICIES: USAGE_EVENTS
-- ============================================

-- Service role has full access (for event logging)
CREATE POLICY "service_role_all_usage_events"
  ON public.usage_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view their own usage events (for analytics dashboard)
CREATE POLICY "users_select_own_usage_events"
  ON public.usage_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users CANNOT insert/update/delete events
-- All event logging is done by backend (service_role)

COMMENT ON POLICY "service_role_all_usage_events" ON public.usage_events IS 'Backend VPS can log all usage events';
COMMENT ON POLICY "users_select_own_usage_events" ON public.usage_events IS 'Users can view their event history (analytics)';

-- ============================================
-- RLS POLICIES: NOTION_CONNECTIONS
-- ============================================

-- Service role has full access
CREATE POLICY "service_role_all_notion_connections"
  ON public.notion_connections
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view their own Notion connections
CREATE POLICY "users_select_own_notion_connections"
  ON public.notion_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own connections (e.g., deactivate)
CREATE POLICY "users_update_own_notion_connections"
  ON public.notion_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users CANNOT insert connections directly
-- Notion connections are created via OAuth flow (service_role)

-- Users CANNOT delete connections (soft delete via is_active = false)

COMMENT ON POLICY "service_role_all_notion_connections" ON public.notion_connections IS 'Backend VPS can manage all Notion connections (OAuth)';
COMMENT ON POLICY "users_select_own_notion_connections" ON public.notion_connections IS 'Users can view their connected workspaces';
COMMENT ON POLICY "users_update_own_notion_connections" ON public.notion_connections IS 'Users can deactivate connections';

-- ============================================
-- ADDITIONAL SECURITY: Prevent RLS Bypass
-- ============================================

-- Ensure RLS is enabled on all tables (defensive check)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notion_connections ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner (extra security layer)
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records FORCE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events FORCE ROW LEVEL SECURITY;
ALTER TABLE public.notion_connections FORCE ROW LEVEL SECURITY;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- service_role can bypass RLS (already set via USING (true))
-- This is expected and needed for backend operations

-- authenticated role can only access via RLS policies
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.usage_records TO authenticated;
GRANT SELECT ON public.usage_events TO authenticated;
GRANT SELECT, UPDATE ON public.notion_connections TO authenticated;

-- anon role has NO access (users must be authenticated)
REVOKE ALL ON public.user_profiles FROM anon;
REVOKE ALL ON public.subscriptions FROM anon;
REVOKE ALL ON public.usage_records FROM anon;
REVOKE ALL ON public.usage_events FROM anon;
REVOKE ALL ON public.notion_connections FROM anon;

-- ============================================
-- SUMMARY
-- ============================================
-- RLS Policies created: 13
-- Tables protected: 5
-- Security model: Backend (service_role) + User (authenticated)
--
-- Access matrix:
--
-- | Table              | service_role | authenticated | anon |
-- |--------------------|--------------|---------------|------|
-- | user_profiles      | ALL          | SELECT, UPDATE| -    |
-- | subscriptions      | ALL          | SELECT        | -    |
-- | usage_records      | ALL          | SELECT        | -    |
-- | usage_events       | ALL          | SELECT        | -    |
-- | notion_connections | ALL          | SELECT, UPDATE| -    |
--
-- Design principles:
-- ✅ Least privilege (users can only access their own data)
-- ✅ Service role bypass (backend needs full access)
-- ✅ Immutable critical data (subscriptions, usage_records)
-- ✅ Defense in depth (FORCE RLS even for owner)
-- ✅ Zero trust (anon has NO access)
--
-- Security notes:
-- - All critical operations (signup, subscription changes, usage tracking)
--   go through backend VPS using SERVICE_ROLE_KEY
-- - Users can only READ their data, not modify counters/billing
-- - Notion tokens are encrypted before storage (AES-256-GCM)
-- - RLS prevents horizontal privilege escalation
-- ============================================
