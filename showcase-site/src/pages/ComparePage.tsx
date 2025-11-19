import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComparisonTable from '../components/ComparisonTable';
import { containerVariants, itemVariants } from '../lib/animations';
import { Badge } from '../components/ui';
import { Zap, Shield, TrendingUp } from 'lucide-react';

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      {/* Hero Section */}
      <motion.section
        className="pt-32 pb-12 px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <Badge variant="secondary" size="lg">
              <Shield className="w-4 h-4" />
              <span>Honest Comparison</span>
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl font-bold mb-6 text-gray-900 dark:text-white"
          >
            Compare Notion Clippers
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
          >
            Not sure which clipper is right for you? Here's an honest comparison.
          </motion.p>
        </div>
      </motion.section>

      {/* Key Differentiators */}
      <section className="pb-16 px-6">
        <motion.div
          className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="card text-center p-6">
            <Zap className="w-10 h-10 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">44%</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Faster</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">vs. official clipper</div>
          </motion.div>

          <motion.div variants={itemVariants} className="card text-center p-6">
            <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">100%</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Offline</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Only clipper with queue</div>
          </motion.div>

          <motion.div variants={itemVariants} className="card text-center p-6">
            <TrendingUp className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">$2.99</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Beta Price</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Locked in forever</div>
          </motion.div>
        </motion.div>
      </section>

      {/* Comparison Table */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <ComparisonTable variant="full" />
        </div>
      </section>

      {/* FAQ Section - Simplified */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900">
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
            <motion.div variants={itemVariants} className="card p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Why is Clipper Pro different from the official Notion Web Clipper?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Clipper Pro is the only clipper with offline mode. The official clipper requires internet.
                We queue clips locally and sync when you're back online. Plus, 44% faster performance and usage analytics.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="card p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Can I switch from another clipper?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes! Fully compatible with Notion's API. Use it alongside other clippers or switch completely.
                Your existing workspace and clips remain unchanged.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-16 shadow-apple-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Ready to try Clipper Pro?
              </h2>
              <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
                The only clipper that works offline. Lock in $2.99/mo forever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center px-10 py-5 bg-white text-purple-600 rounded-2xl font-bold text-lg shadow-apple-xl hover:scale-105 transition-all"
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center px-10 py-5 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
                >
                  View Pricing
                </Link>
              </div>
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
