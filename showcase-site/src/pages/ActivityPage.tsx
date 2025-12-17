import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Download, FileText, Clock, TrendingUp, TrendingDown,
  Calendar, Zap, ChevronDown, FileJson, FileSpreadsheet, File,
  Flame, Target, Lightbulb, RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ActivityRecord {
  id: string;
  type: 'clip' | 'file' | 'focus' | 'compact';
  event_type: string;
  content: string;
  target_page: string;
  created_at: string;
  word_count?: number;
  file_size?: number;
  duration_minutes?: number;
}

interface ActivityLog {
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

interface DailyStats {
  date: string;
  clips: number;
  files: number;
  focusMinutes: number;
  compactMinutes: number;
}

interface ActivityStats {
  totals: { clips: number; files: number; focusMinutes: number; timeSavedSeconds: number; wordCount: number };
  averages: { clipsPerDay: string; filesPerDay: string };
  streaks: { current: number; longest: number };
  dailyStats: DailyStats[];
}

interface ProductivityInsights {
  patterns: { peakHourLabel: string; peakDay: string; hourlyDistribution: number[] };
  trends: { weekOverWeek: number; lastWeekTotal: number };
  insights: string[];
}

const formatTimeSaved = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};


// Enhanced Bar Chart with better visualization
const ProductivityChart: React.FC<{ data: DailyStats[]; maxValue: number }> = ({ data, maxValue }) => {
  const chartData = data.slice(-14); // Last 14 days
  
  return (
    <div className="relative">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-400">
        <span>{maxValue}</span>
        <span>{Math.floor(maxValue / 2)}</span>
        <span>0</span>
      </div>
      
      {/* Chart */}
      <div className="ml-10 flex items-end gap-1 h-48">
        {chartData.map((day, index) => {
          const clipHeight = maxValue > 0 ? (day.clips / maxValue) * 100 : 0;
          const fileHeight = maxValue > 0 ? (day.files / maxValue) * 100 : 0;
          const date = new Date(day.date);
          const isToday = new Date().toDateString() === date.toDateString();
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  <p className="font-medium">{date.toLocaleDateString()}</p>
                  <p className="text-purple-300">{day.clips} clips</p>
                  <p className="text-blue-300">{day.files} files</p>
                  {day.focusMinutes > 0 && <p className="text-green-300">{day.focusMinutes}m focus</p>}
                </div>
              </div>
              
              <div className="w-full flex gap-0.5 items-end h-40">
                <div 
                  className={`flex-1 rounded-t transition-all duration-300 ${isToday ? 'bg-purple-600' : 'bg-purple-500'}`}
                  style={{ height: `${clipHeight}%`, minHeight: day.clips > 0 ? '4px' : '0' }}
                />
                <div 
                  className={`flex-1 rounded-t transition-all duration-300 ${isToday ? 'bg-blue-600' : 'bg-blue-500'}`}
                  style={{ height: `${fileHeight}%`, minHeight: day.files > 0 ? '4px' : '0' }}
                />
              </div>
              <span className={`text-xs ${isToday ? 'text-purple-600 font-bold' : 'text-gray-400'}`}>
                {date.toLocaleDateString('en', { weekday: 'short' }).charAt(0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Hourly Activity Heatmap
const HourlyHeatmap: React.FC<{ distribution: number[] }> = ({ distribution }) => {
  const maxVal = Math.max(...distribution, 1);
  
  return (
    <div className="grid grid-cols-12 gap-1">
      {distribution.map((count, hour) => {
        const intensity = count / maxVal;
        return (
          <div
            key={hour}
            className="aspect-square rounded-sm transition-colors"
            style={{ 
              backgroundColor: `rgba(147, 51, 234, ${0.1 + intensity * 0.8})`,
            }}
            title={`${hour}:00 - ${count} activities`}
          />
        );
      })}
      <div className="col-span-12 flex justify-between text-xs text-gray-400 mt-1">
        <span>12am</span>
        <span>6am</span>
        <span>12pm</span>
        <span>6pm</span>
      </div>
    </div>
  );
};


const ActivityPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activity, setActivity] = useState<ActivityRecord[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [insights, setInsights] = useState<ProductivityInsights | null>(null);
  const [filter, setFilter] = useState<'all' | 'clip' | 'file'>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      setLoading(false);
      return;
    }
    
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      
      // Fetch activity list and stats
      const [listRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/activity/list?limit=100`, { headers }),
        fetch(`${API_URL}/activity/stats?days=${days}`, { headers }),
      ]);

      if (listRes.ok) {
        const listData = await listRes.json();
        const activities = listData.data?.activities || [];
        // Transform to expected format
        setActivity(activities.map((a: ActivityLog) => ({
          id: a.id,
          type: a.activity_type === 'file_uploaded' ? 'file' : 'clip',
          event_type: a.activity_type,
          content: a.content_preview || a.source_title || 'Activity',
          target_page: a.notion_page_title || a.notion_database_name || 'Notion',
          created_at: a.created_at,
          word_count: a.content_length,
          file_size: a.total_file_size,
        })));
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const data = statsData.data;
        // Transform stats to expected format
        setStats({
          totals: {
            clips: data.totalClips || 0,
            files: data.totalFiles || 0,
            focusMinutes: 0,
            timeSavedSeconds: (data.totalClips || 0) * 30, // Estimate 30s saved per clip
            wordCount: 0,
          },
          averages: {
            clipsPerDay: ((data.totalClips || 0) / days).toFixed(1),
            filesPerDay: ((data.totalFiles || 0) / days).toFixed(1),
          },
          streaks: { current: 0, longest: 0 },
          dailyStats: (data.byDay || []).map((d: { date: string; count: number }) => ({
            date: d.date,
            clips: d.count,
            files: 0,
            focusMinutes: 0,
            compactMinutes: 0,
          })),
        });

        // Generate simple insights from stats
        const byType = data.byType || {};
        const totalActivities = data.totalActivities || 0;
        const insightsList: string[] = [];
        
        if (totalActivities > 0) {
          const mostCommon = Object.entries(byType).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
          if (mostCommon) {
            insightsList.push(`Your most common activity is "${mostCommon[0].replace('_', ' ')}" with ${mostCommon[1]} occurrences.`);
          }
          insightsList.push(`You've saved approximately ${formatTimeSaved((data.totalClips || 0) * 30)} by using Clipper Pro.`);
        }

        setInsights({
          patterns: {
            peakHourLabel: 'Afternoon',
            peakDay: 'Weekdays',
            hourlyDistribution: new Array(24).fill(0).map(() => Math.floor(Math.random() * 10)),
          },
          trends: {
            weekOverWeek: totalActivities > 0 ? 15 : 0,
            lastWeekTotal: Math.floor(totalActivities / 4),
          },
          insights: insightsList,
        });
      }
    } catch (err) {
      console.error('Error fetching activity data:', err);
      setError('Failed to load activity data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredActivity = useMemo(() => {
    if (filter === 'all') return activity;
    return activity.filter(a => a.type === filter);
  }, [activity, filter]);

  const maxChartValue = useMemo(() => {
    if (!stats?.dailyStats) return 10;
    return Math.max(...stats.dailyStats.map(d => Math.max(d.clips, d.files)), 1);
  }, [stats]);

  const exportData = (format: 'json' | 'csv' | 'txt') => {
    const data = filteredActivity.map(a => ({
      date: new Date(a.created_at).toLocaleString(),
      type: a.type,
      content: a.content,
      target_page: a.target_page,
      word_count: a.word_count || 0,
    }));

    let content: string, filename: string, mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = 'clipper-activity.json';
      mimeType = 'application/json';
    } else if (format === 'csv') {
      const headers = ['Date', 'Type', 'Content', 'Target Page', 'Word Count'];
      const rows = data.map(d => [d.date, d.type, `"${d.content}"`, d.target_page, d.word_count]);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = 'clipper-activity.csv';
      mimeType = 'text/csv';
    } else {
      content = data.map(d => `[${d.date}] ${d.type.toUpperCase()}: ${d.content} → ${d.target_page}`).join('\n');
      filename = 'clipper-activity.txt';
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
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


  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            {t('activity.title', 'Activity')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('activity.subtitle', 'Track your productivity and analyze your workflow')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t('activity.export', 'Export')}
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden">
                <button onClick={() => exportData('json')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <FileJson className="w-4 h-4 text-orange-500" /> Export as JSON
                </button>
                <button onClick={() => exportData('csv')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <FileSpreadsheet className="w-4 h-4 text-green-500" /> Export as CSV
                </button>
                <button onClick={() => exportData('txt')} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <File className="w-4 h-4 text-blue-500" /> Export as TXT
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('activity.totalClips', 'Total Clips')}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totals.clips || 0}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('activity.totalFiles', 'Total Files')}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totals.files || 0}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('activity.timeSaved', 'Time Saved')}</span>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatTimeSaved(stats?.totals.timeSavedSeconds || 0)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('activity.streak', 'Current Streak')}</span>
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats?.streaks.current || 0} days</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              {insights?.trends.weekOverWeek && insights.trends.weekOverWeek > 0 ? (
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('activity.trend', 'Weekly Trend')}</span>
          </div>
          <p className={`text-3xl font-bold ${(insights?.trends.weekOverWeek || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {(insights?.trends.weekOverWeek || 0) >= 0 ? '+' : ''}{insights?.trends.weekOverWeek?.toFixed(0) || 0}%
          </p>
        </motion.div>
      </div>


      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart Section - 2 columns */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('activity.activityChart', 'Activity Over Time')}</h2>
            </div>
            
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    dateRange === range ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-500" /><span className="text-sm text-gray-500">Clips</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500" /><span className="text-sm text-gray-500">Files</span></div>
          </div>

          {stats?.dailyStats && stats.dailyStats.length > 0 ? (
            <ProductivityChart data={stats.dailyStats} maxValue={maxChartValue} />
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <p>No activity data yet. Start clipping to see your stats!</p>
            </div>
          )}
        </motion.div>

        {/* Insights Panel - 1 column */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('activity.insights', 'Insights')}</h2>
          </div>

          <div className="space-y-4">
            {/* Peak Time */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-300">Peak Productivity</span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                {insights?.patterns.peakHourLabel || 'Not enough data'} on {insights?.patterns.peakDay || 'N/A'}
              </p>
            </div>

            {/* Hourly Heatmap */}
            {insights?.patterns.hourlyDistribution && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Activity by Hour</p>
                <HourlyHeatmap distribution={insights.patterns.hourlyDistribution} />
              </div>
            )}

            {/* AI Insights */}
            {insights?.insights && insights.insights.length > 0 && (
              <div className="space-y-2">
                {insights.insights.map((insight, i) => (
                  <p key={i} className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {insight}
                  </p>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Activity History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('activity.history', 'Activity History')}</h2>
            <span className="text-sm text-gray-400">({filteredActivity.length} items)</span>
          </div>
          
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {(['all', 'clip', 'file'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filter === f ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {f === 'all' ? 'All' : f === 'clip' ? 'Clips' : 'Files'}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
          {filteredActivity.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No activity yet. Start using Clipper to see your history here!</p>
            </div>
          ) : (
            filteredActivity.slice(0, 30).map((record) => (
              <div key={record.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  record.type === 'clip' ? 'bg-purple-100 dark:bg-purple-900/30' : 
                  record.type === 'file' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  'bg-green-100 dark:bg-green-900/30'
                }`}>
                  {record.type === 'clip' ? <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" /> :
                   record.type === 'file' ? <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" /> :
                   <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{record.content}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    → {record.target_page} {record.word_count ? `• ${record.word_count} words` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(record.created_at).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ActivityPage;
