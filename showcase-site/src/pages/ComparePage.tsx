import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComparisonTable from '../components/ComparisonTable';

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Compare Notion Clippers
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Not sure which clipper is right for you? Here's an honest, detailed comparison of all major Notion clipper tools on the market.
            </p>
          </div>

          {/* Comparison Table */}
          <ComparisonTable variant="full" />

          {/* CTA Section */}
          <div className="mt-16 text-center bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 rounded-2xl p-12 border-2 border-purple-200">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to try Clipper Pro?
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Join users who save hours every week with the only clipper that works offline.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Start Free Trial
              </Link>
              <Link
                to="/pricing"
                className="px-10 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
              >
                View Pricing
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-600">50 clips/month free • No credit card required</p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">44%</div>
              <div className="text-gray-900 font-semibold mb-1">Faster Performance</div>
              <div className="text-sm text-gray-600">Compared to official clipper</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-900 font-semibold mb-1">Offline Support</div>
              <div className="text-sm text-gray-600">Only clipper with queue sync</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-200 text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">$5.99</div>
              <div className="text-gray-900 font-semibold mb-1">Best Value</div>
              <div className="text-sm text-gray-600">Desktop app + extension + analytics</div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">Why is Clipper Pro different from the official Notion Web Clipper?</h3>
                <p className="text-gray-600">
                  Clipper Pro is the only clipper with a desktop app and offline mode. Unlike the official clipper which requires an internet connection, Clipper Pro queues your clips locally and syncs them when you're back online. Plus, we offer usage analytics and work 44% faster.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">How does Clipper Pro compare to "Save to Notion"?</h3>
                <p className="text-gray-600">
                  While "Save to Notion" is a great browser extension, Clipper Pro goes further with a native desktop app, offline support, and usage statistics dashboard. We're also priced the same at $5.99/mo but offer more features.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">What about "Copy to Notion"?</h3>
                <p className="text-gray-600">
                  "Copy to Notion" has excellent ratings (4.7★) and is slightly cheaper ($3.75-9/mo), but lacks a desktop app, offline mode, and analytics. If you primarily need a browser extension, it's a solid choice. If you want a complete solution with desktop support and analytics, Clipper Pro is better.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">Can I switch from another clipper to Clipper Pro?</h3>
                <p className="text-gray-600">
                  Yes! Clipper Pro is fully compatible with Notion's API and won't affect your existing clips. You can use it alongside other clippers or switch completely. Your Notion workspace and data remain unchanged.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">Is the free tier really unlimited?</h3>
                <p className="text-gray-600">
                  Our free tier offers 50 clips per month, which resets every month. The official Notion clipper and "Save to Notion" offer truly unlimited clips for free, so if you need more than 50 clips/month without paying, those might be better options. However, they don't offer offline mode or analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
