/**
 * Supabase Database Configuration (OPTIMIZED)
 * Refactored for the new 5-table schema with RPC functions
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize Supabase client (singleton pattern)
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const { url, serviceRoleKey } = config.supabase;

    if (!url || !serviceRoleKey) {
      throw new Error('Supabase configuration is missing');
    }

    // Create client with service_role key to bypass RLS
    supabaseClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'apikey': serviceRoleKey,
        },
      },
    });

    logger.info('✅ Supabase client initialized successfully');
  }

  return supabaseClient;
}

/**
 * Database helper functions (Optimized for new schema)
 */
export const db = {
  // ============================================
  // USER_PROFILES
  // ============================================

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Database error fetching user:', error);
      throw error;
    }

    return data;
  },

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      logger.error('Database error fetching user by email:', error);
      throw error;
    }

    return data;
  },

  /**
   * Create or update user profile
   */
  async upsertUser(userData: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    auth_provider: 'google' | 'notion' | 'email';
  }) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          ...userData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      )
      .select()
      .single();

    if (error) {
      logger.error('Database error upserting user:', error);
      throw error;
    }

    return data;
  },

  // ============================================
  // SUBSCRIPTIONS
  // ============================================

  /**
   * Get user subscription
   */
  async getSubscription(userId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      logger.error('Database error fetching subscription:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update subscription (for Stripe webhooks)
   */
  async updateSubscription(
    userId: string,
    updates: {
      tier?: 'free' | 'premium' | 'grace_period';
      status?: string;
      stripe_customer_id?: string;
      stripe_subscription_id?: string;
      stripe_price_id?: string;
      current_period_start?: Date;
      current_period_end?: Date;
      cancel_at?: Date | null;
      canceled_at?: Date | null;
      grace_period_ends_at?: Date | null;
      is_grace_period?: boolean;
      cancel_at_period_end?: boolean;
    }
  ) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Database error updating subscription:', error);
      throw error;
    }

    return data;
  },

  /**
   * Upsert subscription (for Stripe webhooks)
   */
  async upsertSubscription(subscriptionData: {
    user_id: string;
    tier?: 'FREE' | 'PREMIUM' | 'GRACE_PERIOD';
    status?: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    stripe_price_id?: string;
    current_period_start?: Date;
    current_period_end?: Date;
    metadata?: any;
  }) {
    const supabase = getSupabaseClient();

    // Normalize tier to uppercase
    const normalizedData = {
      ...subscriptionData,
      tier: subscriptionData.tier ? subscriptionData.tier.toUpperCase() as 'FREE' | 'PREMIUM' | 'GRACE_PERIOD' : 'FREE',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(
        normalizedData,
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (error) {
      logger.error('Database error upserting subscription:', error);
      throw error;
    }

    return data;
  },

  // ============================================
  // NOTION_CONNECTIONS
  // ============================================

  /**
   * Save Notion connection (with encrypted token)
   */
  async saveNotionConnection(
    userId: string,
    workspaceId: string,
    workspaceName: string,
    encryptedToken: string,
    workspaceIcon?: string,
    isActive: boolean = true
  ) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('notion_connections')
      .upsert(
        {
          user_id: userId,
          workspace_id: workspaceId,
          workspace_name: workspaceName,
          workspace_icon: workspaceIcon,
          access_token_encrypted: encryptedToken,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,workspace_id',
        }
      )
      .select()
      .single();

    if (error) {
      logger.error('Database error saving Notion connection:', error);
      throw error;
    }

    return data;
  },

  /**
   * Get Notion connection for user
   */
  async getNotionConnection(userId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('notion_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      logger.error('Database error fetching Notion connection:', error);
      throw error;
    }

    return data;
  },

  /**
   * Get connection by workspace ID
   */
  async getConnectionByWorkspace(workspaceId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('notion_connections')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      logger.error('Database error fetching connection by workspace:', error);
      throw error;
    }

    return data;
  },

  // ============================================
  // USAGE TRACKING (RPC Functions)
  // ============================================

  /**
   * Increment usage counter via RPC function
   * This is the PRIMARY method for tracking usage
   */
  async incrementUsageCounter(
    userId: string,
    feature: 'clips' | 'files' | 'focus_mode_minutes' | 'compact_mode_minutes',
    increment: number = 1
  ) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.rpc('increment_usage_counter', {
      p_user_id: userId,
      p_feature: feature,
      p_increment: increment,
    });

    if (error) {
      logger.error('RPC error incrementing usage counter:', error);
      throw error;
    }

    // RPC returns array with single row
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  },

  /**
   * Get current quota and usage via RPC function
   */
  async getCurrentQuota(userId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.rpc('get_current_quota', {
      p_user_id: userId,
    });

    if (error) {
      logger.error('RPC error getting current quota:', error);
      throw error;
    }

    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  },

  /**
   * Check if user has reached quota limit via RPC function
   */
  async checkQuotaLimit(
    userId: string,
    feature: 'clips' | 'files' | 'focus_mode_minutes' | 'compact_mode_minutes'
  ) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.rpc('check_quota_limit', {
      p_user_id: userId,
      p_feature: feature,
    });

    if (error) {
      logger.error('RPC error checking quota limit:', error);
      throw error;
    }

    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  },

  /**
   * Get usage analytics via RPC function
   */
  async getUsageAnalytics(userId: string, months: number = 6) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.rpc('get_usage_analytics', {
      p_user_id: userId,
      p_months: months,
    });

    if (error) {
      logger.error('RPC error getting usage analytics:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get current month usage (direct query - fallback if RPC not available)
   */
  async getCurrentUsage(userId: string, year: number, month: number) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('usage_records')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .eq('month', month)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      logger.error('Database error fetching usage:', error);
      throw error;
    }

    return data;
  },

  // ============================================
  // USAGE EVENTS
  // ============================================

  /**
   * Log usage event
   */
  async logUsageEvent(eventData: {
    userId: string;
    subscriptionId?: string;
    usageRecordId: string;
    eventType: 'clip_sent' | 'file_uploaded' | 'focus_mode_started' | 'focus_mode_ended' | 'compact_mode_started' | 'compact_mode_ended' | 'quota_exceeded' | 'subscription_upgraded' | 'subscription_downgraded';
    feature: 'clips' | 'files' | 'focus_mode_minutes' | 'compact_mode_minutes';
    metadata?: any;
  }) {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from('usage_events').insert({
      user_id: eventData.userId,
      subscription_id: eventData.subscriptionId || null,
      usage_record_id: eventData.usageRecordId,
      event_type: eventData.eventType,
      feature: eventData.feature,
      metadata: eventData.metadata || {},
    });

    if (error) {
      logger.error('Database error logging usage event:', error);
      throw error;
    }
  },

  /**
   * Get usage events for a user
   */
  async getUserUsageEvents(userId: string, limit: number = 100, offset: number = 0) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('usage_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Database error fetching usage events:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get usage events by type
   */
  async getUsageEventsByType(
    userId: string,
    eventType: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const supabase = getSupabaseClient();

    let query = supabase
      .from('usage_events')
      .select('*')
      .eq('user_id', userId)
      .eq('event_type', eventType)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Database error fetching usage events by type:', error);
      throw error;
    }

    return data || [];
  },

  // ============================================
  // UTILITY
  // ============================================

  /**
   * Get Supabase client instance (for Auth operations)
   */
  getSupabaseClient,
};
