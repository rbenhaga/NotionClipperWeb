-- ============================================
-- Migration: Add cancel_at_period_end column
-- Date: 2025-12-01
-- Description: Add column to track subscription cancellation status
-- ============================================

-- Add cancel_at_period_end column if it doesn't exist
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_cancel_at_period_end 
ON public.subscriptions(cancel_at_period_end) 
WHERE cancel_at_period_end = true;
