-- ============================================================================
-- STRIPE WEBHOOK EVENTS - ENABLE RLS (CRITICAL SECURITY FIX)
-- 🔒 Without RLS, anyone with ANON key could read event_ids and error_messages
-- Service role bypasses RLS, so no policies needed
-- ============================================================================

-- Enable RLS on stripe_webhook_events table
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- No policies = no access via anon/authenticated keys
-- Service role (used by backend) bypasses RLS automatically

COMMENT ON TABLE stripe_webhook_events IS 'Tracks processed Stripe webhook events for idempotency. RLS enabled - service role only.';
