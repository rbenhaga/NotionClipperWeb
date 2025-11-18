import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComparisonTable from '../components/ComparisonTable';

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

  const monthlyPrice = 5.99;
  const annualPrice = 59.00; // $4.92/mo when billed annually
  const annualSavings = (monthlyPrice * 12 - annualPrice);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              {t('title')}
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              {t('subtitle')}
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-md font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('billing.monthly')}
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-3 rounded-md font-semibold transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('billing.annual')}
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  -{annualSavings.toFixed(0)}€
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{t('free.name')}</h3>
                <p className="text-sm text-gray-600">{t('free.tagline')}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">{t('free.currency')}{t('free.price')}</span>
                  <span className="text-gray-600 ml-2 text-base">{t('free.period')}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 min-h-[200px]">
                <li className="flex items-start gap-3">
                  <Check className="text-gray-900 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 text-sm">{t('free.features.clips')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-gray-900 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 text-sm">{t('free.features.uploads')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-gray-900 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 text-sm">{t('free.features.focus')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-gray-900 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 text-sm">{t('free.features.markdown')}</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('free')}
                className="w-full px-6 py-3 bg-white text-gray-900 border-2 border-gray-900 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition-all"
              >
                {t('free.button')}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-xl p-8 shadow-md border-2 border-gray-900 relative">
              {/* Recommended Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="bg-gray-900 text-white px-4 py-1 rounded text-xs font-semibold">
                  {t('premium.badge')}
                </div>
              </div>

              <div className="mb-6 mt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{t('premium.name')}</h3>
                <p className="text-sm text-gray-600">{t('premium.tagline')}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    {billingCycle === 'monthly' ? t('premium.price') : t('premium.priceAnnual')}{t('premium.currency')}
                  </span>
                  <span className="text-gray-600 ml-2 text-base">{t('premium.period')}</span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-sm text-green-700 font-medium mt-2">
                    {t('premium.billedAnnually', { price: annualPrice.toFixed(2), savings: annualSavings.toFixed(2) })}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 min-h-[200px]">
                <li className="flex items-start gap-3">
                  <Check className="text-gray-900 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-900 text-sm font-semibold">{t('premium.features.unlimitedClips')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-gray-900 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-900 text-sm font-semibold">{t('premium.features.unlimitedUploads')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-gray-900 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-900 text-sm font-semibold">{t('premium.features.unlimitedFocus')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-gray-900 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 text-sm">{t('premium.features.advancedMarkdown')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-gray-900 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 text-sm">{t('premium.features.prioritySupport')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-gray-900 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 text-sm">{t('premium.features.earlyAccess')}</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('premium')}
                disabled={loading}
                className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                {loading ? 'Loading...' : t('premium.button')}
              </button>
            </div>

            {/* One-Time Purchase Plan */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-300 opacity-60 relative">
              {/* Coming Soon Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="bg-gray-600 text-white px-4 py-1 rounded text-xs font-semibold">
                  {t('onetime.badge')}
                </div>
              </div>

              <div className="mb-6 mt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{t('onetime.name')}</h3>
                <p className="text-sm text-gray-600">{t('onetime.tagline')}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    {t('onetime.price')}
                  </span>
                  <span className="text-gray-600 ml-2 text-base">{t('onetime.period')}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 min-h-[200px]">
                <li className="flex items-start gap-3">
                  <Check className="text-gray-900 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-900 text-sm font-semibold">{t('onetime.features.everything')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-gray-900 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-900 text-sm font-semibold">{t('onetime.features.lifetime')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-gray-900 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 text-sm">{t('onetime.features.updates')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-gray-900 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 text-sm">{t('onetime.features.priority')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-gray-900 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 text-sm">{t('onetime.features.noSubscription')}</span>
                </li>
              </ul>

              <button
                disabled
                className="w-full px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
              >
                {t('onetime.comingSoon')}
              </button>
            </div>
          </div>

          {/* Comparison Table Section */}
          <div className="mt-24">
            <ComparisonTable variant="full" />
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
              {t('faq.title')}
            </h2>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 text-base">{t('faq.cancel.question')}</h3>
                <p className="text-gray-600 text-sm">{t('faq.cancel.answer')}</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 text-base">{t('faq.payment.question')}</h3>
                <p className="text-gray-600 text-sm">{t('faq.payment.answer')}</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 text-base">{t('faq.upgrade.question')}</h3>
                <p className="text-gray-600 text-sm">{t('faq.upgrade.answer')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
