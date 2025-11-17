/**
 * Subscription Service
 * Handles subscription and usage management via backend VPS
 */

import { authService } from './auth.service';

export type SubscriptionTier = 'free' | 'premium' | 'grace_period';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  trial_end?: string;
  is_grace_period: boolean;
  cancel_at?: string;
  canceled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  subscription_id: string;
  year: number;
  month: number;
  clips_count: number;
  files_count: number;
  focus_mode_minutes: number;
  compact_mode_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Quotas {
  clips: number;
  files: number;
  words_per_clip: number;
  focus_mode_minutes: number;
  compact_mode_minutes: number;
}

// Quotas par tier (must match server-side constants)
const TIER_QUOTAS: Record<SubscriptionTier, Quotas> = {
  free: {
    clips: 100,
    files: 10,
    words_per_clip: 1000,
    focus_mode_minutes: 60,
    compact_mode_minutes: 60,
  },
  premium: {
    clips: Number.MAX_SAFE_INTEGER, // Unlimited
    files: Number.MAX_SAFE_INTEGER,
    words_per_clip: Number.MAX_SAFE_INTEGER,
    focus_mode_minutes: Number.MAX_SAFE_INTEGER,
    compact_mode_minutes: Number.MAX_SAFE_INTEGER,
  },
  grace_period: {
    clips: 100,
    files: 10,
    words_per_clip: 1000,
    focus_mode_minutes: 60,
    compact_mode_minutes: 60,
  },
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class SubscriptionService {
  /**
   * Get current user's subscription
   */
  async getCurrentSubscription(): Promise<Subscription | null> {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/user/subscription`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      return data.subscription || data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }

  /**
   * Get usage records for current month
   * Note: This endpoint might not exist yet in backend, will return null for now
   */
  async getCurrentUsage(): Promise<UsageRecord | null> {
    const token = authService.getToken();
    if (!token) return null;

    try {
      // TODO: Add endpoint in backend for usage
      // For now, return null
      return null;
    } catch (error) {
      console.error('Error fetching usage:', error);
      return null;
    }
  }

  /**
   * Get quotas for a tier
   */
  getQuotasForTier(tier: SubscriptionTier): Quotas {
    return TIER_QUOTAS[tier];
  }

  /**
   * Create Stripe checkout session for Premium upgrade
   */
  async createCheckoutSession(returnUrl?: string): Promise<string> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: returnUrl || window.location.origin,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Create Stripe Customer Portal session for managing subscription
   */
  async createPortalSession(returnUrl?: string): Promise<string> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_URL}/stripe/create-portal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: returnUrl || window.location.origin,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create portal session');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }

  /**
   * Check if user can perform action based on quotas
   */
  async canPerformAction(
    action: 'clip' | 'file' | 'focus_mode' | 'compact_mode',
    amount = 1
  ): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await this.getCurrentSubscription();

    if (!subscription) {
      return { allowed: false, reason: 'No subscription found' };
    }

    // Premium users have unlimited access
    if (subscription.tier === 'premium') {
      return { allowed: true };
    }

    const usage = await this.getCurrentUsage();
    const quotas = this.getQuotasForTier(subscription.tier);

    // Check specific action
    switch (action) {
      case 'clip':
        const clipsUsed = usage?.clips_count || 0;
        if (clipsUsed + amount > quotas.clips) {
          return { allowed: false, reason: `Monthly clip limit reached (${quotas.clips})` };
        }
        break;

      case 'file':
        const filesUsed = usage?.files_count || 0;
        if (filesUsed + amount > quotas.files) {
          return { allowed: false, reason: `Monthly file limit reached (${quotas.files})` };
        }
        break;

      case 'focus_mode':
        const focusUsed = usage?.focus_mode_minutes || 0;
        if (focusUsed + amount > quotas.focus_mode_minutes) {
          return { allowed: false, reason: `Monthly focus mode limit reached (${quotas.focus_mode_minutes} minutes)` };
        }
        break;

      case 'compact_mode':
        const compactUsed = usage?.compact_mode_minutes || 0;
        if (compactUsed + amount > quotas.compact_mode_minutes) {
          return { allowed: false, reason: `Monthly compact mode limit reached (${quotas.compact_mode_minutes} minutes)` };
        }
        break;
    }

    return { allowed: true };
  }
}

export const subscriptionService = new SubscriptionService();
