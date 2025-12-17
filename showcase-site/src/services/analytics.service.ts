/**
 * Analytics Service
 * Frontend service for content analytics and productivity metrics
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ============================================
// TYPES
// ============================================

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
  sentimentLabel: 'positive' | 'negative' | 'neutral' | 'mixed';
  readabilityScore: number;
  readingTimeSeconds: number;
}

export interface ProductivitySummary {
  totalClips: number;
  totalFiles: number;
  totalWords: number;
  avgProductivityScore: number;
  currentStreak: number;
  peakHour: number | null;
  topCategories: string[];
}

export interface DailyMetric {
  date: string;
  clips: number;
  files: number;
  words: number;
  score: number;
}

export interface ProductivityAnalytics {
  summary: ProductivitySummary;
  dailyMetrics: DailyMetric[];
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
// API FUNCTIONS
// ============================================

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Store content for analysis
 */
export async function storeContent(data: {
  contentType: string;
  rawContent: string;
  parsedContent?: string;
  parsedBlocks?: any[];
  activityLogId?: string;
  fileType?: string;
  fileSizeBytes?: number;
  filePages?: number;
}): Promise<{ contentId: string }> {
  const response = await fetch(`${API_URL}/analytics/content`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to store content');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Analyze content without storing
 */
export async function analyzeContent(content: string): Promise<ContentAnalysis> {
  const response = await fetch(`${API_URL}/analytics/analyze`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze content');
  }

  const result = await response.json();
  return result.data.analysis;
}

/**
 * Get productivity analytics
 */
export async function getProductivityAnalytics(days: number = 30): Promise<ProductivityAnalytics> {
  try {
    const response = await fetch(`${API_URL}/analytics/productivity?days=${days}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      // Return default data if API fails (tables not yet created)
      console.warn('Analytics API not available, using default data');
      return getDefaultAnalytics();
    }

    const result = await response.json();
    return result.data || getDefaultAnalytics();
  } catch (error) {
    console.warn('Analytics API error, using default data:', error);
    return getDefaultAnalytics();
  }
}

/**
 * Get default analytics data (fallback)
 */
function getDefaultAnalytics(): ProductivityAnalytics {
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

/**
 * Get content insights
 */
export async function getContentInsights(limit: number = 10): Promise<ContentInsight[]> {
  try {
    const response = await fetch(`${API_URL}/analytics/insights?limit=${limit}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      // Return empty array if API fails (tables not yet created)
      console.warn('Insights API not available');
      return [];
    }

    const result = await response.json();
    return result.data?.insights || [];
  } catch (error) {
    console.warn('Insights API error:', error);
    return [];
  }
}

/**
 * Generate new insights
 */
export async function generateInsights(): Promise<void> {
  const response = await fetch(`${API_URL}/analytics/insights/generate`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to generate insights');
  }
}

/**
 * Dismiss an insight
 */
export async function dismissInsight(insightId: string): Promise<void> {
  const response = await fetch(`${API_URL}/analytics/insights/${insightId}/dismiss`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to dismiss insight');
  }
}

/**
 * Mark insight as read
 */
export async function markInsightRead(insightId: string): Promise<void> {
  const response = await fetch(`${API_URL}/analytics/insights/${insightId}/read`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to mark insight as read');
  }
}

/**
 * Refresh daily metrics
 */
export async function refreshMetrics(): Promise<void> {
  const response = await fetch(`${API_URL}/analytics/metrics/refresh`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh metrics');
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format reading time
 */
export function formatReadingTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get sentiment color
 */
export function getSentimentColor(label: string): string {
  switch (label) {
    case 'positive': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    case 'negative': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    case 'mixed': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
  }
}

/**
 * Get readability label
 */
export function getReadabilityLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Very Easy', color: 'text-green-600' };
  if (score >= 60) return { label: 'Easy', color: 'text-green-500' };
  if (score >= 40) return { label: 'Moderate', color: 'text-yellow-600' };
  if (score >= 20) return { label: 'Difficult', color: 'text-orange-600' };
  return { label: 'Very Difficult', color: 'text-red-600' };
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    technology: '💻',
    business: '💼',
    research: '🔬',
    personal: '📝',
    education: '📚',
    creative: '🎨',
    productivity: '⚡',
    news: '📰',
    general: '📄',
  };
  return icons[category] || '📄';
}

/**
 * Format large numbers
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
