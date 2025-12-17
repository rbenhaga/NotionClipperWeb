import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Crown,
  FileText,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Zap,
  WifiOff,
  Clock,
  CheckCircle,
  Monitor,
  Rocket,
  Heart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../services/auth.service';
import { subscriptionService } from '../services/subscription.service';
import type { Subscription, UsageRecord } from '../services/subscription.service';
import type { AuthUser } from '../services/auth.service';
import { ClipperProLogo } from '../assets/Logo';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  action?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
  progress?: {
    current: number;
    max: number;
  };
}

function StatCard({ title, value, subtitle, icon, gradient, action, progress }: StatCardProps) {
  const progressPercent = progress ? Math.min((progress.current / progress.max) * 100, 100) : 0;
  const isWarning = progressPercent > 80;
  
  return (
    <motion.div
      {...fadeInUp}
      className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${gradient}`}>
          {icon}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            disabled={action.loading}
            className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            {action.loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {action.label}
                <ArrowUpRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
      
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
      
      {progress && (
        <div className="mt-4 space-y-2">
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isWarning ? 'bg-orange-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{progress.current} used</span>
            <span>{progress.max} limit</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}



export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageRecord | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const loadData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const user = await authService.getCurrentUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setAuthUser(user);

      const [sub, usageData] = await Promise.all([
        subscriptionService.getCurrentSubscription(),
        subscriptionService.getCurrentUsage(),
      ]);

      console.log('Dashboard - Subscription:', sub);
      setSubscription(sub);
      setUsage(usageData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived state
  const isPremium = subscription?.tier === 'PREMIUM';
  const quotas = subscription 
    ? subscriptionService.getQuotasForTier(subscription.tier)
    : subscriptionService.getQuotasForTier('FREE');
  const clipsUsed = usage?.clips_count || 0;
  const clipsLimit = quotas?.clips || 100;

  // Handlers
  const handleUpgrade = async () => {
    const token = authService.getToken();
    if (!token) {
      navigate('/auth?checkout=true&plan=premium_monthly');
      return;
    }

    setUpgradeLoading(true);
    try {
      const response = await fetch(`${apiUrl}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: 'premium_monthly' }),
      });

      const result = await response.json();
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      navigate('/pricing');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    const token = authService.getToken();
    if (!token) return;

    try {
      const response = await fetch(`${apiUrl}/stripe/create-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });

      const result = await response.json();
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <ClipperProLogo size={56} />
          <div className="w-40 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  const userName = authUser?.profile?.full_name || authUser?.user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardSidebar />

      <main className="ml-72 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.header {...fadeInUp} className="mb-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {isPremium ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold rounded-full">
                      <Crown className="w-4 h-4" />
                      {t('dashboard.status.premium', 'Premium')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
                      {t('dashboard.status.free', 'Free Plan')}
                    </span>
                  )}
                  {subscription?.cancel_at_period_end ? (
                    <span className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                      <Clock className="w-3 h-3" />
                      {t('dashboard.status.canceling', 'Canceling')} {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : ''}
                    </span>
                  ) : subscription?.status === 'active' && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      {t('dashboard.status.active', 'Active')}
                    </span>
                  )}
                  {subscription?.status === 'trialing' && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <Sparkles className="w-3 h-3" />
                      {t('dashboard.status.trial', 'Trial')}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {t('dashboard.welcome', 'Welcome back')}, {userName}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                  {isPremium 
                    ? t('dashboard.stats.unlimited', 'You have unlimited access to all features.')
                    : `${clipsUsed} / ${clipsLimit} ${t('dashboard.stats.clipsUsed', 'clips used this month')}.`}
                </p>
              </div>
              
              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </motion.header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard
              title="Subscription"
              value={isPremium ? (subscription?.cancel_at_period_end ? 'Canceling' : 'Premium') : 'Free'}
              subtitle={isPremium && subscription?.current_period_end 
                ? subscription?.cancel_at_period_end
                  ? `Ends ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  : subscription?.status === 'trialing'
                    ? `Trial ends ${new Date(subscription.current_period_end).toLocaleDateString()}`
                    : `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`
                : undefined}
              icon={<Crown className={isPremium ? 'text-white' : 'text-gray-500'} size={22} />}
              gradient={isPremium 
                ? subscription?.cancel_at_period_end
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                  : 'bg-gradient-to-br from-purple-500 to-purple-600' 
                : 'bg-gray-100 dark:bg-gray-800'}
              action={isPremium 
                ? { label: 'Manage', onClick: handleManageSubscription }
                : { label: 'Upgrade', onClick: handleUpgrade, loading: upgradeLoading }}
            />

            <StatCard
              title="Clips This Month"
              value={isPremium ? '∞' : clipsUsed}
              subtitle={isPremium ? 'Unlimited' : undefined}
              icon={<FileText className="text-white" size={22} />}
              gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              progress={!isPremium ? { current: clipsUsed, max: clipsLimit } : undefined}
            />

            <StatCard
              title="Total Activity"
              value={(usage?.clips_count || 0) + (usage?.files_count || 0)}
              subtitle={`${usage?.clips_count || 0} clips · ${usage?.files_count || 0} files`}
              icon={<TrendingUp className="text-white" size={22} />}
              gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
            />
          </div>

          {/* Premium Features Section - Clean Minimal Design */}
          {isPremium && (
            <motion.section {...fadeInUp} className="mb-10">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t('dashboard.premium.title', 'Your Premium Features')}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('dashboard.premium.subtitle', 'Full access to all features')}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                  Active
                </span>
              </div>

              {/* Features Grid - Clean Cards */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Clipboard Capture */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {t('dashboard.premium.clipboardCapture', 'Clipboard Capture')}
                        </h3>
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {t('dashboard.premium.clipboardCaptureDesc', 'Instantly capture text, images, and links to Notion')}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Chrome Extension */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {t('dashboard.premium.chromeExtension', 'Chrome Extension')}
                        </h3>
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {t('dashboard.premium.chromeExtensionDesc', 'Save web content directly from your browser')}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Offline Mode */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <WifiOff className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {t('dashboard.premium.offlineMode', 'Offline Mode')}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                          {t('dashboard.premium.comingSoon', 'Soon')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {t('dashboard.premium.offlineModeDesc', 'Queue clips locally and sync when back online')}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Desktop App */}
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                      <Monitor className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {t('dashboard.premium.desktopApp', 'Desktop App')}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                          {t('dashboard.premium.comingSoon', 'Soon')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {t('dashboard.premium.desktopAppDesc', 'Native app for macOS and Windows')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Benefits Bar - Minimal */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('dashboard.premium.thankYou', 'Thank you for supporting Clipper Pro!')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-bold text-purple-600 dark:text-purple-400">∞</span>
                      <span>Clips</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-bold text-blue-600 dark:text-blue-400">∞</span>
                      <span>Files</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Rocket className="w-4 h-4 text-amber-500" />
                      <span>Early Access</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Features Section for Free Users - Comparison */}
          {!isPremium && (
            <motion.section {...fadeInUp} className="mb-10">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('dashboard.free.yourPlan', 'Your Free Plan')}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('dashboard.free.currentFeatures', 'Features included in your plan')}
                  </p>
                </div>
              </div>

              {/* Comparison Grid */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Header Row */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('dashboard.free.feature', 'Feature')}
                  </div>
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                      Free
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-xs font-semibold">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  </div>
                </div>

                {/* Feature Rows */}
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {/* Clips per month */}
                  <div className="grid grid-cols-3 gap-4 p-4 items-center">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t('dashboard.free.clipsMonth', 'Clips per month')}</span>
                    </div>
                    <div className="text-center text-sm font-medium text-gray-900 dark:text-white">100</div>
                    <div className="text-center text-sm font-bold text-purple-600 dark:text-purple-400">∞ Unlimited</div>
                  </div>

                  {/* File uploads */}
                  <div className="grid grid-cols-3 gap-4 p-4 items-center">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t('dashboard.free.fileUploads', 'File uploads')}</span>
                    </div>
                    <div className="text-center text-sm font-medium text-gray-900 dark:text-white">50</div>
                    <div className="text-center text-sm font-bold text-purple-600 dark:text-purple-400">∞ Unlimited</div>
                  </div>

                  {/* Clipboard Capture */}
                  <div className="grid grid-cols-3 gap-4 p-4 items-center">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t('dashboard.premium.clipboardCapture', 'Clipboard Capture')}</span>
                    </div>
                    <div className="text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></div>
                    <div className="text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></div>
                  </div>

                  {/* Chrome Extension */}
                  <div className="grid grid-cols-3 gap-4 p-4 items-center">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t('dashboard.premium.chromeExtension', 'Chrome Extension')}</span>
                    </div>
                    <div className="text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></div>
                    <div className="text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></div>
                  </div>

                  {/* Priority Support */}
                  <div className="grid grid-cols-3 gap-4 p-4 items-center">
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t('dashboard.free.prioritySupport', 'Priority Support')}</span>
                    </div>
                    <div className="text-center text-gray-400">—</div>
                    <div className="text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></div>
                  </div>

                  {/* Early Access */}
                  <div className="grid grid-cols-3 gap-4 p-4 items-center">
                    <div className="flex items-center gap-3">
                      <Rocket className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t('dashboard.free.earlyAccess', 'Early Access')}</span>
                    </div>
                    <div className="text-center text-gray-400">—</div>
                    <div className="text-center"><CheckCircle className="w-5 h-5 text-green-500 mx-auto" /></div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Upgrade CTA for Free Users - Clean Design */}
          {!isPremium && (
            <motion.section {...fadeInUp}>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {t('dashboard.free.upgradeTitle', 'Upgrade to Premium')}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full uppercase">
                          {t('dashboard.free.earlyBird', 'Early Bird')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                        {t('dashboard.free.upgradeDesc', 'Unlimited clips, priority support, and early access. Lock in $2.99/mo forever.')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleUpgrade}
                    disabled={upgradeLoading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25"
                  >
                    {upgradeLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        {t('dashboard.free.processing', 'Processing...')}
                      </>
                    ) : (
                      <>
                        {t('dashboard.free.upgradeNow', 'Upgrade Now')}
                        <ArrowUpRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </div>
      </main>
    </div>
  );
}
