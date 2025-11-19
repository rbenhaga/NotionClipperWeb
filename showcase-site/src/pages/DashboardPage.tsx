import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut,
  Crown,
  FileText,
  Clock,
  TrendingUp,
  CreditCard,
  User,
  Mail,
  Calendar,
  Zap,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { authService } from '../services/auth.service';
import { subscriptionService } from '../services/subscription.service';
import type { Subscription, UsageRecord } from '../services/subscription.service';
import type { AuthUser } from '../services/auth.service';
import { NotionClipperLogo } from '../assets/Logo.tsx';
import { Button, Card, Badge, Alert, ProgressBar, Skeleton } from '../components/ui';
import {
  pageVariants,
  containerVariants,
  itemVariants,
} from '../lib/animations';

export default function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageRecord | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Get current user
        const user = await authService.getCurrentUser();
        if (!user) {
          navigate('/auth');
          return;
        }
        setAuthUser(user);

        // Get subscription and usage in parallel
        const [sub, usageData] = await Promise.all([
          subscriptionService.getCurrentSubscription(),
          subscriptionService.getCurrentUsage(),
        ]);

        setSubscription(sub);
        setUsage(usageData);
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
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
      setError(err.message || 'Failed to sign out');
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoadingPortal(true);
      const portalUrl = await subscriptionService.createPortalSession(
        window.location.origin
      );
      window.location.href = portalUrl;
    } catch (err: any) {
      console.error('Error creating portal session:', err);
      setError(err.message || 'Failed to open subscription portal');
      setLoadingPortal(false);
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
      setError(err.message || 'Failed to start upgrade process');
      setLoadingCheckout(false);
    }
  };

  const quotas = subscription
    ? subscriptionService.getQuotasForTier(subscription.tier)
    : null;
  const isPremium = subscription?.tier === 'premium';
  const isFreeTier =
    subscription?.tier === 'free' || subscription?.tier === 'grace_period';

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Skeleton width={32} height={32} circle />
                <Skeleton width={150} height={20} />
              </div>
              <Skeleton width={100} height={36} />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton width={300} height={32} className="mb-2" />
            <Skeleton width={400} height={20} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Skeleton width="100%" height={200} />
              <Skeleton width="100%" height={250} />
            </div>
            <div className="lg:col-span-2">
              <Skeleton width="100%" height={500} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-gray-950"
      initial="initial"
      animate="enter"
      variants={pageVariants}
    >
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <NotionClipperLogo size={32} />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                NotionClipper
              </span>
            </Link>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              leftIcon={<LogOut size={18} />}
            >
              {t('signOut', 'Sign Out')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <motion.div className="mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Alert variant="error" closable onClose={() => setError('')}>
              {error}
            </Alert>
          </motion.div>
        )}

        {/* Welcome Section */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('welcome', 'Welcome back')},{' '}
            {authUser?.profile?.full_name ||
              authUser?.user.email?.split('@')[0] ||
              'User'}
            !
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('subtitle', "Here's what's happening with your account")}
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card
              padding="md"
              interactive
              onClick={() => alert('New clip functionality coming soon!')}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-3">
                  <Plus className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  New Clip
                </p>
              </div>
            </Card>

            <Card
              padding="md"
              interactive
              onClick={() => alert('Notion sync coming soon!')}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-3">
                  <Zap className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Sync Now
                </p>
              </div>
            </Card>

            <Link to="/pricing" className="block">
              <Card padding="md" hover>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mb-3">
                    <Crown className="text-yellow-600 dark:text-yellow-400" size={24} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Plans
                  </p>
                </div>
              </Card>
            </Link>

            <Card
              padding="md"
              interactive
              onClick={() => alert('Settings coming soon!')}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-3">
                  <User className="text-gray-600 dark:text-gray-400" size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Settings
                </p>
              </div>
            </Card>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {/* Left Column - Profile & Subscription */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            variants={itemVariants}
          >
            {/* Profile Card */}
            <Card>
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User size={20} />
                  {t('profile.title', 'Profile')}
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('profile.email', 'Email')}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {authUser?.user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('profile.joined', 'Member since')}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {authUser?.profile?.created_at
                        ? new Date(authUser.profile.created_at).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Subscription Card */}
            <Card>
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Crown
                    size={20}
                    className={
                      isPremium
                        ? 'text-yellow-500'
                        : 'text-gray-400 dark:text-gray-600'
                    }
                  />
                  {t('subscription.title', 'Subscription')}
                </h2>
              </div>

              {subscription ? (
                <div className="space-y-4">
                  {/* Tier Badge */}
                  <Badge variant={isPremium ? 'yellow' : 'gray'}>
                    {subscription.tier?.toUpperCase() || 'FREE'}
                  </Badge>

                  {/* Status */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('subscription.status', 'Status')}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {subscription.status}
                    </p>
                  </div>

                  {/* Period */}
                  {subscription.current_period_end && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('subscription.renewsOn', 'Renews on')}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(
                          subscription.current_period_end
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                    {isPremium ? (
                      <Button
                        variant="secondary"
                        size="md"
                        fullWidth
                        onClick={handleManageSubscription}
                        isLoading={loadingPortal}
                        leftIcon={<CreditCard size={18} />}
                      >
                        {t('subscription.manage', 'Manage Subscription')}
                      </Button>
                    ) : (
                      <Button
                        variant="accent"
                        size="md"
                        fullWidth
                        onClick={handleUpgradeToPremium}
                        isLoading={loadingCheckout}
                        leftIcon={<Crown size={18} />}
                      >
                        {t('subscription.upgrade', 'Upgrade to Premium')}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('subscription.noData', 'No subscription data available')}
                </p>
              )}
            </Card>
          </motion.div>

          {/* Right Column - Usage Stats */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <Card>
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={20} />
                  {t('usage.title', 'Monthly Usage')}
                </h2>
                {isFreeTier && (
                  <Badge variant="purple">
                    {t('usage.freeplan', 'Free Plan')}
                  </Badge>
                )}
              </div>

              {quotas ? (
                <div className="space-y-6">
                  {/* Clips Usage */}
                  <ProgressBar
                    value={usage?.clips_count || 0}
                    max={quotas.clips}
                    showLabel
                    label={
                      <div className="flex items-center gap-2">
                        <FileText size={18} />
                        <span>{t('usage.clips', 'Clips')}</span>
                      </div>
                    }
                  />

                  {/* Files Usage */}
                  <ProgressBar
                    value={usage?.files_count || 0}
                    max={quotas.files}
                    showLabel
                    label={
                      <div className="flex items-center gap-2">
                        <FileText size={18} />
                        <span>{t('usage.files', 'Files')}</span>
                      </div>
                    }
                  />

                  {/* Focus Mode Minutes */}
                  <ProgressBar
                    value={usage?.focus_mode_minutes || 0}
                    max={quotas.focus_mode_minutes}
                    showLabel
                    label={
                      <div className="flex items-center gap-2">
                        <Clock size={18} />
                        <span>{t('usage.focusMode', 'Focus Mode')}</span>
                      </div>
                    }
                  />

                  {/* Compact Mode Minutes */}
                  <ProgressBar
                    value={usage?.compact_mode_minutes || 0}
                    max={quotas.compact_mode_minutes}
                    showLabel
                    label={
                      <div className="flex items-center gap-2">
                        <Clock size={18} />
                        <span>{t('usage.compactMode', 'Compact Mode')}</span>
                      </div>
                    }
                  />

                  {/* Upgrade CTA for Free Users */}
                  {isFreeTier && (
                    <motion.div
                      className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl"
                      whileHover={{ scale: 1.02 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Crown className="text-yellow-500" size={20} />
                            {t('usage.upgradeCta', 'Want unlimited access?')}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {t(
                              'usage.upgradeDesc',
                              'Upgrade to Premium for unlimited clips, files, and features'
                            )}
                          </p>
                          <Button
                            variant="accent"
                            size="md"
                            onClick={handleUpgradeToPremium}
                            isLoading={loadingCheckout}
                            rightIcon={<ArrowUpRight size={16} />}
                          >
                            {t('usage.upgradeButton', 'Upgrade Now')}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('usage.noData', 'No usage data available')}
                </p>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}
