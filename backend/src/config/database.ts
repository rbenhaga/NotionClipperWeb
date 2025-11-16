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

    supabaseClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
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
    encryptedToken: string
  ) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('notion_connections')
      .upsert(
        {
          user_id: userId,
          workspace_id: workspaceId,
          workspace_name: workspaceName,
          access_token_encrypted: encryptedToken,
          is_active: true,
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
};
