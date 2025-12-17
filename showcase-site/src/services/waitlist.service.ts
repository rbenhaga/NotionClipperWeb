/**
 * Waitlist Service
 * Handles waitlist registration and referral tracking
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

class WaitlistService {
  /**
   * Register for the waitlist
   */
  async register(email: string, referralCode?: string): Promise<WaitlistStats> {
    const response = await fetch(`${API_URL}/waitlist/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, referralCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription');
    }

    return data.data || data;
  }

  /**
   * Get waitlist stats for an email
   */
  async getStats(email: string): Promise<WaitlistStats | null> {
    const response = await fetch(`${API_URL}/waitlist/stats?email=${encodeURIComponent(email)}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      const data = await response.json();
      throw new Error(data.message || 'Erreur lors de la récupération des stats');
    }

    const data = await response.json();
    return data.data || data;
  }

  /**
   * Check if a referral code is valid
   */
  async checkReferralCode(code: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/waitlist/check/${code}`);

    if (!response.ok) return false;

    const data = await response.json();
    return data.data?.valid || data.valid || false;
  }

  /**
   * Get total waitlist count
   */
  async getCount(): Promise<number> {
    const response = await fetch(`${API_URL}/waitlist/count`);

    if (!response.ok) return 0;

    const data = await response.json();
    return data.data?.count || data.count || 0;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(): Promise<{
    totalSignups: number;
    leaderboard: Array<{
      position: number;
      referralCount: number;
      rewardTier: string;
      badge?: string;
    }>;
  }> {
    const response = await fetch(`${API_URL}/waitlist/leaderboard`);

    if (!response.ok) {
      return { totalSignups: 0, leaderboard: [] };
    }

    const data = await response.json();
    return data.data || data;
  }

  /**
   * Get reward tiers info
   */
  async getRewardTiers(): Promise<RewardTier[]> {
    const response = await fetch(`${API_URL}/waitlist/tiers`);

    if (!response.ok) return [];

    const data = await response.json();
    return data.data?.tiers || data.tiers || [];
  }
}

export const waitlistService = new WaitlistService();
