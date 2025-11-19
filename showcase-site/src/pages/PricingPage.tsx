import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Zap, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComparisonTable from '../components/ComparisonTable';
import { containerVariants, itemVariants, scaleVariants } from '../lib/animations';
import { Badge } from '../components/ui';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const handleSubscribe = async (plan: 'free' | 'pro') => {
    if (plan === 'free') {
      window.location.href = '/auth';
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (!token) {
      // Redirect to auth page with return URL
      window.location.href = '/auth?redirect=/pricing';
      return;
    }

    setLoading(true);
    try {
      const stripePlan = billingPeriod === 'monthly' ? 'premium_monthly' : 'premium_annual';
      
      const response = await fetch(`${apiUrl}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: stripePlan,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create checkout session');
      }

      // Backend wraps response in { success: true, data: { url, sessionId } }
      if (result.data?.url) {
        window.location.href = result.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Please sign in first to subscribe.');
      window.location.href = '/auth?redirect=/pricing';
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      {/* Hero Section */}
      <motion.section
        className="pt-32 pb-16 px-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Beta Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <Badge variant="gradient" size="lg">
              <Sparkles className="w-4 h-4" />
              <span className="font-bold">Beta Pricing - First 500 Users</span>
            </Badge>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl font-bold mb-6 text-gray-900 dark:text-white"
          >
            Simple, Honest Pricing
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
          >
            Try free. Upgrade when you need offline mode.
            <span className="font-semibold text-purple-600 dark:text-purple-400"> Early users get $2.99/mo forever.</span>
          </motion.p>

          {/* Quick Beta Notice */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-left max-w-2xl"
          >
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-white">This is beta software.</span>
              {' '}Clipboard capture works great. Desktop app and offline sync are still buggy.
              {' '}<Link to="/compare" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">See what works →</Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Pricing Tiers */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Billing Period Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 mb-12"
          >
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-apple-lg'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all relative ${
                billingPeriod === 'annual'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-apple-lg'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              Annual
              <Badge variant="success" size="sm" className="ml-2">Save 20%</Badge>
            </button>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            variants={scaleVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            {/* FREE TIER */}
            <motion.div
              className="card-interactive bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8"
              whileHover={{ y: -4 }}
            >
              <Badge variant="secondary" size="sm" className="mb-4">Free</Badge>

              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Try It Out</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Perfect for light usage</p>

              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="text-gray-400 dark:text-gray-600 flex-shrink-0" size={20} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">10 clips/month</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-gray-400 dark:text-gray-600 flex-shrink-0" size={20} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Chrome extension</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-gray-400 dark:text-gray-600 flex-shrink-0" size={20} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Basic clipboard capture</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-gray-400 dark:text-gray-600 flex-shrink-0" size={20} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Community support</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('free')}
                className="btn-secondary w-full"
              >
                Start Free
              </button>
            </motion.div>

            {/* PRO TIER */}
            <motion.div
              className="card-interactive bg-gradient-to-br from-purple-500/10 to-blue-500/10 dark:from-purple-500/20 dark:to-blue-500/20 border-2 border-purple-500/50 dark:border-purple-400/50 rounded-3xl p-8 relative"
              whileHover={{ y: -4, scale: 1.02 }}
            >
              {/* Recommended Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="gradient" size="md">
                  <Zap className="w-3 h-3" />
                  <span className="font-bold">Beta Price</span>
                </Badge>
              </div>

              <Badge variant="primary" size="sm" className="mb-4 mt-2">Pro</Badge>

              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Clipper Pro</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-8">For power users</p>

              <div className="mb-8">
                <div className="flex items-baseline">
                  {billingPeriod === 'monthly' ? (
                    <>
                      <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">$2.99</span>
                      <span className="text-gray-700 dark:text-gray-300 ml-2">/mo</span>
                    </>
                  ) : (
                    <>
                      <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">$28.68</span>
                      <span className="text-gray-700 dark:text-gray-300 ml-2">/year</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-2">
                  {billingPeriod === 'monthly' ? 'Locked in forever • Reg. $5.99' : '$2.39/mo • Save 20%'}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="text-purple-600 dark:text-purple-400 flex-shrink-0" size={20} strokeWidth={2.5} />
                  <span className="text-sm text-gray-900 dark:text-white font-semibold">Unlimited clips</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-purple-600 dark:text-purple-400 flex-shrink-0" size={20} strokeWidth={2.5} />
                  <span className="text-sm text-gray-900 dark:text-white">Offline mode</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-purple-600 dark:text-purple-400 flex-shrink-0" size={20} strokeWidth={2.5} />
                  <span className="text-sm text-gray-900 dark:text-white">Desktop app (beta)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-purple-600 dark:text-purple-400 flex-shrink-0" size={20} strokeWidth={2.5} />
                  <span className="text-sm text-gray-900 dark:text-white">Usage analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="text-purple-600 dark:text-purple-400 flex-shrink-0" size={20} strokeWidth={2.5} />
                  <span className="text-sm text-gray-900 dark:text-white">Priority support</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe('pro')}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Processing...' : 'Start Free Trial'}
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* Comparison Table */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <ComparisonTable variant="full" />
        </div>
      </section>

      {/* FAQ Section - Simplified */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Common Questions
          </motion.h2>

          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              variants={itemVariants}
              className="card bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Is beta pricing really locked in forever?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes. Like YouTube Premium early adopters who still pay $7.99 while new users pay $13.99 (10 years later),
                your $2.99/mo rate never changes. Ever.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="card bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Why pay when the official clipper is free?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                If the official clipper works for you, stick with it. We built this for people who experience "go online" errors
                and need offline support. Different problem, different solution.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-16 shadow-apple-2xl relative overflow-hidden">
            {/* Gradient Orb */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Ready to clip offline?
              </h2>
              <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
                Join 200+ beta users building the future of Notion clipping
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-10 py-5 bg-white text-purple-600 rounded-2xl font-bold text-lg shadow-apple-xl hover:scale-105 transition-all"
              >
                Start Free Trial
              </Link>
              <p className="text-sm text-purple-200 mt-6">
                No credit card • Cancel anytime
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
