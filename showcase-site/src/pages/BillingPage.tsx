import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { CreditCard, Check, Zap, ArrowUpRight, Shield, Clock, Crown, ExternalLink, AlertTriangle, Sparkles } from 'lucide-react';
import { Button, Badge } from '../components/ui';
import { authService } from '../services/auth.service';
import { subscriptionService } from '../services/subscription.service';
import type { Subscription } from '../services/subscription.service';

interface PaymentMethod {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
}

const BillingPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [upgradeLoading, setUpgradeLoading] = useState(false);
    const [reactivateLoading, setReactivateLoading] = useState(false);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

    useEffect(() => {
        const loadData = async () => {
            try {
                const [sub, pm] = await Promise.all([
                    subscriptionService.getCurrentSubscription(),
                    subscriptionService.getPaymentMethod(),
                ]);
                setSubscription(sub);
                setPaymentMethod(pm);
            } catch (error) {
                console.error('Error loading billing data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const isPremium = subscription?.tier === 'PREMIUM' || (subscription?.tier as string) === 'premium';
    const isCanceling = subscription?.cancel_at_period_end === true;
    const isTrialing = subscription?.status === 'trialing';

    // Handle upgrade - redirect to Stripe checkout
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
            if (!response.ok) {
                throw new Error(result.error?.message || 'Failed to create checkout session');
            }
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

    // Handle manage subscription (Stripe Portal)
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
            if (response.ok && result.data?.url) {
                window.location.href = result.data.url;
            }
        } catch (error) {
            console.error('Portal error:', error);
        }
    };

    // Handle reactivate subscription directly (without going to portal)
    const handleReactivateSubscription = async () => {
        const token = authService.getToken();
        if (!token) return;

        setReactivateLoading(true);
        try {
            const response = await fetch(`${apiUrl}/stripe/reactivate-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();
            if (response.ok && result.data?.success) {
                // Refresh subscription data
                const sub = await subscriptionService.getCurrentSubscription();
                setSubscription(sub);
            } else {
                console.error('Reactivation failed:', result);
            }
        } catch (error) {
            console.error('Reactivation error:', error);
        } finally {
            setReactivateLoading(false);
        }
    };

    // Get status badge
    const getStatusBadge = () => {
        if (isCanceling) {
            return (
                <Badge variant="yellow" className="gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{t('billing.status.canceling', 'Canceling')}</span>
                </Badge>
            );
        }
        if (isTrialing) {
            return (
                <Badge variant="blue" className="gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{t('billing.status.trial', 'Trial')}</span>
                </Badge>
            );
        }
        if (isPremium) {
            return (
                <Badge variant="purple" className="gap-1">
                    <Crown className="w-3 h-3" />
                    <span>Premium</span>
                </Badge>
            );
        }
        return <Badge variant="gray">{t('billing.status.free', 'Free')}</Badge>;
    };

    // Get subscription status text
    const getStatusText = () => {
        if (isCanceling && subscription?.current_period_end) {
            return t('billing.cancelingOn', 'Your subscription will end on {{date}}', {
                date: new Date(subscription.current_period_end).toLocaleDateString()
            });
        }
        if (isTrialing && subscription?.current_period_end) {
            return t('billing.trialEnds', 'Your trial ends on {{date}}', {
                date: new Date(subscription.current_period_end).toLocaleDateString()
            });
        }
        if (isPremium && subscription?.current_period_end) {
            return t('billing.renewsOn', 'Renews on {{date}}', {
                date: new Date(subscription.current_period_end).toLocaleDateString()
            });
        }
        return t('billing.freeDescription', 'You are currently on the free plan.');
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                    {t('billing.title', 'Billing')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    {t('billing.subtitle', 'Manage your subscription and billing details.')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Current Plan */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {t('billing.currentPlan', 'Current Plan')}
                            </h2>
                            {getStatusBadge()}
                        </div>

                        <div className="flex items-start gap-4 mb-6">
                            <div className={`p-3 rounded-xl ${
                                isCanceling 
                                    ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                                    : isPremium 
                                        ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                                        : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                                <Zap className={`w-6 h-6 ${isPremium || isCanceling ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    {isPremium 
                                        ? (isCanceling 
                                            ? t('billing.premiumCanceling', 'Premium (Canceling)')
                                            : t('billing.premiumPlan', 'Premium Plan'))
                                        : t('billing.freePlan', 'Free Plan')}
                                </h3>
                                <p className={`text-sm ${isCanceling ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {getStatusText()}
                                </p>
                            </div>
                        </div>

                        {/* Cancellation Warning */}
                        {isCanceling && (
                            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-orange-800 dark:text-orange-300">
                                            {t('billing.cancelWarning.title', 'Your subscription is set to cancel')}
                                        </p>
                                        <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                                            {t('billing.cancelWarning.description', 'You will lose access to Premium features after the current billing period. You can reactivate anytime before then.')}
                                        </p>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="mt-3"
                                            onClick={handleReactivateSubscription}
                                            disabled={reactivateLoading}
                                        >
                                            {reactivateLoading 
                                                ? t('billing.reactivating', 'Reactivating...')
                                                : t('billing.reactivate', 'Reactivate Subscription')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Trial Info */}
                        {isTrialing && (
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-blue-800 dark:text-blue-300">
                                            {t('billing.trial.title', 'You are on a free trial')}
                                        </p>
                                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                            {t('billing.trial.description', 'Enjoy all Premium features during your trial period. Your card will be charged when the trial ends.')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                                {t('billing.planFeatures', 'Plan Features')}
                            </h4>
                            <ul className="space-y-3">
                                {isPremium ? (
                                    <>
                                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                            <Check className="w-4 h-4 text-purple-500" />
                                            {t('billing.features.unlimitedClips', 'Unlimited clips')}
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                            <Check className="w-4 h-4 text-purple-500" />
                                            {t('billing.features.unlimitedFiles', 'Unlimited file uploads')}
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                            <Check className="w-4 h-4 text-purple-500" />
                                            {t('billing.features.prioritySupport', 'Priority support')}
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                            <Check className="w-4 h-4 text-purple-500" />
                                            {t('billing.features.offlineMode', 'Offline mode (coming soon)')}
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                            <Check className="w-4 h-4 text-green-500" />
                                            {t('billing.features.freeClips', '100 clips per month')}
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                            <Check className="w-4 h-4 text-green-500" />
                                            {t('billing.features.freeFiles', '10 file uploads per month')}
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                            <Check className="w-4 h-4 text-green-500" />
                                            {t('billing.features.communitySupport', 'Community support')}
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {isPremium && !isCanceling && (
                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <Button
                                    variant="secondary"
                                    onClick={handleManageSubscription}
                                    rightIcon={<ExternalLink size={16} />}
                                >
                                    {t('billing.manageSubscription', 'Manage Subscription')}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {t('billing.paymentMethod', 'Payment Method')}
                            </h2>
                            {isPremium && (
                                <Button variant="ghost" size="sm" onClick={handleManageSubscription}>
                                    {t('billing.manage', 'Manage')}
                                </Button>
                            )}
                        </div>

                        {isPremium && paymentMethod ? (
                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <div className={`w-12 h-8 rounded flex items-center justify-center ${
                                    paymentMethod.brand === 'visa' ? 'bg-gradient-to-r from-blue-600 to-blue-700' :
                                    paymentMethod.brand === 'mastercard' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                                    paymentMethod.brand === 'amex' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                                    'bg-gradient-to-r from-gray-600 to-gray-700'
                                }`}>
                                    <CreditCard className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                        {paymentMethod.brand} •••• {paymentMethod.last4}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('billing.expires', 'Expires')} {paymentMethod.expMonth.toString().padStart(2, '0')}/{paymentMethod.expYear}
                                    </p>
                                </div>
                            </div>
                        ) : isPremium ? (
                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <div className="w-12 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {t('billing.managedViaStripe', 'Managed via Stripe')}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('billing.clickManage', 'Click Manage to view details')}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                <p>{t('billing.noPaymentMethod', 'No payment methods added yet.')}</p>
                                <p className="text-sm mt-2">{t('billing.upgradeToAdd', 'Upgrade to Premium to add a payment method.')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    {/* Upgrade CTA for Free Users */}
                    {!isPremium && (
                        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg sticky top-24">
                            <div className="mb-6">
                                <Badge variant="gradient" size="sm" className="bg-white/20 text-white border-white/30 mb-3">
                                    {t('billing.betaPrice', 'Beta Price')}
                                </Badge>
                                <h3 className="text-xl font-bold mb-2">{t('billing.upgradeToPro', 'Upgrade to Pro')}</h3>
                                <p className="text-purple-100 text-sm">
                                    {t('billing.upgradeDescription', 'Get unlimited clips, priority support, and advanced features.')}
                                </p>
                            </div>

                            <div className="text-3xl font-bold mb-2">
                                $2.99<span className="text-lg text-purple-200 font-normal">/mo</span>
                            </div>
                            <p className="text-xs text-purple-200 mb-6">{t('billing.lockedForever', 'Locked in forever • Reg. $5.99')}</p>

                            <Button 
                                variant="secondary" 
                                fullWidth 
                                className="bg-white text-purple-600 hover:bg-gray-50 border-none"
                                onClick={handleUpgrade}
                                isLoading={upgradeLoading}
                                rightIcon={!upgradeLoading && <ArrowUpRight size={16} />}
                            >
                                {upgradeLoading ? t('billing.processing', 'Processing...') : t('billing.upgradeNow', 'Upgrade Now')}
                            </Button>

                            <div className="mt-6 pt-4 border-t border-white/20 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-purple-200">
                                    <Clock className="w-3 h-3" />
                                    <span>{t('billing.trial14days', '14-day free trial')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-purple-200">
                                    <Shield className="w-3 h-3" />
                                    <span>{t('billing.securePayment', 'Secure payment')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-purple-200">
                                    <Zap className="w-3 h-3" />
                                    <span>{t('billing.cancelAnytime', 'Cancel anytime')}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Premium User - Subscription Info */}
                    {isPremium && (
                        <div className={`rounded-2xl p-6 border sticky top-24 ${
                            isCanceling 
                                ? 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800'
                                : 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800'
                        }`}>
                            <div className="flex items-center gap-2 mb-4">
                                {isCanceling ? (
                                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                ) : (
                                    <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                )}
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {isCanceling 
                                        ? t('billing.subscriptionEnding', 'Subscription Ending')
                                        : isTrialing
                                            ? t('billing.trialActive', 'Trial Active')
                                            : t('billing.premiumActive', 'Premium Active')}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                {isCanceling 
                                    ? t('billing.cancelingDescription', 'Your access will end at the end of the billing period.')
                                    : isTrialing
                                        ? t('billing.trialDescription', 'Enjoying your free trial with all Premium features.')
                                        : t('billing.premiumDescription', 'Thank you for being a Premium subscriber!')}
                            </p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">{t('billing.status.label', 'Status')}</span>
                                    <span className={`font-medium ${
                                        isCanceling 
                                            ? 'text-orange-600 dark:text-orange-400'
                                            : isTrialing
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-green-600 dark:text-green-400'
                                    }`}>
                                        {isCanceling 
                                            ? t('billing.status.canceling', 'Canceling')
                                            : isTrialing
                                                ? t('billing.status.trial', 'Trial')
                                                : t('billing.status.active', 'Active')}
                                    </span>
                                </div>
                                {subscription?.current_period_end && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">
                                            {isCanceling 
                                                ? t('billing.endsOn', 'Ends on')
                                                : isTrialing
                                                    ? t('billing.trialEndsOn', 'Trial ends')
                                                    : t('billing.nextBilling', 'Next billing')}
                                        </span>
                                        <span className="text-gray-900 dark:text-white font-medium">
                                            {new Date(subscription.current_period_end).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BillingPage;
