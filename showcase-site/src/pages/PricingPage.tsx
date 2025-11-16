import { useState } from 'react';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const handleSubscribe = async (plan: 'free' | 'premium') => {
    if (plan === 'free') {
      // Redirect to signup
      window.location.href = '/auth';
      return;
    }

    // Premium plan - create Stripe checkout session
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

      // Redirect to Stripe Checkout
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

  const monthlyPrice = 9;
  const annualPrice = 90; // $7.50/month billed annually
  const annualSavings = (monthlyPrice * 12 - annualPrice);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '4s' }}></div>
          <div className="absolute bottom-0 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" style={{ animationDelay: '6s' }}></div>
        </div>
      </div>

      <Header />

      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold mb-4 text-gray-900">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Choose the plan that's right for you
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md border border-gray-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:text-gray-900'
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${billingCycle === 'annual'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:text-gray-900'
                  }`}
              >
                Annual
                <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  Save ${annualSavings}
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                  <p className="text-sm text-gray-600">Perfect to get started</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">100 clips per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">10 file uploads per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">60 minutes focus mode</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Basic Markdown support</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('free')}
                className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
              >
                Get Started Free
              </button>
            </div>

            {/* Premium Plan */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-purple-300 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                  <Crown size={16} />
                  <span>MOST POPULAR</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6 mt-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
                  <p className="text-sm text-gray-600">For power users</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    ${billingCycle === 'monthly' ? monthlyPrice : Math.floor(annualPrice / 12)}
                  </span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-sm text-emerald-600 font-medium mt-2">
                    Billed ${annualPrice}/year • Save ${annualSavings}
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-900 font-semibold">Unlimited clips</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-900 font-semibold">Unlimited file uploads</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-900 font-semibold">Unlimited focus mode</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Advanced Markdown parsing</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Early access to new features</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('premium')}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Start 14-Day Free Trial'}
              </button>

              <p className="text-xs text-center text-gray-600 mt-4">
                No credit card required for trial
              </p>
            </div>
          </div>

          {/* Trust Section */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-gray-200">
              <Check className="text-emerald-500" size={20} />
              <span className="text-gray-700 font-medium">14-day free trial • Cancel anytime • No questions asked</span>
            </div>
          </div>

          {/* FAQ Preview */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-700">Yes! You can cancel your subscription at any time. No questions asked, no hidden fees.</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-700">We accept all major credit cards via Stripe. Your payment information is secure and encrypted.</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade or downgrade later?</h3>
                <p className="text-gray-700">Absolutely! You can upgrade to Premium or downgrade to Free at any time from your account settings.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-gray-200/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-gray-700">
            <p className="text-sm">&copy; 2025 Clipper Pro. All rights reserved.</p>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <Link to="/" className="hover:text-gray-900">Home</Link>
              <Link to="/pricing" className="hover:text-gray-900">Pricing</Link>
              <a href="https://github.com/rbenhaga/NotionClipper" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}