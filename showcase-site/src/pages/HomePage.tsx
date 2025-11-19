import { Link } from 'react-router-dom';
import { Zap, Sparkles, WifiOff, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComparisonTable from '../components/ComparisonTable';
import SocialProof from '../components/SocialProof';
import { containerVariants, itemVariants } from '../lib/animations';
import { Badge } from '../components/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Gradient Orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

        <motion.div
          className="max-w-5xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Beta Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <Badge variant="gradient" size="lg">
              <Sparkles className="w-4 h-4" />
              <span className="font-bold">Beta - First 500 Users Get $2.99/mo Forever</span>
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          >
            <span className="text-gray-900 dark:text-white">Save to Notion.</span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Even Offline.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto mb-10"
          >
            The only Notion clipper with a real offline queue.
            No more <span className="font-semibold text-red-600 dark:text-red-400">"go online"</span> errors. Ever.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link to="/auth" className="btn-primary px-10 py-5 text-lg">
              Start Free Trial
            </Link>
            <Link to="/pricing" className="btn-secondary px-10 py-5 text-lg">
              See Pricing
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div variants={itemVariants}>
            <SocialProof />
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Feature 1: Offline Mode */}
            <motion.div variants={itemVariants} className="card-interactive text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <WifiOff className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Works Offline
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Local queue syncs automatically when you're back online. Never lose a clip again.
              </p>
            </motion.div>

            {/* Feature 2: Instant Capture */}
            <motion.div variants={itemVariants} className="card-interactive text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Instant Capture
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                One keyboard shortcut. Clipboard to Notion in under 2 seconds. Simple as copy-paste.
              </p>
            </motion.div>

            {/* Feature 3: Usage Analytics */}
            <motion.div variants={itemVariants} className="card-interactive text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Usage Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track your clipping activity. See patterns. Optimize your workflow.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" size="lg" className="mb-4">
              <Clock className="w-4 h-4" />
              <span>Simple Workflow</span>
            </Badge>
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Simple as Copy-Paste
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Three steps. Zero friction. Maximum productivity.
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Step 1 */}
            <motion.div
              variants={itemVariants}
              className="flex items-start gap-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Copy anything
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Text, images, links. Use <kbd className="kbd">Ctrl+C</kbd> like normal.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              variants={itemVariants}
              className="flex items-start gap-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Auto-detection
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Clipper Pro instantly detects new clipboard content.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              variants={itemVariants}
              className="flex items-start gap-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl"
            >
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Send to Notion
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Press <kbd className="kbd">Ctrl+Shift+C</kbd>. Done. Saved to Notion in under 2 seconds.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Clipper Pro?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Built for people who work offline. Not another browser extension.
            </p>
          </motion.div>
          <ComparisonTable variant="condensed" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-16 shadow-apple-2xl relative overflow-hidden">
            {/* Gradient Orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Ready to clip offline?
              </h2>
              <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
                Join 200+ beta users. Lock in $2.99/mo forever.
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
                  See Pricing
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
