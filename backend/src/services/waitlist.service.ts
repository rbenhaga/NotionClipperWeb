/**
 * Waitlist Service
 * Handles waitlist registration with viral referral mechanics
 * Based on Robinhood model: position in queue + referral rewards
 */

import { db } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../types/index.js';
import crypto from 'crypto';

// ============================================================================
// TYPES
// ============================================================================
export interface WaitlistEntry {
  id: string;
  email: string;
  position: number;
  referral_code: string;
  referred_by: string | null;
  referral_count: number;
  reward_tier: string;
  created_at: string;
  updated_at: string;
}

export interface WaitlistStats {
  totalSignups: number;
  position: number;
  referralCount: number;
  referralCode: string;
  referralLink: string;
  rewardTier: RewardTier;
  nextTier: RewardTier | null;
  referralsToNextTier: number;
}

export interface RewardTier {
  name: string;
  minReferrals: number;
  reward: string;
  badge?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================
const REWARD_TIERS: RewardTier[] = [
  { name: 'starter', minReferrals: 0, reward: 'Accès Beta' },
  { name: 'bronze', minReferrals: 3, reward: '1 mois Pro gratuit', badge: '🥉' },
  { name: 'silver', minReferrals: 10, reward: 'Badge Founding Member', badge: '🥈' },
  { name: 'gold', minReferrals: 25, reward: '50% lifetime discount', badge: '🥇' },
  { name: 'platinum', minReferrals: 50, reward: 'Compte lifetime gratuit', badge: '💎' },
];

const SPOTS_PER_REFERRAL = 100; // Move up 100 spots per referral

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique referral code
 */
function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Get reward tier based on referral count
 */
function getRewardTier(referralCount: number): RewardTier {
  let currentTier = REWARD_TIERS[0];
  for (const tier of REWARD_TIERS) {
    if (referralCount >= tier.minReferrals) {
      currentTier = tier;
    }
  }
  return currentTier;
}

/**
 * Get next reward tier
 */
function getNextTier(referralCount: number): RewardTier | null {
  for (const tier of REWARD_TIERS) {
    if (referralCount < tier.minReferrals) {
      return tier;
    }
  }
  return null;
}

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Register new waitlist entry
 */
export async function registerWaitlist(
  email: string,
  referredByCode?: string
): Promise<WaitlistStats> {
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Format email invalide', 400);
  }

  // Check if already registered
  const existing = await getWaitlistByEmail(email);
  if (existing) {
    throw new AppError('Cet email est déjà inscrit sur la liste d\'attente', 409);
  }

  // Get current total count for position
  const totalCount = await getWaitlistCount();
  const position = totalCount + 1;

  // Generate unique referral code
  const referralCode = generateReferralCode();

  // Handle referral
  let referredById: string | null = null;
  if (referredByCode) {
    const referrer = await getWaitlistByReferralCode(referredByCode);
    if (referrer) {
      referredById = referrer.id;
      // Increment referrer's count and update their position
      await incrementReferralCount(referrer.id);
    }
  }

  // Insert new entry
  const { data, error } = await db.getSupabaseClient()
    .from('waitlist')
    .insert({
      email: email.toLowerCase().trim(),
      position,
      referral_code: referralCode,
      referred_by: referredById,
      referral_count: 0,
      reward_tier: 'starter',
    })
    .select()
    .single();

  if (error) {
    logger.error('Failed to register waitlist:', error);
    throw new AppError('Échec de l\'inscription', 500);
  }

  logger.info(`Waitlist registration: ${email} at position ${position}`);

  return buildWaitlistStats(data);
}

/**
 * Get waitlist entry by email
 */
export async function getWaitlistByEmail(email: string): Promise<WaitlistEntry | null> {
  const { data, error } = await db.getSupabaseClient()
    .from('waitlist')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Failed to get waitlist by email:', error);
    throw new AppError('Erreur base de données', 500);
  }

  return data;
}

/**
 * Get waitlist entry by referral code
 */
export async function getWaitlistByReferralCode(code: string): Promise<WaitlistEntry | null> {
  const { data, error } = await db.getSupabaseClient()
    .from('waitlist')
    .select('*')
    .eq('referral_code', code.toUpperCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Failed to get waitlist by referral code:', error);
    throw new AppError('Erreur base de données', 500);
  }

  return data;
}

/**
 * Get total waitlist count
 */
export async function getWaitlistCount(): Promise<number> {
  const { count, error } = await db.getSupabaseClient()
    .from('waitlist')
    .select('*', { count: 'exact', head: true });

  if (error) {
    logger.error('Failed to get waitlist count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Increment referral count and update position
 */
async function incrementReferralCount(userId: string): Promise<void> {
  // Get current entry
  const { data: entry, error: fetchError } = await db.getSupabaseClient()
    .from('waitlist')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchError || !entry) {
    logger.error('Failed to fetch entry for referral increment:', fetchError);
    return;
  }

  const newReferralCount = entry.referral_count + 1;
  const newPosition = Math.max(1, entry.position - SPOTS_PER_REFERRAL);
  const newTier = getRewardTier(newReferralCount);

  const { error: updateError } = await db.getSupabaseClient()
    .from('waitlist')
    .update({
      referral_count: newReferralCount,
      position: newPosition,
      reward_tier: newTier.name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    logger.error('Failed to increment referral count:', updateError);
  } else {
    logger.info(`Referral credited: ${entry.email} now has ${newReferralCount} referrals, position ${newPosition}`);
  }
}

/**
 * Get waitlist stats for a user
 */
export async function getWaitlistStats(email: string): Promise<WaitlistStats | null> {
  const entry = await getWaitlistByEmail(email);
  if (!entry) return null;

  return buildWaitlistStats(entry);
}

/**
 * Build waitlist stats response
 */
function buildWaitlistStats(entry: WaitlistEntry): WaitlistStats {
  const currentTier = getRewardTier(entry.referral_count);
  const nextTier = getNextTier(entry.referral_count);
  const referralsToNextTier = nextTier ? nextTier.minReferrals - entry.referral_count : 0;

  return {
    totalSignups: 0, // Will be filled by controller
    position: entry.position,
    referralCount: entry.referral_count,
    referralCode: entry.referral_code,
    referralLink: `https://clipperpro.app/r/${entry.referral_code}`,
    rewardTier: currentTier,
    nextTier,
    referralsToNextTier,
  };
}

/**
 * Get leaderboard (top referrers)
 */
export async function getLeaderboard(limit: number = 10): Promise<Array<{
  position: number;
  referralCount: number;
  rewardTier: string;
  badge?: string;
}>> {
  const { data, error } = await db.getSupabaseClient()
    .from('waitlist')
    .select('position, referral_count, reward_tier')
    .order('referral_count', { ascending: false })
    .limit(limit);

  if (error) {
    logger.error('Failed to get leaderboard:', error);
    return [];
  }

  return data.map(entry => ({
    position: entry.position,
    referralCount: entry.referral_count,
    rewardTier: entry.reward_tier,
    badge: REWARD_TIERS.find(t => t.name === entry.reward_tier)?.badge,
  }));
}

/**
 * Get reward tiers info
 */
export function getRewardTiers(): RewardTier[] {
  return REWARD_TIERS;
}
