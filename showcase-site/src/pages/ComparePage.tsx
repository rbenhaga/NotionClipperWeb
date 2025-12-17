import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComparisonTable from '../components/ComparisonTable';
import { Zap, WifiOff, ArrowRight, ChevronDown } from 'lucide-react';

export default function ComparePage() {
  const { t } = useTranslation('common');
  
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-full mb-8"
          >
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
              Honest Comparison
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-semibold text-neutral-900 dark:text-white mb-4"
          >
            {t('compare.title', 'Compare Clippers')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-500 max-w-2xl mx-auto"
          >
            {t('compare.subtitle', 'Not sure which clipper is right for you? Here\'s an honest comparison.')}
          </motion.p>
        </div>
      </section>

      {/* Key Stats */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center"
            >
              <Zap className="w-8 h-8 text-violet-600 dark:text-violet-400 mx-auto mb-3" />
              <div className="text-3xl font-semibold text-neutral-900 dark:text-white mb-1">44%</div>
              <div className="text-sm text-neutral-500">Faster than official</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center"
            >
              <WifiOff className="w-8 h-8 text-violet-600 dark:text-violet-400 mx-auto mb-3" />
              <div className="text-3xl font-semibold text-neutral-900 dark:text-white mb-1">100%</div>
              <div className="text-sm text-neutral-500">Offline capable</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center"
            >
              <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-violet-600 dark:text-violet-400 font-semibold">€</span>
              </div>
              <div className="text-3xl font-semibold text-neutral-900 dark:text-white mb-1">-25%</div>
              <div className="text-sm text-neutral-500">2,99€/mo beta price</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ComparisonTable variant="full" />
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
              Common Questions
            </h2>
            <p className="text-neutral-500">
              Everything you need to know before switching
            </p>
          </motion.div>

          <div className="space-y-3">
            {[
              {
                q: 'Why is Clipper Pro different from the official Notion Web Clipper?',
                a: 'Clipper Pro is the only clipper with offline mode. The official clipper requires internet and fails when you\'re offline. We queue clips locally and sync automatically when you\'re back online. Plus: native desktop app, 44% faster performance, templates, multi-select databases, and usage analytics.'
              },
              {
                q: 'Can I use Clipper Pro alongside other clippers?',
                a: 'Yes! Clipper Pro is fully compatible with Notion\'s API. You can use it alongside the official clipper or any other tool. Your existing workspace, databases, and clips remain completely unchanged.'
              },
              {
                q: 'What platforms are supported?',
                a: 'Desktop app available for macOS, Windows, and Linux. Chrome extension works on any Chromium-based browser (Chrome, Edge, Brave, Arc). Mobile apps are planned for the future.'
              },
              {
                q: 'How does offline mode work?',
                a: 'When you\'re offline, your clips are saved locally in a queue. As soon as you\'re back online, they sync automatically to your Notion workspace. You never lose a clip, even with unstable internet.'
              },
              {
                q: 'Is my data secure?',
                a: 'Yes. We use Notion\'s official OAuth for authentication. Your Notion tokens are encrypted with AES-256-GCM. We never store your Notion content - clips go directly to your workspace.'
              }
            ].map((faq, i) => (
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

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-900 dark:text-white mb-4">
            {t('cta.title', 'Ready to try Clipper Pro?')}
          </h2>
          <p className="text-neutral-500 mb-8">
            {t('cta.subtitle', 'The only clipper that works offline. Lock in 2,99€/mo forever.')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/auth?checkout=true&plan=premium_monthly"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
            >
              {t('cta.button', 'Start Free Trial')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              {t('cta.buttonSecondary', 'View Pricing')}
            </Link>
          </div>
          
          <p className="text-neutral-400 text-sm mt-6">
            {t('cta.trust', 'Cancel anytime · Secure payment')}
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}