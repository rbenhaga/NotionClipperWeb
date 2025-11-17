import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Loader2,
  LogOut,
  Crown,
  FileText,
  Clock,
  TrendingUp,
  CreditCard,
  User,
  Mail,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { subscriptionService } from '../services/subscription.service';
import type { Subscription, UsageRecord } from '../services/subscription.service';
import type { AuthUser } from '../services/auth.service';
import { NotionClipperLogo } from '../assets/Logo.tsx';

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
      const portalUrl = await subscriptionService.createPortalSession(window.location.origin);
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
      const checkoutUrl = await subscriptionService.createCheckoutSession(window.location.origin);
      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'Failed to start upgrade process');
      setLoadingCheckout(false);
    }
  };

  // Calculate usage percentages
  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === Number.MAX_SAFE_INTEGER) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('loading', 'Loading your dashboard...')}</p>
        </div>
      </div>
    );
  }

  const quotas = subscription ? subscriptionService.getQuotasForTier(subscription.tier) : null;
  const isPremium = subscription?.tier === 'premium';
  const isFreeTier = subscription?.tier === 'free' || subscription?.tier === 'grace_period';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <NotionClipperLogo size={32} />
              <span className="text-xl font-bold text-gray-900">NotionClipper</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut size={18} />
              <span>{t('signOut', 'Sign Out')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{t('error', 'Error')}</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('welcome', 'Welcome back')}, {authUser?.profile?.full_name || authUser?.user.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-gray-600">
            {t('subtitle', 'Manage your subscription and view your usage statistics')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Subscription */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} />
                {t('profile.title', 'Profile')}
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500">{t('profile.email', 'Email')}</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{authUser?.user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">{t('profile.joined', 'Member since')}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {authUser?.profile?.created_at
                        ? new Date(authUser.profile.created_at).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Crown size={20} className={isPremium ? 'text-yellow-500' : 'text-gray-400'} />
                {t('subscription.title', 'Subscription')}
              </h2>

              {subscription ? (
                <div className="space-y-4">
                  {/* Tier Badge */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isPremium
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {subscription.tier.toUpperCase()}
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-sm text-gray-500">{t('subscription.status', 'Status')}</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{subscription.status}</p>
                  </div>

                  {/* Period */}
                  {subscription.current_period_end && (
                    <div>
                      <p className="text-sm text-gray-500">{t('subscription.renewsOn', 'Renews on')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    {isPremium ? (
                      <button
                        onClick={handleManageSubscription}
                        disabled={loadingPortal}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingPortal ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CreditCard size={18} />
                        )}
                        <span>{t('subscription.manage', 'Manage Subscription')}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleUpgradeToPremium}
                        disabled={loadingCheckout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                      >
                        {loadingCheckout ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Crown size={18} />
                        )}
                        <span>{t('subscription.upgrade', 'Upgrade to Premium')}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t('subscription.noData', 'No subscription data available')}</p>
              )}
            </div>
          </div>

          {/* Right Column - Usage Stats */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} />
                {t('usage.title', 'Monthly Usage')}
              </h2>

              {quotas ? (
                <div className="space-y-6">
                  {/* Clips Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{t('usage.clips', 'Clips')}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {usage?.clips_count || 0} / {quotas.clips === Number.MAX_SAFE_INTEGER ? '∞' : quotas.clips}
                      </span>
                    </div>
                    {quotas.clips !== Number.MAX_SAFE_INTEGER && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            getUsagePercentage(usage?.clips_count || 0, quotas.clips) >= 90
                              ? 'bg-red-500'
                              : getUsagePercentage(usage?.clips_count || 0, quotas.clips) >= 70
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${getUsagePercentage(usage?.clips_count || 0, quotas.clips)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Files Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{t('usage.files', 'Files')}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {usage?.files_count || 0} / {quotas.files === Number.MAX_SAFE_INTEGER ? '∞' : quotas.files}
                      </span>
                    </div>
                    {quotas.files !== Number.MAX_SAFE_INTEGER && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            getUsagePercentage(usage?.files_count || 0, quotas.files) >= 90
                              ? 'bg-red-500'
                              : getUsagePercentage(usage?.files_count || 0, quotas.files) >= 70
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${getUsagePercentage(usage?.files_count || 0, quotas.files)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Focus Mode Minutes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{t('usage.focusMode', 'Focus Mode')}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {usage?.focus_mode_minutes || 0} / {quotas.focus_mode_minutes === Number.MAX_SAFE_INTEGER ? '∞' : quotas.focus_mode_minutes} min
                      </span>
                    </div>
                    {quotas.focus_mode_minutes !== Number.MAX_SAFE_INTEGER && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            getUsagePercentage(usage?.focus_mode_minutes || 0, quotas.focus_mode_minutes) >= 90
                              ? 'bg-red-500'
                              : getUsagePercentage(usage?.focus_mode_minutes || 0, quotas.focus_mode_minutes) >= 70
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${getUsagePercentage(usage?.focus_mode_minutes || 0, quotas.focus_mode_minutes)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Compact Mode Minutes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{t('usage.compactMode', 'Compact Mode')}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {usage?.compact_mode_minutes || 0} / {quotas.compact_mode_minutes === Number.MAX_SAFE_INTEGER ? '∞' : quotas.compact_mode_minutes} min
                      </span>
                    </div>
                    {quotas.compact_mode_minutes !== Number.MAX_SAFE_INTEGER && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            getUsagePercentage(usage?.compact_mode_minutes || 0, quotas.compact_mode_minutes) >= 90
                              ? 'bg-red-500'
                              : getUsagePercentage(usage?.compact_mode_minutes || 0, quotas.compact_mode_minutes) >= 70
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${getUsagePercentage(usage?.compact_mode_minutes || 0, quotas.compact_mode_minutes)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Upgrade CTA for Free Users */}
                  {isFreeTier && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {t('usage.upgradeCta', 'Want unlimited access?')}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        {t('usage.upgradeDesc', 'Upgrade to Premium for unlimited clips, files, and features')}
                      </p>
                      <button
                        onClick={handleUpgradeToPremium}
                        disabled={loadingCheckout}
                        className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingCheckout ? (
                          <Loader2 className="w-4 h-4 animate-spin inline" />
                        ) : (
                          t('usage.upgradeButton', 'Upgrade Now')
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t('usage.noData', 'No usage data available')}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
