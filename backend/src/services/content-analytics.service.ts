/**
 * Content Analytics Service
 * Handles content storage, analysis, and productivity metrics
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
  }
  return supabase;
}

// ============================================
// TYPES
// ============================================

export type ContentType = 
  | 'text'
  | 'html'
  | 'pdf_extracted'
  | 'image_ocr'
  | 'audio_transcript'
  | 'file_metadata';

export type SentimentLabel = 'positive' | 'negative' | 'neutral' | 'mixed';

export interface ContentStorageInput {
  userId: string;
  activityLogId?: string;
  contentType: ContentType;
  rawContent: string;
  parsedContent?: string;
  parsedBlocks?: any[];
  fileType?: string;
  fileSizeBytes?: number;
  filePages?: number;
}

export interface ContentAnalysis {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  paragraphCount: number;
  detectedLanguage: string;
  languageConfidence: number;
  contentCategories: string[];
  keywords: string[];
  sentimentScore: number;
  sentimentLabel: SentimentLabel;
  readabilityScore: number;
  readingTimeSeconds: number;
}

export interface ProductivityAnalytics {
  summary: {
    totalClips: number;
    totalFiles: number;
    totalWords: number;
    avgProductivityScore: number;
    currentStreak: number;
    peakHour: number | null;
    topCategories: string[];
  };
  dailyMetrics: Array<{
    date: string;
    clips: number;
    files: number;
    words: number;
    score: number;
  }>;
}

export interface ContentInsight {
  id: string;
  insightType: string;
  title: string;
  description: string;
  data: any;
  relevanceScore: number;
  isActionable: boolean;
  icon?: string;
  color?: string;
  createdAt: string;
}

// ============================================
// CONTENT STORAGE
// ============================================

/**
 * Store content with analysis
 */
export async function storeContent(input: ContentStorageInput): Promise<string> {
  const db = getSupabase();
  
  // Generate hash for deduplication
  const contentHash = crypto
    .createHash('sha256')
    .update(input.rawContent)
    .digest('hex');

  // Check for duplicate
  const { data: existing } = await db
    .from('content_storage')
    .select('id')
    .eq('user_id', input.userId)
    .eq('raw_content_hash', contentHash)
    .single();

  if (existing) {
    logger.debug(`Duplicate content detected for user ${input.userId}`);
    return existing.id;
  }

  // Analyze content
  const analysis = analyzeContent(input.rawContent);

  // Insert content
  const { data, error } = await db
    .from('content_storage')
    .insert({
      user_id: input.userId,
      activity_log_id: input.activityLogId,
      content_type: input.contentType,
      raw_content: input.rawContent,
      raw_content_hash: contentHash,
      parsed_content: input.parsedContent,
      parsed_blocks: input.parsedBlocks,
      word_count: analysis.wordCount,
      character_count: analysis.characterCount,
      sentence_count: analysis.sentenceCount,
      paragraph_count: analysis.paragraphCount,
      detected_language: analysis.detectedLanguage,
      language_confidence: analysis.languageConfidence,
      content_categories: analysis.contentCategories,
      keywords: analysis.keywords,
      sentiment_score: analysis.sentimentScore,
      sentiment_label: analysis.sentimentLabel,
      readability_score: analysis.readabilityScore,
      reading_time_seconds: analysis.readingTimeSeconds,
      file_type: input.fileType,
      file_size_bytes: input.fileSizeBytes,
      file_pages: input.filePages,
      processing_status: 'completed',
      processed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    logger.error('Error storing content:', error);
    throw new Error('Failed to store content');
  }

  // Update daily metrics
  await updateDailyMetrics(input.userId);

  return data.id;
}

// ============================================
// CONTENT ANALYSIS
// ============================================

/**
 * Analyze content and extract metrics
 */
export function analyzeContent(content: string): ContentAnalysis {
  const text = content.trim();
  
  // Basic counts
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const characterCount = text.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;

  // Language detection (simple heuristic)
  const { language, confidence } = detectLanguage(text);

  // Extract keywords (simple TF approach)
  const keywords = extractKeywords(text);

  // Content categorization
  const categories = categorizeContent(text, keywords);

  // Sentiment analysis (simple lexicon-based)
  const { score: sentimentScore, label: sentimentLabel } = analyzeSentiment(text);

  // Readability score (Flesch-Kincaid approximation)
  const readabilityScore = calculateReadability(text, wordCount, sentenceCount);

  // Reading time (average 200 words per minute)
  const readingTimeSeconds = Math.ceil((wordCount / 200) * 60);

  return {
    wordCount,
    characterCount,
    sentenceCount,
    paragraphCount,
    detectedLanguage: language,
    languageConfidence: confidence,
    contentCategories: categories,
    keywords,
    sentimentScore,
    sentimentLabel,
    readabilityScore,
    readingTimeSeconds,
  };
}

/**
 * Simple language detection
 */
function detectLanguage(text: string): { language: string; confidence: number } {
  const frenchWords = ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'est', 'sont', 'pour', 'dans', 'que', 'qui', 'avec', 'sur', 'par', 'ce', 'cette'];
  const englishWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
  const spanishWords = ['el', 'la', 'los', 'las', 'de', 'del', 'un', 'una', 'y', 'es', 'son', 'para', 'en', 'que', 'con', 'por', 'este', 'esta'];
  const germanWords = ['der', 'die', 'das', 'ein', 'eine', 'und', 'ist', 'sind', 'für', 'in', 'mit', 'auf', 'von', 'zu', 'den', 'dem'];

  const words = text.toLowerCase().split(/\s+/);
  
  const counts = {
    fr: words.filter(w => frenchWords.includes(w)).length,
    en: words.filter(w => englishWords.includes(w)).length,
    es: words.filter(w => spanishWords.includes(w)).length,
    de: words.filter(w => germanWords.includes(w)).length,
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const max = Math.max(...Object.values(counts));
  const language = Object.entries(counts).find(([, v]) => v === max)?.[0] || 'en';
  const confidence = total > 0 ? max / total : 0.5;

  return { language, confidence };
}

/**
 * Extract keywords using simple TF approach
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'under', 'again', 'further', 'then', 'once',
    'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'est',
    'sont', 'pour', 'dans', 'que', 'qui', 'avec', 'sur', 'par', 'ce',
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Categorize content based on keywords
 */
function categorizeContent(text: string, keywords: string[]): string[] {
  const categories: string[] = [];
  const lowerText = text.toLowerCase();
  const allWords = [...keywords, ...lowerText.split(/\s+/)];

  const categoryPatterns: Record<string, string[]> = {
    technology: ['code', 'software', 'api', 'database', 'programming', 'developer', 'tech', 'app', 'web', 'cloud', 'server', 'algorithm'],
    business: ['business', 'company', 'market', 'revenue', 'profit', 'strategy', 'management', 'enterprise', 'startup', 'investment'],
    research: ['research', 'study', 'analysis', 'data', 'findings', 'methodology', 'hypothesis', 'experiment', 'results', 'conclusion'],
    personal: ['personal', 'diary', 'journal', 'thoughts', 'feelings', 'life', 'family', 'friends', 'hobby', 'travel'],
    education: ['learn', 'course', 'tutorial', 'lesson', 'education', 'student', 'teacher', 'school', 'university', 'training'],
    creative: ['design', 'art', 'creative', 'writing', 'story', 'music', 'video', 'photo', 'illustration', 'animation'],
    productivity: ['task', 'todo', 'project', 'deadline', 'meeting', 'schedule', 'plan', 'goal', 'workflow', 'efficiency'],
    news: ['news', 'article', 'report', 'update', 'announcement', 'press', 'media', 'headline', 'breaking', 'latest'],
  };

  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    const matches = patterns.filter(p => allWords.some(w => w.includes(p)));
    if (matches.length >= 2) {
      categories.push(category);
    }
  }

  return categories.length > 0 ? categories : ['general'];
}

/**
 * Simple sentiment analysis
 */
function analyzeSentiment(text: string): { score: number; label: SentimentLabel } {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'happy', 'joy', 'success', 'perfect', 'best', 'awesome', 'brilliant', 'superb', 'bien', 'super', 'génial', 'excellent', 'parfait'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'sad', 'angry', 'fail', 'worst', 'poor', 'wrong', 'problem', 'issue', 'error', 'bug', 'mal', 'mauvais', 'terrible', 'problème', 'erreur'];

  const words = text.toLowerCase().split(/\s+/);
  const positiveCount = words.filter(w => positiveWords.some(p => w.includes(p))).length;
  const negativeCount = words.filter(w => negativeWords.some(n => w.includes(n))).length;

  const total = positiveCount + negativeCount;
  if (total === 0) {
    return { score: 0, label: 'neutral' };
  }

  const score = (positiveCount - negativeCount) / total;
  
  let label: SentimentLabel;
  if (score > 0.3) label = 'positive';
  else if (score < -0.3) label = 'negative';
  else if (positiveCount > 0 && negativeCount > 0) label = 'mixed';
  else label = 'neutral';

  return { score, label };
}

/**
 * Calculate readability score (Flesch-Kincaid approximation)
 */
function calculateReadability(text: string, wordCount: number, sentenceCount: number): number {
  if (wordCount === 0 || sentenceCount === 0) return 0;

  // Count syllables (simple approximation)
  const syllableCount = text.toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/[^aeiouy]+/g, ' ')
    .trim()
    .split(/\s+/)
    .length;

  // Flesch Reading Ease formula
  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;
  
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  return Math.max(0, Math.min(100, score));
}

// ============================================
// PRODUCTIVITY METRICS
// ============================================

/**
 * Update daily metrics for a user
 */
export async function updateDailyMetrics(userId: string, date?: Date): Promise<void> {
  const db = getSupabase();
  const targetDate = date || new Date();
  const dateStr = targetDate.toISOString().split('T')[0];

  try {
    await db.rpc('calculate_daily_metrics', {
      p_user_id: userId,
      p_date: dateStr,
    });
    logger.debug(`Daily metrics updated for user ${userId} on ${dateStr}`);
  } catch (error) {
    logger.error('Error updating daily metrics:', error);
  }
}

/**
 * Get productivity analytics for a user
 */
export async function getProductivityAnalytics(
  userId: string,
  days: number = 30
): Promise<ProductivityAnalytics> {
  const db = getSupabase();

  const { data, error } = await db.rpc('get_productivity_analytics', {
    p_user_id: userId,
    p_days: days,
  });

  if (error) {
    // Return empty analytics if the function doesn't exist yet
    if (error.code === 'PGRST202') {
      logger.warn('get_productivity_analytics function not found, returning empty data');
      return {
        summary: {
          totalClips: 0,
          totalFiles: 0,
          totalWords: 0,
          avgProductivityScore: 0,
          currentStreak: 0,
          peakHour: null,
          topCategories: [],
        },
        dailyMetrics: [],
      };
    }
    logger.error('Error fetching productivity analytics:', error);
    throw new Error('Failed to fetch productivity analytics');
  }

  return data as ProductivityAnalytics;
}

// ============================================
// CONTENT INSIGHTS
// ============================================

/**
 * Get insights for a user
 */
export async function getContentInsights(
  userId: string,
  limit: number = 10
): Promise<ContentInsight[]> {
  const db = getSupabase();

  const { data, error } = await db
    .from('content_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('is_dismissed', false)
    .gte('valid_until', new Date().toISOString())
    .order('relevance_score', { ascending: false })
    .limit(limit);

  if (error) {
    // Return empty array if the table doesn't exist yet
    if (error.code === 'PGRST205' || error.code === '42P01') {
      logger.warn('content_insights table not found, returning empty data');
      return [];
    }
    logger.error('Error fetching content insights:', error);
    throw new Error('Failed to fetch content insights');
  }

  return (data || []).map(row => ({
    id: row.id,
    insightType: row.insight_type,
    title: row.title,
    description: row.description,
    data: row.data,
    relevanceScore: row.relevance_score,
    isActionable: row.is_actionable,
    icon: row.icon,
    color: row.color,
    createdAt: row.created_at,
  }));
}

/**
 * Generate insights for a user (called periodically)
 */
export async function generateInsights(userId: string): Promise<void> {
  const db = getSupabase();

  try {
    // Get recent content analysis
    const { data: recentContent } = await db
      .from('content_storage')
      .select('content_categories, keywords, word_count, sentiment_label')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (!recentContent || recentContent.length === 0) return;

    // Analyze patterns
    const categoryCount: Record<string, number> = {};
    const keywordCount: Record<string, number> = {};
    let totalWords = 0;
    const sentiments: Record<string, number> = {};

    recentContent.forEach(item => {
      totalWords += item.word_count || 0;
      (item.content_categories || []).forEach((cat: string) => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      (item.keywords || []).forEach((kw: string) => {
        keywordCount[kw] = (keywordCount[kw] || 0) + 1;
      });
      if (item.sentiment_label) {
        sentiments[item.sentiment_label] = (sentiments[item.sentiment_label] || 0) + 1;
      }
    });

    // Generate topic trend insight
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topCategories.length > 0) {
      await db.from('content_insights').insert({
        user_id: userId,
        insight_type: 'topic_trend',
        title: `Your focus this week: ${topCategories[0][0]}`,
        description: `You've been working mostly on ${topCategories.map(([cat]) => cat).join(', ')} content.`,
        data: { categories: categoryCount, topKeywords: Object.entries(keywordCount).slice(0, 10) },
        relevance_score: 0.8,
        is_actionable: false,
        icon: '📊',
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Generate productivity tip
    if (totalWords > 5000) {
      await db.from('content_insights').insert({
        user_id: userId,
        insight_type: 'productivity_tip',
        title: 'Great productivity this week!',
        description: `You've processed ${totalWords.toLocaleString()} words. Keep up the momentum!`,
        data: { totalWords, clipCount: recentContent.length },
        relevance_score: 0.7,
        is_actionable: false,
        icon: '🚀',
        valid_until: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    logger.info(`Generated insights for user ${userId}`);
  } catch (error) {
    logger.error('Error generating insights:', error);
  }
}

/**
 * Dismiss an insight
 */
export async function dismissInsight(userId: string, insightId: string): Promise<void> {
  const db = getSupabase();

  const { error } = await db
    .from('content_insights')
    .update({ is_dismissed: true })
    .eq('id', insightId)
    .eq('user_id', userId);

  if (error) {
    logger.error('Error dismissing insight:', error);
    throw new Error('Failed to dismiss insight');
  }
}

/**
 * Mark insight as read
 */
export async function markInsightRead(userId: string, insightId: string): Promise<void> {
  const db = getSupabase();

  const { error } = await db
    .from('content_insights')
    .update({ is_read: true })
    .eq('id', insightId)
    .eq('user_id', userId);

  if (error) {
    logger.error('Error marking insight as read:', error);
  }
}
