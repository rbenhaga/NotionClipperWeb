import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Loader2,
  LogOut,
  Crown,
  FileText,
  TrendingUp,
  CreditCard,
  User,
  Mail,
  Calendar,
  AlertCircle,
  Sparkles,
  Zap,
  BarChart3,
  ArrowUpRight
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">{t('loading', 'Loading your dashboard...')}</p>
        </div>
      </div>
    );
  }

  const quotas = subscription ? subscriptionService.getQuotasForTier(subscription.tier) : null;
  const isPremium = subscription?.tier === 'PREMIUM';
  const isFreeTier = subscription?.tier === 'FREE' || subscription?.tier === 'GRACE_PERIOD';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <NotionClipperLogo size={32} />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Clipper Pro
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {isPremium && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300 rounded-full">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-bold text-yellow-800">PRO</span>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-white/60"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">{t('signOut', 'Sign Out')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-start gap-3 shadow-md">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{t('error', 'Error')}</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome back
            </span>
            {authUser && (
              <span className="text-gray-900">, {authUser.profile?.full_name || authUser.user.email?.split('@')[0] || 'User'}!</span>
            )}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('subtitle', 'Manage your subscription and track your usage')}
          </p>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Clips Used */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Clips This Month</p>
            <p className="text-3xl font-bold text-gray-900">
              {usage?.clips_count || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              of {quotas?.clips === Number.MAX_SAFE_INTEGER ? '∞' : quotas?.clips || 0}
            </p>
          </div>

          {/* Plan Type */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                isPremium
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
              }`}>
                <Crown className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Current Plan</p>
            <p className="text-2xl font-bold text-gray-900">
              {subscription?.tier || 'FREE'}
            </p>
            <p className={`text-xs mt-1 font-medium ${
              subscription?.status === 'active' ? 'text-green-600' : 'text-gray-500'
            }`}>
              {subscription?.status || 'N/A'}
            </p>
          </div>

          {/* Account Age */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Member Since</p>
            <p className="text-lg font-bold text-gray-900">
              {authUser?.profile?.created_at
                ? new Date(authUser.profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : 'N/A'}
            </p>
          </div>

          {/* Quick Action */}
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-white/90 mb-2">Want more power?</p>
            {isPremium ? (
              <button
                onClick={handleManageSubscription}
                disabled={loadingPortal}
                className="w-full px-4 py-2 bg-white/90 hover:bg-white text-purple-700 rounded-lg font-semibold text-sm transition-all shadow-md disabled:opacity-50"
              >
                {loadingPortal ? 'Loading...' : 'Manage Plan'}
              </button>
            ) : (
              <button
                onClick={handleUpgradeToPremium}
                disabled={loadingCheckout}
                className="w-full px-4 py-2 bg-white/90 hover:bg-white text-purple-700 rounded-lg font-semibold text-sm transition-all shadow-md disabled:opacity-50"
              >
                {loadingCheckout ? 'Loading...' : 'Upgrade to Pro'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Usage Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Usage Stats Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  {t('usage.title', 'Monthly Usage')}
                </h2>
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>

              {quotas ? (
                <div className="space-y-8">
                  {/* Clips Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{t('usage.clips', 'Clips')}</p>
                          <p className="text-xs text-gray-500">Web content saved</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {usage?.clips_count || 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          / {quotas.clips === Number.MAX_SAFE_INTEGER ? '∞' : quotas.clips}
                        </p>
                      </div>
                    </div>
                    {quotas.clips !== Number.MAX_SAFE_INTEGER && (
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            getUsagePercentage(usage?.clips_count || 0, quotas.clips) >= 90
                              ? 'bg-gradient-to-r from-red-500 to-red-600'
                              : getUsagePercentage(usage?.clips_count || 0, quotas.clips) >= 70
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                              : 'bg-gradient-to-r from-purple-500 to-purple-600'
                          }`}
                          style={{ width: `${getUsagePercentage(usage?.clips_count || 0, quotas.clips)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Files Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{t('usage.files', 'Files')}</p>
                          <p className="text-xs text-gray-500">Documents uploaded</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {usage?.files_count || 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          / {quotas.files === Number.MAX_SAFE_INTEGER ? '∞' : quotas.files}
                        </p>
                      </div>
                    </div>
                    {quotas.files !== Number.MAX_SAFE_INTEGER && (
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${getUsagePercentage(usage?.files_count || 0, quotas.files)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Upgrade CTA for Free Users */}
                  {isFreeTier && (
                    <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">Need more clips?</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Upgrade to Pro for unlimited clips, desktop app, and offline mode
                          </p>
                          <button
                            onClick={handleUpgradeToPremium}
                            disabled={loadingCheckout}
                            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {loadingCheckout ? 'Loading...' : 'Upgrade to Pro - $3.99/mo'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">{t('usage.noData', 'No usage data available')}</p>
              )}
            </div>
          </div>

          {/* Right Column - Profile & Subscription */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                {t('profile.title', 'Profile')}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">{t('profile.email', 'Email')}</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{authUser?.user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">{t('profile.joined', 'Member since')}</p>
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Crown className={`w-5 h-5 ${isPremium ? 'text-yellow-500' : 'text-gray-400'}`} />
                {t('subscription.title', 'Subscription')}
              </h2>

              {subscription ? (
                <div className="space-y-4">
                  {/* Tier Badge */}
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                    isPremium
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {subscription.tier}
                  </div>

                  {/* Status */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">{t('subscription.status', 'Status')}</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{subscription.status}</p>
                    </div>
                  </div>

                  {/* Period */}
                  {subscription.current_period_end && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">{t('subscription.renewsOn', 'Renews on')}</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(subscription.current_period_end).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    {isPremium ? (
                      <button
                        onClick={handleManageSubscription}
                        disabled={loadingPortal}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingPortal ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        <span className="font-semibold">{t('subscription.manage', 'Manage Subscription')}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleUpgradeToPremium}
                        disabled={loadingCheckout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      >
                        {loadingCheckout ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Crown className="w-4 h-4" />
                        )}
                        <span className="font-semibold">{t('subscription.upgrade', 'Upgrade to Pro')}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t('subscription.noData', 'No subscription data available')}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
