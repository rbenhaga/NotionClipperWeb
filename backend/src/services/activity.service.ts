/**
 * Activity Service
 * Database operations for activity logs
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// Supabase client with service role (bypasses RLS)
let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
  }
  return supabase;
}

export interface ActivityLog {
  id: string;
  activity_type: string;
  content_preview: string | null;
  content_length: number;
  source_url: string | null;
  source_title: string | null;
  notion_page_title: string | null;
  notion_database_name: string | null;
  sections_selected: string[] | null;
  sections_count: number;
  has_files: boolean;
  file_names: string[] | null;
  files_count: number;
  total_file_size: number;
  created_at: string;
}

/**
 * Get user activity with pagination
 */
export async function getUserActivity(
  userId: string,
  limit: number = 50,
  offset: number = 0,
  startDate?: Date,
  endDate?: Date
): Promise<ActivityLog[]> {
  const db = getSupabase();

  let query = db
    .from('activity_logs')
    .select(`
      id,
      activity_type,
      content_preview,
      content_length,
      source_url,
      source_title,
      notion_page_title,
      notion_database_name,
      sections_selected,
      sections_count,
      has_files,
      file_names,
      files_count,
      total_file_size,
      created_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Error fetching activity logs:', error);
    throw new Error('Failed to fetch activity logs');
  }

  return data || [];
}

/**
 * Get activity statistics
 */
export async function getActivityStats(
  userId: string,
  days: number = 30
): Promise<{
  totalActivities: number;
  byType: Record<string, number>;
  byDay: { date: string; count: number }[];
  totalFiles: number;
  totalClips: number;
}> {
  const db = getSupabase();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all activities in the period
  const { data, error } = await db
    .from('activity_logs')
    .select('activity_type, files_count, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());

  if (error) {
    logger.error('Error fetching activity stats:', error);
    throw new Error('Failed to fetch activity stats');
  }

  const activities = data || [];

  // Calculate stats
  const byType: Record<string, number> = {};
  const byDayMap: Record<string, number> = {};
  let totalFiles = 0;
  let totalClips = 0;

  activities.forEach((activity) => {
    // By type
    byType[activity.activity_type] = (byType[activity.activity_type] || 0) + 1;

    // By day
    const day = activity.created_at.split('T')[0];
    byDayMap[day] = (byDayMap[day] || 0) + 1;

    // Totals
    totalFiles += activity.files_count || 0;
    if (activity.activity_type === 'clip_sent' || activity.activity_type === 'selection_saved') {
      totalClips++;
    }
  });

  // Convert byDayMap to sorted array
  const byDay = Object.entries(byDayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalActivities: activities.length,
    byType,
    byDay,
    totalFiles,
    totalClips,
  };
}

/**
 * Export user activity as CSV-ready data
 */
export async function exportUserActivity(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  date: string;
  time: string;
  activity_type: string;
  content_preview: string;
  source_url: string;
  source_title: string;
  notion_page: string;
  notion_database: string;
  sections: string;
  files: string;
  files_count: number;
}[]> {
  const db = getSupabase();

  let query = db
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Error exporting activity:', error);
    throw new Error('Failed to export activity');
  }

  return (data || []).map((row) => {
    const createdAt = new Date(row.created_at);
    return {
      date: createdAt.toISOString().split('T')[0],
      time: createdAt.toISOString().split('T')[1].split('.')[0],
      activity_type: row.activity_type,
      content_preview: row.content_preview || '',
      source_url: row.source_url || '',
      source_title: row.source_title || '',
      notion_page: row.notion_page_title || '',
      notion_database: row.notion_database_name || '',
      sections: (row.sections_selected || []).join(', '),
      files: (row.file_names || []).join(', '),
      files_count: row.files_count || 0,
    };
  });
}
