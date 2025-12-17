import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Brain, TrendingUp, BookOpen,
  Tag, Clock, FileText, Sparkles, RefreshCw,
  X, Award, Flame, Languages, MessageSquare
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import * as analyticsService from '../services/analytics.service';
import type { ProductivityAnalytics, ContentInsight, DailyMetric } from '../services/analytics.service';

// ============================================
// COMPONENTS
// ============================================

// Productivity Score Gauge
const ProductivityGauge: React.FC<{ score: number }> = ({ score }) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 80) return '#22c55e';
    if (s >= 60) return '#84cc16';
    if (s >= 40) return '#eab308';
    if (s >= 20) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke={getColor(score)}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{score}</span>
        <span className="text-xs text-gray-500">Score</span>
      </div>
    </div>
  );
};

// Mini Bar Chart for daily metrics
const MiniBarChart: React.FC<{ data: DailyMetric[] }> = ({ data }) => {
  const last7Days = data.slice(-7);
  const maxValue = Math.max(...last7Days.map(d => d.clips + d.files), 1);

  return (
    <div className="flex items-end gap-1 h-16">
      {last7Days.map((day, i) => {
        const height = ((day.clips + day.files) / maxValue) * 100;
        const date = new Date(day.date);
        const isToday = new Date().toDateString() === date.toDateString();
        
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t transition-all ${isToday ? 'bg-purple-600' : 'bg-purple-400'}`}
              style={{ height: `${Math.max(height, 4)}%` }}
            />
            <span className="text-[10px] text-gray-400">
              {date.toLocaleDateString('en', { weekday: 'short' }).charAt(0)}
            </span>
          </div>
        );
      })}
    </div>
  );
};



// Insight Card
const InsightCard: React.FC<{
  insight: ContentInsight;
  onDismiss: (id: string) => void;
}> = ({ insight, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-100 dark:border-purple-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{insight.icon || '💡'}</span>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{insight.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
          </div>
        </div>
        <button
          onClick={() => onDismiss(insight.id)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN PAGE
// ============================================

const ProductivityAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const isPremium = subscription?.tier === 'PREMIUM';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<ProductivityAnalytics | null>(null);
  const [insights, setInsights] = useState<ContentInsight[]>([]);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      
      const [analyticsData, insightsData] = await Promise.all([
        analyticsService.getProductivityAnalytics(days),
        analyticsService.getContentInsights(5),
      ]);

      setAnalytics(analyticsData);
      setInsights(insightsData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDismissInsight = async (insightId: string) => {
    try {
      await analyticsService.dismissInsight(insightId);
      setInsights(prev => prev.filter(i => i.id !== insightId));
    } catch (err) {
      console.error('Error dismissing insight:', err);
    }
  };

  const handleGenerateInsights = async () => {
    try {
      setRefreshing(true);
      await analyticsService.generateInsights();
      const newInsights = await analyticsService.getContentInsights(5);
      setInsights(newInsights);
    } catch (err) {
      console.error('Error generating insights:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      </DashboardLayout>
    );
  }

  const summary = analytics?.summary;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            {t('analytics.title', 'Productivity Analytics')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('analytics.subtitle', 'Deep insights into your content and workflow')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  dateRange === range
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Premium Banner for Free Users */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <div>
                <p className="font-medium">Unlock Full Analytics</p>
                <p className="text-sm text-purple-200">Get AI insights, content analysis, and 90-day history</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors">
              Upgrade to Premium
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Productivity Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Productivity Score</span>
            </div>
          </div>
          <div className="flex justify-center">
            <ProductivityGauge score={summary?.avgProductivityScore || 0} />
          </div>
        </motion.div>

        {/* Total Words */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Words Captured</span>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {analyticsService.formatNumber(summary?.totalWords || 0)}
          </p>
          <p className="text-sm text-gray-500">
            ~{analyticsService.formatReadingTime((summary?.totalWords || 0) / 200 * 60)} reading time
          </p>
        </motion.div>

        {/* Current Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Streak</span>
          </div>
          <p className="text-4xl font-bold text-orange-600 mb-2">
            {summary?.currentStreak || 0}
          </p>
          <p className="text-sm text-gray-500">consecutive days</p>
        </motion.div>

        {/* Peak Hour */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Peak Productivity</span>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {summary?.peakHour != null ? `${summary.peakHour}:00` : '--'}
          </p>
          <p className="text-sm text-gray-500">most active hour</p>
        </motion.div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Trend</h2>
          </div>

          {analytics?.dailyMetrics && analytics.dailyMetrics.length > 0 ? (
            <div className="h-48">
              <MiniBarChart data={analytics.dailyMetrics} />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <p>No activity data yet</p>
            </div>
          )}

          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span className="text-sm text-gray-500">{summary?.totalClips || 0} clips</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-sm text-gray-500">{summary?.totalFiles || 0} files</span>
            </div>
          </div>
        </motion.div>

        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <Tag className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Categories</h2>
          </div>

          {summary?.topCategories && summary.topCategories.length > 0 ? (
            <div className="space-y-3">
              {summary.topCategories.map((category, i) => (
                <div key={category} className="flex items-center gap-3">
                  <span className="text-lg">{analyticsService.getCategoryIcon(category)}</span>
                  <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {category}
                  </span>
                  <span className="text-xs text-gray-400">#{i + 1}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Categories will appear as you clip content</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h2>
            {isPremium && (
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs font-medium rounded-full">
                Premium
              </span>
            )}
          </div>
          
          {isPremium && (
            <button
              onClick={handleGenerateInsights}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Generate New
            </button>
          )}
        </div>

        {!isPremium ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              AI-powered insights are available for Premium users
            </p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Upgrade to Premium
            </button>
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onDismiss={handleDismissInsight}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No insights yet. Keep clipping to generate personalized insights!</p>
          </div>
        )}
      </motion.div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
          <Languages className="w-5 h-5 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">EN</p>
          <p className="text-xs text-gray-500">Primary Language</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
          <BookOpen className="w-5 h-5 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">65</p>
          <p className="text-xs text-gray-500">Avg. Readability</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
          <MessageSquare className="w-5 h-5 mx-auto mb-2 text-purple-500" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">😊</p>
          <p className="text-xs text-gray-500">Avg. Sentiment</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
          <TrendingUp className="w-5 h-5 mx-auto mb-2 text-orange-500" />
          <p className="text-2xl font-bold text-green-600">+12%</p>
          <p className="text-xs text-gray-500">vs Last Week</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductivityAnalyticsPage;
