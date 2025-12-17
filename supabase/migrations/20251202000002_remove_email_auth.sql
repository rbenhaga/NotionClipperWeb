-- ============================================
-- REMOVE EMAIL AUTH - OAuth Only (Google + Notion)
-- ============================================
-- This migration updates the auth_provider constraint to only allow
-- 'google' and 'notion' providers, removing 'email' option.

-- 1. Update constraint to only allow google/notion
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS check_auth_provider;
ALTER TABLE public.user_profiles ADD CONSTRAINT check_auth_provider
  CHECK (auth_provider IN ('google', 'notion'));

-- Note: Existing email users will NOT be deleted automatically.
-- If you want to delete them, run this manually:
-- 
-- DELETE FROM auth.users WHERE id IN (
--   SELECT id FROM user_profiles WHERE auth_provider = 'email'
-- );

COMMENT ON CONSTRAINT check_auth_provider ON public.user_profiles IS 'Only OAuth providers allowed (google, notion). Email auth removed.';
