-- ============================================================================
-- STRIPE WEBHOOK IDEMPOTENCY TABLE
-- Prevents replay attacks and double-processing of webhook events
-- ============================================================================

-- Create table to track processed webhook events
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,  -- Stripe event ID (evt_xxx)
  event_type TEXT NOT NULL,       -- e.g., 'checkout.session.completed'
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'processed', 'failed')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by event_id
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id ON stripe_webhook_events(event_id);

-- Index for cleanup of old events
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_created_at ON stripe_webhook_events(created_at);

-- Auto-cleanup: delete events older than 30 days (optional, can be done via cron)
-- This keeps the table small while maintaining enough history for debugging

COMMENT ON TABLE stripe_webhook_events IS 'Tracks processed Stripe webhook events for idempotency';
COMMENT ON COLUMN stripe_webhook_events.event_id IS 'Stripe event ID (evt_xxx) - unique constraint prevents duplicates';
COMMENT ON COLUMN stripe_webhook_events.status IS 'processing = in progress, processed = success, failed = error';
