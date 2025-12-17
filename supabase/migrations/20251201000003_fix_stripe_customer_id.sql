-- ============================================
-- Migration: Fix corrupted stripe_customer_id
-- Date: 2025-12-01
-- Description: Extract customer ID from JSON objects stored incorrectly
-- ============================================

-- Update stripe_customer_id to extract just the ID if it contains JSON
UPDATE public.subscriptions 
SET stripe_customer_id = (stripe_customer_id::json->>'id')
WHERE stripe_customer_id IS NOT NULL 
  AND stripe_customer_id LIKE '{%'
  AND stripe_customer_id::json->>'id' IS NOT NULL;

-- Verify the fix
-- SELECT user_id, stripe_customer_id FROM public.subscriptions WHERE stripe_customer_id IS NOT NULL;
