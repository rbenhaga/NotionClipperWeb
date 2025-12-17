-- ============================================
-- Migration: Create Optimized Schema
-- Date: 2025-11-18
-- Description: Create optimized database schema with only essential tables
-- Author: Backend Optimization - Apple/Notion Quality Standards
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ============================================
-- TABLE 1: USER_PROFILES
-- Purpose: Store user information from OAuth/Email auth
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  auth_provider text NOT NULL CHECK (auth_provider IN ('google', 'notion', 'email')),

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT user_profiles_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Add comment
COMMENT ON TABLE public.user_profiles IS 'User profiles from OAuth (Google/Notion) and Email authentication';

-- ============================================
-- TABLE 2: SUBSCRIPTIONS
-- Purpose: Stripe subscription management and tier tracking
-- ============================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Subscription details
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'grace_period')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'trialing', 'past_due', 'canceled',
    'unpaid', 'grace_period', 'incomplete', 'incomplete_expired'
  )),

  -- Stripe integration
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,

  -- Billing period
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '1 month'),

  -- Cancellation handling
  cancel_at timestamptz,
  canceled_at timestamptz,

  -- Grace period (when subscription expires but user keeps access temporarily)
  grace_period_ends_at timestamptz,
  is_grace_period boolean NOT NULL DEFAULT false,

  -- Metadata (JSON for flexibility)
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add comment
COMMENT ON TABLE public.subscriptions IS 'User subscription tiers and Stripe billing information';
COMMENT ON COLUMN public.subscriptions.grace_period_ends_at IS 'Grace period for users who cancel - keep premium features temporarily';

-- ============================================
-- TABLE 3: USAGE_RECORDS
-- Purpose: Track monthly usage for quota enforcement
-- ============================================

CREATE TABLE IF NOT EXISTS public.usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,

  -- Period tracking
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  year integer NOT NULL CHECK (year >= 2024 AND year <= 2100),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),

  -- Usage counters
  clips_count integer NOT NULL DEFAULT 0 CHECK (clips_count >= 0),
  files_count integer NOT NULL DEFAULT 0 CHECK (files_count >= 0),
  focus_mode_minutes integer NOT NULL DEFAULT 0 CHECK (focus_mode_minutes >= 0),
  compact_mode_minutes integer NOT NULL DEFAULT 0 CHECK (compact_mode_minutes >= 0),

  -- Last activity timestamps
  last_clip_at timestamptz,
  last_file_upload_at timestamptz,
  last_focus_mode_at timestamptz,
  last_compact_mode_at timestamptz,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Unique constraint: one record per user per month
  CONSTRAINT usage_records_unique_user_month UNIQUE (user_id, year, month)
);

-- Add comment
COMMENT ON TABLE public.usage_records IS 'Monthly usage records for quota tracking and analytics';
COMMENT ON COLUMN public.usage_records.clips_count IS 'Number of clips sent to Notion this month';
COMMENT ON COLUMN public.usage_records.files_count IS 'Number of files uploaded this month';

-- ============================================
-- TABLE 4: USAGE_EVENTS
-- Purpose: Detailed event log for analytics and debugging
-- ============================================

CREATE TABLE IF NOT EXISTS public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  usage_record_id uuid NOT NULL REFERENCES public.usage_records(id) ON DELETE CASCADE,

  -- Event details
  event_type text NOT NULL CHECK (event_type IN (
    'clip_sent',
    'file_uploaded',
    'focus_mode_started',
    'focus_mode_ended',
    'compact_mode_started',
    'compact_mode_ended',
    'quota_limit_reached',
    'upgrade_prompt_shown',
    'upgrade_clicked'
  )),

  feature text NOT NULL CHECK (feature IN (
    'clips',
    'files',
    'words_per_clip',
    'focus_mode_time',
    'compact_mode_time',
    'multiple_selections'
  )),

  -- Event metadata (flexible JSON for additional data)
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timestamp
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add comment
COMMENT ON TABLE public.usage_events IS 'Detailed event log for analytics, debugging, and user behavior tracking';

-- ============================================
-- TABLE 5: NOTION_CONNECTIONS
-- Purpose: Store encrypted Notion OAuth tokens
-- ============================================

CREATE TABLE IF NOT EXISTS public.notion_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notion workspace info
  workspace_id text NOT NULL,
  workspace_name text,
  workspace_icon text,

  -- Encrypted access token (AES-256-GCM)
  access_token_encrypted text NOT NULL,

  -- Status
  is_active boolean NOT NULL DEFAULT true,

  -- Sync tracking
  last_synced_at timestamptz,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Unique constraint: one active connection per user per workspace
  CONSTRAINT notion_connections_unique_user_workspace UNIQUE (user_id, workspace_id)
);

-- Add comment
COMMENT ON TABLE public.notion_connections IS 'Notion OAuth connections with encrypted access tokens';
COMMENT ON COLUMN public.notion_connections.access_token_encrypted IS 'Encrypted with AES-256-GCM using TOKEN_ENCRYPTION_KEY';

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notion_connections ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SUMMARY
-- ============================================
-- Tables created: 5
-- Total columns: ~50
-- Constraints: 15+ (CHECK, UNIQUE, FOREIGN KEY)
-- RLS: Enabled on all tables
--
-- Design principles:
-- ✅ Minimal schema (only essential tables)
-- ✅ Strong data validation (CHECK constraints)
-- ✅ Referential integrity (CASCADE deletes)
-- ✅ Encrypted sensitive data (Notion tokens)
-- ✅ Flexible metadata (JSONB columns)
-- ✅ Audit trail (timestamps everywhere)
-- ============================================
