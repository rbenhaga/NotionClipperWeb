import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut,
  Crown,
  FileText,
  Clock,
  TrendingUp,
  Zap,
  Settings,
  Sparkles,
  ArrowUpRight,
  Activity,
  Calendar,
  BarChart3,
  CheckCircle2,
  AlertCircle,
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
      {/* Premium Animated Background - 4 gradient orbs like Apple */}
      <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/4 w-[28rem] h-[28rem] bg-indigo-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-[24rem] h-[24rem] bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />

      {/* Premium Header */}
      <header className="relative z-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <NotionClipperLogo size={32} />
              </motion.div>
              <span className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white group-hover:opacity-80 transition-opacity">
                NotionClipper
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Badge variant={isPremium ? 'gradient' : 'secondary'} size="md">
                {isPremium ? (
                  <>
                    <Crown className="w-3.5 h-3.5" />
                    <span className="font-semibold">PRO</span>
                  </>
                ) : (
                  <span className="font-medium">FREE</span>
                )}
              </Badge>
              <Button
                variant="ghost"
                size="md"
                onClick={handleSignOut}
                leftIcon={<LogOut size={18} />}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Hero Section - Left-aligned like Apple */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary" size="sm">
                <Activity className="w-3 h-3" />
                <span>Dashboard</span>
              </Badge>
              <Badge variant={subscription?.status === 'active' ? 'success' : 'secondary'} size="sm">
                {subscription?.status === 'active' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    <span>Inactive</span>
                  </>
                )}
              </Badge>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
              <span className="text-gray-900 dark:text-white">Welcome back,</span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {authUser?.profile?.full_name || authUser?.user.email?.split('@')[0] || 'User'}
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
              {isPremium
                ? 'You\'re clipping without limits. Here\'s your activity overview.'
                : `You've used ${usage?.clips_count || 0} of ${quotas?.clips || 0} clips this month.`
              }
            </p>
          </motion.div>

          {/* Premium Stats Grid - Enhanced Design */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Clips Card */}
            <motion.div
              className="card-interactive relative overflow-hidden group"
              whileHover={{ y: -4 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors duration-500" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="text-white" size={24} />
                  </div>
                  <Badge variant="purple" size="sm">
                    {quotas?.clips === -1 ? '∞' : `${quotas?.clips || 0} max`}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Clips This Month
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
                      {usage?.clips_count || 0}
                    </span>
                    {quotas?.clips !== -1 && (
                      <span className="text-lg text-gray-500 dark:text-gray-400">
                        / {quotas?.clips || 0}
                      </span>
                    )}
                  </div>
                </div>
                {quotas?.clips !== -1 && (
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${clipsUsagePercent}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Focus Time Card */}
            <motion.div
              className="card-interactive relative overflow-hidden group"
              whileHover={{ y: -4 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors duration-500" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock className="text-white" size={24} />
                  </div>
                  <Badge variant="blue" size="sm">
                    This Month
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Focus Time
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
                      {Math.floor((usage?.focus_mode_minutes || 0) / 60)}
                    </span>
                    <span className="text-lg text-gray-500 dark:text-gray-400">hours</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {usage?.focus_mode_minutes || 0} minutes total
                </p>
              </div>
            </motion.div>

            {/* Activity Card */}
            <motion.div
              className="card-interactive relative overflow-hidden group"
              whileHover={{ y: -4 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors duration-500" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                  <Badge variant="success" size="sm">
                    <Activity className="w-3 h-3" />
                    Live
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Total Actions
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
                      {(usage?.clips_count || 0) + (usage?.files_count || 0)}
                    </span>
                    <span className="text-lg text-gray-500 dark:text-gray-400">total</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Clips + Files combined
                </p>
              </div>
            </motion.div>

            {/* Files Card */}
            <motion.div
              className="card-interactive relative overflow-hidden group"
              whileHover={{ y: -4 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors duration-500" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="text-white" size={24} />
                  </div>
                  <Badge variant="secondary" size="sm">
                    {quotas?.files === -1 ? '∞' : `${quotas?.files || 0} max`}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Files Synced
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
                      {usage?.files_count || 0}
                    </span>
                    {quotas?.files !== -1 && (
                      <span className="text-lg text-gray-500 dark:text-gray-400">
                        / {quotas?.files || 0}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Documents and media
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Quick Actions - Premium Design */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Quick Actions
              </h2>
              <Badge variant="secondary" size="sm">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </span>
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="card-interactive p-6 text-left group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Zap className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Quick Clip
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Instant clipboard capture
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="card-interactive p-6 text-left group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Activity className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Sync Now
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sync with Notion
                </p>
              </motion.button>

              <Link to="/pricing" className="block">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="card-interactive p-6 group h-full"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                    <Crown className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {isPremium ? 'Manage Plan' : 'Upgrade'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isPremium ? 'View subscription' : 'Unlock premium'}
                  </p>
                </motion.div>
              </Link>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="card-interactive p-6 text-left group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Settings className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Settings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure preferences
                </p>
              </motion.button>
            </div>
          </motion.div>

          {/* Upgrade CTA for Free Users - Premium Design */}
          {isFreeTier && (
            <motion.div variants={itemVariants}>
              <div className="relative overflow-hidden rounded-3xl">
                {/* Premium gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                {/* Content */}
                <div className="relative z-10 p-12 lg:p-16">
                  <div className="max-w-4xl">
                    <Badge variant="secondary" size="lg" className="mb-6 bg-white/20 backdrop-blur-sm text-white border-white/30">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold">Unlock Premium</span>
                    </Badge>

                    <h3 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
                      Ready for unlimited clips?
                    </h3>

                    <p className="text-xl text-purple-100 mb-8 max-w-2xl leading-relaxed">
                      Upgrade to Premium for unlimited clips, offline mode, desktop app, and priority support.
                      <span className="font-semibold text-white"> Lock in $2.99/mo forever.</span>
                    </p>

                    <div className="flex flex-wrap gap-4">
                      <Button
                        variant="accent"
                        size="lg"
                        onClick={handleUpgradeToPremium}
                        isLoading={loadingCheckout}
                        rightIcon={<ArrowUpRight size={20} />}
                        className="bg-white text-purple-600 hover:bg-gray-50 shadow-apple-xl"
                      >
                        Upgrade to Premium
                      </Button>
                      <Link to="/pricing">
                        <Button
                          variant="secondary"
                          size="lg"
                          className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
                        >
                          View All Plans
                        </Button>
                      </Link>
                    </div>

                    {/* Feature highlights */}
                    <div className="mt-8 grid sm:grid-cols-3 gap-6">
                      {[
                        { icon: FileText, label: 'Unlimited Clips', desc: 'No limits' },
                        { icon: Clock, label: 'Offline Mode', desc: 'Work anywhere' },
                        { icon: Sparkles, label: 'Priority Support', desc: '24/7 help' },
                      ].map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                            <feature.icon className="text-white" size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{feature.label}</p>
                            <p className="text-xs text-purple-100">{feature.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Account Details Grid - Premium Design */}
          <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
            {/* Account Info */}
            <div className="card-interactive space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Account Details
                </h3>
                <Badge variant={isPremium ? 'gradient' : 'secondary'} size="md">
                  {isPremium ? 'PRO' : 'FREE'}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {(authUser?.profile?.full_name?.[0] || authUser?.user.email?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                      {authUser?.user.email}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Member Since
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {authUser?.profile?.created_at
                        ? new Date(authUser.profile.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Plan Status
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {subscription?.status || 'Active'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Breakdown */}
            <div className="card-interactive space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Monthly Breakdown
              </h3>

              <div className="space-y-4">
                {/* Clips */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <FileText className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">Clips</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {usage?.clips_count || 0} / {quotas?.clips === -1 ? '∞' : quotas?.clips || 0}
                      </p>
                    </div>
                  </div>
                  <Badge variant="purple" size="md">
                    {quotas?.clips === -1 ? '∞' : `${Math.round(clipsUsagePercent)}%`}
                  </Badge>
                </div>

                {/* Files */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <FileText className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">Files</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {usage?.files_count || 0} / {quotas?.files === -1 ? '∞' : quotas?.files || 0}
                      </p>
                    </div>
                  </div>
                  <Badge variant="blue" size="md">
                    {usage?.files_count || 0}
                  </Badge>
                </div>

                {/* Focus Mode */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Clock className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">Focus Mode</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {usage?.focus_mode_minutes || 0} minutes
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" size="md">
                    {Math.floor((usage?.focus_mode_minutes || 0) / 60)}h
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
