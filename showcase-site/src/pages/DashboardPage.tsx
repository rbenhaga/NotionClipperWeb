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
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  BarChart3,
  Target,
  Flame,
  WifiOff,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { authService } from '../services/auth.service';
import { subscriptionService } from '../services/subscription.service';
import type { Subscription, UsageRecord } from '../services/subscription.service';
import type { AuthUser } from '../services/auth.service';
import { ClipperProLogo } from '../assets/Logo.tsx';
import { Button, Badge } from '../components/ui';
import { containerVariants, itemVariants } from '../lib/animations';

export default function DashboardPage() {
  useTranslation('dashboard');
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
  const isPremium = subscription?.tier === 'PREMIUM';
  const isFreeTier = subscription?.tier === 'FREE' || subscription?.tier === 'GRACE_PERIOD';

  const clipsUsagePercent = quotas?.clips
    ? Math.min(((usage?.clips_count || 0) / quotas.clips) * 100, 100)
    : 0;

  // Loading State - Premium Apple Style
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center relative overflow-hidden">
        {/* Premium Mesh Background - 5 orbs comme AuthPage */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-indigo-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/4 left-1/4 w-[28rem] h-[28rem] bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-1/3 right-1/3 w-[24rem] h-[24rem] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        <motion.div
          className="flex flex-col items-center gap-8 relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
          >
            <ClipperProLogo size={96} />
          </motion.div>
          <div className="w-80 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            Loading your dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  const userName = authUser?.profile?.full_name || authUser?.user.email?.split('@')[0] || 'User';
  const memberSince = authUser?.profile?.created_at
    ? new Date(authUser.profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Premium Mesh Gradient Background - FIXED INSET avec 5 orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/4 w-[38rem] h-[38rem] bg-indigo-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-[35rem] h-[35rem] bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Premium Header - Frosted Glass Sticky */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                <ClipperProLogo size={40} />
              </motion.div>
              <span className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white group-hover:opacity-70 transition-opacity">
                NotionClipper
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Badge variant={isPremium ? 'gradient' : 'secondary'} size="lg">
                {isPremium ? (
                  <>
                    <Crown className="w-4 h-4" />
                    <span className="font-bold">PRO</span>
                  </>
                ) : (
                  <span className="font-semibold">FREE</span>
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
      <main className="relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-6 lg:px-8"
        >
          {/* Hero Section - MASSIVE Typography comme HomePage */}
          <section className="pt-24 pb-16">
            <motion.div variants={itemVariants} className="space-y-8">
              {/* Status Badges Row */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" size="md">
                  <Activity className="w-4 h-4" />
                  <span className="font-semibold">Dashboard</span>
                </Badge>
                <Badge
                  variant={subscription?.status === 'active' ? 'success' : 'secondary'}
                  size="md"
                >
                  {subscription?.status === 'active' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-semibold">Active</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>Inactive</span>
                    </>
                  )}
                </Badge>
                <Badge variant="secondary" size="md">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {memberSince}</span>
                </Badge>
              </div>

              {/* Massive Headline - text-8xl like HomePage */}
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9]">
                <span className="text-gray-900 dark:text-white">Welcome back,</span>
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {userName}.
                </span>
              </h1>

              {/* Subheadline - text-2xl with generous spacing */}
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
                {isPremium
                  ? "You're clipping without limits. Here's your activity at a glance."
                  : `You've used ${usage?.clips_count || 0} of ${quotas?.clips || 0} clips this month. Ready to level up?`}
              </p>
            </motion.div>
          </section>

          {/* Stats Grid - 4 Cards with Premium Design */}
          <section className="pb-20">
            <motion.div
              variants={itemVariants}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {/* Clips Card */}
              <motion.div
                className="card-interactive relative overflow-hidden group"
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 group-hover:from-purple-500/10 group-hover:to-purple-600/10 transition-all duration-500" />
                <div className="relative p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                      <FileText className="text-white" size={32} />
                    </div>
                    {quotas?.clips === -1 ? (
                      <Badge variant="gradient" size="md">
                        <span className="font-bold">∞ Unlimited</span>
                      </Badge>
                    ) : (
                      <Badge variant="secondary" size="sm">
                        {quotas?.clips || 0} max
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                      Clips This Month
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tighter">
                        {usage?.clips_count || 0}
                      </span>
                      {quotas?.clips !== -1 && (
                        <span className="text-2xl text-gray-500 dark:text-gray-400">
                          / {quotas?.clips || 0}
                        </span>
                      )}
                    </div>
                  </div>
                  {quotas?.clips !== -1 && (
                    <div className="space-y-3">
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-600 to-purple-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${clipsUsagePercent}%` }}
                          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {Math.round(clipsUsagePercent)}% used
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Focus Time Card */}
              <motion.div
                className="card-interactive relative overflow-hidden group"
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 group-hover:from-blue-500/10 group-hover:to-blue-600/10 transition-all duration-500" />
                <div className="relative p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <Clock className="text-white" size={32} />
                    </div>
                    <Badge variant="blue" size="sm">
                      This Month
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                      Focus Time
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tighter">
                        {Math.floor((usage?.focus_mode_minutes || 0) / 60)}
                      </span>
                      <span className="text-2xl text-gray-500 dark:text-gray-400">hours</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {usage?.focus_mode_minutes || 0} minutes total
                  </p>
                </div>
              </motion.div>

              {/* Activity Card */}
              <motion.div
                className="card-interactive relative overflow-hidden group"
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-600/5 group-hover:from-indigo-500/10 group-hover:to-indigo-600/10 transition-all duration-500" />
                <div className="relative p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                      <TrendingUp className="text-white" size={32} />
                    </div>
                    <Badge variant="success" size="sm">
                      <Activity className="w-3 h-3" />
                      Live
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                      Total Actions
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tighter">
                        {(usage?.clips_count || 0) + (usage?.files_count || 0)}
                      </span>
                      <span className="text-2xl text-gray-500 dark:text-gray-400">total</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Clips + Files combined
                  </p>
                </div>
              </motion.div>

              {/* Streak Card */}
              <motion.div
                className="card-interactive relative overflow-hidden group"
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 group-hover:from-orange-500/10 group-hover:to-orange-600/10 transition-all duration-500" />
                <div className="relative p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                      <Flame className="text-white" size={32} />
                    </div>
                    <Badge variant="secondary" size="sm">
                      Streak
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                      Active Days
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tighter">
                        {Math.min(usage?.clips_count || 0, 30)}
                      </span>
                      <span className="text-2xl text-gray-500 dark:text-gray-400">days</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Keep the momentum going!
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* Quick Actions - Premium Design */}
          <section className="pb-20">
            <motion.div variants={itemVariants} className="space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Quick Actions
                </h2>
                <Badge variant="secondary" size="md">
                  <Target className="w-4 h-4" />
                  <span className="font-semibold">Ready to clip</span>
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Quick Clip */}
                <motion.button
                  whileHover={{ scale: 1.04, y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  className="card-interactive p-10 text-left group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 group-hover:from-purple-500/10 group-hover:to-blue-500/10 transition-all duration-500" />
                  <div className="relative space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-xl group-hover:shadow-purple-500/35 group-hover:scale-105 transition-all">
                      <Zap className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Quick Clip
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        Instant clipboard capture
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Sync Now */}
                <motion.button
                  whileHover={{ scale: 1.04, y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  className="card-interactive p-10 text-left group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-500" />
                  <div className="relative space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/35 group-hover:scale-105 transition-all">
                      <RefreshCw className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Sync Now
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        Sync with Notion
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Desktop App */}
                <motion.button
                  whileHover={{ scale: 1.04, y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  className="card-interactive p-10 text-left group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-all duration-500" />
                  <div className="relative space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:shadow-xl group-hover:shadow-green-500/35 group-hover:scale-105 transition-all">
                      <Download className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Desktop App
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        Download for offline
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Settings */}
                <motion.button
                  whileHover={{ scale: 1.04, y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  className="card-interactive p-10 text-left group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-600/5 to-gray-700/5 group-hover:from-gray-600/10 group-hover:to-gray-700/10 transition-all duration-500" />
                  <div className="relative space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-3xl flex items-center justify-center shadow-lg shadow-gray-500/25 group-hover:shadow-xl group-hover:shadow-gray-500/35 group-hover:scale-105 transition-all">
                      <Settings className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Settings
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        Configure preferences
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </section>

          {/* Premium Upgrade CTA for Free Users */}
          {isFreeTier && (
            <section className="pb-20">
              <motion.div variants={itemVariants}>
                <div className="relative overflow-hidden rounded-[2rem] shadow-apple-2xl">
                  {/* Premium gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600" />
                  <div className="absolute top-0 right-0 w-[36rem] h-[36rem] bg-white/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-[36rem] h-[36rem] bg-white/10 rounded-full blur-3xl" />

                  {/* Content */}
                  <div className="relative z-10 p-16 lg:p-20">
                    <div className="max-w-4xl">
                      <Badge
                        variant="secondary"
                        size="lg"
                        className="mb-8 bg-white/20 backdrop-blur-sm text-white border-white/30"
                      >
                        <Sparkles className="w-5 h-5" />
                        <span className="font-bold text-base">Unlock Premium</span>
                      </Badge>

                      <h3 className="text-6xl sm:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
                        Ready for <br className="hidden sm:block" />
                        unlimited clips?
                      </h3>

                      <p className="text-2xl sm:text-3xl text-purple-100 mb-12 max-w-2xl leading-relaxed">
                        Upgrade to Premium for unlimited clips, offline mode, desktop app, and
                        priority support.{' '}
                        <span className="font-bold text-white">Lock in $2.99/mo forever.</span>
                      </p>

                      <div className="flex flex-wrap gap-5 mb-12">
                        <Button
                          variant="accent"
                          size="lg"
                          onClick={handleUpgradeToPremium}
                          isLoading={loadingCheckout}
                          rightIcon={<ArrowUpRight size={22} />}
                          className="bg-white text-purple-600 hover:bg-gray-50 shadow-apple-xl text-lg px-10 py-5"
                        >
                          Upgrade to Premium
                        </Button>
                        <Link to="/pricing">
                          <Button
                            variant="secondary"
                            size="lg"
                            className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 text-lg px-10 py-5"
                          >
                            View All Plans
                          </Button>
                        </Link>
                      </div>

                      {/* Feature highlights */}
                      <div className="grid sm:grid-cols-3 gap-8">
                        {[
                          {
                            icon: FileText,
                            label: 'Unlimited Clips',
                            desc: 'Never hit a limit',
                          },
                          { icon: WifiOff, label: 'Offline Mode', desc: 'Work anywhere' },
                          {
                            icon: Sparkles,
                            label: 'Priority Support',
                            desc: '24/7 assistance',
                          },
                        ].map((feature, i) => (
                          <div key={i} className="flex items-start gap-5">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                              <feature.icon className="text-white" size={28} />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-white mb-1">
                                {feature.label}
                              </p>
                              <p className="text-base text-purple-100">{feature.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>
          )}

          {/* Account & Usage Grid */}
          <section className="pb-24">
            <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-10">
              {/* Account Details */}
              <div className="card-interactive p-10 space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Account
                  </h3>
                  <Badge variant={isPremium ? 'gradient' : 'secondary'} size="lg">
                    {isPremium ? (
                      <>
                        <Crown className="w-4 h-4" />
                        <span className="font-bold">PRO</span>
                      </>
                    ) : (
                      <span className="font-semibold">FREE</span>
                    )}
                  </Badge>
                </div>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white font-bold text-2xl">
                        {(
                          authUser?.profile?.full_name?.[0] ||
                          authUser?.user.email?.[0] ||
                          'U'
                        ).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
                        Email Address
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white truncate">
                        {authUser?.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Status Grid */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                        Member Since
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {memberSince}
                      </p>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                        Plan Status
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                        {subscription?.status || 'Active'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Breakdown */}
              <div className="card-interactive p-10 space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Usage
                  </h3>
                  <Badge variant="secondary" size="md">
                    <BarChart3 className="w-4 h-4" />
                    <span className="font-semibold">This Month</span>
                  </Badge>
                </div>

                <div className="space-y-5">
                  {/* Clips */}
                  <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        Clips
                      </p>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        {usage?.clips_count || 0} /{' '}
                        {quotas?.clips === -1 ? '∞' : quotas?.clips || 0}
                      </p>
                    </div>
                    <Badge variant="purple" size="md">
                      {quotas?.clips === -1 ? '∞' : `${Math.round(clipsUsagePercent)}%`}
                    </Badge>
                  </div>

                  {/* Files */}
                  <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        Files Synced
                      </p>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        {usage?.files_count || 0} /{' '}
                        {quotas?.files === -1 ? '∞' : quotas?.files || 0}
                      </p>
                    </div>
                    <Badge variant="blue" size="md">{usage?.files_count || 0}</Badge>
                  </div>

                  {/* Focus Mode */}
                  <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Clock className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        Focus Mode
                      </p>
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        {usage?.focus_mode_minutes || 0} minutes
                      </p>
                    </div>
                    <Badge variant="secondary" size="md">
                      {Math.floor((usage?.focus_mode_minutes || 0) / 60)}h
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
