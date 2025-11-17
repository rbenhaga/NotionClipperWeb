-- Fix RLS policies for user_profiles and related tables to allow service_role access
-- This is needed for the backend VPS to create/update users during OAuth

-- ============================================
-- USER PROFILES
-- ============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Service role has full access to user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Enable RLS (if not already enabled)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow service_role to do everything (for backend VPS using SERVICE_ROLE_KEY)
CREATE POLICY "Service role has full access to user profiles"
  ON public.user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Note: Users cannot INSERT or DELETE their own profiles
-- Only the backend (via service_role) can create new user profiles during OAuth

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Service role has full access to subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (for Stripe webhooks and subscription management)
CREATE POLICY "Service role has full access to subscriptions"
  ON public.subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow users to view their own subscription
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Note: Users cannot modify subscriptions directly
-- Only service_role (via Stripe webhooks) can update subscriptions

-- ============================================
-- USAGE RECORDS
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Service role has full access to usage records" ON public.usage_records;
DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_records;

-- Enable RLS
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (for usage tracking)
CREATE POLICY "Service role has full access to usage records"
  ON public.usage_records
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow users to view their own usage
CREATE POLICY "Users can view their own usage"
  ON public.usage_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- NOTION CONNECTIONS (update existing policy)
-- ============================================

-- Drop existing policy and recreate with consistent pattern
DROP POLICY IF EXISTS "Service role has full access to Notion connections" ON public.notion_connections;

CREATE POLICY "Service role has full access to Notion connections"
  ON public.notion_connections
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Keep existing user policies for notion_connections (they should already exist from previous migration)
