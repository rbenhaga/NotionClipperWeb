/**
 * Usage Service
 * Handles usage tracking and quota management
 */

export interface UsageData {
    clips_count: number;
    files_count: number;
    focus_mode_minutes: number;
    compact_mode_minutes: number;
    year: number;
    month: number;
}

export interface SubscriptionData {
    id?: string;
    tier: 'free' | 'premium';
    status: 'active' | 'cancelled' | 'past_due';
    current_period_end?: string;
    cancel_at_period_end?: boolean;
    quotas?: {
        clips_per_month: number;
        files_per_month: number;
        focus_mode_minutes: number;
        compact_mode_minutes: number;
    };
}

export interface QuotaCheck {
    allowed: boolean;
    reason: string;
    currentUsage?: number;
    limit?: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class UsageService {
    /**
     * Get current month usage for authenticated user
     */
    async getCurrentUsage(): Promise<UsageData> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_URL}/usage/current`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch usage: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data.usage;
    }

    /**
     * Get user subscription details
     */
    async getSubscription(): Promise<SubscriptionData> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_URL}/user/subscription`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch subscription: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
    }

    /**
     * Get quotas based on tier
     */
    getQuotasForTier(tier: 'free' | 'premium'): {
        clips_per_month: number;
        files_per_month: number;
        focus_mode_minutes: number;
        compact_mode_minutes: number;
    } {
        if (tier === 'premium') {
            return {
                clips_per_month: 999999, // Unlimited
                files_per_month: 999999, // Unlimited
                focus_mode_minutes: 999999, // Unlimited
                compact_mode_minutes: 999999, // Unlimited  
            };
        }

        // Free tier defaults
        return {
            clips_per_month: 100,
            files_per_month: 10,
            focus_mode_minutes: 60,
            compact_mode_minutes: 30,
        };
    }

    /**
     * Track usage increment
     */
    async trackUsage(
        feature: 'clips' | 'files' | 'focus_mode_minutes' | 'compact_mode_minutes',
        increment: number = 1,
        metadata?: any
    ): Promise<void> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        // Get user ID from token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId;

        const response = await fetch(`${API_URL}/usage/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                feature,
                increment,
                metadata,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to track usage: ${response.statusText}`);
        }
    }

    /**
     * Check if user can perform action based on quota
     */
    async checkQuota(
        feature: 'clips' | 'files' | 'focus_mode_minutes' | 'compact_mode_minutes'
    ): Promise<QuotaCheck> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        // Get user ID from token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId;

        const response = await fetch(`${API_URL}/usage/check-quota`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                feature,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to check quota: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
    }

    /**
     * Calculate usage percentage
     */
    calculateUsagePercentage(current: number, limit: number): number {
        if (limit === 0) return 0;
        if (limit >= 999999) return 0; // Unlimited
        return Math.min(Math.round((current / limit) * 100), 100);
    }
}

export const usageService = new UsageService();
