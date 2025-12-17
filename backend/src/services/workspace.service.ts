/**
 * Workspace Service
 * Database operations for workspace management with anti-abuse protection
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { encryptToken } from './crypto.service.js';

// Supabase client with service role (bypasses RLS)
let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
  }
  return supabase;
}

export interface NotionConnection {
  id: string;
  user_id: string;
  workspace_id: string;
  workspace_name: string;
  workspace_icon?: string;
  access_token_encrypted?: string;
  is_active: boolean;
  is_default: boolean;
  connection_status: 'active' | 'disconnected' | 'expired' | 'revoked';
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceHistory {
  id: string;
  workspace_id: string;
  workspace_name?: string;
  first_user_id: string;
  first_user_email: string;
  connected_at: string;
  disconnected_at?: string;
  is_blocked: boolean;
  block_reason?: string;
}

export interface ConnectionAttempt {
  userId: string;
  workspaceId: string;
  attemptType: 'connect' | 'disconnect' | 'blocked';
  success: boolean;
  errorMessage?: string | null;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Get all workspaces for a user
 */
export async function getUserWorkspaces(userId: string): Promise<NotionConnection[]> {
  const { data, error } = await getSupabase()
    .from('notion_connections')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching user workspaces:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get the active (default) workspace for a user
 */
export async function getActiveWorkspace(userId: string): Promise<NotionConnection | null> {
  // First try to get the default workspace
  let { data, error } = await getSupabase()
    .from('notion_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    logger.error('Error fetching default workspace:', error);
  }

  // If no default, get the most recently used active workspace
  if (!data) {
    const result = await getSupabase()
      .from('notion_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_used_at', { ascending: false, nullsFirst: false })
      .limit(1)
      .single();

    if (result.error && result.error.code !== 'PGRST116') {
      logger.error('Error fetching active workspace:', result.error);
    }
    data = result.data;
  }

  return data || null;
}

/**
 * Get a workspace by its internal ID
 */
export async function getWorkspaceById(id: string, userId: string): Promise<NotionConnection | null> {
  const { data, error } = await getSupabase()
    .from('notion_connections')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Error fetching workspace by ID:', error);
  }

  return data || null;
}

/**
 * Get a workspace by Notion workspace ID
 */
export async function getWorkspaceByNotionId(workspaceId: string, userId: string): Promise<NotionConnection | null> {
  const { data, error } = await getSupabase()
    .from('notion_connections')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Error fetching workspace by Notion ID:', error);
  }

  return data || null;
}

/**
 * Set a workspace as the default
 */
export async function setDefaultWorkspace(userId: string, workspaceId: string): Promise<void> {
  // First, unset all defaults for this user
  await getSupabase()
    .from('notion_connections')
    .update({ is_default: false })
    .eq('user_id', userId);

  // Then set the new default
  const { error } = await getSupabase()
    .from('notion_connections')
    .update({ is_default: true })
    .eq('id', workspaceId)
    .eq('user_id', userId);

  if (error) {
    logger.error('Error setting default workspace:', error);
    throw error;
  }
}

/**
 * Update last used timestamp
 */
export async function updateWorkspaceLastUsed(workspaceId: string): Promise<void> {
  const { error } = await getSupabase()
    .from('notion_connections')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', workspaceId);

  if (error) {
    logger.error('Error updating workspace last used:', error);
  }
}

/**
 * Check if a workspace is available for connection (anti-abuse)
 */
export async function checkWorkspaceAvailability(
  workspaceId: string, 
  userId: string
): Promise<{ available: boolean; reason: string; ownerEmail?: string }> {
  // Check workspace_usage_history
  const { data, error } = await getSupabase()
    .from('workspace_usage_history')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Error checking workspace availability:', error);
    throw error;
  }

  if (!data) {
    // Workspace never used before
    return { available: true, reason: 'Workspace available' };
  }

  if (data.first_user_id === userId) {
    // Same user, can reconnect
    return { available: true, reason: 'Workspace belongs to this user', ownerEmail: data.first_user_email };
  }

  if (data.is_blocked) {
    return { 
      available: false, 
      reason: `Workspace blocked: ${data.block_reason || 'abuse detected'}`,
      ownerEmail: data.first_user_email 
    };
  }

  // Workspace belongs to another user
  return { 
    available: false, 
    reason: 'This Notion workspace is already linked to another account. Each workspace can only be used with one Clipper Pro account.',
    ownerEmail: data.first_user_email 
  };
}

/**
 * Register a workspace connection in history (anti-abuse)
 */
export async function registerWorkspaceConnection(
  workspaceId: string,
  workspaceName: string,
  userId: string,
  userEmail: string
): Promise<{ success: boolean; message: string }> {
  // Check availability first
  const availability = await checkWorkspaceAvailability(workspaceId, userId);
  
  if (!availability.available) {
    return { success: false, message: availability.reason };
  }

  // Upsert into history
  const { error } = await getSupabase()
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
    logger.error('Error registering workspace connection:', error);
    return { success: false, message: 'Failed to register workspace' };
  }

  return { success: true, message: 'Workspace registered successfully' };
}

/**
 * Disconnect a workspace (mark as inactive)
 */
export async function disconnectWorkspace(workspaceId: string): Promise<void> {
  const { error } = await getSupabase()
    .from('notion_connections')
    .update({ 
      is_active: false, 
      is_default: false,
      connection_status: 'disconnected',
      updated_at: new Date().toISOString()
    })
    .eq('id', workspaceId);

  if (error) {
    logger.error('Error disconnecting workspace:', error);
    throw error;
  }
}

/**
 * Mark workspace as disconnected in history
 */
export async function markWorkspaceDisconnected(workspaceId: string): Promise<void> {
  const { error } = await getSupabase()
    .from('workspace_usage_history')
    .update({ 
      disconnected_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('workspace_id', workspaceId);

  if (error) {
    logger.error('Error marking workspace disconnected in history:', error);
  }
}

/**
 * Get workspace history for a user
 */
export async function getWorkspaceHistory(userId: string): Promise<WorkspaceHistory[]> {
  const { data, error } = await getSupabase()
    .from('workspace_usage_history')
    .select('*')
    .eq('first_user_id', userId)
    .order('connected_at', { ascending: false });

  if (error) {
    logger.error('Error fetching workspace history:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a specific workspace history entry
 */
export async function getWorkspaceHistoryEntry(workspaceId: string): Promise<WorkspaceHistory | null> {
  const { data, error } = await getSupabase()
    .from('workspace_usage_history')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Error fetching workspace history entry:', error);
  }

  return data || null;
}

/**
 * Log a connection attempt (for security auditing)
 */
export async function logConnectionAttempt(attempt: ConnectionAttempt): Promise<void> {
  const { error } = await getSupabase()
    .from('connection_attempts')
    .insert({
      user_id: attempt.userId,
      workspace_id: attempt.workspaceId,
      attempt_type: attempt.attemptType,
      success: attempt.success,
      error_message: attempt.errorMessage,
      ip_address: attempt.ipAddress,
      user_agent: attempt.userAgent
    });

  if (error) {
    logger.error('Error logging connection attempt:', error);
    // Don't throw - logging failure shouldn't break the flow
  }
}

/**
 * Save or update a Notion connection
 */
export async function saveNotionConnection(
  userId: string,
  workspaceId: string,
  workspaceName: string,
  accessToken: string,
  workspaceIcon?: string
): Promise<NotionConnection> {
  // Encrypt the token
  const encryptedToken = encryptToken(accessToken);

  // Check if connection already exists
  const existing = await getWorkspaceByNotionId(workspaceId, userId);

  if (existing) {
    // Update existing connection
    const { data, error } = await getSupabase()
      .from('notion_connections')
      .update({
        workspace_name: workspaceName,
        workspace_icon: workspaceIcon,
        access_token_encrypted: encryptedToken,
        is_active: true,
        connection_status: 'active',
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating Notion connection:', error);
      throw error;
    }

    return data;
  } else {
    // Create new connection
    const isFirst = (await getUserWorkspaces(userId)).length === 0;
    
    const { data, error } = await getSupabase()
      .from('notion_connections')
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        workspace_name: workspaceName,
        workspace_icon: workspaceIcon,
        access_token_encrypted: encryptedToken,
        is_active: true,
        is_default: isFirst, // First workspace is default
        connection_status: 'active',
        last_used_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating Notion connection:', error);
      throw error;
    }

    return data;
  }
}
