-- ============================================
-- Migration: Content Analytics & Full Content Storage
-- Date: 2025-12-02
-- Description: Store full content for productivity analytics
-- ============================================

-- ============================================
-- TABLE: CONTENT_STORAGE
-- Purpose: Store full content for analytics (separate from activity_logs for performance)
-- ============================================

CREATE TABLE IF NOT EXISTS public.content_storage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_log_id uuid REFERENCES public.activity_logs(id) ON DELETE CASCADE,
  
  -- Content types
  content_type text NOT NULL CHECK (content_type IN (
    'text',           -- Plain text/markdown
    'html',           -- HTML content
    'pdf_extracted',  -- Text extracted from PDF
    'image_ocr',      -- OCR text from images
    'audio_transcript', -- Transcription from audio
    'file_metadata'   -- File metadata only
  )),
  
  -- Raw content (original)
  raw_content text,
  raw_content_hash text, -- SHA256 hash for deduplication
  
  -- Parsed/processed content
  parsed_content text,
  parsed_blocks jsonb, -- Notion blocks structure
  
  -- Content analysis
  word_count integer DEFAULT 0,
  character_count integer DEFAULT 0,
  sentence_count integer DEFAULT 0,
  paragraph_count integer DEFAULT 0,
  
  -- Language detection
  detected_language text DEFAULT 'en',
  language_confidence real DEFAULT 0.0,
  
  -- Content classification
  content_categories text[], -- ['technology', 'business', 'personal', etc.]
  keywords text[], -- Extracted keywords
  entities jsonb DEFAULT '[]'::jsonb, -- Named entities (people, places, orgs)
  
  -- Sentiment analysis
  sentiment_score real, -- -1.0 to 1.0
  sentiment_label text CHECK (sentiment_label IN ('positive', 'negative', 'neutral', 'mixed')),
  
  -- Readability metrics
  readability_score real, -- Flesch-Kincaid or similar
  reading_time_seconds integer DEFAULT 0,
  
  -- File-specific metadata
  file_type text, -- 'pdf', 'docx', 'png', 'jpg', etc.
  file_size_bytes integer DEFAULT 0,
  file_pages integer, -- For PDFs
  
  -- Processing status
  processing_status text DEFAULT 'pending' CHECK (processing_status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'skipped'
  )),
  processing_error text,
  processed_at timestamptz,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_storage_user_id ON public.content_storage(user_id);
CREATE INDEX IF NOT EXISTS idx_content_storage_activity_log ON public.content_storage(activity_log_id);
CREATE INDEX IF NOT EXISTS idx_content_storage_content_type ON public.content_storage(content_type);
CREATE INDEX IF NOT EXISTS idx_content_storage_created_at ON public.content_storage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_storage_hash ON public.content_storage(raw_content_hash);
CREATE INDEX IF NOT EXISTS idx_content_storage_categories ON public.content_storage USING GIN(content_categories);
CREATE INDEX IF NOT EXISTS idx_content_storage_keywords ON public.content_storage USING GIN(keywords);

-- Enable RLS
ALTER TABLE public.content_storage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own content" ON public.content_storage;
CREATE POLICY "Users can view own content"
  ON public.content_storage FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own content" ON public.content_storage;
CREATE POLICY "Users can insert own content"
  ON public.content_storage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own content" ON public.content_storage;
CREATE POLICY "Users can update own content"
  ON public.content_storage FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: PRODUCTIVITY_METRICS
-- Purpose: Aggregated productivity metrics per user per day
-- ============================================

CREATE TABLE IF NOT EXISTS public.productivity_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date date NOT NULL,
  
  -- Activity counts
  total_clips integer DEFAULT 0,
  total_files integer DEFAULT 0,
  total_words_clipped integer DEFAULT 0,
  total_characters integer DEFAULT 0,
  
  -- Time metrics
  active_minutes integer DEFAULT 0,
  focus_mode_minutes integer DEFAULT 0,
  compact_mode_minutes integer DEFAULT 0,
  
  -- Content diversity
  unique_sources integer DEFAULT 0,
  unique_destinations integer DEFAULT 0,
  content_types_used text[],
  
  -- Quality metrics
  avg_content_length integer DEFAULT 0,
  avg_readability_score real,
  
  -- Productivity score (0-100)
  productivity_score integer DEFAULT 0,
  
  -- Streak tracking
  is_active_day boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, metric_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_productivity_metrics_user_date ON public.productivity_metrics(user_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_productivity_metrics_score ON public.productivity_metrics(productivity_score DESC);

-- Enable RLS
ALTER TABLE public.productivity_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own metrics" ON public.productivity_metrics;
CREATE POLICY "Users can view own metrics"
  ON public.productivity_metrics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can manage metrics" ON public.productivity_metrics;
CREATE POLICY "Service can manage metrics"
  ON public.productivity_metrics FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TABLE: CONTENT_INSIGHTS
-- Purpose: AI-generated insights from content analysis
-- ============================================

CREATE TABLE IF NOT EXISTS public.content_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Insight type
  insight_type text NOT NULL CHECK (insight_type IN (
    'topic_trend',        -- Trending topics in user's content
    'productivity_tip',   -- Personalized productivity suggestions
    'content_pattern',    -- Patterns in content creation
    'time_optimization',  -- Best times for productivity
    'category_summary',   -- Summary by content category
    'weekly_digest',      -- Weekly summary
    'monthly_report'      -- Monthly report
  )),
  
  -- Insight content
  title text NOT NULL,
  description text,
  data jsonb DEFAULT '{}'::jsonb,
  
  -- Relevance
  relevance_score real DEFAULT 0.5,
  is_actionable boolean DEFAULT false,
  
  -- Display
  icon text,
  color text,
  
  -- Validity period
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  
  -- User interaction
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_insights_user ON public.content_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_content_insights_type ON public.content_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_content_insights_valid ON public.content_insights(valid_from, valid_until);

-- Enable RLS
ALTER TABLE public.content_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own insights" ON public.content_insights;
CREATE POLICY "Users can view own insights"
  ON public.content_insights FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own insights" ON public.content_insights;
CREATE POLICY "Users can update own insights"
  ON public.content_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Calculate daily productivity metrics
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_daily_metrics(
  p_user_id uuid,
  p_date date DEFAULT CURRENT_DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_clips integer;
  v_files integer;
  v_words integer;
  v_chars integer;
  v_sources integer;
  v_destinations integer;
  v_avg_length integer;
  v_score integer;
BEGIN
  -- Calculate metrics from activity_logs and content_storage
  SELECT 
    COUNT(*) FILTER (WHERE activity_type IN ('clip_sent', 'selection_saved')),
    COUNT(*) FILTER (WHERE activity_type = 'file_uploaded'),
    COALESCE(SUM(content_length), 0),
    COUNT(DISTINCT source_url),
    COUNT(DISTINCT notion_page_id)
  INTO v_clips, v_files, v_chars, v_sources, v_destinations
  FROM public.activity_logs
  WHERE user_id = p_user_id
    AND DATE(created_at) = p_date;

  -- Get word count from content_storage
  SELECT COALESCE(SUM(word_count), 0)
  INTO v_words
  FROM public.content_storage
  WHERE user_id = p_user_id
    AND DATE(created_at) = p_date;

  -- Calculate average content length
  v_avg_length := CASE WHEN v_clips > 0 THEN v_chars / v_clips ELSE 0 END;

  -- Calculate productivity score (simple algorithm)
  v_score := LEAST(100, (
    (v_clips * 5) +
    (v_files * 10) +
    (v_words / 100) +
    (v_sources * 3) +
    (v_destinations * 3)
  ));

  -- Upsert metrics
  INSERT INTO public.productivity_metrics (
    user_id, metric_date, total_clips, total_files, total_words_clipped,
    total_characters, unique_sources, unique_destinations, avg_content_length,
    productivity_score, is_active_day, updated_at
  ) VALUES (
    p_user_id, p_date, v_clips, v_files, v_words,
    v_chars, v_sources, v_destinations, v_avg_length,
    v_score, (v_clips > 0 OR v_files > 0), now()
  )
  ON CONFLICT (user_id, metric_date) DO UPDATE SET
    total_clips = EXCLUDED.total_clips,
    total_files = EXCLUDED.total_files,
    total_words_clipped = EXCLUDED.total_words_clipped,
    total_characters = EXCLUDED.total_characters,
    unique_sources = EXCLUDED.unique_sources,
    unique_destinations = EXCLUDED.unique_destinations,
    avg_content_length = EXCLUDED.avg_content_length,
    productivity_score = EXCLUDED.productivity_score,
    is_active_day = EXCLUDED.is_active_day,
    updated_at = now();
END;
$$;

-- ============================================
-- FUNCTION: Get productivity analytics
-- ============================================

CREATE OR REPLACE FUNCTION public.get_productivity_analytics(
  p_user_id uuid,
  p_days integer DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_total_clips integer;
  v_total_files integer;
  v_total_words integer;
  v_avg_score real;
  v_current_streak integer;
  v_best_streak integer;
  v_top_categories text[];
  v_peak_hour integer;
BEGIN
  -- Get totals
  SELECT 
    COALESCE(SUM(total_clips), 0),
    COALESCE(SUM(total_files), 0),
    COALESCE(SUM(total_words_clipped), 0),
    COALESCE(AVG(productivity_score), 0)
  INTO v_total_clips, v_total_files, v_total_words, v_avg_score
  FROM public.productivity_metrics
  WHERE user_id = p_user_id
    AND metric_date >= CURRENT_DATE - p_days;

  -- Calculate current streak
  WITH streak_days AS (
    SELECT metric_date, is_active_day,
           metric_date - ROW_NUMBER() OVER (ORDER BY metric_date)::integer AS grp
    FROM public.productivity_metrics
    WHERE user_id = p_user_id AND is_active_day = true
    ORDER BY metric_date DESC
  )
  SELECT COUNT(*)
  INTO v_current_streak
  FROM streak_days
  WHERE grp = (SELECT grp FROM streak_days LIMIT 1);

  -- Get peak hour
  SELECT EXTRACT(HOUR FROM created_at)::integer
  INTO v_peak_hour
  FROM public.activity_logs
  WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE - p_days
  GROUP BY EXTRACT(HOUR FROM created_at)
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Get top categories
  SELECT ARRAY_AGG(DISTINCT unnest_cat)
  INTO v_top_categories
  FROM (
    SELECT unnest(content_categories) as unnest_cat
    FROM public.content_storage
    WHERE user_id = p_user_id
      AND created_at >= CURRENT_DATE - p_days
    GROUP BY unnest(content_categories)
    ORDER BY COUNT(*) DESC
    LIMIT 5
  ) sub;

  -- Build result
  v_result := jsonb_build_object(
    'summary', jsonb_build_object(
      'totalClips', v_total_clips,
      'totalFiles', v_total_files,
      'totalWords', v_total_words,
      'avgProductivityScore', ROUND(v_avg_score::numeric, 1),
      'currentStreak', COALESCE(v_current_streak, 0),
      'peakHour', v_peak_hour,
      'topCategories', COALESCE(v_top_categories, ARRAY[]::text[])
    ),
    'dailyMetrics', (
      SELECT jsonb_agg(jsonb_build_object(
        'date', metric_date,
        'clips', total_clips,
        'files', total_files,
        'words', total_words_clipped,
        'score', productivity_score
      ) ORDER BY metric_date)
      FROM public.productivity_metrics
      WHERE user_id = p_user_id
        AND metric_date >= CURRENT_DATE - p_days
    )
  );

  RETURN v_result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.calculate_daily_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_productivity_analytics TO authenticated;

-- Comments
COMMENT ON TABLE public.content_storage IS 'Full content storage for analytics and AI processing';
COMMENT ON TABLE public.productivity_metrics IS 'Daily aggregated productivity metrics per user';
COMMENT ON TABLE public.content_insights IS 'AI-generated insights from content analysis';
