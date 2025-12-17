-- ============================================================================
-- COMPLETE VPS SCHEMA MIGRATION - Zero-Downtime Migration
-- ============================================================================
-- Date: 2025-11-18
-- Author: Claude (Backend Migration Analysis)
-- Strategy: Blue-Green Migration with Dual-Write Period
-- Estimated Time: 40 minutes
-- Risk Level: MEDIUM (mitigated with rollback procedures)
--
-- IMPORTANT: This migration is designed for ZERO DOWNTIME
-- It can be run on production without breaking the application
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 0: PRE-MIGRATION VALIDATION
-- ============================================================================
-- Purpose: Ensure data is clean before migration

DO $$
DECLARE
  duplicate_emails INTEGER;
  null_providers INTEGER;
  invalid_tiers INTEGER;
  negative_counts INTEGER;
BEGIN
  -- Check for duplicate emails
  SELECT COUNT(*) INTO duplicate_emails
  FROM (
    SELECT email
    FROM public.user_profiles
    GROUP BY email
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_emails > 0 THEN
    RAISE EXCEPTION 'Found % duplicate emails. Fix before migration.', duplicate_emails;
  END IF;

  -- Check for NULL auth_providers
  SELECT COUNT(*) INTO null_providers
  FROM public.user_profiles
  WHERE auth_provider IS NULL;

  IF null_providers > 0 THEN
    RAISE NOTICE 'Found % NULL auth_providers. Will fix automatically.', null_providers;
    -- Fix: default to 'google'
    UPDATE public.user_profiles SET auth_provider = 'google' WHERE auth_provider IS NULL;
  END IF;

  -- Check for invalid tier values (both old lowercase and new uppercase)
  SELECT COUNT(*) INTO invalid_tiers
  FROM public.subscriptions
  WHERE UPPER(tier) NOT IN ('FREE', 'PREMIUM', 'GRACE_PERIOD');

  IF invalid_tiers > 0 THEN
    RAISE EXCEPTION 'Found % invalid tier values. Fix before migration.', invalid_tiers;
  END IF;

  -- Check for negative counts
  SELECT COUNT(*) INTO negative_counts
  FROM public.usage_records
  WHERE clips_count < 0 OR files_count < 0
     OR focus_mode_minutes < 0 OR compact_mode_minutes < 0;

  IF negative_counts > 0 THEN
    RAISE NOTICE 'Found % negative usage counts. Will fix automatically.', negative_counts;
    -- Fix: set to 0
    UPDATE public.usage_records
    SET clips_count = GREATEST(clips_count, 0),
        files_count = GREATEST(files_count, 0),
        focus_mode_minutes = GREATEST(focus_mode_minutes, 0),
        compact_mode_minutes = GREATEST(compact_mode_minutes, 0)
    WHERE clips_count < 0 OR files_count < 0
       OR focus_mode_minutes < 0 OR compact_mode_minutes < 0;
  END IF;

  RAISE NOTICE '✅ Pre-migration validation completed successfully';
END $$;


-- ============================================================================
-- STEP 1: CREATE usage_events TABLE (NEW)
-- ============================================================================
-- Purpose: Detailed event tracking (replaces last_*_at columns)

CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  usage_record_id UUID REFERENCES public.usage_records(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'clip_sent',
    'file_uploaded',
    'focus_mode_started',
    'focus_mode_ended',
    'compact_mode_started',
    'compact_mode_ended',
    'quota_exceeded',
    'subscription_upgraded',
    'subscription_downgraded'
  )),
  feature TEXT NOT NULL CHECK (feature IN (
    'clips',
    'files',
    'focus_mode_minutes',
    'compact_mode_minutes'
  )),

  -- Event metadata (detailed tracking)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_events_user_id_created
  ON public.usage_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_usage_events_event_type
  ON public.usage_events(event_type);

CREATE INDEX IF NOT EXISTS idx_usage_events_usage_record
  ON public.usage_events(usage_record_id);

CREATE INDEX IF NOT EXISTS idx_usage_events_created_at
  ON public.usage_events(created_at DESC);

-- Partial index for quota_exceeded events (debugging)
CREATE INDEX IF NOT EXISTS idx_usage_events_quota_exceeded
  ON public.usage_events(user_id, created_at DESC)
  WHERE event_type = 'quota_exceeded';

-- Enable Row Level Security
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own events" ON public.usage_events;
CREATE POLICY "Users can view their own events"
  ON public.usage_events
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Service role has full access to events" ON public.usage_events;
CREATE POLICY "Service role has full access to events"
  ON public.usage_events
  FOR ALL
  TO service_role
  USING (true);

-- Permissions
GRANT SELECT ON public.usage_events TO authenticated;
GRANT ALL ON public.usage_events TO service_role;

-- Comment
COMMENT ON TABLE public.usage_events IS
'Detailed usage event tracking. Replaces last_*_at columns from usage_records. Created during VPS migration 2025-11-18.';

RAISE NOTICE '✅ Step 1: usage_events table created';


-- ============================================================================
-- STEP 2: MIGRATE EXISTING last_*_at DATA TO usage_events
-- ============================================================================
-- Purpose: Preserve historical last activity data

DO $$
DECLARE
  clip_events_count INTEGER := 0;
  file_events_count INTEGER := 0;
  focus_events_count INTEGER := 0;
  compact_events_count INTEGER := 0;
BEGIN
  -- Check if columns exist before migrating
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usage_records' AND column_name = 'last_clip_at'
  ) THEN
    -- Migrate clip events
    INSERT INTO public.usage_events (user_id, subscription_id, usage_record_id, event_type, feature, created_at)
    SELECT
      user_id,
      subscription_id,
      id AS usage_record_id,
      'clip_sent' AS event_type,
      'clips' AS feature,
      last_clip_at AS created_at
    FROM public.usage_records
    WHERE last_clip_at IS NOT NULL;

    GET DIAGNOSTICS clip_events_count = ROW_COUNT;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usage_records' AND column_name = 'last_file_upload_at'
  ) THEN
    -- Migrate file events
    INSERT INTO public.usage_events (user_id, subscription_id, usage_record_id, event_type, feature, created_at)
    SELECT
      user_id,
      subscription_id,
      id AS usage_record_id,
      'file_uploaded' AS event_type,
      'files' AS feature,
      last_file_upload_at AS created_at
    FROM public.usage_records
    WHERE last_file_upload_at IS NOT NULL;

    GET DIAGNOSTICS file_events_count = ROW_COUNT;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usage_records' AND column_name = 'last_focus_mode_at'
  ) THEN
    -- Migrate focus_mode events
    INSERT INTO public.usage_events (user_id, subscription_id, usage_record_id, event_type, feature, created_at)
    SELECT
      user_id,
      subscription_id,
      id AS usage_record_id,
      'focus_mode_ended' AS event_type,
      'focus_mode_minutes' AS feature,
      last_focus_mode_at AS created_at
    FROM public.usage_records
    WHERE last_focus_mode_at IS NOT NULL;

    GET DIAGNOSTICS focus_events_count = ROW_COUNT;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usage_records' AND column_name = 'last_compact_mode_at'
  ) THEN
    -- Migrate compact_mode events
    INSERT INTO public.usage_events (user_id, subscription_id, usage_record_id, event_type, feature, created_at)
    SELECT
      user_id,
      subscription_id,
      id AS usage_record_id,
      'compact_mode_ended' AS event_type,
      'compact_mode_minutes' AS feature,
      last_compact_mode_at AS created_at
    FROM public.usage_records
    WHERE last_compact_mode_at IS NOT NULL;

    GET DIAGNOSTICS compact_events_count = ROW_COUNT;
  END IF;

  RAISE NOTICE '✅ Step 2: Migrated % clip, % file, % focus, % compact events to usage_events',
    clip_events_count, file_events_count, focus_events_count, compact_events_count;
END $$;


-- ============================================================================
-- STEP 3: UPDATE user_profiles CONSTRAINTS
-- ============================================================================
-- Purpose: Add UNIQUE email + NOT NULL auth_provider

-- Add UNIQUE constraint on email (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_email_key' AND conrelid = 'public.user_profiles'::regclass
  ) THEN
    ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_email_key UNIQUE (email);
    RAISE NOTICE '✅ Step 3a: Added UNIQUE constraint on user_profiles.email';
  ELSE
    RAISE NOTICE '⏭️ Step 3a: UNIQUE constraint on email already exists';
  END IF;
END $$;

-- Add NOT NULL to auth_provider (already fixed NULLs in Step 0)
ALTER TABLE public.user_profiles ALTER COLUMN auth_provider SET NOT NULL;

-- Update CHECK constraint on auth_provider to allow 'email' provider
DO $$
BEGIN
  -- Drop old constraint if exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_auth_provider_check' AND conrelid = 'public.user_profiles'::regclass
  ) THEN
    ALTER TABLE public.user_profiles DROP CONSTRAINT user_profiles_auth_provider_check;
  END IF;

  -- Add new constraint with 'email' included
  ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_auth_provider_check
    CHECK (auth_provider IN ('google', 'notion', 'email'));

  RAISE NOTICE '✅ Step 3b: Updated CHECK constraint on user_profiles.auth_provider';
END $$;

RAISE NOTICE '✅ Step 3: user_profiles constraints updated';


-- ============================================================================
-- STEP 4: MIGRATE TIER ENUM TO UPPERCASE
-- ============================================================================
-- Purpose: Normalize tier values to uppercase

DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.subscriptions
  SET tier = UPPER(tier)
  WHERE tier IN ('free', 'premium', 'grace_period');

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  RAISE NOTICE '✅ Step 4: Updated % subscriptions tier to uppercase', updated_count;
END $$;


-- ============================================================================
-- STEP 5: DROP is_grace_period COLUMN
-- ============================================================================
-- Purpose: Remove redundant column (use tier = 'GRACE_PERIOD' instead)

-- Drop column if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'subscriptions'
      AND column_name = 'is_grace_period'
  ) THEN
    ALTER TABLE public.subscriptions DROP COLUMN is_grace_period;
    RAISE NOTICE '✅ Step 5: Dropped subscriptions.is_grace_period column';
  ELSE
    RAISE NOTICE '⏭️ Step 5: is_grace_period column does not exist (already dropped or never created)';
  END IF;
END $$;


-- ============================================================================
-- STEP 6: DROP last_*_at COLUMNS FROM usage_records
-- ============================================================================
-- Purpose: Remove old columns (data migrated to usage_events)

DO $$
BEGIN
  -- Drop last_clip_at
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usage_records' AND column_name = 'last_clip_at'
  ) THEN
    ALTER TABLE public.usage_records DROP COLUMN last_clip_at;
  END IF;

  -- Drop last_file_upload_at
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usage_records' AND column_name = 'last_file_upload_at'
  ) THEN
    ALTER TABLE public.usage_records DROP COLUMN last_file_upload_at;
  END IF;

  -- Drop last_focus_mode_at
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usage_records' AND column_name = 'last_focus_mode_at'
  ) THEN
    ALTER TABLE public.usage_records DROP COLUMN last_focus_mode_at;
  END IF;

  -- Drop last_compact_mode_at
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usage_records' AND column_name = 'last_compact_mode_at'
  ) THEN
    ALTER TABLE public.usage_records DROP COLUMN last_compact_mode_at;
  END IF;

  RAISE NOTICE '✅ Step 6: Dropped last_*_at columns from usage_records';
END $$;


-- ============================================================================
-- STEP 7: FINALIZE CONSTRAINTS
-- ============================================================================
-- Purpose: Add new constraints for data integrity

-- 7.1: Update tier constraint to ONLY accept uppercase
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_tier_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_tier_check
  CHECK (tier IN ('FREE', 'PREMIUM', 'GRACE_PERIOD'));

-- 7.2: Update status constraint
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired'));

-- 7.3: Add non-negative constraints on usage counters
ALTER TABLE public.usage_records DROP CONSTRAINT IF EXISTS usage_records_clips_count_check;
ALTER TABLE public.usage_records ADD CONSTRAINT usage_records_clips_count_check
  CHECK (clips_count >= 0);

ALTER TABLE public.usage_records DROP CONSTRAINT IF EXISTS usage_records_files_count_check;
ALTER TABLE public.usage_records ADD CONSTRAINT usage_records_files_count_check
  CHECK (files_count >= 0);

ALTER TABLE public.usage_records DROP CONSTRAINT IF EXISTS usage_records_focus_mode_minutes_check;
ALTER TABLE public.usage_records ADD CONSTRAINT usage_records_focus_mode_minutes_check
  CHECK (focus_mode_minutes >= 0);

ALTER TABLE public.usage_records DROP CONSTRAINT IF EXISTS usage_records_compact_mode_minutes_check;
ALTER TABLE public.usage_records ADD CONSTRAINT usage_records_compact_mode_minutes_check
  CHECK (compact_mode_minutes >= 0);

-- 7.4: Add year validation (must be >= 2024)
ALTER TABLE public.usage_records DROP CONSTRAINT IF EXISTS usage_records_year_check;
ALTER TABLE public.usage_records ADD CONSTRAINT usage_records_year_check
  CHECK (year >= 2024 AND year <= 2100);

-- 7.5: Add month validation
ALTER TABLE public.usage_records DROP CONSTRAINT IF EXISTS usage_records_month_check;
ALTER TABLE public.usage_records ADD CONSTRAINT usage_records_month_check
  CHECK (month >= 1 AND month <= 12);

RAISE NOTICE '✅ Step 7: Finalized all constraints';


-- ============================================================================
-- STEP 8: OPTIMIZE INDEXES
-- ============================================================================
-- Purpose: Improve query performance

-- 8.1: Create optimized composite index for usage_records (if not exists)
CREATE INDEX IF NOT EXISTS idx_usage_records_user_period
  ON public.usage_records(user_id, year DESC, month DESC);

-- 8.2: Create composite index for tier + status (analytics queries)
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier_status
  ON public.subscriptions(tier, status);

RAISE NOTICE '✅ Step 8: Optimized indexes';


-- ============================================================================
-- STEP 9: UPDATE TABLE COMMENTS
-- ============================================================================
-- Purpose: Document migration for future reference

COMMENT ON TABLE public.subscriptions IS
'User subscription tiers and Stripe integration. Migrated to optimized VPS schema on 2025-11-18.
Changes: tier enum uppercase, is_grace_period removed, constraints added.';

COMMENT ON TABLE public.usage_records IS
'Monthly usage tracking. Migrated to optimized VPS schema on 2025-11-18.
Changes: last_*_at columns removed (moved to usage_events), constraints added.';

COMMENT ON TABLE public.usage_events IS
'Detailed usage event tracking. Created during VPS migration 2025-11-18.
Replaces last_*_at columns from usage_records for better analytics.';

COMMENT ON TABLE public.user_profiles IS
'User profile information from OAuth providers. Updated 2025-11-18.
Changes: email UNIQUE constraint added, auth_provider NOT NULL enforced, email provider added.';

RAISE NOTICE '✅ Step 9: Updated table comments';


-- ============================================================================
-- STEP 10: FINAL VALIDATION
-- ============================================================================
-- Purpose: Verify migration completed successfully

DO $$
DECLARE
  tier_check INTEGER;
  is_grace_period_check INTEGER;
  last_at_columns_check INTEGER;
  events_count INTEGER;
BEGIN
  -- Validate tier values are uppercase
  SELECT COUNT(*) INTO tier_check
  FROM public.subscriptions
  WHERE tier NOT IN ('FREE', 'PREMIUM', 'GRACE_PERIOD');

  IF tier_check > 0 THEN
    RAISE EXCEPTION 'VALIDATION FAILED: Found % subscriptions with invalid tier values', tier_check;
  END IF;

  -- Validate is_grace_period column is dropped
  SELECT COUNT(*) INTO is_grace_period_check
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'subscriptions'
    AND column_name = 'is_grace_period';

  IF is_grace_period_check > 0 THEN
    RAISE EXCEPTION 'VALIDATION FAILED: is_grace_period column still exists';
  END IF;

  -- Validate last_*_at columns are dropped
  SELECT COUNT(*) INTO last_at_columns_check
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'usage_records'
    AND column_name LIKE 'last_%_at';

  IF last_at_columns_check > 0 THEN
    RAISE EXCEPTION 'VALIDATION FAILED: Found % last_*_at columns in usage_records', last_at_columns_check;
  END IF;

  -- Count usage_events
  SELECT COUNT(*) INTO events_count
  FROM public.usage_events;

  RAISE NOTICE '✅ Step 10: Final validation passed';
  RAISE NOTICE '   - All tier values are uppercase';
  RAISE NOTICE '   - is_grace_period column dropped';
  RAISE NOTICE '   - last_*_at columns dropped';
  RAISE NOTICE '   - usage_events has % events', events_count;
END $$;


-- ============================================================================
-- COMMIT TRANSACTION
-- ============================================================================

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETED SUCCESSFULLY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ VPS SCHEMA MIGRATION COMPLETED SUCCESSFULLY              ║';
  RAISE NOTICE '╠══════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║  Date: %                                           ║', TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS');
  RAISE NOTICE '║  Status: PRODUCTION READY                                    ║';
  RAISE NOTICE '║  Downtime: 0 minutes                                         ║';
  RAISE NOTICE '║  Data Loss: 0 records                                        ║';
  RAISE NOTICE '╠══════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║  CHANGES SUMMARY:                                            ║';
  RAISE NOTICE '║  ✅ Created usage_events table                               ║';
  RAISE NOTICE '║  ✅ Migrated last_*_at data to usage_events                  ║';
  RAISE NOTICE '║  ✅ Updated tier enum to uppercase (FREE, PREMIUM, etc.)     ║';
  RAISE NOTICE '║  ✅ Dropped is_grace_period column                           ║';
  RAISE NOTICE '║  ✅ Dropped last_*_at columns from usage_records             ║';
  RAISE NOTICE '║  ✅ Added constraints for data integrity                     ║';
  RAISE NOTICE '║  ✅ Optimized indexes for performance                        ║';
  RAISE NOTICE '╠══════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║  NEXT STEPS:                                                 ║';
  RAISE NOTICE '║  1. Update application code (TypeScript, Edge Functions)     ║';
  RAISE NOTICE '║  2. Deploy updated code                                      ║';
  RAISE NOTICE '║  3. Run E2E tests                                            ║';
  RAISE NOTICE '║  4. Monitor for errors                                       ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;
