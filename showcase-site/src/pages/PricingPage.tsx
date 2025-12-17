import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ArrowRight, Shield, Zap, Clock, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { authService } from '../services/auth.service';

export default function PricingPage() {
  const { } = useTranslation(['pricing', 'common']);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [betaSpots, setBetaSpots] = useState({ remaining: 347, total: 500 });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    fetch(`${apiUrl}/stripe/beta-spots`)
      .then(res => res.json())
      .then(data => {
        if (data.data) setBetaSpots({ remaining: data.data.remaining, total: data.data.total });
      })
      .catch(() => {});
  }, [apiUrl]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'true' && params.get('plan')) {
      window.history.replaceState({}, '', '/pricing');
      const token = localStorage.getItem('token');
      if (token) initiateCheckout(params.get('plan')!);
      else navigate(`/auth?checkout=true&plan=${params.get('plan')}`);
    }
  }, []);

  const initiateCheckout = async (plan: string) => {
    const token = localStorage.getItem('token');
    if (!token) { navigate(`/auth?checkout=true&plan=${plan}`); return; }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      });
      const result = await res.json();
      if (result.data?.url) window.location.href = result.data.url;
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubscribe = async (plan: 'free' | 'pro') => {
    if (plan === 'free') { navigate('/auth'); return; }
    const stripePlan = billingPeriod === 'monthly' ? 'premium_monthly' : 'premium_annual';
    const user = await authService.getCurrentUser();
    if (!user) { navigate(`/auth?checkout=true&plan=${stripePlan}`); return; }
    await initiateCheckout(stripePlan);
  };

  const freeFeatures = [
    { text: '100 clips/month', included: true },
    { text: '10 files/month', included: true },
    { text: '60min Focus mode/day', included: true },
    { text: '60min Compact mode/day', included: true },
    { text: 'Chrome extension', included: true },
    { text: 'Desktop app', included: true },
    { text: 'Offline mode', included: false },
    { text: 'Templates', included: false },
    { text: 'Multi-select databases', included: false },
  ];

  const proFeatures = [
    { text: 'Unlimited clips', included: true, highlight: true },
    { text: 'Unlimited file attachments', included: true, highlight: true },
    { text: 'Offline mode + auto-sync', included: true, highlight: true },
    { text: 'Unlimited Focus & Compact modes', included: true, highlight: true },
    { text: 'Unlimited templates', included: true },
    { text: 'Multi-select databases', included: true },
    { text: 'Custom shortcuts', included: true },
    { text: 'Usage analytics & export', included: true },
    { text: 'Desktop app (macOS/Win/Linux)', included: true },
  ];

  const faqs = [
    {
      q: 'Is beta pricing locked forever?',
      a: 'Yes. Once you subscribe during beta, your 2,99€/mo rate is locked forever. Even when we raise prices to 3,99€ or more, you keep your original rate.'
    },
    {
      q: 'Why pay when the official clipper is free?',
      a: 'The official clipper requires internet. We\'re the only clipper that works offline - your clips queue locally and sync automatically when you\'re back online. Plus: desktop app, templates, multi-select databases, and usage analytics.'
    },
    {
      q: 'What happens after the 14-day trial?',
      a: 'Your card is charged automatically. You can cancel anytime before the trial ends with one click - no questions asked, no hidden fees.'
    },
    {
      q: 'Can I switch between monthly and annual?',
      a: 'Yes. You can switch anytime from your billing settings. Annual saves you 20% compared to monthly.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'All major credit cards (Visa, Mastercard, Amex) via Stripe. Your payment info is secure, encrypted, and never stored on our servers.'
    },
    {
      q: 'Do you offer refunds?',
      a: 'Yes. If you\'re not satisfied within the first 14 days after your trial, contact us for a full refund.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Beta badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-full mb-8"
          >
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
              {betaSpots.remaining}/{betaSpots.total} beta spots · Price locks at 2,99€/mo
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-semibold text-neutral-900 dark:text-white mb-4"
          >
            Simple pricing
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-500 mb-10"
          >
            Start free. Upgrade when you need unlimited clips.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg"
          >
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                billingPeriod === 'annual'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500'
              }`}
            >
              Annual
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                -20%
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* FREE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800"
            >
              <div className="mb-6">
                <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-1">Free</p>
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">Try it out</h3>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-neutral-900 dark:text-white">0€</span>
                  <span className="text-neutral-500">/month</span>
                </div>
                <p className="text-sm text-neutral-500 mt-1">Perfect for light usage</p>
              </div>

              <ul className="space-y-3 mb-8">
                {freeFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {f.included ? (
                      <Check className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <X className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
                    )}
                    <span className={`text-sm ${f.included ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400'}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe('free')}
                className="w-full py-3 px-6 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Get Started
              </button>
            </motion.div>

            {/* PRO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative p-8 rounded-2xl border-2 border-violet-500 bg-violet-50/50 dark:bg-violet-500/5"
            >
              {/* Popular badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-violet-600 text-white text-xs font-semibold rounded-full">
                  POPULAR
                </span>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wide mb-1">Pro</p>
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">Clipper Pro</h3>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg text-neutral-400 line-through">
                    {billingPeriod === 'monthly' ? '3,99€' : '38,30€'}
                  </span>
                  <span className="text-4xl font-semibold text-neutral-900 dark:text-white">
                    {billingPeriod === 'monthly' ? '2,99€' : '28,70€'}
                  </span>
                  <span className="text-neutral-500">/{billingPeriod === 'monthly' ? 'mo' : 'year'}</span>
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  {billingPeriod === 'monthly' ? 'Locked forever · -25%' : '2,39€/mo · -25% beta + -20% annual'}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {proFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className={`w-4 h-4 ${f.highlight ? 'text-violet-600' : 'text-violet-500'}`} />
                    <span className={`text-sm ${f.highlight ? 'font-medium text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>
                      {f.text}
                    </span>
                    {(f as any).soon && (
                      <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/20 px-1.5 py-0.5 rounded">
                        Soon
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe('pro')}
                disabled={loading}
                className="w-full py-3 px-6 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Start 14-Day Free Trial'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-neutral-500 text-xs mt-3">
                Paiement sécurisé via Stripe
              </p>
            </motion.div>
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 mt-12"
          >
            {[
              { icon: Clock, text: '14-day free trial' },
              { icon: Shield, text: 'Paiement sécurisé' },
              { icon: Zap, text: 'Cancel anytime' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-neutral-500">
                <item.icon className="w-4 h-4 text-violet-500" />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-24 px-6 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-300 dark:via-violet-700 to-transparent" />
        
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-semibold text-neutral-900 dark:text-white mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-500">
              Everything you need to know about Clipper Pro
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group p-5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-violet-200 dark:hover:border-violet-800 transition-colors"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h3 className="font-medium text-neutral-900 dark:text-white pr-4">{faq.q}</h3>
                  <ChevronDown className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <p className="text-sm text-neutral-500 mt-3 leading-relaxed">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
              {betaSpots.remaining} spots left
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-white mb-4">
            Ready to clip offline?
          </h2>
          <p className="text-neutral-500 mb-8">
            Lock in 2,99€/mo forever before beta ends.
          </p>
          
          <button
            onClick={() => handleSubscribe('pro')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
          >
            {loading ? 'Processing...' : 'Start Free Trial'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}