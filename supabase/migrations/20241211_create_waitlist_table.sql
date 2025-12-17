-- ============================================================================
-- Waitlist Table with Viral Referral Mechanics
-- Based on Robinhood model: position in queue + referral rewards
-- ============================================================================

-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  position INTEGER NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by UUID REFERENCES public.waitlist(id) ON DELETE SET NULL,
  referral_count INTEGER DEFAULT 0,
  reward_tier TEXT DEFAULT 'starter',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_code ON public.waitlist(referral_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_referred_by ON public.waitlist(referred_by);
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON public.waitlist(position);
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_count ON public.waitlist(referral_count DESC);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Public read access for count and leaderboard (anonymous)
CREATE POLICY "Allow public read for waitlist count" ON public.waitlist
  FOR SELECT
  USING (true);

-- Allow inserts from service role (backend)
CREATE POLICY "Allow service role insert" ON public.waitlist
  FOR INSERT
  WITH CHECK (true);

-- Allow updates from service role (backend)
CREATE POLICY "Allow service role update" ON public.waitlist
  FOR UPDATE
  USING (true);

-- Add comment
COMMENT ON TABLE public.waitlist IS 'Pre-launch waitlist with viral referral mechanics';
COMMENT ON COLUMN public.waitlist.position IS 'Queue position (lower = earlier access)';
COMMENT ON COLUMN public.waitlist.referral_code IS 'Unique code for sharing';
COMMENT ON COLUMN public.waitlist.referred_by IS 'ID of user who referred this signup';
COMMENT ON COLUMN public.waitlist.referral_count IS 'Number of successful referrals';
COMMENT ON COLUMN public.waitlist.reward_tier IS 'Current reward tier: starter, bronze, silver, gold, platinum';
