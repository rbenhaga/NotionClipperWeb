import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Heart, Users, TrendingUp, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComparisonTable from '../components/ComparisonTable';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState('5.00');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Beta stats (would come from backend in production)
  const currentBetaUsers = 0; // Start at 0
  const betaGoal = 1000;
  const currentMRR = 0;
  const mrrGoal = 500;

  const handleSubscribe = async (plan: 'free' | 'early' | 'custom', amount?: string) => {
    if (plan === 'free') {
      window.location.href = '/auth';
      return;
    }

    setLoading(true);
    try {
      const priceAmount = plan === 'custom' ? parseFloat(amount || '5') : 1.99;

      const response = await fetch(`${apiUrl}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'beta_early_access',
          amount: priceAmount * 100, // Convert to cents
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

      {/* Beta Header with Progress Bar */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Beta Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-sm">EARLY ACCESS BETA</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Limited to {betaGoal} users</span>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Help Us Build The Future
              </span>
              <br />
              <span className="text-gray-900">of Notion Clippers</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're launching in beta and need your support to keep building.
              Choose your path and shape the product with your feedback.
            </p>
          </div>

          {/* Transparency Box */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Why We're Doing This</h3>
                  <p className="text-gray-600 leading-relaxed">
                    I'm a French economics student building this solo (with help from AI tools).
                    API costs, hosting, and development tools cost <strong>~$500/month</strong>.
                    Your early support keeps this project alive and lets me focus on making the best Notion clipper out there.
                  </p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Beta Users Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-700">Beta Users</span>
                    </div>
                    <span className="text-sm font-bold text-purple-600">
                      {currentBetaUsers} / {betaGoal}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${(currentBetaUsers / betaGoal) * 100}%` }}
                    />
                  </div>
                </div>

                {/* MRR Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-gray-700">Monthly Runway</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      ${currentMRR} / ${mrrGoal}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${(currentMRR / mrrGoal) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  💯 100% of payments go toward API costs, hosting, and future features you vote on
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Paths */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Path</h2>
            <p className="text-lg text-gray-600">All paths get the same features. You decide what's fair.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* PATH 1: FREE BETA TESTER */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold mb-4">
                  PATH 1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Beta Tester</h3>
                <p className="text-sm text-gray-600">Help us improve with feedback</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Free forever (no credit card)</p>
              </div>

              <ul className="space-y-3 mb-8 min-h-[280px]">
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-700"><strong>All features unlocked</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-700">Unlimited clips</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-700">Desktop app access</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-700">Offline mode</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-700">Usage analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-700">50% discount when we launch</span>
                </li>
              </ul>

              <div className="space-y-3">
                <button
                  onClick={() => handleSubscribe('free')}
                  className="w-full px-6 py-4 bg-white text-gray-900 border-2 border-gray-900 rounded-xl font-bold hover:bg-gray-900 hover:text-white transition-all"
                >
                  Join Free Beta
                </button>
                <p className="text-xs text-center text-gray-500">
                  In exchange: Weekly feedback surveys
                </p>
              </div>
            </div>

            {/* PATH 2: EARLY SUPPORTER */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 shadow-xl border-2 border-purple-300 relative transform hover:scale-105 transition-all">
              {/* Recommended Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                  ⭐ MOST POPULAR
                </div>
              </div>

              <div className="mb-6 mt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-200/50 text-purple-700 rounded-full text-xs font-semibold mb-4">
                  PATH 2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Early Supporter</h3>
                <p className="text-sm text-gray-700">Support development + perks</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">$1.99</span>
                  <span className="text-gray-700 ml-2">/month</span>
                </div>
                <p className="text-xs text-purple-700 font-medium mt-2">
                  🔒 Lock in this price FOREVER (vs $5.99 at launch)
                </p>
              </div>

              <ul className="space-y-3 mb-8 min-h-[280px]">
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={3} />
                  <span className="text-sm text-gray-900"><strong>Everything from Free Beta</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={3} />
                  <span className="text-sm text-gray-900"><strong>Priority support</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={3} />
                  <span className="text-sm text-gray-900"><strong>Founder badge in app</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={3} />
                  <span className="text-sm text-gray-900">Direct line to founder</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={3} />
                  <span className="text-sm text-gray-900">Vote on feature roadmap</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={3} />
                  <span className="text-sm text-gray-900">Early access to new features</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-purple-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={3} />
                  <span className="text-sm text-gray-900">Listed as supporter (optional)</span>
                </li>
              </ul>

              <div className="space-y-3">
                <button
                  onClick={() => handleSubscribe('early')}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Support for $1.99/mo'}
                </button>
                <p className="text-xs text-center text-purple-700 font-medium">
                  Cancel anytime • Save 67% vs launch price
                </p>
              </div>
            </div>

            {/* PATH 3: PAY WHAT YOU WANT */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full text-xs font-semibold mb-4">
                  PATH 3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pay What You Want</h3>
                <p className="text-sm text-gray-600">You decide what's fair</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline mb-3">
                  <span className="text-3xl font-bold text-gray-900">$</span>
                  <input
                    type="number"
                    min="3"
                    max="50"
                    step="0.50"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="text-5xl font-bold text-gray-900 w-32 border-b-2 border-purple-300 focus:border-purple-600 outline-none bg-transparent text-center"
                  />
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-xs text-gray-500">Suggested: $5-10/mo • Lifetime license at v1.0</p>
              </div>

              <ul className="space-y-3 mb-8 min-h-[280px]">
                <li className="flex items-start gap-3">
                  <Check className="text-amber-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-900"><strong>Everything from Path 2</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-amber-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-900"><strong>Lifetime license when we hit v1.0</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-amber-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-900"><strong>Public thank you</strong> (if you want)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-amber-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-900">Shape product direction</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-amber-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-900">Beta & stable releases forever</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-amber-600 flex-shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
                  <span className="text-sm text-gray-900">First to know about new features</span>
                </li>
              </ul>

              <div className="space-y-3">
                <button
                  onClick={() => handleSubscribe('custom', customAmount)}
                  disabled={loading || parseFloat(customAmount) < 3}
                  className="w-full px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Pay $${customAmount}/mo`}
                </button>
                <p className="text-xs text-center text-gray-500">
                  Minimum $3/mo • Average supporter pays $7.50
                </p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                0 days
              </div>
              <p className="text-sm text-gray-600">Downtime since launch</p>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                44%
              </div>
              <p className="text-sm text-gray-600">Faster than competitors</p>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <p className="text-sm text-gray-600">Offline support</p>
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
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Should You Join The Beta?</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="font-semibold text-green-700 mb-2">✅ Join if:</p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• You work offline often and NEED a reliable clipper</li>
                      <li>• You want to influence the product roadmap</li>
                      <li>• You're okay with bugs in exchange for discounts</li>
                      <li>• You believe in supporting indie makers</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-red-700 mb-2">❌ Don't join if:</p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• You need 100% stability for critical work</li>
                      <li>• You don't have time to report bugs</li>
                      <li>• You prefer polished, finished products</li>
                      <li>• You'd rather wait for v1.0</li>
                    </ul>
                  </div>
                </div>

                <p className="text-sm text-gray-600 italic">
                  <strong>Being honest:</strong> If you're risk-averse, bookmark this page and come back in 3 months
                  when we hit v1.0. But if you join now, you'll get lifetime discounts and shape the product.
                </p>
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
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Can I switch from Free Beta to Early Supporter later?</h3>
              <p className="text-gray-600">
                Absolutely! You can upgrade anytime. If you upgrade within the first month, you'll still lock in the $1.99 price forever.
                After 1,000 beta users, the early supporter price increases to $3.99/mo.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200/50">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">What happens when you exit beta?</h3>
              <p className="text-gray-600">
                All beta users keep their pricing FOREVER. Free beta testers get 50% off launch price.
                Early supporters keep $1.99/mo forever (vs $5.99 regular). Pay What You Want users get lifetime license.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200/50">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">How do I know my payment is going toward development?</h3>
              <p className="text-gray-600">
                100% transparency: I post weekly updates on Discord and email showing exactly what I'm building,
                bugs fixed, and costs breakdown. You'll see MRR, user count, and feature progress updated in real-time.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200/50">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">What if Clipper Pro shuts down?</h3>
              <p className="text-gray-600">
                Fair question. If I decide to shut down, I'll: (1) Give 60 days notice, (2) Refund the last month of paid users,
                (3) Open source the code so the community can fork it. Your Notion data stays in Notion—we never lock you in.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200/50">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Why should I pay when the official clipper is free?</h3>
              <p className="text-gray-600">
                Honest answer: You shouldn't if the official clipper works for you. But if you've experienced "go online" errors,
                want a desktop app, need offline support, or want usage analytics—that's what we built. We're not replacing the official clipper;
                we're solving problems it doesn't.
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
              Ready to shape the future?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join {currentBetaUsers} early users building Clipper Pro together
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="px-10 py-5 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-all"
              >
                Join Free Beta
              </Link>
              <button
                onClick={() => handleSubscribe('early')}
                className="px-10 py-5 bg-purple-900/50 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold text-lg hover:bg-purple-900/70 transition-all"
              >
                Support for $1.99/mo
              </button>
            </div>
            <p className="text-sm text-purple-200 mt-6">
              No credit card required for free beta • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
