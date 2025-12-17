-- ============================================
-- Migration: Fix Subscription Tier Case
-- Date: 2025-12-01
-- Description: Update tier constraint to accept UPPERCASE values
-- ============================================

-- Drop the existing constraint
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_tier_check;

-- Add new constraint that accepts UPPERCASE values
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_tier_check 
  CHECK (tier IN ('FREE', 'PREMIUM', 'GRACE_PERIOD'));

-- Update existing records to uppercase (if any are lowercase)
UPDATE public.subscriptions SET tier = UPPER(tier) WHERE tier IS NOT NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON public.subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
