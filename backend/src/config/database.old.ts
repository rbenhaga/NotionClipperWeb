/**
 * Supabase Database Configuration
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

    logger.info('Supabase client initialized successfully');
  }

  return supabaseClient;
}

/**
 * Database helper functions
 */
export const db = {
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

  /**
   * Get user subscription
   */
  async getSubscription(userId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      logger.error('Database error fetching subscription:', error);
      throw error;
    }

    return data;
  },

  /**
   * Create subscription (called by trigger, but can be used manually)
   */
  async createSubscription(userId: string, tier: 'free' | 'premium' = 'free') {
    const supabase = getSupabaseClient();

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        tier,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Database error creating subscription:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update subscription
   */
  async updateSubscription(
    userId: string,
    updates: {
      tier?: 'free' | 'premium';
      status?: 'active' | 'canceled' | 'past_due';
      stripe_customer_id?: string;
      stripe_subscription_id?: string;
      current_period_end?: Date;
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
      .single();

    if (error) {
      logger.error('Database error updating subscription:', error);
      throw error;
    }

    return data;
  },

  /**
   * Save Notion connection (encrypted token)
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
   * Get Notion connection
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

  /**
   * Get subscription by user ID
   */
  async getSubscriptionByUserId(userId: string) {
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
   * Upsert subscription (for Stripe webhooks)
   */
  async upsertSubscription(subscriptionData: any) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          ...subscriptionData,
          updated_at: new Date().toISOString(),
        },
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

  /**
   * Increment usage counter via RPC
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
      logger.error('Database error incrementing usage counter:', error);
      throw error;
    }

    // RPC with RETURNS TABLE returns an array
    return Array.isArray(data) ? data[0] : data;
  },

  /**
   * Get current usage for user
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

  /**
   * Log usage event
   */
  async logUsageEvent(eventData: {
    userId: string;
    subscriptionId: string;
    usageRecordId: string;
    eventType: string;
    feature: string;
    metadata: any;
  }) {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from('usage_events').insert({
      user_id: eventData.userId,
      subscription_id: eventData.subscriptionId,
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
   * Get Supabase client instance (for Auth operations)
   */
  getSupabaseClient,
};
