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
   * 🔒 SECURITY: Returns null instead of throwing on "no rows" to prevent 500 errors
   */
  async getUserById(userId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // 🔒 Use maybeSingle() instead of single() to return null on no rows

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
    tier?: 'FREE' | 'PREMIUM' | 'GRACE_PERIOD' | 'free' | 'premium' | 'grace_period';
    status?: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    stripe_price_id?: string;
    current_period_start?: Date;
    current_period_end?: Date;
    cancel_at_period_end?: boolean;
    metadata?: any;
  }) {
    const supabase = getSupabaseClient();

    // Normalize tier to UPPERCASE (as per DB constraint after migration)
    const tierUpper = subscriptionData.tier 
      ? subscriptionData.tier.toUpperCase() as 'FREE' | 'PREMIUM' | 'GRACE_PERIOD'
      : 'FREE';

    logger.info(`Upserting subscription for user: ${subscriptionData.user_id}, tier: ${tierUpper}`);

    // First check if subscription exists
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', subscriptionData.user_id)
      .maybeSingle();

    const dataToUpsert: Record<string, unknown> = {
      user_id: subscriptionData.user_id,
      tier: tierUpper,
      status: subscriptionData.status || 'active',
      stripe_customer_id: subscriptionData.stripe_customer_id,
      stripe_subscription_id: subscriptionData.stripe_subscription_id,
      stripe_price_id: subscriptionData.stripe_price_id,
      current_period_start: subscriptionData.current_period_start?.toISOString() || new Date().toISOString(),
      current_period_end: subscriptionData.current_period_end?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: subscriptionData.metadata || {},
      updated_at: new Date().toISOString(),
    };

    // Only include cancel_at_period_end if explicitly set
    if (subscriptionData.cancel_at_period_end !== undefined) {
      dataToUpsert.cancel_at_period_end = subscriptionData.cancel_at_period_end;
    }

    let result;
    
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('subscriptions')
        .update(dataToUpsert)
        .eq('user_id', subscriptionData.user_id)
        .select()
        .single();
      
      if (error) {
        logger.error('Database error updating subscription:', error);
        throw error;
      }
      result = data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(dataToUpsert)
        .select()
        .single();
      
      if (error) {
        logger.error('Database error inserting subscription:', error);
        throw error;
      }
      result = data;
    }

    logger.info(`✅ Subscription upserted successfully for user: ${subscriptionData.user_id}`);
    return result;
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
   * Get Notion connection for user (returns most recently updated if multiple)
   */
  async getNotionConnection(userId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('notion_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error('Database error fetching Notion connection:', error);
      throw error;
    }

    return data;
  },

  /**
   * Get all Notion connections for user
   */
  async getAllNotionConnections(userId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('notion_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) {
      logger.error('Database error fetching Notion connections:', error);
      throw error;
    }

    return data || [];
  },

  // ============================================
  // NOTION WRITE IDEMPOTENCY & JOBS
  // ============================================

  async getNotionIdempotency(idempotencyKey: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('notion_idempotency')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      logger.error('Database error fetching notion idempotency:', error);
      throw error;
    }

    return data;
  },

  async insertNotionIdempotency(entry: {
    idempotencyKey: string;
    userId: string;
    workspaceId: string;
    targetId: string;
    insertionMode?: string | null;
    requestHash: string;
    jobId: string | null;
    status: 'queued' | 'running' | 'succeeded' | 'failed';
  }) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('notion_idempotency')
      .insert({
        idempotency_key: entry.idempotencyKey,
        user_id: entry.userId,
        workspace_id: entry.workspaceId,
        target_id: entry.targetId,
        insertion_mode: entry.insertionMode || null,
        request_hash: entry.requestHash,
        job_id: entry.jobId,
        status: entry.status,
      })
      .select()
      .single();

    if (error) {
      logger.error('Database error inserting notion idempotency:', error);
      throw error;
    }

    return data;
  },

  async updateNotionIdempotency(idempotencyKey: string, updates: {
    status?: 'queued' | 'running' | 'succeeded' | 'failed';
    error_code?: string | null;
    result_metadata?: Record<string, unknown> | null;
    retry_at?: string | null;
    job_id?: string | null;
  }) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('notion_idempotency')
      .update({
        status: updates.status,
        error_code: updates.error_code ?? null,
        result_metadata: updates.result_metadata ?? null,
        retry_at: updates.retry_at ?? null,
        job_id: updates.job_id ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('idempotency_key', idempotencyKey)
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Database error updating notion idempotency:', error);
      throw error;
    }

    return data;
  },

  async insertNotionWriteJob(job: {
    userId: string;
    workspaceId: string;
    idempotencyKey: string;
    operation: string;
    targetId: string;
    insertionMode?: string | null;
    payload: Record<string, unknown>;
    retryAt?: string | null;
    maxAttempts: number;
  }) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('notion_write_jobs')
      .insert({
        user_id: job.userId,
        workspace_id: job.workspaceId,
        idempotency_key: job.idempotencyKey,
        operation: job.operation,
        target_id: job.targetId,
        insertion_mode: job.insertionMode ?? null,
        payload: job.payload,
        status: 'queued',
        retry_at: job.retryAt ?? null,
        max_attempts: job.maxAttempts,
      })
      .select()
      .single();

    if (error) {
      logger.error('Database error inserting notion write job:', error);
      throw error;
    }

    return data;
  },

  async updateNotionWriteJob(jobId: string, updates: {
    status?: 'queued' | 'running' | 'succeeded' | 'failed';
    retry_at?: string | null;
    error_code?: string | null;
    result_metadata?: Record<string, unknown> | null;
    started_at?: string | null;
    completed_at?: string | null;
  }) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('notion_write_jobs')
      .update({
        status: updates.status,
        retry_at: updates.retry_at ?? null,
        error_code: updates.error_code ?? null,
        result_metadata: updates.result_metadata ?? null,
        started_at: updates.started_at ?? null,
        completed_at: updates.completed_at ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Database error updating notion write job:', error);
      throw error;
    }

    return data;
  },

  async getNotionWriteJob(jobId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('notion_write_jobs')
      .select('*')
      .eq('id', jobId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      logger.error('Database error fetching notion write job:', error);
      throw error;
    }

    return data;
  },

  async getNotionWriteJobByIdempotency(idempotencyKey: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('notion_write_jobs')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      logger.error('Database error fetching notion write job by idempotency:', error);
      throw error;
    }

    return data;
  },

  async getQueuedNotionWriteJobs(limit: number) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('claim_notion_write_jobs', { p_limit: limit });
    if (error) {
      logger.error('Database error claiming notion write jobs:', error);
      throw error;
    }
    return (data as any[]) || [];
  },

  async markJobRunning(jobId: string) {
    const supabase = getSupabaseClient();
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from('notion_write_jobs')
      .update({
        status: 'running',
        started_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', jobId)
      .eq('status', 'queued')
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Database error marking job running:', error);
      throw error;
    }

    return data;
  },

  async getQueueDepth() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('notion_write_jobs')
      .select('status');

    if (error) {
      logger.error('Database error fetching queue depth:', error);
      throw error;
    }

    const counts: Record<string, number> = {};
    (data || []).forEach((row: { status: string }) => {
      counts[row.status] = (counts[row.status] || 0) + 1;
    });

    return counts;
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
  // WORKSPACE HISTORY (Anti-abuse)
  // ============================================

  /**
   * Get workspace history entry
   */
  async getWorkspaceHistory(workspaceId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('workspace_usage_history')
      .select('*')
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      logger.error('Database error fetching workspace history:', error);
      throw error;
    }

    return data;
  },

  /**
   * Register workspace in history (anti-abuse tracking)
   */
  async registerWorkspaceHistory(
    workspaceId: string,
    workspaceName: string,
    userId: string,
    userEmail: string
  ) {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('workspace_usage_history')
      .upsert({
        workspace_id: workspaceId,
        workspace_name: workspaceName,
        first_user_id: userId,
        first_user_email: userEmail,
        disconnected_at: null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'workspace_id'
      });

    if (error) {
      logger.error('Database error registering workspace history:', error);
      throw error;
    }
  },

  // ============================================
  // PENDING NOTION REGISTRATIONS
  // ============================================

  /**
   * Save pending Notion registration (waiting for email verification)
   */
  async savePendingNotionRegistration(data: {
    workspaceId: string;
    workspaceName?: string;
    workspaceIcon?: string;
    accessToken: string; // Already encrypted
    ownerName?: string;
    ownerAvatar?: string;
    source?: 'app' | 'web';
  }) {
    const supabase = getSupabaseClient();

    // Delete any existing pending registration for this workspace
    await supabase
      .from('pending_notion_registrations')
      .delete()
      .eq('workspace_id', data.workspaceId);

    const { data: result, error } = await supabase
      .from('pending_notion_registrations')
      .insert({
        workspace_id: data.workspaceId,
        workspace_name: data.workspaceName,
        workspace_icon: data.workspaceIcon,
        access_token: data.accessToken,
        owner_name: data.ownerName,
        owner_avatar: data.ownerAvatar,
        source: data.source || 'web',
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      })
      .select()
      .single();

    if (error) {
      logger.error('Database error saving pending Notion registration:', error);
      throw error;
    }

    return result;
  },

  /**
   * Get pending Notion registration by workspace ID
   */
  async getPendingNotionRegistration(workspaceId: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('pending_notion_registrations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      logger.error('Database error fetching pending Notion registration:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update pending registration with email
   */
  async updatePendingNotionEmail(workspaceId: string, email: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('pending_notion_registrations')
      .update({
        email,
        updated_at: new Date().toISOString(),
      })
      .eq('workspace_id', workspaceId)
      .select()
      .single();

    if (error) {
      logger.error('Database error updating pending Notion email:', error);
      throw error;
    }

    return data;
  },

  /**
   * Delete pending Notion registration
   */
  async deletePendingNotionRegistration(workspaceId: string) {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('pending_notion_registrations')
      .delete()
      .eq('workspace_id', workspaceId);

    if (error) {
      logger.error('Database error deleting pending Notion registration:', error);
      throw error;
    }
  },

  /**
   * Cleanup expired pending registrations
   */
  async cleanupExpiredPendingRegistrations() {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('pending_notion_registrations')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      logger.error('Database error cleaning up expired pending registrations:', error);
    }
  },

  // ============================================
  // UTILITY
  // ============================================

  /**
   * Get Supabase client instance (for Auth operations)
   */
  getSupabaseClient,

  // ============================================
  // STRIPE WEBHOOK IDEMPOTENCY
  // ============================================

  /**
   * Check if a Stripe webhook event has already been processed
   * Returns: { exists: boolean, status: string | null, isStale: boolean }
   * 🔒 SECURITY: Events stuck in 'processing' for > 5 min are considered stale (allow retry)
   */
  async checkWebhookEventExists(eventId: string): Promise<{ exists: boolean; status: string | null; isStale: boolean }> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('stripe_webhook_events')
      .select('status, created_at')
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) {
      logger.error('Database error checking webhook event:', error);
      throw error;
    }

    if (!data) {
      return { exists: false, status: null, isStale: false };
    }

    // 🔒 TTL: If status is 'processing' and created_at > 5 minutes ago, consider stale
    const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
    const isStale = data.status === 'processing' && 
      data.created_at && 
      (Date.now() - new Date(data.created_at).getTime()) > STALE_THRESHOLD_MS;

    return {
      exists: true,
      status: data.status,
      isStale,
    };
  },

  /**
   * Mark a webhook event as processing (insert with status='processing')
   * Returns true if inserted, false if already exists (race condition protection)
   */
  async markWebhookEventProcessing(eventId: string, eventType: string): Promise<boolean> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('stripe_webhook_events')
      .insert({
        event_id: eventId,
        event_type: eventType,
        status: 'processing',
      });

    if (error) {
      // Unique constraint violation = already exists
      if (error.code === '23505') {
        logger.info(`[webhook-idempotency] Event ${eventId} already being processed (race condition)`);
        return false;
      }
      logger.error('Database error marking webhook event processing:', error);
      throw error;
    }

    return true;
  },

  /**
   * Mark a webhook event as processed (success)
   */
  async markWebhookEventProcessed(eventId: string): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('stripe_webhook_events')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('event_id', eventId);

    if (error) {
      logger.error('Database error marking webhook event processed:', error);
      throw error;
    }
  },

  /**
   * Mark a webhook event as failed
   */
  async markWebhookEventFailed(eventId: string, errorMessage: string): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('stripe_webhook_events')
      .update({
        status: 'failed',
        processed_at: new Date().toISOString(),
        error_message: errorMessage.substring(0, 1000), // Limit error message length
      })
      .eq('event_id', eventId);

    if (error) {
      logger.error('Database error marking webhook event failed:', error);
      throw error;
    }
  },

  /**
   * Cleanup old webhook events (older than 30 days)
   */
  async cleanupOldWebhookEvents(): Promise<number> {
    const supabase = getSupabaseClient();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('stripe_webhook_events')
      .delete()
      .lt('created_at', thirtyDaysAgo)
      .select('id');

    if (error) {
      logger.error('Database error cleaning up old webhook events:', error);
      return 0;
    }

    return data?.length || 0;
  },
};
