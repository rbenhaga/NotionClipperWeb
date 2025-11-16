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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold mb-4 text-gray-900">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              {t('subtitle')}
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md border border-gray-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm'
                    : 'text-gray-700'
                }`}
              >
                {t('billing.monthly')}
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm'
                    : 'text-gray-700'
                }`}
              >
                {t('billing.annual')}
                <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  {t('billing.save')} {annualSavings.toFixed(0)}€
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{t('free.name')}</h3>
                  <p className="text-sm text-gray-600">{t('free.tagline')}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900">{t('free.currency')}{t('free.price')}</span>
                  <span className="text-gray-600 ml-2">{t('free.period')}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('free.features.clips')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('free.features.uploads')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('free.features.focus')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('free.features.markdown')}</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('free')}
                className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md"
              >
                {t('free.button')}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-purple-300 relative">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  {t('premium.badge')}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6 mt-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{t('premium.name')}</h3>
                  <p className="text-sm text-gray-600">{t('premium.tagline')}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {billingCycle === 'monthly' ? t('premium.price') : t('premium.priceAnnual')}{t('premium.currency')}
                  </span>
                  <span className="text-gray-600 ml-2">{t('premium.period')}</span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-sm text-emerald-600 font-medium mt-2">
                    {t('premium.billedAnnually', { price: annualPrice.toFixed(2), savings: annualSavings.toFixed(2) })}
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-900 font-semibold">{t('premium.features.unlimitedClips')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-900 font-semibold">{t('premium.features.unlimitedUploads')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-900 font-semibold">{t('premium.features.unlimitedFocus')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('premium.features.advancedMarkdown')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('premium.features.prioritySupport')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('premium.features.earlyAccess')}</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('premium')}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Loading...' : t('premium.button')}
              </button>

              <p className="text-xs text-center text-gray-600 mt-4">
                {t('premium.trial')}
              </p>
            </div>

            {/* One-Time Purchase Plan */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-200 opacity-75">
              {/* Coming Soon Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  {t('onetime.badge')}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6 mt-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{t('onetime.name')}</h3>
                  <p className="text-sm text-gray-600">{t('onetime.tagline')}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {t('onetime.price')}
                  </span>
                  <span className="text-gray-600 ml-2">{t('onetime.period')}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-900 font-semibold">{t('onetime.features.everything')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-900 font-semibold">{t('onetime.features.lifetime')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('onetime.features.updates')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('onetime.features.priority')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{t('onetime.features.noSubscription')}</span>
                </li>
              </ul>

              <button
                disabled
                className="w-full px-6 py-4 bg-gray-400 text-white rounded-xl font-bold cursor-not-allowed opacity-60"
              >
                {t('onetime.comingSoon')}
              </button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
              {t('faq.title')}
            </h2>
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{t('faq.cancel.question')}</h3>
                <p className="text-gray-700">{t('faq.cancel.answer')}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{t('faq.payment.question')}</h3>
                <p className="text-gray-700">{t('faq.payment.answer')}</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{t('faq.upgrade.question')}</h3>
                <p className="text-gray-700">{t('faq.upgrade.answer')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
