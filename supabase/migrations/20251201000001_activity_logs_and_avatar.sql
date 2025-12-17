-- ============================================
-- Migration: Activity Logs & Avatar Storage
-- Date: 2025-12-01
-- Description: Add activity_logs table for detailed tracking and avatar storage
-- ============================================

-- ============================================
-- TABLE: ACTIVITY_LOGS
-- Purpose: Detailed activity tracking for dashboard display
-- ============================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type text NOT NULL CHECK (activity_type IN (
    'clip_sent',
    'file_uploaded',
    'page_created',
    'selection_saved',
    'bulk_export'
  )),
  
  -- Content info
  content_preview text, -- First 200 chars of content
  content_length integer DEFAULT 0,
  
  -- Source info
  source_url text,
  source_title text,
  
  -- Notion destination
  notion_page_id text,
  notion_page_title text,
  notion_database_id text,
  notion_database_name text,
  
  -- Sections/blocks selected
  sections_selected text[], -- Array of section names
  sections_count integer DEFAULT 1,
  
  -- File info (if applicable)
  has_files boolean DEFAULT false,
  file_names text[], -- Array of file names
  files_count integer DEFAULT 0,
  total_file_size integer DEFAULT 0, -- in bytes
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON public.activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON public.activity_logs(activity_type);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own activity logs" ON public.activity_logs;
CREATE POLICY "Users can view own activity logs"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activity logs" ON public.activity_logs;
CREATE POLICY "Users can insert own activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.activity_logs IS 'Detailed activity logs for dashboard display and export';

-- ============================================
-- UPDATE USER_PROFILES: Add avatar_data column
-- Purpose: Store avatar as base64 for small images (< 100KB)
-- ============================================

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_data text,
ADD COLUMN IF NOT EXISTS avatar_updated_at timestamptz;

-- Add comment
COMMENT ON COLUMN public.user_profiles.avatar_data IS 'Base64 encoded avatar image (max 100KB, WebP format)';

-- ============================================
-- FUNCTION: Get user activity with pagination
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_activity(
  p_user_id uuid,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  activity_type text,
  content_preview text,
  content_length integer,
  source_url text,
  source_title text,
  notion_page_title text,
  notion_database_name text,
  sections_selected text[],
  sections_count integer,
  has_files boolean,
  file_names text[],
  files_count integer,
  total_file_size integer,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.activity_type,
    al.content_preview,
    al.content_length,
    al.source_url,
    al.source_title,
    al.notion_page_title,
    al.notion_database_name,
    al.sections_selected,
    al.sections_count,
    al.has_files,
    al.file_names,
    al.files_count,
    al.total_file_size,
    al.created_at
  FROM public.activity_logs al
  WHERE al.user_id = p_user_id
    AND (p_start_date IS NULL OR al.created_at >= p_start_date)
    AND (p_end_date IS NULL OR al.created_at <= p_end_date)
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================
-- FUNCTION: Export user activity as CSV-ready data
-- ============================================

CREATE OR REPLACE FUNCTION public.export_user_activity(
  p_user_id uuid,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL
)
RETURNS TABLE (
  activity_date text,
  activity_time text,
  activity_type text,
  content_preview text,
  source_url text,
  source_title text,
  notion_page text,
  notion_database text,
  sections text,
  files text,
  files_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(al.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') as activity_date,
    to_char(al.created_at AT TIME ZONE 'UTC', 'HH24:MI:SS') as activity_time,
    al.activity_type,
    al.content_preview,
    al.source_url,
    al.source_title,
    al.notion_page_title as notion_page,
    al.notion_database_name as notion_database,
    array_to_string(al.sections_selected, ', ') as sections,
    array_to_string(al.file_names, ', ') as files,
    al.files_count
  FROM public.activity_logs al
  WHERE al.user_id = p_user_id
    AND (p_start_date IS NULL OR al.created_at >= p_start_date)
    AND (p_end_date IS NULL OR al.created_at <= p_end_date)
  ORDER BY al.created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.export_user_activity TO authenticated;
