import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Heart, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComparisonTable from '../components/ComparisonTable';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const handleSubscribe = async (plan: 'free' | 'pro') => {
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
          plan: 'premium_monthly', // Use existing premium plan
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />

      {/* Beta Header */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Beta Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-sm">🧪 BETA - Help Us Build It</span>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                The Offline-First
              </span>
              <br />
              <span className="text-gray-900">Notion Clipper</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              If you've ever seen "go online" errors on other clippers, we solve that problem TODAY.
            </p>
          </div>

          {/* Beta Pricing Box with Grandfathering Explanation */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Beta Pricing - Lock In Forever</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    The first 500 users get <strong>$3.99/mo locked in for life</strong>.
                    After that, it's $5.99/mo for everyone else.
                  </p>
                  
                  {/* Grandfathering Explanation - Improved */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200/50 mb-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">🔒 Beta Price - Lock In $3.99/mo Forever</h4>
                    <p className="text-sm text-gray-700 mb-4">Not just the first year. Forever.</p>
                    
                    <div className="bg-white/60 rounded-lg p-4 mb-3">
                      <p className="text-xs font-bold text-gray-900 mb-2">Price Timeline:</p>
                      <ul className="space-y-1.5 text-xs text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="font-mono">•</span>
                          <span><strong>Today (Beta):</strong> $3.99/mo 🔒 You lock this in</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-mono">•</span>
                          <span><strong>After Beta:</strong> $5.99/mo 💸 New users pay this</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-mono">•</span>
                          <span><strong>6 months later:</strong> $7.99/mo 💸 New users pay this</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-mono">•</span>
                          <span><strong>You still pay:</strong> $3.99/mo ✅ Forever</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-green-200">
                      <p className="text-xs text-gray-600">
                        <strong>Real example:</strong> YouTube Premium early birds still pay $7.99 today (10 years later!) 
                        while new users pay $13.99.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200/50">
                    <p className="text-sm font-bold text-gray-900 mb-2">Why beta pricing?</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• You're taking a risk on an unfinished product</li>
                      <li>• You'll help me shape features with your feedback</li>
                      <li>• Fair trade: lower price for early support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple, Honest Pricing</h2>
            <p className="text-lg text-gray-600">Try free, upgrade when you need more</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FREE TIER */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold mb-4">
                  FREE
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Try It Out</h3>
                <p className="text-sm text-gray-600">Perfect for light usage</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">No credit card required</p>
              </div>

              <ul className="space-y-3 mb-8 min-h-[240px]">
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-700"><strong>10 clips per month</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-700">Chrome extension</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-700">Basic clipboard capture</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-700">Notion OAuth integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-700">Community support</span>
                </li>
              </ul>

              <div className="space-y-3">
                <button
                  onClick={() => handleSubscribe('free')}
                  className="w-full px-6 py-4 bg-white text-gray-900 border-2 border-gray-900 rounded-xl font-bold hover:bg-gray-900 hover:text-white transition-all"
                >
                  Start Free
                </button>
                <p className="text-xs text-center text-gray-500">
                  ~2-3 clips/week • See the value first
                </p>
              </div>
            </div>

            {/* PRO BETA TIER */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 shadow-xl border-2 border-purple-300 relative transform hover:scale-105 transition-all">
              {/* Recommended Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                  ⭐ BETA PRICE
                </div>
              </div>

              <div className="mb-6 mt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-200/50 text-purple-700 rounded-full text-xs font-semibold mb-4">
                  PRO
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Clipper Pro</h3>
                <p className="text-sm text-gray-700">For power users</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">$3.99</span>
                  <span className="text-gray-700">/month</span>
                </div>
                <p className="text-xs text-purple-700 font-medium mt-2">
                  🔒 Beta price (first 500 users) • Regular $5.99
                </p>
              </div>

              <ul className="space-y-3 mb-8 min-h-[240px]">
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={3} />
                  <span className="text-sm text-gray-900"><strong>Unlimited clips</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={3} />
                  <span className="text-sm text-gray-900"><strong>Desktop app</strong> 🚧 <span className="text-xs text-gray-600">(Beta)</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={3} />
                  <span className="text-sm text-gray-900"><strong>Offline mode</strong> 🚧 <span className="text-xs text-gray-600">(Beta)</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={3} />
                  <span className="text-sm text-gray-900"><strong>Usage analytics</strong> 🚧 <span className="text-xs text-gray-600">(Coming soon)</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={3} />
                  <span className="text-sm text-gray-900">100 offline queue</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={3} />
                  <span className="text-sm text-gray-900">1000 clips history</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={3} />
                  <span className="text-sm text-gray-900">Priority support</span>
                </li>
              </ul>

              <div className="space-y-3">
                <button
                  onClick={() => handleSubscribe('pro')}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Start Free Trial'}
                </button>
                <p className="text-xs text-center text-purple-700 font-medium">
                  No credit card • Cancel anytime
                </p>
              </div>
            </div>
          </div>

          {/* Feature Legend */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
              <h4 className="font-bold text-gray-900 mb-3 text-center">Feature Status Legend</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <span className="text-2xl">✅</span>
                  <p className="text-xs text-gray-600 mt-1">Production Ready</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl">🚧</span>
                  <p className="text-xs text-gray-600 mt-1">Beta / In Development</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl">❌</span>
                  <p className="text-xs text-gray-600 mt-1">Not Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Disclaimer */}
      <section className="py-16 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-3">⚠️ Beta Disclaimer - Read This First</h3>
                
                <p className="text-sm text-gray-700 mb-4">This product is NOT finished. Here's what that means:</p>

                <div className="space-y-4 mb-6">
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="font-semibold text-green-700 mb-2 text-sm">✅ What works TODAY:</p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• Clipboard capture (rock solid)</li>
                      <li>• Send to Notion (95%+ success rate)</li>
                      <li>• Offline queue (tested with 100+ clips)</li>
                    </ul>
                  </div>

                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="font-semibold text-amber-700 mb-2 text-sm">🚧 What's still buggy:</p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• Desktop app (macOS only, crashes sometimes)</li>
                      <li>• Markdown parsing (some edge cases fail)</li>
                      <li>• Sync (polls every 5s, not real-time yet)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 text-sm mb-6">
                  <div className="flex-1 bg-green-100/50 rounded-lg p-3">
                    <p className="font-semibold text-green-800 mb-1">Join if:</p>
                    <p className="text-gray-700">You work offline often and need this NOW</p>
                  </div>
                  <div className="flex-1 bg-red-100/50 rounded-lg p-3">
                    <p className="font-semibold text-red-800 mb-1">Wait if:</p>
                    <p className="text-gray-700">You need 100% stability for work</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-amber-200">
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    I Accept the Bugs, Start Trial →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <ComparisonTable variant="full" />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200/50">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Can I upgrade from Free to Pro later?</h3>
              <p className="text-gray-600">
                Absolutely! You can upgrade anytime. The first 500 users who upgrade get the $3.99/mo beta price locked in forever.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200/50">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">What happens when you exit beta?</h3>
              <p className="text-gray-600">
                Beta users keep their pricing forever. Free users keep free access with 10 clips/month.
                Pro beta users keep $3.99/mo forever (vs $5.99 regular price).
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200/50">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">How do I know my payment is going toward development?</h3>
              <p className="text-gray-600">
                100% transparency: I post weekly updates showing exactly what I'm building, bugs fixed, and costs breakdown.
                You'll see feature progress and development updates in real-time.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200/50">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Why should I pay when the official clipper is free?</h3>
              <p className="text-gray-600">
                Honest answer: You shouldn't if the official clipper works for you. But if you've experienced "go online" errors,
                want a desktop app, need offline support, or want usage analytics—that's what we built. We're solving problems the official clipper doesn't.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200/50">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Is the 14-day trial really free?</h3>
              <p className="text-gray-600">
                Yes! No credit card required. Try all Pro features for 14 days. If you like it, upgrade to Pro. If not, you automatically stay on the Free plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to clip without limits?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join the beta and help shape the future of Notion clipping
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="px-10 py-5 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-all"
              >
                Start Free Trial
              </Link>
            </div>
            <p className="text-sm text-purple-200 mt-6">
              No credit card • 14 days free • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
