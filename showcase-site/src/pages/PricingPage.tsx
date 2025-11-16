import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Sparkles, Zap, Gift } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PricingPage() {
  const { t } = useTranslation('pricing');
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const handleSubscribe = async (plan: 'free' | 'premium') => {
    if (plan === 'free') {
      window.location.href = '/auth';
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: billingCycle === 'monthly' ? 'premium_monthly' : 'premium_annual',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const monthlyPrice = 2.99;
  const annualPrice = 28.68;
  const annualSavings = (monthlyPrice * 12 - annualPrice);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              {t('title')}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {t('subtitle')}
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                {t('billing.monthly')}
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                {t('billing.annual')}
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  -{annualSavings.toFixed(0)}€
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{t('free.name')}</h3>
                  <p className="text-xs text-gray-500">{t('free.tagline')}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    {t('free.currency')}{t('free.price')}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">{t('free.period')}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="text-gray-400 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-600">{t('free.features.clips')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-gray-400 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-600">{t('free.features.uploads')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-gray-400 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-600">{t('free.features.focus')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-gray-400 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-600">{t('free.features.markdown')}</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('free')}
                className="w-full px-5 py-3 border border-gray-300 text-gray-900 rounded-lg text-sm font-medium hover:border-gray-400 transition-colors"
              >
                {t('free.button')}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-900 relative">
              {/* Popular Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-xs font-medium">
                  {t('premium.badge')}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6 mt-2">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{t('premium.name')}</h3>
                  <p className="text-xs text-gray-500">{t('premium.tagline')}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    {billingCycle === 'monthly' ? t('premium.price') : t('premium.priceAnnual')}{t('premium.currency')}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">{t('premium.period')}</span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-xs text-green-700 mt-2">
                    {t('premium.billedAnnually', { price: annualPrice.toFixed(2), savings: annualSavings.toFixed(2) })}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="text-gray-900 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-900 font-medium">{t('premium.features.unlimitedClips')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-gray-900 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-900 font-medium">{t('premium.features.unlimitedUploads')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-gray-900 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-900 font-medium">{t('premium.features.unlimitedFocus')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-gray-900 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-600">{t('premium.features.advancedMarkdown')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-gray-900 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-600">{t('premium.features.prioritySupport')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-gray-900 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-600">{t('premium.features.earlyAccess')}</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('premium')}
                disabled={loading}
                className="w-full px-5 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : t('premium.button')}
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                {t('premium.trial')}
              </p>
            </div>

            {/* One-Time Purchase Plan */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 opacity-60">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gray-400 text-white px-4 py-1 rounded-full text-xs font-medium">
                  {t('onetime.badge')}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6 mt-2">
                <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{t('onetime.name')}</h3>
                  <p className="text-xs text-gray-500">{t('onetime.tagline')}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    {t('onetime.price')}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">{t('onetime.period')}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="text-gray-400 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-900 font-medium">{t('onetime.features.everything')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-gray-400 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-900 font-medium">{t('onetime.features.lifetime')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-gray-400 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-600">{t('onetime.features.updates')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-gray-400 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-600">{t('onetime.features.priority')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-gray-400 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-600">{t('onetime.features.noSubscription')}</span>
                </li>
              </ul>

              <button
                disabled
                className="w-full px-5 py-3 bg-gray-300 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
              >
                {t('onetime.comingSoon')}
              </button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
              {t('faq.title')}
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{t('faq.cancel.question')}</h3>
                <p className="text-sm text-gray-600">{t('faq.cancel.answer')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{t('faq.payment.question')}</h3>
                <p className="text-sm text-gray-600">{t('faq.payment.answer')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{t('faq.upgrade.question')}</h3>
                <p className="text-sm text-gray-600">{t('faq.upgrade.answer')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
