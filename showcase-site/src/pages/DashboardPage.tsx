import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut,
  Crown,
  FileText,
  Clock,
  TrendingUp,
  Zap,
  Plus,
  Settings,
  Sparkles,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { authService } from '../services/auth.service';
import { subscriptionService } from '../services/subscription.service';
import type { Subscription, UsageRecord } from '../services/subscription.service';
import type { AuthUser } from '../services/auth.service';
import { NotionClipperLogo } from '../assets/Logo.tsx';
import { Button, Card, Badge } from '../components/ui';
import { containerVariants, itemVariants } from '../lib/animations';

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageRecord | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
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

        setSubscription(sub);
        setUsage(usageData);
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate('/');
    } catch (err: any) {
      console.error('Error signing out:', err);
    }
  };

  const handleUpgradeToPremium = async () => {
    try {
      setLoadingCheckout(true);
      const checkoutUrl = await subscriptionService.createCheckoutSession(
        window.location.origin
      );
      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setLoadingCheckout(false);
    }
  };

  const quotas = subscription
    ? subscriptionService.getQuotasForTier(subscription.tier)
    : null;
  const isPremium = subscription?.tier === 'premium';
  const isFreeTier = subscription?.tier === 'free' || subscription?.tier === 'grace_period';

  const clipsUsagePercent = quotas?.clips
    ? Math.min(((usage?.clips_count || 0) / quotas.clips) * 100, 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <NotionClipperLogo size={64} />
          <div className="w-48 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Header */}
      <header className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <NotionClipperLogo size={32} />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                NotionClipper
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Badge variant={isPremium ? 'gradient' : 'secondary'}>
                {isPremium ? (
                  <>
                    <Crown className="w-3 h-3" />
                    <span className="font-bold">PRO</span>
                  </>
                ) : (
                  'FREE'
                )}
              </Badge>
              <Button variant="ghost" onClick={handleSignOut} leftIcon={<LogOut size={18} />}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome Hero */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {authUser?.profile?.full_name || authUser?.user.email?.split('@')[0] || 'User'}
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Here's your clipping activity overview
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
            {/* Clips Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                    <FileText className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                  <Badge variant="secondary" size="sm">
                    {quotas?.clips === -1 ? 'Unlimited' : `${quotas?.clips || 0} max`}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Clips This Month</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {usage?.clips_count || 0}
                    </span>
                    {quotas?.clips !== -1 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        / {quotas?.clips || 0}
                      </span>
                    )}
                  </div>
                  {/* Progress Bar */}
                  {quotas?.clips !== -1 && (
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-3">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${clipsUsagePercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Focus Time Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <Clock className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <Badge variant="secondary" size="sm">
                    This Month
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Focus Time</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {Math.floor((usage?.focus_mode_minutes || 0) / 60)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">hours</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {usage?.focus_mode_minutes || 0} minutes total
                  </p>
                </div>
              </div>
            </Card>

            {/* Activity Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={24} />
                  </div>
                  <Badge variant="success" size="sm">
                    <Activity className="w-3 h-3" />
                    Active
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Activity</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {(usage?.clips_count || 0) + (usage?.files_count || 0)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">actions</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Clips + Files combined
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="text-purple-600 dark:text-purple-400" size={24} />
              Quick Actions
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="card-interactive p-6 text-left"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4">
                  <Plus className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">New Clip</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create a new clip</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="card-interactive p-6 text-left"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Sync Now</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sync with Notion</p>
              </motion.button>

              <Link to="/pricing">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="card-interactive p-6"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4">
                    <Crown className="text-white" size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Upgrade</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View plans</p>
                </motion.div>
              </Link>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="card-interactive p-6 text-left"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 rounded-2xl flex items-center justify-center mb-4">
                  <Settings className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure app</p>
              </motion.button>
            </div>
          </motion.div>

          {/* Upgrade CTA for Free Users */}
          {isFreeTier && (
            <motion.div variants={itemVariants}>
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="relative p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge variant="gradient" size="lg" className="mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-bold">Unlock Premium</span>
                      </Badge>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Ready for unlimited clips?
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">
                        Upgrade to Premium for unlimited clips, offline mode, desktop app, and priority support.
                        <span className="font-semibold text-purple-600 dark:text-purple-400"> Lock in $2.99/mo forever.</span>
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Button
                          variant="accent"
                          size="lg"
                          onClick={handleUpgradeToPremium}
                          isLoading={loadingCheckout}
                          rightIcon={<ArrowUpRight size={20} />}
                        >
                          Upgrade to Premium
                        </Button>
                        <Link to="/pricing">
                          <Button variant="secondary" size="lg">
                            View All Plans
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Account Info */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
            {/* Profile */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {authUser?.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Member Since</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {authUser?.profile?.created_at
                      ? new Date(authUser.profile.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Plan Status</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {subscription?.status || 'Active'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Usage Breakdown */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Monthly Breakdown
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <FileText className="text-purple-600 dark:text-purple-400" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Clips</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {usage?.clips_count || 0} / {quotas?.clips === -1 ? '∞' : quotas?.clips || 0}
                      </p>
                    </div>
                  </div>
                  <Badge variant="purple" size="sm">
                    {quotas?.clips === -1 ? '∞' : `${Math.round(clipsUsagePercent)}%`}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <FileText className="text-blue-600 dark:text-blue-400" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Files</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {usage?.files_count || 0} / {quotas?.files === -1 ? '∞' : quotas?.files || 0}
                      </p>
                    </div>
                  </div>
                  <Badge variant="blue" size="sm">
                    {usage?.files_count || 0}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                      <Clock className="text-indigo-600 dark:text-indigo-400" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Focus Mode</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {usage?.focus_mode_minutes || 0} min
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" size="sm">
                    {Math.floor((usage?.focus_mode_minutes || 0) / 60)}h
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
