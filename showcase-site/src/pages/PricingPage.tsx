import { Link } from 'react-router-dom';
import { Check, Sparkles, Zap, Shield, Heart, Info } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComparisonTable from '../components/ComparisonTable';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Beta Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-sm">BETA ACCESS</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Early pricing for first users</span>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Simple, Transparent Pricing
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Start free, upgrade when you need more. No credit card required for trial.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {/* FREE TIER */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Perfect to try out Clipper Pro</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>100 clips/month</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Chrome extension</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Basic markdown parser</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Notion integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Community support</span>
                </li>
              </ul>

              <Link
                to="/auth"
                className="block w-full px-6 py-4 bg-white text-gray-900 rounded-xl font-bold text-center shadow-md hover:shadow-lg transition-all border-2 border-gray-300 hover:border-purple-600"
              >
                Get Started Free
              </Link>
            </div>

            {/* PRO TIER */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 shadow-xl border-2 border-purple-300 relative">
              {/* Popular Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                  ⭐ BETA PRICE
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    $3.99
                  </span>
                  <span className="text-gray-700">/month</span>
                </div>
                <p className="text-xs text-purple-700 font-medium mt-2">
                  🔒 Beta price (regular $5.99) • Cancel anytime
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Unlimited clips</strong> ⭐</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Desktop app</strong> (beta) ⭐</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Offline mode</strong> ⭐</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Advanced markdown parser</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Usage analytics dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Early access to new features</span>
                </li>
              </ul>

              <Link
                to="/auth"
                className="block w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-center shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Start 14-Day Free Trial
              </Link>
              <p className="text-xs text-center text-gray-600 mt-3">
                No credit card required • Cancel anytime
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
              <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-bold text-gray-900">Instant Setup</p>
              <p className="text-sm text-gray-600">Connect in 2 clicks</p>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-bold text-gray-900">100% Offline Support</p>
              <p className="text-sm text-gray-600">Works without internet</p>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
              <Heart className="w-8 h-8 text-pink-600 mx-auto mb-2" />
              <p className="font-bold text-gray-900">Cancel Anytime</p>
              <p className="text-sm text-gray-600">No long-term commitment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Disclaimer */}
      <section className="py-16 px-6 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8">
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-6 h-6 text-amber-700 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Beta Transparency</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Clipper Pro is in active beta. This means some features are still being refined,
                  and you might encounter occasional bugs. In exchange, you get:
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 ml-9">
              <div>
                <p className="font-semibold text-green-700 mb-2">✅ You'll love it if:</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• You work offline often</li>
                  <li>• You need a reliable Notion clipper</li>
                  <li>• You want to influence the roadmap</li>
                  <li>• You're okay with reporting bugs</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-700 mb-2">❌ Not for you if:</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• You need 100% stability for critical work</li>
                  <li>• You don't have time to report issues</li>
                  <li>• You prefer fully polished products</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-6 bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How Clipper Pro Compares
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how we stack up against other Notion clippers
            </p>
          </div>
          <ComparisonTable variant="detailed" />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                What happens after the 14-day trial?
              </h3>
              <p className="text-gray-700">
                If you don't cancel, you'll be charged $3.99/month (beta price). You can cancel
                anytime from your dashboard. No surprise charges.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Can I switch from Free to Pro later?
              </h3>
              <p className="text-gray-700">
                Yes! You can upgrade to Pro at any time from your dashboard. Your usage resets to
                unlimited clips immediately.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Will the price increase after beta?
              </h3>
              <p className="text-gray-700">
                Yes. The regular price will be $5.99/month after beta. If you subscribe during beta,
                you keep the $3.99 rate as long as you stay subscribed.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-700">
                We use Stripe for secure payments. Credit cards, debit cards, and Apple/Google Pay
                are all supported.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Is my Notion data safe?
              </h3>
              <p className="text-gray-700">
                Absolutely. We use OAuth2 for secure Notion authentication. We never store your
                Notion credentials, and all data is encrypted in transit and at rest.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                What happens to my data if I downgrade to Free?
              </h3>
              <p className="text-gray-700">
                Your data stays safe. You'll just be limited to 100 clips/month going forward. All
                previously saved clips remain in your Notion workspace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to supercharge your Notion workflow?
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
            Join early users who are saving hours every week with Clipper Pro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="px-10 py-5 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              Start Free Trial
            </Link>
            <Link
              to="/"
              className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
